<template>
  <div class="d-flex justify-content-center align-items-center ">
    <div class="col-12 col-md-6 col-lg-4">
      <h2 class="text-center mb-4">Restablecer contraseña</h2>
      <form @submit.prevent="resetPassword" class="d-flex flex-column">
        <input
          v-model="newPassword"
          type="password"
          class="form-control mb-3"
          placeholder="Enter new password"
        />
        <button type="submit" class="btn btn-primary">Cambiar Contraseña</button>
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
const router = useRouter();

const route = useRoute();
const newPassword = ref('');

const apiUrl = inject('apiUrl'); // Ahora tienes acceso a apiUrl

const resetPassword = async () => {
  const token = route.query.token;
  try {
    await axios.post(apiUrl+'users/reset-password', { token, newPassword: newPassword.value });
    Swal.fire({
      icon: 'success',
      title: 'Contraseña restablecida',
      text: 'Has restablecido tu contraseña con éxito, ahora puedes iniciar sesión con tu nueva contraseña.',
      showConfirmButton: true
    }).then(() => {
      router.push('/login');
    });
  } catch (error) {
    console.error(error);
    alert('Error resetting password');
  }
};
</script>
