<template>
  <main class="recovery-page">
    <section class="recovery-card" aria-labelledby="recovery-title">
      <div class="recovery-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="img">
          <path
            d="M17 9h-1V7a4 4 0 0 0-8 0v2H7a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2Zm-7-2a2 2 0 1 1 4 0v2h-4V7Zm3 8.73V18h-2v-2.27a2 2 0 1 1 2 0Z"
          />
        </svg>
      </div>

      <header class="recovery-header">
        <h1 id="recovery-title" class="recovery-title">
          {{ t('profileSeccion.recoveryPassword') }}
        </h1>
        <p class="recovery-description">
          {{ t('profileSeccion.enterNewPassword') }}
        </p>
      </header>

      <form class="recovery-form" @submit.prevent="resetPassword">
        <div class="form-group">
          <label class="form-label" for="new-password">
            {{ t('profileSeccion.enterNewPassword') }}
          </label>

          <div class="password-control">
            <input
              id="new-password"
              v-model="newPassword"
              :type="showPassword ? 'text' : 'password'"
              class="form-control password-input"
              :placeholder="t('profileSeccion.enterNewPassword')"
              autocomplete="new-password"
              required
              :disabled="isLoading"
            />

            <button
              type="button"
              class="password-toggle"
              :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              :title="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
              :disabled="isLoading"
              @click="showPassword = !showPassword"
            >
              <svg v-if="showPassword" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="m3.28 2-1.27 1.27 3.08 3.08A11.44 11.44 0 0 0 1 12s4 7 11 7a10.7 10.7 0 0 0 4.05-.8l3.67 3.67 1.27-1.27L3.28 2ZM12 17c-4.35 0-7.35-3.76-8.62-5.99a13.7 13.7 0 0 1 3.04-3.33l1.72 1.72A4 4 0 0 0 13.6 14.86l1.01 1.01A8.9 8.9 0 0 1 12 17Zm0-10c4.35 0 7.35 3.76 8.62 5.99a13.15 13.15 0 0 1-2.18 2.6l1.42 1.42A15.42 15.42 0 0 0 23 12s-4-7-11-7c-.72 0-1.41.08-2.06.21l1.72 1.72C11.45 6.98 11.72 7 12 7Zm-.56 2.04 3.52 3.52A3 3 0 0 0 11.44 9.04Z"
                />
              </svg>

              <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M12 5C5 5 1 12 1 12s4 7 11 7 11-7 11-7-4-7-11-7Zm0 12c-4.35 0-7.35-3.76-8.62-5C4.65 10.76 7.65 7 12 7s7.35 3.76 8.62 5c-1.27 1.24-4.27 5-8.62 5Zm0-8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"
                />
              </svg>
            </button>
          </div>
        </div>

        <button
          type="submit"
          class="btn btn-success recovery-submit"
          :disabled="isLoading || !newPassword"
        >
          <span
            v-if="isLoading"
            class="spinner-border spinner-border-sm"
            role="status"
            aria-hidden="true"
          />
          <span>{{ t('buttons.changePassword') }}</span>
        </button>
      </form>
    </section>
  </main>
</template>

<script setup>
import { inject, onMounted, ref } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Swal from 'sweetalert2';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const apiUrl = inject('apiUrl', '');

const newPassword = ref('');
const showPassword = ref(false);
const isLoading = ref(false);

const getToken = () => {
  const token = route.query.token;
  return Array.isArray(token) ? token[0] : token;
};

const buildApiUrl = (path) => {
  const baseUrl = String(apiUrl || '').replace(/\/+$/, '');
  const normalizedPath = String(path || '').replace(/^\/+/, '');

  return `${baseUrl}/${normalizedPath}`;
};

const showInvalidLinkMessage = async () => {
  await Swal.fire({
    icon: 'error',
    title: t('responseApisSeccion.error'),
    text: t('responseApisSeccion.passwordRestableError'),
    confirmButtonText: 'Aceptar'
  });

  await router.replace('/login');
};

