<template>
  <div :class="['container', { 'dark-mode': mode === 'dark' }]">
    <div :class="['card', { 'dark-card': mode === 'dark' }]">
      <h2 :class="['title', { 'dark-text': mode === 'dark' }]">
        Lista de Usuarios
      </h2>

      <div class="table-responsive">
        <table v-if="isAdmin" class="custom-table">
          <thead>
            <tr>
              <th>{{ $t('profileSeccion.avatarUrl') }}</th>
              <th>{{ $t('profileSeccion.name') }}</th>
              <th>{{ $t('profileSeccion.lastName') }}</th>
              <th>{{ $t('profileSeccion.nickName') }}</th>
              <th>{{ $t('profileSeccion.email') }}</th>
              <th>{{ $t('profileSeccion.isOrganizer') }}</th>
              <th>{{ $t('profileSeccion.actions') }}</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="(user, index) in users" :key="index">
              <!-- Avatar -->
              <td>
                <img
                  :src="user.avatarUrl || defaultAvatar"
                  class="avatar"
                  alt="avatar"
                />
              </td>

              <!-- Nombre -->
              <td>
                <input
                  v-if="user.editing"
                  v-model="user.name"
                  class="table-input"
                />
                <span v-else>{{ user.name }}</span>
              </td>

              <!-- Apellido -->
              <td>
                <input
                  v-if="user.editing"
                  v-model="user.lastName"
                  class="table-input"
                />
                <span v-else>{{ user.lastName }}</span>
              </td>

              <!-- Nick -->
              <td>
                <input
                  v-if="user.editing"
                  v-model="user.nickName"
                  class="table-input"
                />
                <span v-else>{{ user.nickName }}</span>
              </td>

              <!-- Email -->
              <td>
                <input
                  v-if="user.editing"
                  v-model="user.email"
                  class="table-input"
                />
                <span v-else>{{ user.email }}</span>
              </td>

              <!-- Organizador -->
              <td class="center">
                <input
                  v-if="user.editing"
                  type="checkbox"
                  v-model="user.isOrganizer"
                />
                <span v-else>
                  {{ user.isOrganizer ? 'Sí' : 'No' }}
                </span>
              </td>

              <!-- Acciones -->
              <td class="actions">
                <button
                  v-if="!user.editing"
                  class="btn btn-edit"
                  @click="editUser(user)"
                >
                  Editar
                </button>

                <button
                  v-else
                  class="btn btn-save"
                  @click="saveUser(user)"
                >
                  Guardar
                </button>

                <button
                  v-if="user.editing"
                  class="btn btn-cancel"
                  @click="cancelEdit(user)"
                >
                  Cancelar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>


<script setup>
  import { ref, inject, onMounted, computed  } from 'vue'
  import axios from 'axios'
import Swal from 'sweetalert2'

  const mode = inject('mode')
  const apiUrl = inject('apiUrl')

  // ===============================
  // State
  // ===============================
  const users = ref([])
  const defaultAvatar = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0LY6fD3PfS3Vv6fzibjBVCWfO8TZ6bgJ6DA&s'

  // Para respaldar datos al editar
  const backupUser = ref(null)

  // ===============================
  // Load users
  // ===============================
  const loadUsers = async () => {
    try {
      if (!isAdmin.value) {
        Swal.fire({
          icon: 'error',
          title: 'No autorizado',
          text: 'No tienes permisos para ver esta página.',
        })
      }

      const response = await axios.get(`${apiUrl}users`)

      users.value = response.data.salida[0].data.map(user => ({
        ...user,
        editing: false
      }))

    } catch (error) {
      console.error('Error al cargar usuarios', error)
    }
  }

  // ===============================
  // Edit actions
  // ===============================
  const editUser = (user) => {
    backupUser.value = { ...user }
    user.editing = true
  }

  const cancelEdit = (user) => {
    Object.assign(user, backupUser.value)
    user.editing = false
  }

  const saveUser = async (user) => {
    try {
      user.editing = false

      // Aquí normalmente iría un PUT o PATCH
      await axios.post(`${apiUrl}users/edit/${user.id}`, {
        name: user.name,
        lastName: user.lastName,
        nickName: user.nickName,
        email: user.email,
        isOrganizer: user.isOrganizer
      })

      console.log('Usuario actualizado', user)

    } catch (error) {
      console.error('Error al actualizar usuario', error)
    }
  }

  const isAdmin = computed(() => {
    return sessionStorage.getItem('isAdmin') === 'true';
  })

  // ===============================
  // Lifecycle
  // ===============================
  onMounted(loadUsers)
</script>

<style scoped>
  .container {
    padding: 20px;
  }

  .card {
    background: #ffffff;
    border-radius: 12px;
    padding: 20px;
  }

  .dark-mode {
    background: #121212;
  }

  .dark-card {
    background: #1e1e1e;
  }

  .title {
    text-align: center;
    margin-bottom: 20px;
  }

  .dark-text {
    color: #ffffff;
  }

  .table-responsive {
    overflow-x: auto;
  }

  .custom-table {
    width: 100%;
    border-collapse: collapse;
  }

  .custom-table th,
  .custom-table td {
    padding: 10px;
    border-bottom: 1px solid #ddd;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }

  .table-input {
    width: 100%;
    padding: 6px;
    border-radius: 6px;
    border: 1px solid #ccc;
  }

  .center {
    text-align: center;
  }

  .actions {
    display: flex;
    gap: 6px;
  }

  .btn {
    padding: 6px 10px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
  }

  .btn-edit {
    background: #3498db;
    color: white;
  }

  .btn-save {
    background: #2ecc71;
    color: white;
  }

  .btn-cancel {
    background: #e74c3c;
    color: white;
  }

  /* ===============================
    Texto general
  =============================== */
  .card {
    color: #2c3e50;
  }

  .dark-card {
    color: #ecf0f1;
  }

  /* ===============================
    Tabla
  =============================== */
  .custom-table th,
  .custom-table td {
    color: inherit;
  }

  /* ===============================
    Inputs en tabla
  =============================== */
  .table-input {
    background: #ffffff;
    color: #2c3e50;
  }

  .dark-card .table-input {
    background: #2c2c2c;
    color: #ecf0f1;
    border: 1px solid #444;
  }

  /* ===============================
    Checkbox
  =============================== */
  .dark-card input[type="checkbox"] {
    accent-color: #2ecc71;
  }

  /* ===============================
    Bordes tabla
  =============================== */
  .custom-table th,
  .custom-table td {
    border-bottom: 1px solid #ddd;
  }

  .dark-card .custom-table th,
  .dark-card .custom-table td {
    border-bottom: 1px solid #333;
  }


</style>

