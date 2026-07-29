<template>
  <main
    class="account-page"
    :class="{ 'theme-dark': isDark }"
  >
    <div class="account-container">
      <section class="account-card">
        <header class="account-header">
          <h1>{{ $t('createAccount') }}</h1>
        </header>

        <form
          class="account-form"
          novalidate
          :aria-busy="isLoading"
          @submit.prevent="saveUser"
        >
          <div class="form-grid">
            <div class="field-group">
              <label for="name">
                {{ $t('profileSeccion.name') }}
              </label>

              <input
                id="name"
                v-model="user.name"
                class="account-input"
                :class="{ 'is-invalid': nameTouched && nameError }"
                type="text"
                autocomplete="given-name"
                maxlength="80"
                :placeholder="$t('profileSeccion.ingNombre')"
                :disabled="isLoading"
                :aria-invalid="nameTouched && nameError"
                :aria-describedby="
                  nameTouched && nameError
                    ? 'name-error'
                    : undefined
                "
                @blur="nameTouched = true"
                @input="clearServerError"
              >

              <p
                v-if="nameTouched && nameError"
                id="name-error"
                class="field-error"
              >
                {{ $t('errorsSeccion.errorName') }}
              </p>
            </div>

            <div class="field-group">
              <label for="lastName">
                {{ $t('profileSeccion.lastName') }}
              </label>

              <input
                id="lastName"
                v-model="user.lastName"
                class="account-input"
                :class="{
                  'is-invalid':
                    lastNameTouched && lastNameError
                }"
                type="text"
                autocomplete="family-name"
                maxlength="100"
                :placeholder="$t('profileSeccion.ingApellido')"
                :disabled="isLoading"
                :aria-invalid="
                  lastNameTouched && lastNameError
                "
                :aria-describedby="
                  lastNameTouched && lastNameError
                    ? 'last-name-error'
                    : undefined
                "
                @blur="lastNameTouched = true"
                @input="clearServerError"
              >

              <p
                v-if="lastNameTouched && lastNameError"
                id="last-name-error"
                class="field-error"
              >
                {{ $t('errorsSeccion.errorLastName') }}
              </p>
            </div>

            <div class="field-group">
              <label for="email">
                {{ $t('profileSeccion.email') }}
              </label>

              <input
                id="email"
                v-model="user.email"
                class="account-input"
                :class="{ 'is-invalid': emailTouched && emailError }"
                type="email"
                inputmode="email"
                autocomplete="email"
                maxlength="150"
                :placeholder="$t('profileSeccion.ingEmail')"
                :disabled="isLoading"
                :aria-invalid="emailTouched && emailError"
                :aria-describedby="
                  emailTouched && emailError
                    ? 'email-error'
                    : undefined
                "
                @blur="emailTouched = true"
                @input="clearServerError"
              >

              <p
                v-if="emailTouched && emailError"
                id="email-error"
                class="field-error"
              >
                {{ $t('errorsSeccion.errorEmail') }}
              </p>
            </div>

            <div class="field-group">
              <label for="nickName">
                {{ $t('profileSeccion.nickName') }}
              </label>

              <input
                id="nickName"
                v-model="user.nickName"
                class="account-input"
                :class="{
                  'is-invalid':
                    nickNameTouched && nickNameError
                }"
                type="text"
                autocomplete="nickname"
                maxlength="50"
                :placeholder="$t('profileSeccion.ingNickName')"
                :disabled="isLoading"
                :aria-invalid="
                  nickNameTouched && nickNameError
                "
                :aria-describedby="
                  nickNameTouched && nickNameError
                    ? 'nickname-error'
                    : undefined
                "
                @blur="nickNameTouched = true"
                @input="clearServerError"
              >

              <p
                v-if="nickNameTouched && nickNameError"
                id="nickname-error"
                class="field-error"
              >
                Debes ingresar un nickname.
              </p>
            </div>

            <div class="field-group">
              <label for="passwordHash">
                {{ $t('profileSeccion.password') }}
              </label>

              <input
                id="passwordHash"
                v-model="user.passwordHash"
                class="account-input"
                :class="{
                  'is-invalid':
                    passwordTouched && passwordError
                }"
                type="password"
                autocomplete="new-password"
                :placeholder="$t('profileSeccion.ingPassword')"
                :disabled="isLoading"
                :aria-invalid="
                  passwordTouched && passwordError
                "
                :aria-describedby="
                  passwordTouched && passwordError
                    ? 'password-error'
                    : undefined
                "
                @blur="passwordTouched = true"
                @input="clearServerError"
              >
            </div>

            <div class="field-group">
              <label for="confirmPassword">
                {{ $t('profileSeccion.confirmPassword') }}
              </label>

              <input
                id="confirmPassword"
                v-model="confirmPassword"
                class="account-input"
                :class="{
                  'is-invalid':
                    passwordTouched && passwordError
                }"
                type="password"
                autocomplete="new-password"
                :placeholder="
                  $t('profileSeccion.ingConfirmPassword')
                "
                :disabled="isLoading"
                :aria-invalid="
                  passwordTouched && passwordError
                "
                :aria-describedby="
                  passwordTouched && passwordError
                    ? 'password-error'
                    : undefined
                "
                @blur="passwordTouched = true"
                @input="clearServerError"
              >

              <p
                v-if="passwordTouched && passwordError"
                id="password-error"
                class="field-error"
              >
                {{ $t('errorsSeccion.errorConfirmPassword') }}
              </p>
            </div>

            <div class="field-group full-width">
              <label for="avatarUrl">
                {{ $t('profileSeccion.avatarUrl') }}
              </label>

              <input
                id="avatarUrl"
                v-model="user.avatarUrl"
                class="account-input"
                :class="{
                  'is-invalid':
                    avatarTouched && avatarUrlError
                }"
                type="url"
                inputmode="url"
                autocomplete="url"
                maxlength="500"
                :placeholder="$t('profileSeccion.ingAvatarUrl')"
                :disabled="isLoading"
                :aria-invalid="
                  avatarTouched && avatarUrlError
                "
                :aria-describedby="
                  avatarTouched && avatarUrlError
                    ? 'avatar-error'
                    : undefined
                "
                @blur="avatarTouched = true"
                @input="clearServerError"
              >

              <p
                v-if="avatarTouched && avatarUrlError"
                id="avatar-error"
                class="field-error"
              >
                Ingresa una URL válida que comience con http:// o https://.
              </p>
            </div>
          </div>

          <p
            v-if="serverError"
            class="form-error"
            role="alert"
            aria-live="assertive"
          >
            {{ serverError }}
          </p>

          <button
            type="submit"
            class="submit-button"
            :disabled="isLoading"
          >
            <span
              v-if="isLoading"
              class="button-spinner"
              aria-hidden="true"
            />
            <span>
              {{
                isLoading
                  ? 'Creando...'
                  : $t('buttons.createAccount')
              }}
            </span>
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
  reactive,
  ref,
  unref
} from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useI18n } from 'vue-i18n';

