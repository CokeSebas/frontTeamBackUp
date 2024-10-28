<template>
  <div class="form-container">
    <div class="form-card">
      <h1 class="form-title">Crear Cuenta</h1>
      <form @submit.prevent="saveUser">

        <!-- Nombre -->
        <div class="form-group">
          <label for="name">Nombre:</label>
          <input 
            type="text" 
            v-model="user.name" 
            class="form-control" 
            placeholder="Ingresa tu nombre" 
            required
            @blur="validateName"
            :class="{ 'is-invalid': nameTouched && nameError }"
          />
          <div v-if="nameTouched && nameError" class="invalid-feedback">
            El nombre debe tener al menos 3 caracteres.
          </div>
        </div>

        <!-- Apellido -->
        <div class="form-group">
          <label for="lastName">Apellido:</label>
          <input 
            type="text" 
            v-model="user.lastName" 
            class="form-control" 
            id="lastName" 
            placeholder="Ingresa tu apellido" 
            required
            @blur="validateLastName"
            :class="{ 'is-invalid': lastNameTouched && lastNameError }"
          />
          <div v-if="lastNameTouched && lastNameError" class="invalid-feedback">
            El apellido debe tener al menos 3 caracteres.
          </div>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email">Email:</label>
          <input 
            type="email" 
            v-model="user.email" 
            class="form-control" 
            id="email" 
            placeholder="Ingresa tu email" 
            required
            @blur="validateEmail"
            :class="{ 'is-invalid': emailTouched && emailError }"
          />
          <div v-if="emailTouched && emailError" class="invalid-feedback">
            Por favor, ingresa un email válido.
          </div>
        </div>

        <!-- Contraseña -->
        <div class="form-group">
          <label for="passwordHash">Contraseña:</label>
          <input 
            type="password" 
            v-model="user.passwordHash" 
            class="form-control" 
            id="passwordHash" 
            placeholder="Ingresa tu contraseña" 
            required
            @blur="validatePassword"
            :class="{ 'is-invalid': passwordTouched && passwordError }"
          />
        </div>

        <!-- Confirmar Contraseña -->
        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña:</label>
          <input 
            type="password" 
            v-model="confirmPassword" 
            class="form-control" 
            id="confirmPassword" 
            placeholder="Confirma tu contraseña" 
            required
            @blur="validatePassword"
            :class="{ 'is-invalid': passwordTouched && passwordError }"
          />
          <div v-if="passwordTouched && passwordError" class="invalid-feedback">
            Las contraseñas no coinciden.
          </div>
        </div>



        <!-- URL de Imagen -->
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

        <!-- Nickname -->
        <div class="form-group">
          <label for="nickname">Nickname:</label>
          <input 
            type="text" 
            v-model="user.nickName" 
            class="form-control" 
            id="nickName" 
            placeholder="Ingresa tu nickname" 
            required
          />
        </div>

        <!-- Spinner de carga -->
        <div v-if="isLoading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">Cargando...</span>
          </div>
        </div>

        <!-- Botón Crear Cuenta -->
        <button type="submit" class="btn btn-primary mt-3" :disabled="isLoading || hasErrors">
          Crear Cuenta
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { inject, reactive, ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
const apiUrl = inject('apiUrl'); // Ahora tienes acceso a apiUrl

const router = useRouter();
const isLoading = ref(false);
const wasSubmitted = ref(false);

// Variables para rastrear si los campos fueron tocados
const nameTouched = ref(false);
const lastNameTouched = ref(false);
const emailTouched = ref(false);
const passwordTouched = ref(false);

// Datos del usuario
const user = reactive({
  name: '',
  lastName: '',
  email: '',
  passwordHash: '',
  avatarUrl: '',
  provider: 'local',
  nickName: '',
});

// Campo para confirmar la contraseña
const confirmPassword = ref('');

// Errores de validación
const nameError = computed(() => user.name.length < 3);
const lastNameError = computed(() => user.lastName.length < 3);
const emailError = computed(() => !/\S+@\S+\.\S+/.test(user.email));
const passwordError = computed(() => user.passwordHash !== confirmPassword.value);

// Verifica si hay errores
const hasErrors = computed(() => nameError.value || lastNameError.value || emailError.value || passwordError.value);

// Métodos de validación para el evento `blur`
function validateName() {
  nameTouched.value = true;
  if (nameError.value) {
    return;
  }
}

function validateLastName() {
  lastNameTouched.value = true;
  if (lastNameError.value) {
    return;
  }
}

function validateEmail() {
  emailTouched.value = true;
  if (emailError.value) {
    return;
  }
}

function validatePassword() {
  passwordTouched.value = true;
  if (passwordError.value) {
    return;
  }
}

async function saveUser() {
  wasSubmitted.value = true;

  // Verificar errores manualmente en todos los campos
  validateName();
  validateLastName();
  validateEmail();
  validatePassword();

  // Si hay errores, no enviar el formulario
  if (hasErrors.value) {
    return;
  }

  isLoading.value = true; // Iniciar estado de carga
  try {
    const response = await axios.post(apiUrl+'users', user);
    
    if (response.data.salida[0].status == "success") {
      Swal.fire({
        icon: 'success',
        title: 'Cuenta creada con éxito',
        text: 'Debe activar su Cuenta siguiendo las instrucciones enviadas a su correo',
        showConfirmButton: true,
      });

      setTimeout(() => {
        const redirectTo = router.currentRoute.value.query.redirect || '/';
        router.push(redirectTo);
      }, 1500);
    } else if (response.data.salida[0].status == "error") {
      Swal.fire({
        icon: 'error',
        title: 'Error al registrar',
        text: response.data.salida[0].message
      });
    }
  } catch (error) {
    console.error('Error al registrar:', error);
    Swal.fire({
      icon: 'error',
      title: 'Error',
      text: 'Hubo un problema al crear la cuenta.',
    });
  } finally {
    isLoading.value = false; // Finalizar estado de carga
  }
}


</script>

<style scoped>
  /* Estilos para centrar el formulario y hacerlo ocupar todo el espacio central */
  .form-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f0f2f5;
  }

  .form-card {
    background-color: #ffffff;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 800px;
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

  .spinner-border {
    width: 3rem;
    height: 3rem;
    margin: 10px 0;
  }
</style>
