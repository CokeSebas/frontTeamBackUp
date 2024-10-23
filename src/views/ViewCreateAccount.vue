<template>
  <div class="form-background">
    <div class="form-container">
      <h1 class="form-title">Crear Cuenta</h1>
      <form @submit.prevent="saveUser">
        <div class="form-group">
          <label for="name">Nombre:</label>
          <input 
            type="text" 
            v-model="user.name" 
            class="form-control" 
            placeholder="Ingresa tu nombre" 
            required
          />
        </div>

        <div class="form-group">
          <label for="lastName">Apellido:</label>
          <input 
            type="text" 
            v-model="user.lastName" 
            class="form-control" 
            id="lastName" 
            placeholder="Ingresa tu apellido" 
            required
          />
        </div>

        <div class="form-group">
          <label for="email">Email:</label>
          <input 
            type="email" 
            v-model="user.email" 
            class="form-control" 
            id="email" 
            placeholder="Ingresa tu email" 
            required
          />
        </div>

        <div class="form-group">
          <label for="passwordHash">Contraseña:</label>
          <input 
            type="password" 
            v-model="user.passwordHash" 
            class="form-control" 
            id="passwordHash" 
            placeholder="Ingresa tu contraseña" 
            required
          />
        </div>

        <div class="form-group">
          <label for="avatarUrl">URL de Imagen:</label>
          <input 
            type="url" 
            v-model="user.avatarUrl" 
            class="form-control" 
            id="avatarUrl" 
            placeholder="Ingresa la URL de tu imagen"
          />
        </div>

        <div class="form-group">
          <label for="nickname">Nickname:</label>
          <input 
            type="text" 
            v-model="user.nickname" 
            class="form-control" 
            id="nickname" 
            placeholder="Ingresa tu nickname" 
            required
          />
        </div>

        <button type="submit" class="btn btn-primary mt-3">Crear Cuenta</button>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { reactive } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  import Swal from 'sweetalert2';
  import { isAuthenticated } from '../services/isAuthenticated';

  const router = useRouter();

  const user = reactive({
    name: '',
    lastName: '',
    email: '',
    passwordHash: '',
    avatarUrl: '',
    provider: 'local',
    nickname: '',
  });

  async function saveUser() {
    //console.log("Datos del formulario:", user);
    // Lógica para manejar el registro aquí
    try {
      const response = await axios.post('http://localhost:4000/api/users', user, {
      });

      console.log(response.data.salida[0].status);
      
      if(response.data.salida[0].status == "success"){

        isAuthenticated.value = true;

        localStorage.setItem("token", response.data.salida[0].data.token);

        Swal.fire({
          icon: 'success',
          title: 'Cuenta creada con éxito',
          text: response.data.salida[0].message,
          showConfirmButton: false,
          timer: 1500
        });
        setTimeout(() => {
          const redirectTo = router.currentRoute.value.query.redirect || '/';
          router.push(redirectTo);
        }, 1500);
      }else if(response.data.salida[0].status == "error"){
        Swal.fire({
          icon: 'error',
          title: 'Error al registrar',
          text: response.data.salida[0].message
        });
      }
      
    } catch (error) {
      console.error('Error al registrar:', error);
    }
  }  

</script>

<style scoped>
  .form-background {
    background-color: #f0f0f0; /* Fondo gris claro */
    height: 100vh; /* Altura completa de la pantalla */
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .form-container {
    max-width: 600px;
    width: 100%;
    padding: 20px;
    background-color: #fff; /* Fondo blanco */
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  .form-title {
    text-align: center;
    margin-bottom: 20px;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .form-control {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
    border: 1px solid #ced4da;
  }

  label {
    font-weight: bold;
    display: block;
    margin-bottom: 5px;
  }

  button {
    display: block;
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
  }
</style>