const resetPassword = async () => {
  if (isLoading.value) return;

  const token = getToken();

  if (!token || !apiUrl || !newPassword.value) {
    await showInvalidLinkMessage();
    return;
  }

  isLoading.value = true;

  try {
    await axios.post(buildApiUrl('users/reset-password'), {
      token,
      newPassword: newPassword.value
    });

    await Swal.fire({
      icon: 'success',
      title: t('responseApisSeccion.exito'),
      text: t('responseApisSeccion.passwordRestabled'),
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false
    });

    await router.replace('/login');
  } catch (error) {
    const apiMessage = axios.isAxiosError(error)
      ? error.response?.data?.message
      : null;

    console.error('No fue posible restablecer la contraseña:', error);

    await Swal.fire({
      icon: 'error',
      title: t('responseApisSeccion.error'),
      text: apiMessage || t('responseApisSeccion.passwordRestableError'),
      confirmButtonText: 'Aceptar'
    });
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (!getToken()) {
    void showInvalidLinkMessage();
  }
});
</script>

<style scoped>
.recovery-page {
  min-height: calc(100vh - 72px);
  display: grid;
  place-items: center;
  padding: 32px 16px;
  background:
    radial-gradient(circle at top left, rgba(25, 135, 84, 0.12), transparent 36%),
    var(--bs-tertiary-bg, #f7f8fa);
}

.recovery-card {
  width: min(100%, 460px);
  padding: clamp(24px, 5vw, 40px);
  border: 1px solid var(--bs-border-color, #dee2e6);
  border-radius: 24px;
  background: var(--bs-body-bg, #ffffff);
  color: var(--bs-body-color, #212529);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.12);
}

.recovery-icon {
  width: 64px;
  height: 64px;
  display: grid;
  place-items: center;
  margin: 0 auto 20px;
  border-radius: 20px;
  background: rgba(25, 135, 84, 0.12);
  color: var(--bs-success, #198754);
}

.recovery-icon svg {
  width: 32px;
  height: 32px;
  fill: currentColor;
}

.recovery-header {
  margin-bottom: 28px;
  text-align: center;
}

.recovery-title {
  margin: 0;
  font-size: clamp(1.55rem, 4vw, 2rem);
  font-weight: 750;
  line-height: 1.2;
  letter-spacing: -0.025em;
}

.recovery-description {
  margin: 10px 0 0;
  color: var(--bs-secondary-color, #6c757d);
  font-size: 0.98rem;
  line-height: 1.55;
}

.recovery-form {
  display: grid;
  gap: 22px;
}

.form-group {
  display: grid;
  gap: 8px;
}

.form-label {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 650;
}

.password-control {
  position: relative;
}

.password-input {
  min-height: 50px;
  padding-right: 52px;
  border-radius: 12px;
}

.password-input:focus {
  border-color: rgba(25, 135, 84, 0.7);
  box-shadow: 0 0 0 0.25rem rgba(25, 135, 84, 0.15);
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 8px;
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--bs-secondary-color, #6c757d);
  transform: translateY(-50%);
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
}

.password-toggle:hover:not(:disabled) {
  background: var(--bs-tertiary-bg, #f1f3f5);
  color: var(--bs-body-color, #212529);
}

.password-toggle:focus-visible {
  outline: 3px solid rgba(25, 135, 84, 0.25);
  outline-offset: 1px;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.password-toggle svg {
  width: 21px;
  height: 21px;
  fill: currentColor;
}

.recovery-submit {
  min-height: 50px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 12px;
  font-weight: 700;
}

.recovery-submit:disabled {
  cursor: not-allowed;
}

@media (max-width: 575.98px) {
  .recovery-page {
    min-height: calc(100vh - 56px);
    padding: 16px;
  }

  .recovery-card {
    padding: 24px 20px;
    border-radius: 20px;
  }

  .recovery-icon {
    width: 56px;
    height: 56px;
    border-radius: 17px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .password-toggle {
    transition: none;
  }
}
</style>
