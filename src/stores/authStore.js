import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const isAuthenticated = ref(false);
  const user = ref(null);
  const token = ref('');
  const idUser = ref('');

  // Acciones
  function login(userData, authToken, id) {
    isAuthenticated.value = true;
    user.value = userData;
    token.value = authToken;
    idUser.value = id;
  }

  function logout() {
    isAuthenticated.value = false;
    user.value = null;
    token.value = '';
    idUser.value = '';
  }

  // Funciones opcionales para verificar el estado
  function isLoggedIn() {
    return isAuthenticated.value;
  }

  return {
    isAuthenticated,
    user,
    token,
    idUser,
    login,
    logout,
    isLoggedIn,
  };
});