const apiUrl = inject('apiUrl');
const mode = inject('mode');

const router = useRouter();
const { t } = useI18n();

const isLoading = ref(false);
const serverError = ref('');

const nameTouched = ref(false);
const lastNameTouched = ref(false);
const emailTouched = ref(false);
const passwordTouched = ref(false);
const nickNameTouched = ref(false);
const avatarTouched = ref(false);

let requestController = null;

const user = reactive({
  name: '',
  lastName: '',
  email: '',
  passwordHash: '',
  avatarUrl: '',
  provider: 'local',
  nickName: ''
});

const confirmPassword = ref('');

const isDark = computed(() => unref(mode) === 'dark');

const nameError = computed(
  () => user.name.trim().length < 3
);

const lastNameError = computed(
  () => user.lastName.trim().length < 3
);

const emailError = computed(() => {
  const email = user.email.trim();

  return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
});

const passwordError = computed(
  () =>
    !user.passwordHash ||
    !confirmPassword.value ||
    user.passwordHash !== confirmPassword.value
);

const nickNameError = computed(
  () => !user.nickName.trim()
);

const avatarUrlError = computed(() => {
  const avatarUrl = user.avatarUrl.trim();

  if (!avatarUrl) {
    return false;
  }

  try {
    const parsedUrl = new URL(avatarUrl);

    return !['http:', 'https:'].includes(parsedUrl.protocol);
  } catch {
    return true;
  }
});

const hasErrors = computed(
  () =>
    nameError.value ||
    lastNameError.value ||
    emailError.value ||
    passwordError.value ||
    nickNameError.value ||
    avatarUrlError.value
);

const buildApiUrl = (path) => {
  const baseUrl = String(unref(apiUrl) || '').replace(/\/+$/, '');
  const cleanPath = String(path || '').replace(/^\/+/, '');

  return `${baseUrl}/${cleanPath}`;
};

const clearServerError = () => {
  serverError.value = '';
};

const touchAllFields = () => {
  nameTouched.value = true;
  lastNameTouched.value = true;
  emailTouched.value = true;
  passwordTouched.value = true;
  nickNameTouched.value = true;
  avatarTouched.value = true;
};

const createPayload = () => ({
  name: user.name.trim(),
  lastName: user.lastName.trim(),
  email: user.email.trim().toLowerCase(),
  passwordHash: user.passwordHash,
  avatarUrl: user.avatarUrl.trim(),
  provider: user.provider,
  nickName: user.nickName.trim()
});

const isSuccessfulResponse = (data) =>
  data?.salida?.[0]?.status === 'success' ||
  data?.status === 'success' ||
  data?.success === true;

