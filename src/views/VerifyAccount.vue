<template>
  <div class="verify-account-container">
    <h2>Verificación de Cuenta</h2>
    <div v-if="loading">
      <p>Verificando tu cuenta, por favor espera...</p>
    </div>
    <div v-else>
      <p v-if="verificationSuccess" class="success-message">¡Tu cuenta ha sido verificada exitosamente!</p>
      <p v-else class="error-message">Hubo un problema al verificar tu cuenta. El enlace podría haber expirado o ser inválido.</p>
    </div>
  </div>
</template>

<script setup>

import { inject, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore'; // Asegúrate de que el store esté correctamente importado

const authStore = useAuthStore(); // Inicializa el store de autenticación
const router = useRouter(); // Inicializa el router para hacer la redirección
const route = useRoute();
const apiUrl = inject('apiUrl'); // Ahora tienes acceso a apiUrl

const token = route.query.token;
const loading = ref(true);
const verificationSuccess = ref(false);

onMounted(async () => {
  if (!token) {
    loading.value = false;
    return;
  }

  try {
    const response = await axios.get(`${apiUrl}users/verify-account`, {
      params: { token }
    });

    console.log(response.data.salida[0].status);
    if (response.data.salida[0].status === 'success') {
      console.log('cuenta verificada');
      verificationSuccess.value = true;
      
      // Guarda los datos del usuario en el store de autenticación
      const userData = response.data.salida[0].data.user;
      const userToken = response.data.salida[0].data.token;
      const userId = response.data.salida[0].data.id;
      authStore.login(userData, userToken, userId); // Inicia sesión

      localStorage.setItem('token', userToken);

      // Redirige a la página de inicio
      router.push('/');
    } else {
      console.log('error al verificar la cuenta');
      verificationSuccess.value = false;
    }
  } catch (error) {
    console.error('Error al verificar la cuenta:', error);
    verificationSuccess.value = false;
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.verify-account-container {
  max-width: 600px;
  margin: 50px auto;
  padding: 20px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 10px;
}

.success-message {
  color: green;
}

.error-message {
  color: red;
}
</style>
