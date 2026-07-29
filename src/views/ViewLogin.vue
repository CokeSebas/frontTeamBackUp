<template>
  <main
    class="login-page"
    :class="{ 'theme-dark': isDark }"
  >
    <div class="login-container">
      <section class="login-card">
        <header class="page-header">
          <h1>{{ $t('login') }}</h1>
        </header>

        <form
          class="login-form"
          novalidate
          :aria-busy="isLoading"
          @submit.prevent="login"
        >
          <div class="field-group">
            <label for="login-email">
              {{ $t('profileSeccion.correoElectronico') }}
            </label>

            <input
              id="login-email"
              v-model="email"
              class="form-control"
              :class="{
                'is-invalid': emailTouched && emailError
              }"
              type="email"
              inputmode="email"
              autocomplete="email"
              maxlength="150"
              placeholder="Ingresa tu correo"
              :disabled="isLoading"
              :aria-invalid="
                emailTouched && Boolean(emailError)
              "
              :aria-describedby="
                emailTouched && emailError
                  ? 'login-email-error'
                  : undefined
              "
              @blur="emailTouched = true"
              @input="clearFormError"
            >

            <p
              v-if="emailTouched && emailError"
              id="login-email-error"
              class="field-error"
            >
              {{ emailError }}
            </p>
          </div>

          <div class="field-group">
            <label for="login-password">
              {{ $t('profileSeccion.password') }}
            </label>

            <div class="password-field">
              <input
                id="login-password"
                v-model="password"
                class="form-control password-input"
                :class="{
                  'is-invalid':
                    passwordTouched && passwordError
                }"
                :type="showPassword ? 'text' : 'password'"
                autocomplete="current-password"
                placeholder="Ingresa tu contraseña"
                :disabled="isLoading"
                :aria-invalid="
                  passwordTouched && Boolean(passwordError)
                "
                :aria-describedby="
                  passwordTouched && passwordError
                    ? 'login-password-error'
                    : undefined
                "
                @blur="passwordTouched = true"
                @input="clearFormError"
              >

              <button
                type="button"
                class="password-toggle"
                :disabled="isLoading"
                :aria-label="
                  showPassword
                    ? 'Ocultar contraseña'
                    : 'Mostrar contraseña'
                "
                :aria-pressed="showPassword"
                @click="togglePassword"
              >
                <i
                  :class="
                    showPassword
                      ? 'bi bi-eye-slash'
                      : 'bi bi-eye'
                  "
                  aria-hidden="true"
                ></i>
              </button>
            </div>

            <p
              v-if="passwordTouched && passwordError"
              id="login-password-error"
              class="field-error"
            >
              {{ passwordError }}
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
            :disabled="isLoading"
          >
            <span
              v-if="isLoading"
              class="button-spinner"
              aria-hidden="true"
            ></span>

            <span>
              {{ isLoading ? 'Ingresando...' : $t('login') }}
            </span>
          </button>
        </form>

        <nav
          class="login-links"
          aria-label="Opciones de acceso"
        >
          <router-link to="/forgot-password">
            {{ $t('profileSeccion.forgotPassword') }}
          </router-link>

          <router-link to="/create-account">
            {{ $t('profileSeccion.createAccount') }}
          </router-link>
        </nav>
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
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/authStore';
import { createEvent } from '@/services/eventService';

const apiUrl = inject('apiUrl');
const mode = inject('mode');

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { t } = useI18n();

const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const formError = ref('');

const emailTouched = ref(false);
const passwordTouched = ref(false);

let requestController = null;

const isDark = computed(() => unref(mode) === 'dark');

const normalizedEmail = computed(() =>
  email.value.trim().toLowerCase()
);

const emailError = computed(() => {
  if (!normalizedEmail.value) {
    return 'Ingresa tu correo electrónico.';
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    normalizedEmail.value
  )
    ? ''
    : 'Ingresa un correo electrónico válido.';
});

const passwordError = computed(() =>
  password.value
    ? ''
    : 'Ingresa tu contraseña.'
);

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

const touchFields = () => {
  emailTouched.value = true;
  passwordTouched.value = true;
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};

const isCanceledRequest = (error) =>
  error?.name === 'CanceledError' ||
  error?.code === 'ERR_CANCELED';

const getSafeRedirect = () => {
  const redirect = route.query.redirect;

  if (
    typeof redirect === 'string' &&
    redirect.startsWith('/') &&
    !redirect.startsWith('//')
  ) {
    return redirect;
  }

  return '/';
};

const extractLoginData = (responseData) => {
  const data = responseData?.data;

  if (!data || typeof data !== 'object') {
    return null;
  }

  const user =
    data.user && typeof data.user === 'object'
      ? data.user
      : data;

  const token = String(data.token || '').trim();

  const userId =
    data.id ??
    user.id ??
    user.userId ??
    user.user_id ??
    null;

  if (!token || !user || userId == null) {
    return null;
  }

  return {
    token,
    userId,
    user
  };
};