const saveUser = async () => {
  if (isLoading.value) {
    return;
  }

  touchAllFields();
  clearServerError();

  if (hasErrors.value) {
    return;
  }

  isLoading.value = true;
  requestController = new AbortController();

  try {
    const response = await axios.post(
      buildApiUrl('users'),
      createPayload(),
      {
        signal: requestController.signal
      }
    );

    if (!isSuccessfulResponse(response?.data)) {
      throw new Error(
        response?.data?.message || 'ACCOUNT_CREATION_FAILED'
      );
    }

    await Swal.fire({
      icon: 'success',
      title: t('responseApisSeccion.accountCreated'),
      text: t('responseApisSeccion.accountMailSent'),
      timerProgressBar: true,
      showConfirmButton: true
    });

    await router.replace('/');
  } catch (error) {
    if (
      error?.name === 'CanceledError' ||
      error?.code === 'ERR_CANCELED'
    ) {
      return;
    }

    console.error('Error al crear la cuenta:', error);

    serverError.value =
      error?.response?.data?.message ||
      t('responseApisSeccion.errorAccountCreated');

    await Swal.fire({
      icon: 'error',
      title: t('responseApisSeccion.error'),
      text: serverError.value
    });
  } finally {
    isLoading.value = false;
    requestController = null;
  }
};

onBeforeUnmount(() => {
  requestController?.abort();
});
</script>

<style scoped>
.account-page {
  --page-bg: #f1f4f7;
  --page-text: #20252b;
  --card-bg: #ffffff;
  --card-border: #dce2e8;
  --card-shadow: 0 12px 34px rgba(31, 45, 61, 0.1);
  --input-bg: #ffffff;
  --input-text: #20252b;
  --input-border: #c8d0d9;
  --muted-text: #687482;
  --error-text: #c92a2a;
  --focus-ring: rgba(52, 152, 219, 0.24);

  min-height: 100dvh;
  padding: 2rem 0;
  background: var(--page-bg);
  color: var(--page-text);
}

.account-page.theme-dark {
  --page-bg: #121416;
  --page-text: #f1f3f5;
  --card-bg: #1e2329;
  --card-border: #3b444e;
  --card-shadow: 0 12px 34px rgba(0, 0, 0, 0.34);
  --input-bg: #2a3037;
  --input-text: #f1f3f5;
  --input-border: #4c5763;
  --muted-text: #bbc3cc;
  --error-text: #ff8787;
  --focus-ring: rgba(110, 168, 254, 0.3);
}

.account-page,
.account-page * {
  box-sizing: border-box;
}

.account-container {
  width: 70%;
  margin: 0 auto;
}

.account-card {
  padding: 2rem;
  border: 1px solid var(--card-border);
  border-radius: 16px;
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
}

.account-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.account-header h1 {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 2rem;
  line-height: 1.2;
}

.account-form {
  width: 100%;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem 1.25rem;
}

.field-group {
  min-width: 0;
}

.full-width {
  grid-column: 1 / -1;
}

.field-group label {
  display: block;
  margin-bottom: 0.45rem;
  font-weight: 700;
  line-height: 1.3;
}

.account-input {
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
  line-height: 1.3;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.account-input::placeholder {
  color: var(--muted-text);
  opacity: 0.8;
}

.account-input:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 0.22rem var(--focus-ring);
}

.account-input.is-invalid {
  border-color: #dc3545;
}

.account-input:disabled {
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
  margin: 1.25rem 0 0;
  padding: 0.75rem 0.9rem;
  border: 1px solid rgba(220, 53, 69, 0.45);
  border-radius: 10px;
  background: rgba(220, 53, 69, 0.08);
  color: var(--error-text);
  font-weight: 700;
  text-align: center;
}

.submit-button {
  display: inline-flex;
  width: 100%;
  min-height: 46px;
  gap: 0.55rem;
  align-items: center;
  justify-content: center;
  margin-top: 1.5rem;
  padding: 0.7rem 1rem;
  border: 0;
  border-radius: 10px;
  background: #218c4f;
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
  transition:
    filter 140ms ease,
    transform 140ms ease;
}

.submit-button:hover:not(:disabled) {
  filter: brightness(0.95);
  transform: translateY(-1px);
}

.submit-button:focus-visible,
.account-input:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}

.submit-button:disabled {
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
  .account-page {
    padding: 1rem 0;
  }

  .account-container {
    width: 90%;
  }

  .account-card {
    padding: 1.25rem;
    border-radius: 12px;
  }

  .account-header h1 {
    font-size: 1.65rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }
}

@media (prefers-reduced-motion: reduce) {
  .account-input,
  .submit-button {
    transition: none;
  }

  .submit-button:hover:not(:disabled) {
    transform: none;
  }

  .button-spinner {
    animation-duration: 1.4s;
  }
}
</style>
