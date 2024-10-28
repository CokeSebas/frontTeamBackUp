<template>
  <div class="container mt-4">
    <div class="row">
      <!-- Columna para mostrar los datos del perfil -->
      <div class="col-8">
        <div class="user-profile">
          <h1>Perfil de Usuario</h1>

          <div v-if="loading" style="align-items: center; display: flex; justify-content: center;">
            <img src="https://i.pinimg.com/originals/c3/ef/e3/c3efe3c72dc3a0d598735ca29822e80a.gif">
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
                  <label class="col-4 col-form-label"><strong>Nombre:</strong></label>
                  <div class="col-8">
                    <input v-if="isEditing" type="text" v-model="editedUser.name" class="form-control"/>
                    <p v-else>{{ user.name }}</p>
                  </div>
                </div>
                <div class="form-group row">
                  <label class="col-4 col-form-label"><strong>Apellidos:</strong></label>
                  <div class="col-8">
                    <input v-if="isEditing" type="text" v-model="editedUser.lastName" class="form-control"/>
                    <p v-else>{{ user.lastName }}</p>
                  </div>
                </div>
                <div class="form-group row">
                  <label class="col-4 col-form-label"><strong>Nickname:</strong></label>
                  <div class="col-8">
                    <input v-if="isEditing" type="text" v-model="editedUser.nickName" class="form-control"/>
                    <p v-else>{{ user.nickName }}</p>
                  </div>
                </div>
                <div v-if="isEditing" class="form-group row">
                  <label class="col-4 col-form-label"><strong>Avatar URL:</strong></label>
                  <div class="col-8">
                    <input v-if="isEditing" type="text" v-model="editedUser.avatarUrl" class="form-control"/>
                  </div>
                </div>
              </div>
            </div>

            <!-- Botones para guardar y cancelar solo visibles en modo edición -->
            <div v-if="isEditing" class="mt-3">
              <button class="btn btn-success" @click="saveChanges">Guardar Cambios</button>
              <button class="btn btn-secondary" @click="cancelEdit">Cancelar</button>
            </div>

            <!-- Formulario para cambiar la contraseña -->
            <div v-if="showChangePasswordForm" class="mt-4">
              <h3>Cambiar Contraseña</h3>
              <div class="form-group">
                <label for="currentPassword">Contraseña Actual:</label>
                <input type="password" v-model="currentPassword" class="form-control" />
              </div>
              <div class="form-group">
                <label for="newPassword">Nueva Contraseña:</label>
                <input type="password" v-model="newPassword" class="form-control" />
              </div>
              <div class="form-group">
                <label for="confirmPassword">Confirmar Nueva Contraseña:</label>
                <input type="password" v-model="confirmPassword" class="form-control" />
              </div>
              <button class="btn btn-primary" @click="changePassword">Cambiar Contraseña</button>
              <button class="btn btn-secondary" @click="cancelChangePassword">Cancelar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Columna para los botones de acciones -->
      <div class="col-4">
        <div class="actions">
          <h2>Acciones</h2>
          <button class="btn btn-primary btn-block mb-2" @click="goToTeams">Mis Equipos</button>
          <button class="btn btn-primary btn-block mb-2" @click="goToPokemons">Mis Pokémon</button>
          <button class="btn btn-secondary btn-block mb-2" @click="enableEdit">Actualizar Datos</button>
          <button class="btn btn-secondary btn-block" @click="showChangePasswordForm = true">Cambiar Contraseña</button>
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

      const apiUrl = inject('apiUrl'); // Ahora tienes acceso a apiUrl

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('El usuario no está autenticado');
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      
      // Cargar los datos del usuario al montar el componente
      onMounted(async () => {
        console.log(apiUrl+'users/' + userId);
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
          const response = await axios.post(this.apiUrl+'users/edit/' + userId, editedUser.value);
          user.value = { ...editedUser.value }; // Actualizar los datos del usuario en la vista
          isEditing.value = false;

          // Mostrar una notificación de éxito
          Swal.fire({
            icon: 'success',
            title: 'Datos actualizadas con éxito',
            text: response.data.message,
            showConfirmButton: false,
            timer: 1500
          });
        } catch (err) {
          error.value = 'Error al actualizar el perfil';
        }
      };

      // Cambiar contraseña
      const changePassword = async () => {
        if (newPassword.value !== confirmPassword.value) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Las contraseñas no coinciden.',
          });
          return;
        }

        try {
          const response = await axios.post(`${apiUrl}api/users/edit/password/${userId}`, {
            currentPassword: currentPassword.value,
            newPassword: newPassword.value,
          });

          // Mostrar notificación de éxito
          Swal.fire({
            icon: 'success',
            title: 'Contraseña cambiada',
            text: response.data.message,
            showConfirmButton: false,
            timer: 1500
          });

          // Restablecer los campos
          currentPassword.value = '';
          newPassword.value = '';
          confirmPassword.value = '';
          showChangePasswordForm.value = false;
        } catch (err) {
          error.value = 'Error al cambiar la contraseña';
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
        enableEdit,
        cancelEdit,
        saveChanges,
        changePassword,
        cancelChangePassword,
        goToTeams,
        goToPokemons,
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
</style>

