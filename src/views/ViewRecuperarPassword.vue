<template>
  <div class="d-flex justify-content-center align-items-center ">
    <div class="col-12 col-md-6 col-lg-4">
      <h2 class="text-center mb-4">{{ $t('profileSeccion.recoveryPassword') }}</h2>
      <form @submit.prevent="resetPassword" class="d-flex flex-column">
        <input
          v-model="newPassword"
          type="password"
          class="form-control mb-3"
          :placeholder="$t('profileSeccion.enterNewPassword')"
        />
        <button type="submit" class="btn btn-success">{{ $t('buttons.changePassword') }}</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { inject, ref } from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import Swal from 'sweetalert2';

import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'; // Importa useI18n


const router = useRouter();

const route = useRoute();
const newPassword = ref('');

const apiUrl = inject('apiUrl'); // Ahora tienes acceso a apiUrl

const { t } = useI18n(); // Usa `useI18n` para obtener `t`

const resetPassword = async () => {
  const token = route.query.token;
  try {
    await axios.post(apiUrl+'users/reset-password', { token, newPassword: newPassword.value });
    Swal.fire({
      icon: 'success',
      title: t('responseApisSeccion.exito'),
      text: t('responseApisSeccion.passwordRestabled'),
      showConfirmButton: true
    }).then(() => {
      router.push('/login');
    });
  } catch (error) {
    console.error(error);
    Swal.fire({
      icon: 'error',
      title: t('responseApisSeccion.error'),
      text: t('responseApisSeccion.passwordRestableError'),
    })
  }
};
</script>
