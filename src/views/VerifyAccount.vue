<template>
  <main
    class="verify-account-page"
    :class="{ 'theme-dark': mode === 'dark' }"
  >
    <section
      class="verification-card"
      :aria-busy="status === 'loading'"
      aria-live="polite"
    >
      <header class="verification-header">
        <h1>{{ $t('verifyAccount') }}</h1>
      </header>

      <div
        v-if="status === 'loading'"
        class="verification-state"
      >
        <img
          v-if="gifLoading"
          :src="gifLoading"
          class="loading-image"
          alt=""
          aria-hidden="true"
        >

        <span
          v-else
          class="loading-spinner"
          aria-hidden="true"
        />

        <p class="state-title">
          {{ $t('verifyingAccount') }}
        </p>

        <p class="state-description">
          Este proceso puede tardar unos segundos.
        </p>
      </div>

      <div
        v-else-if="status === 'success'"
        class="verification-state success-state"
        role="status"
      >
        <span class="status-icon success-icon" aria-hidden="true">✓</span>

        <p class="state-title success-message">
          {{ $t('verifyAccountSuccess') }}
        </p>

        <p class="state-description">
          Serás redirigido automáticamente al inicio.
        </p>
      </div>

      <div
        v-else
        class="verification-state error-state"
        role="alert"
      >
        <span class="status-icon error-icon" aria-hidden="true">!</span>

        <p class="state-title error-message">
          {{ $t('verifyAccountError') }}
        </p>

        <p v-if="errorDetail" class="state-description">
          {{ errorDetail }}
        </p>

        <div class="verification-actions">
          <button
            v-if="hasToken"
            type="button"
            class="btn btn-primary"
            :disabled="status === 'loading'"
            @click="verifyAccount"
          >
            Reintentar
          </button>

          <button
            type="button"
            class="btn btn-outline-secondary"
            @click="goHome"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import axios from 'axios';
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  ref
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const apiUrl = inject('apiUrl', '');
const gifLoading = inject('gifLoading', '');
const mode = inject('mode', 'light');

const status = ref('loading');
const errorDetail = ref('');

let requestController = null;
let redirectTimer = null;

const token = computed(() => {
  const queryToken = route.query.token;

  if (Array.isArray(queryToken)) {
    return String(queryToken[0] || '').trim();
  }

  return String(queryToken || '').trim();
});

const hasToken = computed(() => token.value.length > 0);

function buildApiUrl(path) {
  const baseUrl = String(apiUrl || '').replace(/\/+$/, '');
  const cleanPath = String(path || '').replace(/^\/+/, '');

  return `${baseUrl}/${cleanPath}`;
}

function getVerificationResult(response) {
  const result = response?.data?.salida?.[0];

  if (!result || typeof result !== 'object') {
    return null;
  }

  return result;
}

function getErrorDetail(error) {
  const apiMessage =
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.response?.data?.salida?.[0]?.message;

  if (apiMessage) {
    return String(apiMessage);
  }

  if (error?.code === 'ERR_CANCELED') {
    return '';
  }

  if (!error?.response) {
    return 'No fue posible conectarse con el servidor. Revisa tu conexión e inténtalo nuevamente.';
  }

  return 'El enlace pudo haber expirado o ya fue utilizado.';
}

function scheduleRedirect() {
  window.clearTimeout(redirectTimer);

  redirectTimer = window.setTimeout(() => {
    router.replace('/').catch((error) => {
      console.error('No fue posible redirigir al inicio:', error);
    });
  }, 1600);
}

async function verifyAccount() {
  if (!hasToken.value) {
    status.value = 'error';
    errorDetail.value = 'El enlace de verificación no contiene un token válido.';
    return;
  }

  requestController?.abort();
  requestController = new AbortController();

  status.value = 'loading';
  errorDetail.value = '';

  try {
    const response = await axios.get(
      buildApiUrl('users/verify-account'),
      {
        params: { token: token.value },
        signal: requestController.signal
      }
    );

    const result = getVerificationResult(response);
    const userData = result?.data?.user;
    const userToken = result?.data?.token;
    const userId = result?.data?.id ?? userData?.id;

    if (
      result?.status !== 'success' ||
      !userData ||
      !userToken
    ) {
      throw new Error('INVALID_VERIFICATION_RESPONSE');
    }

    authStore.login(userData, userToken, userId);
    localStorage.setItem('token', userToken);

    status.value = 'success';
    scheduleRedirect();
  } catch (error) {
    if (axios.isCancel(error) || error?.code === 'ERR_CANCELED') {
      return;
    }

    console.error('Error al verificar la cuenta:', error);
    status.value = 'error';
    errorDetail.value = getErrorDetail(error);
  } finally {
    requestController = null;
  }
}

