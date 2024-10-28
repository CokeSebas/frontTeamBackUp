<!-- src/views/ViewTeamsPublic.vue -->
<template>
    <div>
        <!-- Contenido principal centrado -->
        <div class="container mt-4">
            <div class="text-center">
                <h2 class="mb-4">Mis Equipos Registrados</h2>
                <router-link class="btn btn-primary btn-lg" to="/create-team">Crear Equipo</router-link>

                <!-- Mostrar el div de carga si está cargando -->
                <div v-if="isLoading" class="text-center my-5" style="align-items: center; display: flex; justify-content: center;">
                  <img src="https://i.pinimg.com/originals/c3/ef/e3/c3efe3c72dc3a0d598735ca29822e80a.gif">
                </div>

                <!-- Mostrar la lista de equipos si ya no está cargando -->
                <div v-else class="row">
                  <div v-if="listTeams.length > 0" class="row">
                    <template v-for="team in listTeams" :key="team.id">
                      <div class="col-md-6">
                          <!-- Ejemplo de tarjeta de equipo registrado -->
                        <div class="card mb-4 shadow-sm">
                          <div class="card-body">
                              <h5 class="card-title">{{ team.team_name }}</h5>
                              <p class="card-text">{{ team.desc_uso }}</p>
                              <router-link class="btn btn-outline-primary btn-sm" :to="'/my-team-detail/' + team.id">Ver Detalle Team</router-link>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div> 
                  <div v-else>
                    <p style="color: #ff6b6b; font-weight: bold; font-size: 1.2em; text-align: center;">
                    ¡Aún no tienes Equipos registrados! 
                  </p>
                  <p style="text-align: center;">
                    ¿Qué tal si comienzas a añadir tus favoritos ahora?
                  </p>

                  </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
  import axios from 'axios';
  import { jwtDecode } from 'jwt-decode';

  export default {
    inject: ['apiUrl'],
    name: 'ViewTeamsPublic',
    data() {
      return {
        listTeams: [],
        isLoading: false, // Controla el estado de carga
      };
    },
    methods: {
      async getTeams() {
        this.isLoading = true; // Activar el estado de carga

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('El usuario no está autenticado');
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;
        axios.get(this.apiUrl+'teams/teams-user/' + userId, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            this.listTeams = response.data.data;
            this.isLoading = false; // Desactivar el estado de carga cuando termina
        })
        .catch(error => {
            console.error('Error:', error);
            this.isLoading = false; // Desactivar el estado de carga si hay un error
        });

      },
    },
    mounted() {
      this.getTeams();
    }
  };
</script>

<style scoped>
/* Agrega estilos específicos para ViewTeamsPublic aquí, si lo deseas */
.spinner-border {
    width: 3rem;
    height: 3rem;
}
</style>
