<template>
  <main
    class="forgot-password-page"
    :class="{ 'theme-dark': isDark }"
  >
    <div class="forgot-password-container">
      <section class="forgot-password-card">
        <header class="page-header">
          <h1>{{ $t('profileSeccion.forgotMyPassword') }}</h1>
          <p>
            Ingresa tu correo electrónico y te enviaremos un enlace para
            recuperar tu contraseña.
          </p>
        </header>

        <form
          class="forgot-password-form"
          novalidate
          :aria-busy="isSubmitting"
          @submit.prevent="sendResetEmail"
        >
          <div class="field-group">
            <label for="recovery-email">
              {{ $t('profileSeccion.email') }}
            </label>

            <input
              id="recovery-email"
              v-model="email"
              class="form-control"
              :class="{
                'is-invalid': emailTouched && emailError
              }"
              type="email"
              inputmode="email"
              autocomplete="email"
              maxlength="150"
              :placeholder="$t('profileSeccion.addMail')"
              :disabled="isSubmitting"
              :aria-invalid="emailTouched && Boolean(emailError)"
              :aria-describedby="
                emailTouched && emailError
                  ? 'recovery-email-error'
                  : undefined
              "
              @blur="emailTouched = true"
              @input="clearFormError"
            >

            <p
              v-if="emailTouched && emailError"
              id="recovery-email-error"
              class="field-error"
            >
              {{ emailError }}
            </p>
          </div>

          <p
            v-if="formError"
            class="form-error"
            role="alert"
            aria-live="assertive"
          >
            {{ formError }}
          </p>

          <button
            type="submit"
            class="submit-button"
            :disabled="isSubmitting"
          >
            <span
              v-if="isSubmitting"
              class="button-spinner"
              aria-hidden="true"
            />

            <span>
              {{
                isSubmitting
                  ? 'Enviando...'
                  : $t('buttons.sendLinkRecovery')
              }}
            </span>
          </button>

          <button
            type="button"
            class="back-button"
            :disabled="isSubmitting"
            @click="goBack"
          >
            Volver
          </button>
        </form>
      </section>
    </div>
  </main>
</template>

<script setup>
import {
  computed,
  inject,
  onBeforeUnmount,
  ref,
  unref
} from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const apiUrl = inject('apiUrl');
const mode = inject('mode');

const router = useRouter();
const { t } = useI18n();

const email = ref('');
const emailTouched = ref(false);
const isSubmitting = ref(false);
const formError = ref('');

let requestController = null;

const isDark = computed(() => unref(mode) === 'dark');

const normalizedEmail = computed(() =>
  email.value.trim().toLowerCase()
);

const emailError = computed(() => {
  if (!normalizedEmail.value) {
    return 'Ingresa tu correo electrónico.';
  }

  const isValidEmail =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      normalizedEmail.value
    );

  return isValidEmail
    ? ''
    : 'Ingresa un correo electrónico válido.';
});

const buildApiUrl = (path) => {
  const baseUrl = String(unref(apiUrl) || '')
    .replace(/\/+$/, '');
  const cleanPath = String(path || '')
    .replace(/^\/+/, '');

  return `${baseUrl}/${cleanPath}`;
};

const clearFormError = () => {
  formError.value = '';
};

const responseHasError = (data) =>
  data?.salida?.[0]?.status === 'error' ||
  data?.status === 'error' ||
  data?.success === false;

const isCanceledRequest = (error) =>
  error?.name === 'CanceledError' ||
  error?.code === 'ERR_CANCELED';

const sendResetEmail = async () => {
  if (isSubmitting.value) {
    return;
  }

  emailTouched.value = true;
  clearFormError();

  if (emailError.value) {
    return;
  }

  isSubmitting.value = true;

  requestController?.abort();
  requestController = new AbortController();

  try {
    const response = await axios.post(
      buildApiUrl('users/forgot-password'),
      {
        email: normalizedEmail.value
      },
      {
        signal: requestController.signal
      }
    );

    if (responseHasError(response?.data)) {
      throw new Error('RESET_EMAIL_FAILED');
    }

    await Swal.fire({
      icon: 'success',
      title: t('responseApisSeccion.exito'),
      text: t('responseApisSeccion.sendMailRecovyred'),
      showConfirmButton: true,
      timerProgressBar: true
    });

    await router.replace('/');
  } catch (error) {
    if (isCanceledRequest(error)) {
      return;
    }

    console.error(
      'Error al enviar el correo de recuperación:',
      error
    );

    formError.value =
      error?.response?.data?.message ||
      t('responseApisSeccion.errorSendMailRecovyred');

    await Swal.fire({
      icon: 'error',
      title: t('responseApisSeccion.error'),
      text: formError.value
    });
  } finally {
    isSubmitting.value = false;
    requestController = null;
  }
};

