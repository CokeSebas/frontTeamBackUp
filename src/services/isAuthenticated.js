import { ref } from 'vue';

export const isAuthenticated = ref(false);

// Al montar la aplicación, verifica si el token está presente en localStorage
if (localStorage.getItem('userToken')) {
  isAuthenticated.value = true; // Marca como autenticado si el token existe
}
