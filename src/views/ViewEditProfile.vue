<template>
  <div class="container mt-4">
    <div class="row">
      <!-- Columna para mostrar los datos del perfil -->
      <div class="col-8">
        <div :class="['user-profile', mode === 'dark' ? 'dark-mode' : '']">
          <h1>{{ $t('profileSeccion.title') }}</h1>

          <div v-if="loading" style="align-items: center; display: flex; justify-content: center;">
            <img :src="gifLoading">
          </div>
          <div v-if="error">{{ error }}</div>

          <div v-if="user">
            <div class="row align-items-center">
              <!-- Columna para la imagen del usuario -->
              <div class="col-4 text-center">
                <img :src="user.avatarUrl" alt="User Image" style="width: 80%;" />
              </div>

              <!-- Columna para los datos del usuario -->
              <div class="col-8">
                <div class="form-group row">
                  <label class="col-4 col-form-label"><strong>{{ $t('profileSeccion.name') }}:</strong></label>
                  <div class="col-8">
                    <input v-if="isEditing" type="text" v-model="editedUser.name" class="form-control"/>
                    <p v-else>{{ user.name }}</p>
                  </div>
                </div>
                <div class="form-group row">
                  <label class="col-4 col-form-label"><strong>{{ $t('profileSeccion.lastName') }}:</strong></label>
                  <div class="col-8">
                    <input v-if="isEditing" type="text" v-model="editedUser.lastName" class="form-control"/>
                    <p v-else>{{ user.lastName }}</p>
                  </div>
                </div>
                <div class="form-group row">
                  <label class="col-4 col-form-label"><strong>{{ $t('profileSeccion.nickName') }}:</strong></label>
                  <div class="col-8">
                    <input v-if="isEditing" type="text" v-model="editedUser.nickName" class="form-control"/>
                    <p v-else>{{ user.nickName }}</p>
                  </div>
                </div>
                <div v-if="isEditing" class="form-group row">
                  <label class="col-4 col-form-label"><strong>{{ $t('profileSeccion.avatarUrl') }}:</strong></label>
                  <div class="col-8">
                    <input v-if="isEditing" type="text" v-model="editedUser.avatarUrl" class="form-control"/>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botones para guardar y cancelar solo visibles en modo edición -->
            <div v-if="isEditing" class="mt-3">
              <button class="btn btn-success" @click="saveChanges">{{ $t('buttons.saveChanges') }}</button>
              <button class="btn btn-secondary" @click="cancelEdit">{{ $t('buttons.cancel') }}</button>
            </div>

            <!-- Formulario para cambiar la contraseña -->
            <div v-if="showChangePasswordForm" class="mt-4">
              <h3>{{ $t('profileSeccion.changePassword') }}</h3>
              <div class="form-group">
                <label for="currentPassword">{{  $t('profileSeccion.currentPassword') }}:</label>
                <input type="password" v-model="currentPassword" class="form-control" />
              </div>
              <div class="form-group">
                <label for="newPassword">{{ $t('profileSeccion.newPassword') }}:</label>
                <input type="password" v-model="newPassword" class="form-control" />
              </div>
              <div class="form-group">
                <label for="confirmPassword">{{ $t('profileSeccion.confirmPassword') }}:</label>
                <input type="password" v-model="confirmPassword" class="form-control" />
              </div>
              <button class="btn btn-success" @click="changePassword">{{ $t('buttons.changePassword') }}</button>
              <button class="btn btn-secondary" @click="cancelChangePassword">{{ $t('buttons.cancel') }}</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna para los botones de acciones -->
      <div class="col-4">
        <div class="actions">
          <h2>{{ $t('profileSeccion.actions') }}</h2>
          <button class="btn btn-success btn-block mb-2" @click="goToTeams">{{ $t('buttons.goToMyTeams') }}</button>
          <button class="btn btn-success btn-block mb-2" @click="goToPokemons">{{ $t('buttons.goToMyPokemons') }}</button>
          <button class="btn btn-secondary btn-block mb-2" @click="enableEdit">{{ $t('buttons.editProfile') }}</button>
          <button class="btn btn-secondary btn-block" @click="showChangePasswordForm = true">{{ $t('buttons.changePassword') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import { inject, ref, onMounted } from 'vue';
  import { jwtDecode } from 'jwt-decode';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  import Swal from 'sweetalert2';

  import { useI18n } from 'vue-i18n'; // Importa useI18n

  export default {
    name: 'UserProfile',
    setup() {
      const user = ref(null);
      const editedUser = ref(null);
      const loading = ref(true);
      const error = ref(null);
      const isEditing = ref(false);
      const showChangePasswordForm = ref(false);
      const currentPassword = ref('');
      const newPassword = ref('');
      const confirmPassword = ref('');
      const router = useRouter();

      const { t } = useI18n(); // Usa `useI18n` para obtener `t`

      const apiUrl = inject('apiUrl'); // Ahora tienes acceso a apiUrl
      const gifLoading = inject('gifLoading');

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('El usuario no está autenticado');
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      const mode = inject('mode');
      
      // Cargar los datos del usuario al montar el componente
      onMounted(async () => {
        try {
          const response = await axios.get(apiUrl+'users/' + userId);
          user.value = response.data[0].data;
          editedUser.value = { ...user.value }; // Hacer una copia editable
        } catch (err) {
          error.value = 'Error al cargar el perfil';
        } finally {
          loading.value = false;
        }
      });

      // Habilitar modo edición
      const enableEdit = () => {
        isEditing.value = true;
      };

      // Cancelar edición
      const cancelEdit = () => {
        isEditing.value = false;
        editedUser.value = { ...user.value }; // Restablecer los valores originales
      };

      // Guardar cambios
      const saveChanges = async () => {
        try {
          const response = await axios.post(apiUrl+'users/edit/' + userId, editedUser.value);
          
          if (response.data.salida[0].status === 'error') {
            // Mostrar una notificación de error
            Swal.fire({
              icon: 'error',
              title: t('responseApisSeccion.editProfileTitle'),
              text: t('responseApisSeccion.editProfileError'),
              showConfirmButton: false,
              timer: 1500
            });
          }else{
            user.value = { ...editedUser.value }; // Actualizar los datos del usuario en la vista
            isEditing.value = false;
  
            // Mostrar una notificación de éxito
            Swal.fire({
              icon: 'success',
              title: t('responseApisSeccion.editProfileTitle'),
              text: t('responseApisSeccion.editProfileSuccess'),
              showConfirmButton: false,
              timer: 1500
            });
          }

        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: t('responseApisSeccion.editProfileTitle'),
            text: t('responseApisSeccion.editProfileError'),
            showConfirmButton: false,
            timer: 1500
          });
          console.log(err);
        }
      };

      // Cambiar contraseña
      const changePassword = async () => {
        if (newPassword.value !== confirmPassword.value) {
          Swal.fire({
            icon: 'error',
            title: t('responseApisSeccion.error'),
            text: t('responseApisSeccion.errorPasswordNotMatch'),
          });
          return;
        }

        try {
          const response = await axios.post(`${apiUrl}users/edit/password/${userId}`, {
            currentPassword: currentPassword.value,
            newPassword: newPassword.value,
          });

          if (response.data.salida[0].status === 'error') {
            Swal.fire({
              icon: 'error',
              title: t('responseApisSeccion.error'),
              text: t('responseApisSeccion.errorPasswordChanged'),
            });
            return;
          }else{
            // Mostrar notificación de éxito
            Swal.fire({
              icon: 'success',
              title: t('responseApisSeccion.exito'),
              text: t('responseApisSeccion.passwordChanged'),
              showConfirmButton: false,
              timer: 1500
            });
  
            // Restablecer los campos
            currentPassword.value = '';
            newPassword.value = '';
            confirmPassword.value = '';
            showChangePasswordForm.value = false;
          }

        } catch (err) {
          Swal.fire({
            icon: 'error',
            title: t('responseApisSeccion.error'),
            text: t('responseApisSeccion.errorPasswordChanged'),
            showConfirmButton: false,
            timer: 1500
          });
          console.error(err);
        }
      };

      // Cancelar el formulario de cambio de contraseña
      const cancelChangePassword = () => {
        showChangePasswordForm.value = false;
        currentPassword.value = '';
        newPassword.value = '';
        confirmPassword.value = '';
      };

      // Navegación a otras vistas
      const goToTeams = () => router.push('/my-teams/' + userId);
      const goToPokemons = () => router.push('/my-pokemons/' + userId);

      return {
        user,
        editedUser,
        loading,
        error,
        isEditing,
        showChangePasswordForm,
        currentPassword,
        newPassword,
        confirmPassword,
        gifLoading,
        enableEdit,
        cancelEdit,
        saveChanges,
        changePassword,
        cancelChangePassword,
        goToTeams,
        goToPokemons,
        mode
      };
    }
  };
</script>

<style scoped>
  .user-profile {
    text-align: left;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 10px;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
  }

  .actions {
    text-align: center;
  }

  .actions h2 {
    margin-bottom: 20px;
  }

  .btn-block {
    width: 100%;
  }

  .form-group {
    margin-bottom: 15px;
  }

  .col-form-label {
    text-align: right;
  }

  input[type="text"], input[type="email"] {
    width: 100%;
  }

  /* Estilos para Modo Oscuro */
  .dark-mode {
    background-color: #2c2c2c;
    color: #e0e0e0;
  }

  .dark-mode .user-profile {
    background-color: #333;
    box-shadow: 0px 4px 8px rgba(255, 255, 255, 0.1);
  }

  .dark-mode .actions {
    color: #e0e0e0;
  }

  /*
  .dark-mode .btn-success {
    background-color: #4e4e4e;
    color: #fff;
    border-color: #666;
  }

  .dark-mode .btn-secondary {
    background-color: #666;
    color: #fff;
    border-color: #888;
  }
    */

</style>

