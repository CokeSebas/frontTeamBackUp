<!-- src/views/ViewTeamsPublic.vue -->
<template>
    <div>
        <!-- Contenido principal centrado -->
        <div class="container mt-4">
            <div class="text-center">
                <h2 class="mb-4">Equipos Registrados</h2>
                <router-link class="btn btn-primary btn-lg" to="/create-team">Crear Equipo</router-link>
                
                <div class="row">
                  <template v-for="team in listTeams" :key="team.id">
                    <div class="col-md-6">
                        <!-- Ejemplo de tarjeta de equipo registrado -->
                      <div class="card mb-4 shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title">{{ team.team_name }}</h5>
                            <p class="card-text">{{ team.desc_uso	 }}</p>
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
    name: 'ViewTeamsPublic',
    data() {
      return {
        listTeams: [],
      };
    },
    methods: {
      async getTeams() {

        axios.get('http://localhost:4000/api/teams/')
          .then(
          response => {
              this.listTeams = response.data.data;
              //console.log(response.data.data);
          }
          ).catch(
          error => console.error('Error:', error)
          );
      },
    },
    mounted() {
      this.getTeams();
  }
};
</script>

<style scoped>
/* Agrega estilos específicos para ViewTeamsPublic aquí, si lo deseas */
</style>
