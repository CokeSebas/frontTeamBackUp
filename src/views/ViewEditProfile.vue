<template>
  <div class="container mt-4">
    <div class="row">
      <!-- PERFIL -->
      <div class="col-12 col-md-8">
        <div :class="['user-profile', mode === 'dark' ? 'dark-mode' : '']">
          <h1 class="text-center text-md-start">
            {{ $t('profileSeccion.title') }}
          </h1>

          <!-- Loading -->
          <div
            v-if="loading"
            class="d-flex justify-content-center align-items-center"
          >
            <img :src="gifLoading" />
          </div>

          <div v-if="error">{{ error }}</div>

          <div v-if="user">
            <div class="row align-items-center text-center text-md-start">
              <!-- Avatar -->
              <div class="col-12 col-md-4 text-center mb-3 mb-md-0">
                <img
                  :src="user.avatarUrl"
                  alt="User Image"
                  class="img-fluid rounded-circle shadow"
                  style="max-width: 160px"
                />
              </div>

              <!-- Datos -->
              <div class="col-12 col-md-8">
                <!-- Nombre -->
                <div class="profile-row">
                  <span class="label">{{ $t('profileSeccion.name') }}</span>
                  <div class="value">
                    <input
                      v-if="isEditing"
                      type="text"
                      v-model="editedUser.name"
                      class="form-control"
                    />
                    <span v-else>{{ user.name }}</span>
                  </div>
                </div>

                <!-- Apellido -->
                <div class="profile-row">
                  <span class="label">{{ $t('profileSeccion.lastName') }}</span>
                  <div class="value">
                    <input
                      v-if="isEditing"
                      type="text"
                      v-model="editedUser.lastName"
                      class="form-control"
                    />
                    <span v-else>{{ user.lastName }}</span>
                  </div>
                </div>

                <!-- Nick -->
                <div class="profile-row">
                  <span class="label">{{ $t('profileSeccion.nickName') }}</span>
                  <div class="value">
                    <input
                      v-if="isEditing"
                      type="text"
                      v-model="editedUser.nickName"
                      class="form-control"
                    />
                    <span v-else class="nickname">
                      {{ user.nickName }}
                    </span>
                  </div>
                </div>

                <!-- Organizer -->
                <div class="profile-row" v-if="isOrganizer">
                  <span class="label">
                    {{ $t('profileSeccion.isOrganizer') }}
                  </span>
                  <span class="badge bg-success">
                    Organizer
                  </span>
                </div>

                <!-- Admin -->
                <div class="profile-row" v-if="isAdmin">
                  <span class="label">
                    {{ $t('profileSeccion.isAdmin') }}
                  </span>
                  <span class="badge bg-danger">
                    Admin
                  </span>
                </div>

                <!-- Avatar URL (solo edición) -->
                <div class="profile-row" v-if="isEditing">
                  <span class="label">
                    {{ $t('profileSeccion.avatarUrl') }}
                  </span>
                  <input
                    type="text"
                    v-model="editedUser.avatarUrl"
                    class="form-control"
                  />
                </div>
              </div>
            </div>

            <!-- Botones edición -->
            <div v-if="isEditing" class="mt-3 text-center text-md-start">
              <button class="btn btn-success me-2" @click="saveChanges">
                {{ $t('buttons.saveChanges') }}
              </button>
              <button class="btn btn-secondary" @click="cancelEdit">
                {{ $t('buttons.cancel') }}
              </button>
            </div>

            <!-- Cambio de contraseña -->
            <div v-if="showChangePasswordForm" class="mt-4">
              <h3>{{ $t('profileSeccion.changePassword') }}</h3>

              <div class="form-group">
                <label>{{ $t('profileSeccion.currentPassword') }}</label>
                <input
                  type="password"
                  v-model="currentPassword"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>{{ $t('profileSeccion.newPassword') }}</label>
                <input
                  type="password"
                  v-model="newPassword"
                  class="form-control"
                />
              </div>

              <div class="form-group">
                <label>{{ $t('profileSeccion.confirmPassword') }}</label>
                <input
                  type="password"
                  v-model="confirmPassword"
                  class="form-control"
                />
              </div>

              <button class="btn btn-success me-2" @click="changePassword">
                {{ $t('buttons.changePassword') }}
              </button>
              <button class="btn btn-secondary" @click="cancelChangePassword">
                {{ $t('buttons.cancel') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ACCIONES -->
      <div class="col-12 col-md-4 mt-4 mt-md-0">
        <div class="actions text-center text-md-start">
          <h2>{{ $t('profileSeccion.actions') }}</h2>

          <button class="btn btn-success w-100 mb-2" @click="goToTeams">
            {{ $t('buttons.goToMyTeams') }}
          </button>
          <button class="btn btn-success w-100 mb-2" @click="goToPokemons">
            {{ $t('buttons.goToMyPokemons') }}
          </button>
          <button
            v-if="isOrganizer"
            class="btn btn-success w-100 mb-2"
            @click="goToOrgTorneo"
          >
            {{ $t('buttons.organizar') }}
          </button>
          <button
            v-if="isAdmin"
            class="btn btn-success w-100 mb-2"
            @click="goToListUsers"
          >
            {{ $t('buttons.goToListUsers') }}
          </button>
          <button class="btn btn-secondary w-100 mb-2" @click="enableEdit">
            {{ $t('buttons.editProfile') }}
          </button>
          <button
            class="btn btn-secondary w-100"
            @click="showChangePasswordForm = true"
          >
            {{ $t('buttons.changePassword') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import { inject, ref, onMounted, computed } from 'vue';
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

          if(user.value.isAdmin === true){
            sessionStorage.setItem('isAdmin', 'true');
          }

          if(user.value.isOrganizer === true){
            sessionStorage.setItem('isOrganizer', 'true');
          }

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

      const isOrganizer = computed(() => {
        return user.value?.isOrganizer === true
      })

      const isAdmin = computed(() => {
        return user.value?.isAdmin === true
      })


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
      const goToTeams = () => router.push('/vgc/my-teams/' + userId);
      const goToPokemons = () => router.push('/vgc/my-pokemons/' + userId);
      const goToOrgTorneo = () => router.push('/tournament/add-tournament/' + userId);
      const goToListUsers = () => router.push('/list-users');

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
        isOrganizer,
        isAdmin,
        enableEdit,
        cancelEdit,
        saveChanges,
        changePassword,
        cancelChangePassword,
        goToTeams,
        goToPokemons,
        goToOrgTorneo,
        goToListUsers,
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

  .profile-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    gap: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .profile-row:last-child {
    border-bottom: none;
  }

  .profile-row .label {
    font-weight: 600;
    opacity: 0.85;
  }

  .profile-row .value {
    flex: 1;
    text-align: right;
  }

  .nickname {
    font-style: italic;
    opacity: 0.9;
  }

  .dark-mode .profile-row {
    border-color: rgba(255, 255, 255, 0.15);
  }

</style>