const goBack = () => {
  router.back();
};

onBeforeUnmount(() => {
  requestController?.abort();
});
</script>

<style scoped>
.forgot-password-page {
  --page-bg: #f4f6f9;
  --page-text: #20252b;
  --card-bg: #ffffff;
  --card-border: #dce2e8;
  --card-shadow: 0 12px 34px rgba(31, 45, 61, 0.1);
  --input-bg: #ffffff;
  --input-text: #20252b;
  --input-border: #c8d0d9;
  --muted-text: #687482;
  --error-text: #c92a2a;
  --focus-ring: rgba(76, 175, 80, 0.22);

  min-height: 100dvh;
  padding: 2rem 0;
  background: var(--page-bg);
  color: var(--page-text);
}

.forgot-password-page.theme-dark {
  --page-bg: #0f1115;
  --page-text: #f1f3f5;
  --card-bg: #1c1f26;
  --card-border: #3a3f4b;
  --card-shadow: 0 12px 34px rgba(0, 0, 0, 0.38);
  --input-bg: #2a2e38;
  --input-text: #ffffff;
  --input-border: #464d59;
  --muted-text: #bbc3cc;
  --error-text: #ff8787;
  --focus-ring: rgba(110, 168, 254, 0.28);
}

.forgot-password-page,
.forgot-password-page * {
  box-sizing: border-box;
}

.forgot-password-container {
  width: 70%;
  margin: 0 auto;
}

.forgot-password-card {
  padding: 2rem;
  border: 1px solid var(--card-border);
  border-radius: 16px;
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
}

.page-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.page-header h1,
.page-header p {
  margin: 0;
}

.page-header h1 {
  overflow-wrap: anywhere;
  font-size: 2rem;
  line-height: 1.2;
}

.page-header p {
  margin-top: 0.65rem;
  color: var(--muted-text);
  line-height: 1.5;
}

.forgot-password-form {
  width: 100%;
}

.field-group {
  min-width: 0;
}

.field-group label {
  display: block;
  margin-bottom: 0.45rem;
  font-weight: 700;
  line-height: 1.3;
}

.form-control {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--input-border);
  border-radius: 10px;
  outline: none;
  background: var(--input-bg);
  color: var(--input-text);
  font: inherit;
  line-height: 1.4;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.form-control::placeholder {
  color: var(--muted-text);
  opacity: 0.8;
}

.form-control:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 0.22rem var(--focus-ring);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.form-control:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.field-error {
  margin: 0.4rem 0 0;
  color: var(--error-text);
  font-size: 0.88rem;
  line-height: 1.35;
}

.form-error {
  margin: 1rem 0 0;
  padding: 0.75rem 0.9rem;
  border: 1px solid rgba(220, 53, 69, 0.45);
  border-radius: 10px;
  background: rgba(220, 53, 69, 0.08);
  color: var(--error-text);
  font-weight: 700;
  text-align: center;
}

.submit-button,
.back-button {
  display: inline-flex;
  width: 100%;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    filter 140ms ease,
    transform 140ms ease,
    background-color 140ms ease;
}

.submit-button {
  gap: 0.55rem;
  margin-top: 1.4rem;
  padding: 0.75rem 1rem;
  border: 0;
  background: #218c4f;
  color: #ffffff;
}

.back-button {
  margin-top: 0.75rem;
  padding: 0.7rem 1rem;
  border: 1px solid var(--input-border);
  background: transparent;
  color: var(--page-text);
}

.submit-button:hover:not(:disabled),
.back-button:hover:not(:disabled) {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

.back-button:hover:not(:disabled) {
  background: rgba(128, 128, 128, 0.08);
}

.submit-button:focus-visible,
.back-button:focus-visible,
.form-control:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}

.submit-button:disabled,
.back-button:disabled {
  cursor: not-allowed;
  opacity: 0.68;
}

.button-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 3px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767.98px) {
  .forgot-password-page {
    padding: 1rem 0;
  }

  .forgot-password-container {
    width: 90%;
  }

  .forgot-password-card {
    padding: 1.25rem;
    border-radius: 12px;
  }

  .page-header h1 {
    font-size: 1.65rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .form-control,
  .submit-button,
  .back-button {
    transition: none;
  }

  .submit-button:hover:not(:disabled),
  .back-button:hover:not(:disabled) {
    transform: none;
  }

  .button-spinner {
    animation-duration: 1.4s;
  }
}
</style>
