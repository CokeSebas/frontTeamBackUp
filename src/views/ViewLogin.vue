<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6" :class="mode === 'dark' ? 'dark-mode' : ''">
        <div class="card shadow-lg">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">{{ $t('login') }}</h3>
            <form @submit.prevent="login">
              <div class="form-group mb-3">
                <label for="email">{{ $t('profileSeccion.correoElectronico') }}</label>
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
                <label for="password">{{ $t('profileSeccion.password') }}</label>
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
                  class="btn btn-success btn-lg w-100"
                  :disabled="isLoading"
                >
                  <!-- Mostrar spinner si está cargando -->
                  <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                  <span v-if="!isLoading">{{ $t('login') }}</span>
                </button>
              </div>
            </form>
            <div class="mt-3 text-center">
              <router-link to="/forgot-password" class="d-block mt-2">
                {{ $t('profileSeccion.forgotPassword') }}
              </router-link>
              <router-link to="/create-account" class="d-block mt-2">
                {{ $t('profileSeccion.createAccount') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { inject, ref } from 'vue';  
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  import Swal from 'sweetalert2';
  import { useAuthStore } from '@/stores/authStore';
  import { useI18n } from 'vue-i18n'; // Importa useI18n

  export default {
    inject: ['apiUrl', 'gifLoading', 'mode'],
    name: "LoginView",
    setup() {
      const { t } = useI18n(); // Usa `useI18n` para obtener `t`
      const router = useRouter();
      const authStore = useAuthStore();
      const apiUrl = inject('apiUrl');

      const email = ref('');
      const password = ref('');
      const isLoading = ref(false);

      const login = () => {
        isLoading.value = true;
        const datos = {
          email: email.value,
          passwordHash: password.value,
        };

        axios.post(apiUrl + "users/login", datos)
          .then(response => {
            if (response.data.code == 200) {
              Swal.fire({
                title: t('responseApisSeccion.loginTitle'),
                text: t('responseApisSeccion.loginSuccess'),
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
                title: t('responseApisSeccion.loginTitle'),
                text: t('responseApisSeccion.errorLogin'),
                icon: 'error',
                confirmButtonText: t('buttons.accept')
              });
            }
          })
          .catch(error => {
            console.error('Error:', error);
            Swal.fire({
              title: t('responseApisSeccion.loginTitle'),
              text: t('responseApisSeccion.errorLogin'),
              icon: 'error',
              confirmButtonText: t('buttons.accept')
            });
          })
          .finally(() => {
            isLoading.value = false;
          });
      };

      return {
        email, 
        password,
        login,
        isLoading,
      };
    },
  };

</script>

<style scoped>
  /* Estilos específicos para el formulario de login */
  .spinner-border {
    vertical-align: middle;
  }

  .dark-mode {
    background-color: #121212;
    color: #e0e0e0;
  }

.dark-mode .card {
  background-color: #1e1e1e;
  color: #e0e0e0;
  border-color: #e0e0e0;
}
</style>
