<template>
   <div :class="['form-container', { 'dark-mode': mode === 'dark' }]">
    <div :class="['form-card', { 'dark-card': mode === 'dark' }]">
      <h1 :class="['form-title', { 'dark-text': mode === 'dark' }]" style="text-align: center">{{ $t('createAccount') }}</h1>
      <form @submit.prevent="saveUser">

        <!-- Nombre -->
        <div class="form-group">
          <label for="name">{{ $t('profileSeccion.name') }}:</label>
          <input 
            type="text" 
            v-model="user.name" 
            :class="['form-control', { 'is-invalid': nameTouched && nameError }]" 
            :placeholder="$t('profileSeccion.ingNombre')" 
            required
            @blur="validateName"
          />
          <div v-if="nameTouched && nameError" class="invalid-feedback">
            {{ $t('errorsSeccion.errorName') }}
          </div>
        </div>

        <!-- Apellido -->
        <div class="form-group">
          <label for="lastName">{{ $t('profileSeccion.lastName') }}:</label>
          <input 
            type="text" 
            v-model="user.lastName" 
            class="form-control" 
            id="lastName" 
            :placeholder="$t('profileSeccion.ingApellido')" 
            required
            @blur="validateLastName"
            :class="{ 'is-invalid': lastNameTouched && lastNameError }"
          />
          <div v-if="lastNameTouched && lastNameError" class="invalid-feedback">
            {{ $t('errorsSeccion.errorLastName') }}
          </div>
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email">{{ $t('profileSeccion.email') }}:</label>
          <input 
            type="email" 
            v-model="user.email" 
            class="form-control" 
            id="email" 
            :placeholder="$t('profileSeccion.ingEmail')" 
            required
            @blur="validateEmail"
            :class="{ 'is-invalid': emailTouched && emailError }"
          />
          <div v-if="emailTouched && emailError" class="invalid-feedback">
            {{ $t('errorsSeccion.errorEmail') }}
          </div>
        </div>

        <!-- Contraseña -->
        <div class="form-group">
          <label for="passwordHash">{{ $t('profileSeccion.password') }}:</label>
          <input 
            type="password" 
            v-model="user.passwordHash" 
            class="form-control" 
            id="passwordHash" 
            :placeholder="$t('profileSeccion.ingPassword')" 
            required
            @blur="validatePassword"
            :class="{ 'is-invalid': passwordTouched && passwordError }"
          />
        </div>

        <!-- Confirmar Contraseña -->
        <div class="form-group">
          <label for="confirmPassword">{{ $t('profileSeccion.confirmPassword') }}:</label>
          <input 
            type="password" 
            v-model="confirmPassword" 
            class="form-control" 
            id="confirmPassword" 
            :placeholder="$t('profileSeccion.ingConfirmPassword')" 
            required
            @blur="validatePassword"
            :class="{ 'is-invalid': passwordTouched && passwordError }"
          />
          <div v-if="passwordTouched && passwordError" class="invalid-feedback">
            {{ $t('errorsSeccion.errorConfirmPassword') }}
          </div>
        </div>

        <!-- URL de Imagen -->
        <div class="form-group">
          <label for="avatarUrl">{{ $t('profileSeccion.avatarUrl') }}:</label>
          <input 
            type="url" 
            v-model="user.avatarUrl" 
            class="form-control" 
            id="avatarUrl" 
            :placeholder="$t('profileSeccion.ingAvatarUrl')"
          />
        </div>

        <!-- Nickname -->
        <div class="form-group">
          <label for="nickname">{{ $t('profileSeccion.nickName') }}:</label>
          <input 
            type="text" 
            v-model="user.nickName" 
            class="form-control" 
            id="nickName" 
            :placeholder="$t('profileSeccion.ingNickName')" 
            required
          />
        </div>

        <!-- Spinner de carga -->
        <div v-if="isLoading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">{{ $t('loading') }}</span>
          </div>
        </div>

        <!-- Botón Crear Cuenta -->
        <button type="submit" class="btn btn-success mt-3" :disabled="isLoading || hasErrors">
          {{ $t('buttons.createAccount') }}
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

  import { useI18n } from 'vue-i18n'; // Importa useI18n


  const apiUrl = inject('apiUrl');

  const router = useRouter();
  const isLoading = ref(false);
  const wasSubmitted = ref(false);

  const nameTouched = ref(false);
  const lastNameTouched = ref(false);
  const emailTouched = ref(false);
  const passwordTouched = ref(false);

  const mode = inject('mode');

  const { t } = useI18n(); // Usa `useI18n` para obtener `t`

  const user = reactive({
    name: '',
    lastName: '',
    email: '',
    passwordHash: '',
    avatarUrl: '',
    provider: 'local',
    nickName: '',
  });

  const confirmPassword = ref('');

  const nameError = computed(() => user.name.length < 3);
  const lastNameError = computed(() => user.lastName.length < 3);
  const emailError = computed(() => !/\S+@\S+\.\S+/.test(user.email));
  const passwordError = computed(() => user.passwordHash !== confirmPassword.value);

  const hasErrors = computed(() => nameError.value || lastNameError.value || emailError.value || passwordError.value);

  function validateName() { nameTouched.value = true; }
  function validateLastName() { lastNameTouched.value = true; }
  function validateEmail() { emailTouched.value = true; }
  function validatePassword() { passwordTouched.value = true; }

  async function saveUser() {
    wasSubmitted.value = true;
    validateName();
    validateLastName();
    validateEmail();
    validatePassword();
    if (hasErrors.value) return;
    isLoading.value = true;
    try {
      const response = await axios.post(apiUrl+'users', user);
      if (response.data.salida[0].status === "success") {
        Swal.fire({
          icon: 'success',
          title: t('responseApisSeccion.accountCreated'),
          text: t('responseApisSeccion.accountMailSent'),
          showConfirmButton: true,
        });
        setTimeout(() => router.push('/'), 1500);
      } else {
        Swal.fire({ 
          icon: 'error', 
          title: t('responseApisSeccion.error'),
          text: t('responseApisSeccion.errorAccountCreated')
        });
      }
    } catch (error) {
      Swal.fire({ 
        icon: 'error', 
        title: t('responseApisSeccion.error'),
        text: t('responseApisSeccion.errorAccountCreated')
      });
    } finally {
      isLoading.value = false;
    }
  }
</script>

<style scoped>
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
  .form-title, .form-control, label {
    transition: color 0.3s, background-color 0.3s;
    margin-bottom: 6px;
  }
  .form-control {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border-radius: 5px;
    border: 1px solid #ced4da;
  }
  /* Estilos de modo oscuro */
  .dark-mode {
    background-color: #121212;
  }
  .dark-card {
    background-color: #333;
    box-shadow: 0 4px 10px rgba(255, 255, 255, 0.1);
  }
  .dark-text {
    color: #ffffff;
  }
  .dark-input {
    background-color: #444;
    color: #fff;
    border: 1px solid #555;
  }
  .btn-dark {
    background-color: #444;
    color: #fff;
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