<!-- src/views/LoginView.vue -->
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
                />
              </div>
              <div class="text-center mt-4">
                <button type="submit" class="btn btn-primary btn-lg w-100">
                  Iniciar Sesión
                </button>
              </div>
            </form>
            <div class="mt-3 text-center">
              <a href="#" class="d-block">¿Olvidaste tu contraseña?</a>
              <router-link to="/register" class="d-block mt-2">
                Crear una cuenta nueva
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script >
import router  from '@/router';
import axios from 'axios';
import Swal from 'sweetalert2';
import { isAuthenticated } from '../services/isAuthenticated';


export default {
  name: "LoginView",
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    login() {
      const datos = {
        email: this.email,
        passwordHash: this.password
      }

      axios.post("http://localhost:4000/api/users/login", datos)
      .then(
        response => {
          //console.log(response.data.code);
          if(response.data.code == 200){
            //console.log(response.data.token);
            Swal.fire({
              title: 'Login',
              text: response.data.message,
              icon: 'success', // Tipos: 'success', 'error', 'warning', 'info', 'question'
              //confirmButtonText: 'Aceptar'
            });
            
            setTimeout(() => {
              localStorage.setItem("token", response.data.data.token);
              isAuthenticated.value = true;
              console.log(router.currentRoute.value.query.redirect);
              const redirectTo = router.currentRoute.value.query.redirect || '/'; 
              router.push(redirectTo);
            }, 1500);
          }else if(response.data.code == 202){
            Swal.fire({
              title: 'Error',
              text: response.data.message,
              icon: 'error', // Tipos: 'success', 'error', 'warning', 'info', 'question'
              confirmButtonText: 'Aceptar'
            });
          }
      }
      ).catch(
        error => console.error('Error:', error)
      );
    },
  },
};
</script>

<style scoped>
/* Estilos específicos para el formulario de login */
</style>
