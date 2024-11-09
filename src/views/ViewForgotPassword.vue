<template>
  <div class="d-flex justify-content-center mt-5">
    <div class="col-12 col-md-6 col-lg-4">
      <h2 class="text-center mb-4">{{ $t('profileSeccion.forgotMyPassword') }}</h2>
      <form @submit.prevent="sendResetEmail" class="d-flex flex-column">
        <input
          v-model="email"
          type="email"
          class="form-control mb-3"
          :placeholder="$t('profileSeccion.addMail')"
          required
        />
        <button type="submit" class="btn btn-success" :disabled="loading">
          {{ $t('buttons.sendLinkRecovery') }}
        </button>
        <div v-if="loading" class="text-center mt-3">
          <div class="spinner-border text-success" role="status">
            <span class="visually-hidden"></span>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { inject, ref } from 'vue';
  import axios from 'axios';
  import Swal from 'sweetalert2';
  import { useRouter } from 'vue-router';

  import { useI18n } from 'vue-i18n'; // Importa useI18n

  const router = useRouter();

  const email = ref('');
  const loading = ref(false); // Variable para controlar el estado de carga

  const apiUrl = inject('apiUrl'); // Ahora tienes acceso a apiUrl

  const { t } = useI18n();

  const sendResetEmail = async () => {
    loading.value = true; // Activa el estado de carga

    try {
      await axios.post(apiUrl+'users/forgot-password', { email: email.value });
      Swal.fire({
        icon: 'success',
        title: t('responseApisSeccion.exito'),
        text: t('responseApisSeccion.sendMailRecovyred'),
      });
      setTimeout(() => {
        router.push('/');
      }, 1500);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: 'error',
        title: t('responseApisSeccion.error'),
        text: t('responseApisSeccion.errorSendMailRecovyred'),
      });
    } finally {
      loading.value = false; // Desactiva el estado de carga
    }
  };
</script>