function goHome() {
  router.replace('/').catch((error) => {
    console.error('No fue posible volver al inicio:', error);
  });
}

onMounted(() => {
  verifyAccount();
});

onBeforeUnmount(() => {
  requestController?.abort();
  window.clearTimeout(redirectTimer);
});
</script>

<style scoped>
.verify-account-page {
  --page-text: #212529;
  --card-bg: #ffffff;
  --card-border: #dfe3e8;
  --card-shadow: 0 16px 40px rgba(18, 38, 63, 0.1);
  --muted-text: #66717f;
  --success: #198754;
  --success-bg: rgba(25, 135, 84, 0.12);
  --error: #dc3545;
  --error-bg: rgba(220, 53, 69, 0.12);
  --focus-ring: rgba(13, 110, 253, 0.25);

  display: grid;
  min-height: calc(100vh - 80px);
  padding: clamp(1.25rem, 4vw, 3rem);
  place-items: center;
  color: var(--page-text);
}

.verify-account-page.theme-dark {
  --page-text: #f1f3f5;
  --card-bg: #1f2329;
  --card-border: #3b424b;
  --card-shadow: 0 16px 40px rgba(0, 0, 0, 0.32);
  --muted-text: #c2c8d0;
  --success: #75d6a3;
  --success-bg: rgba(117, 214, 163, 0.13);
  --error: #ff8f9a;
  --error-bg: rgba(255, 143, 154, 0.13);
}

.verification-card {
  width: min(100%, 620px);
  min-height: 390px;
  overflow: hidden;
  border: 1px solid var(--card-border);
  border-radius: 18px;
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
}

.verification-header {
  padding: clamp(1.25rem, 4vw, 2rem);
  border-bottom: 1px solid var(--card-border);
  text-align: center;
}

.verification-header h1 {
  margin: 0;
  font-size: clamp(1.55rem, 4vw, 2.15rem);
  line-height: 1.2;
}

.verification-state {
  display: flex;
  min-height: 300px;
  padding: clamp(1.5rem, 5vw, 2.75rem);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  text-align: center;
}

.loading-image {
  display: block;
  width: clamp(160px, 24vw, 230px);
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

.loading-spinner {
  width: 72px;
  height: 72px;
  border: 7px solid var(--card-border);
  border-top-color: #0d6efd;
  border-radius: 50%;
  animation: loading-spin 0.85s linear infinite;
}

.status-icon {
  display: grid;
  width: 82px;
  height: 82px;
  border-radius: 50%;
  place-items: center;
  font-size: 2.65rem;
  font-weight: 800;
  line-height: 1;
}

.success-icon {
  background: var(--success-bg);
  color: var(--success);
}

.error-icon {
  background: var(--error-bg);
  color: var(--error);
}

.state-title,
.state-description {
  margin: 0;
}

.state-title {
  max-width: 480px;
  font-size: clamp(1.08rem, 3vw, 1.3rem);
  font-weight: 700;
}

.state-description {
  max-width: 480px;
  color: var(--muted-text);
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.success-message {
  color: var(--success);
}

.error-message {
  color: var(--error);
}

.verification-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}

.btn:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

@keyframes loading-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 575.98px) {
  .verify-account-page {
    min-height: calc(100vh - 60px);
    padding: 0.85rem;
  }

  .verification-card {
    min-height: 360px;
    border-radius: 14px;
  }

  .verification-state {
    min-height: 275px;
    padding: 1.25rem;
  }

  .loading-image {
    width: clamp(150px, 52vw, 200px);
  }

  .verification-actions {
    width: 100%;
    flex-direction: column;
  }

  .verification-actions .btn {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation-duration: 1.8s;
  }

  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
