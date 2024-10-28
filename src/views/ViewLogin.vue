<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow-lg">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">Iniciar Sesión</h3>
            <form @submit.prevent="login">
              <div class="form-group mb-3">
                <label for="email">Correo Electrónico</label>
                <input
                  type="email"
                  class="form-control"
                  id="email"
                  v-model="email"
                  placeholder="Ingresa tu correo"
                  required
                  :disabled="isLoading" 
                />
              </div>
              <div class="form-group mb-3">
                <label for="password">Contraseña</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  placeholder="Ingresa tu contraseña"
                  required
                  :disabled="isLoading"
                />
              </div>
              <div class="text-center mt-4">
                <button 
                  type="submit" 
                  class="btn btn-primary btn-lg w-100"
                  :disabled="isLoading"
                >
                  <!-- Mostrar spinner si está cargando -->
                  <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span v-if="!isLoading">Iniciar Sesión</span>
                </button>
              </div>
            </form>
            <div class="mt-3 text-center">
              <router-link to="/forgot-password" class="d-block mt-2">
                ¿Olvidaste tu contraseña?
              </router-link>
              <router-link to="/create-account" class="d-block mt-2">
                Crear una cuenta nueva
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { inject,ref } from 'vue';  // Importa `ref` para variables reactivas
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuthStore } from '@/stores/authStore';

export default {
  inject: ['apiUrl'],
  name: "LoginView",
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const apiUrl = inject('apiUrl'); // Obtén la variable inyectada

    // Definir variables reactivas
    const email = ref('');
    const password = ref('');
    const isLoading = ref(false);  // Bandera para el estado de carga

    // Función para manejar el login
    const login = () => {
      isLoading.value = true;  // Mostrar el estado de carga
      const datos = {
        email: email.value,
        passwordHash: password.value,
      };

      axios.post(apiUrl + "users/login", datos)
        .then(response => {
          if (response.data.code == 200) {
            Swal.fire({
              title: 'Login',
              text: response.data.message,
              icon: 'success'
            });

            setTimeout(() => {
              authStore.login(response.data.data.user, response.data.data.token, response.data.data.id);

              localStorage.setItem("token", response.data.data.token);

              const redirectTo = router.currentRoute.value.query.redirect || '/';
              router.push(redirectTo);
            }, 1500);
          } else if (response.data.code == 202) {
            Swal.fire({
              title: 'Error',
              text: response.data.message,
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          }
        })
        .catch(error => {
          console.error('Error:', error);
          Swal.fire({
            title: 'Error',
            text: 'Ocurrió un error al intentar iniciar sesión.',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        })
        .finally(() => {
          isLoading.value = false;  // Ocultar el estado de carga
        });
    };

    return {
      email, 
      password,
      login,
      isLoading,  // Exponer la bandera isLoading
    };
  },
};
</script>

<style scoped>
/* Estilos específicos para el formulario de login */
.spinner-border {
  vertical-align: middle;
}
</style>