const storeSession = ({ token, userId, user }) => {
  authStore.login(user, token, userId);

  localStorage.setItem('token', token);

  const fullName = [
    user.name,
    user.lastName
  ]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' ');

  if (fullName) {
    localStorage.setItem('userName', fullName);
  } else {
    localStorage.removeItem('userName');
  }

  if (user.isAdmin !== undefined) {
    sessionStorage.setItem(
      'isAdmin',
      String(Boolean(user.isAdmin))
    );
  }

  if (user.isOrganizer !== undefined) {
    sessionStorage.setItem(
      'isOrganizer',
      String(Boolean(user.isOrganizer))
    );
  }
};

const registerLoginEvent = async () => {
  try {
    await createEvent({
      userAgent: navigator.userAgent,
      date: new Date().toISOString(),
      type: 'login_user',
      description: `login user:${normalizedEmail.value}`
    });
  } catch (error) {
    console.error(
      'No se pudo registrar el evento de login:',
      error
    );
  }
};

const login = async () => {
  if (isLoading.value) {
    return;
  }

  touchFields();
  clearFormError();

  if (emailError.value || passwordError.value) {
    return;
  }

  isLoading.value = true;

  requestController?.abort();
  requestController = new AbortController();

  try {
    const response = await axios.post(
      buildApiUrl('users/login'),
      {
        email: normalizedEmail.value,
        passwordHash: password.value
      },
      {
        signal: requestController.signal
      }
    );

    const responseCode = Number(response?.data?.code);

    if (responseCode !== 200) {
      throw new Error(
        responseCode === 202
          ? 'INVALID_CREDENTIALS'
          : 'LOGIN_FAILED'
      );
    }

    const loginData = extractLoginData(response?.data);

    if (!loginData) {
      throw new Error('INVALID_LOGIN_RESPONSE');
    }

    storeSession(loginData);

    registerLoginEvent();

    await Swal.fire({
      title: t('responseApisSeccion.loginTitle'),
      text: t('responseApisSeccion.loginSuccess'),
      icon: 'success',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    });

    await router.replace(getSafeRedirect());
  } catch (error) {
    if (isCanceledRequest(error)) {
      return;
    }

    console.error('Error al iniciar sesión:', error);

    formError.value =
      error?.response?.data?.message ||
      t('responseApisSeccion.errorLogin');

    await Swal.fire({
      title: t('responseApisSeccion.loginTitle'),
      text: formError.value,
      icon: 'error',
      confirmButtonText: t('buttons.accept')
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
.login-page {
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
  --link-color: #2479b8;
  --focus-ring: rgba(52, 152, 219, 0.25);

  min-height: 100dvh;
  padding: 2rem 0;
  background: var(--page-bg);
  color: var(--page-text);
}

.login-page.theme-dark {
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
  --link-color: #74c0fc;
  --focus-ring: rgba(110, 168, 254, 0.3);
}

.login-page,
.login-page * {
  box-sizing: border-box;
}

.login-container {
  width: 70%;
  margin: 0 auto;
}

.login-card {
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

.page-header h1 {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 2rem;
  line-height: 1.2;
}

.login-form {
  width: 100%;
}

.field-group + .field-group {
  margin-top: 1rem;
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
  border-color: #3498db;
  box-shadow: 0 0 0 0.22rem var(--focus-ring);
}

.form-control.is-invalid {
  border-color: #dc3545;
}

.form-control:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.password-field {
  position: relative;
}

.password-input {
  padding-right: 3.25rem;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 0.35rem;
  display: inline-flex;
  width: 42px;
  height: 38px;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--muted-text);
  font-size: 1.15rem;
  cursor: pointer;
  transform: translateY(-50%);
}

.password-toggle:hover:not(:disabled) {
  background: rgba(128, 128, 128, 0.1);
  color: var(--page-text);
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.65;
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

.submit-button {
  display: inline-flex;
  width: 100%;
  min-height: 46px;
  gap: 0.55rem;
  align-items: center;
  justify-content: center;
  margin-top: 1.4rem;
  padding: 0.75rem 1rem;
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

.login-links {
  display: grid;
  gap: 0.7rem;
  margin-top: 1.25rem;
  text-align: center;
}

.login-links a {
  color: var(--link-color);
  font-weight: 700;
  text-decoration: none;
}

.login-links a:hover {
  text-decoration: underline;
}

.submit-button:focus-visible,
.password-toggle:focus-visible,
.form-control:focus-visible,
.login-links a:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767.98px) {
  .login-page {
    padding: 1rem 0;
  }

  .login-container {
    width: 90%;
  }

  .login-card {
    padding: 1.25rem;
    border-radius: 12px;
  }

  .page-header h1 {
    font-size: 1.65rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .form-control,
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
