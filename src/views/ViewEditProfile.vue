<template>
  <div class="container mt-4">
    <div class="row">
      <!-- Columna para mostrar los datos del perfil -->
      <div class="col-8">
        <div class="user-profile">
          <h1>Perfil de Usuario</h1>
          
          <div v-if="loading">Cargando...</div>
          <div v-if="error">{{ error }}</div>
          
          <div v-if="user">
            <div class="row">
              <div class="col-6">
                <img :src="user.avatarUrl" alt="User Image" style="width: 50%;" />
              </div>
              <div class="col-6">
                <p><strong>Nombre:</strong> {{ user.name }}</p>
                <p><strong>Apellidos:</strong> {{ user.lastName }}</p>
                <p><strong>Nickname:</strong> {{ user.nickName }}</p>
                <p><strong>Email:</strong> {{ user.email }}</p>
              </div>  
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
          <button class="btn btn-secondary btn-block mb-2" @click="updateProfile">Actualizar Datos</button>
          <button class="btn btn-secondary btn-block" @click="changePassword">Cambiar Contraseña</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import { ref, onMounted } from 'vue'
  import { jwtDecode } from 'jwt-decode';
  import axios from 'axios';
  import { useRouter } from 'vue-router'

  export default {
    name: 'UserProfile',
   setup() {
    const user = ref(null)
    const loading = ref(true)
    const error = ref(null)
    const router = useRouter()

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('El usuario no está autenticado');
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      
      // Cargar los datos del usuario al montar el componente
      onMounted(async () => {
        try {
          const response = await axios.get('http://localhost:4000/api/users/'+userId)  // Suponiendo que esta es la ruta para obtener los datos del perfil del usuario
          user.value = response.data[0].data;
        } catch (err) {
          error.value = 'Error al cargar el perfil'
        } finally {
          loading.value = false
        }
      })

      // Navegación a otras vistas
      const goToTeams = () => router.push('/my-teams/'+userId)
      const goToPokemons = () => router.push('/my-pokemons/'+userId)
      const updateProfile = () => router.push('/update-profile')  // Vista para actualizar datos
      const changePassword = () => router.push('/change-password')  // Vista para cambiar contraseña

      return {
        user,
        loading,
        error,
        goToTeams,
        goToPokemons,
        updateProfile,
        changePassword
      }
    }
  }
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
</style>
