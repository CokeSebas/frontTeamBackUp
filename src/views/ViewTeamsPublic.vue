<!-- src/views/ViewTeamsPublic.vue -->
<template>
    <div>
        <!-- Contenido principal centrado -->
        <div class="container mt-4">
            <div class="text-center">
                <h2 class="mb-4">Equipos Registrados</h2>
                <router-link class="btn btn-primary btn-lg" to="/create-team">Crear Equipo</router-link>
                
                <!-- Mostrar el div de carga si está cargando -->
                <div v-if="isLoading" style="align-items: center; display: flex; justify-content: center;">
                  <img src="https://i.pinimg.com/originals/c3/ef/e3/c3efe3c72dc3a0d598735ca29822e80a.gif">
                </div>

                <!-- Mostrar la lista de equipos si ya no está cargando -->
                <div v-else class="row">
                  <template v-for="team in listTeams" :key="team.id">
                    <div class="col-md-6">
                        <!-- Ejemplo de tarjeta de equipo registrado -->
                      <div class="card mb-4 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">{{ team.team_name }}</h5>
                            <p class="card-text">{{ team.desc_uso }}</p>
                            <router-link class="btn btn-outline-primary btn-sm" :to="'/team/' + team.id">Ver Detalle Team</router-link>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';

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

          axios.get(this.apiUrl+'teams/')
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
