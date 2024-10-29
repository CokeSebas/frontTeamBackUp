<template>
  <div class="container mt-5">
    <!-- Encabezado -->
    <div class="text-center mb-4">
      <h1 class="display-4">Registra tus Equipos de Pokémon o Pokémon de manera individual.</h1>
      <p class="lead">Crea y organiza tus equipos para estar listo en la competición</p>

      <div class="d-flex justify-content-between mt-4" style="max-width: 600px; margin: 0 auto;">
        <router-link class="btn btn-primary btn-lg" to="/create-team">Crear Equipo</router-link>
        <router-link class="btn btn-primary btn-lg" to="/create-pokemon">Crear Pokémon</router-link>
      </div>
    </div>

    <!-- Sección de equipos registrados -->
    <div class="mt-5">
      <div class="row">
        <div class="col-md-6">
          <h2 class="text-center mb-4">Últimos Equipos Registrados</h2>

          <!-- Indicador de carga para equipos -->
          <div v-if="loadingTeams" class="text-center">
            <img :src="gifLoading">
          </div>
          <div v-else>
            <div class="row">
              <template v-for="team in listTeams" :key="team.id">
                <div class="col-md-6">
                  <!-- Tarjeta de equipo registrado -->
                  <div class="card mb-4 shadow-sm">
                    <div class="card-body">
                      <h5 class="card-title">{{ team.team_name }}</h5>
                      <p class="card-text">{{ team.desc_uso }}</p>
                      <router-link class="btn btn-outline-primary btn-sm" :to="'/team/' + team.id">Ver Equipo</router-link>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Sección de Pokémon registrados -->
        <div class="col-md-6">
          <h2 class="text-center mb-4">Pokémon Registrados Recientemente</h2>

          <!-- Indicador de carga para Pokémon -->
          <div v-if="loadingPokes" class="text-center">
            <img :src="gifLoading">
          </div>
          <div v-else>
            <div class="row">
              <template v-for="pokemon in listPokes" :key="pokemon.id">
                <div class="col-md-4">
                  <!-- Tarjeta de Pokémon registrada -->
                  <div class="card mb-4 shadow-sm">
                    <div class="card-body">
                      <h5 class="card-title">{{ pokemon.name }}</h5>
                      <img :src="pokemon.imgPokemon" style="width: 30%;" class="card-img-top d-block mx-auto" alt="Pokemon">
                      <p class="card-text">
                        Tera Type: {{ pokemon.teraType }}
                      </p>
                      <p class="card-text">
                        Items: {{ pokemon.item }}
                      </p>
                      <router-link class="btn btn-outline-primary btn-sm" :to="'/pokemon/' + pokemon.id">Ver Pokémon</router-link>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  inject: ['apiUrl', 'gifLoading'],
  name: 'HomeView',
  data() {
    return {
      listTeams: [],
      listPokes: [],
      loadingTeams: true,  // Variable de estado para equipos
      loadingPokes: true   // Variable de estado para Pokémon
    };
  },
  methods: {
    async getTeams() {
      axios.get(this.apiUrl+'teams/teams-home')
        .then(response => {
          this.listTeams = response.data.data;
          this.loadingTeams = false; // Termina la carga de equipos
        })
        .catch(error => {
          console.error('Error:', error);
          this.loadingTeams = false; // En caso de error, también termina la carga
        });
    },
    async getPokes() {
      axios.get(this.apiUrl+'pokemon/pokes-home')
        .then(response => {
          this.listPokes = response.data.data;
          this.loadingPokes = false; // Termina la carga de Pokémon
        })
        .catch(error => {
          console.error('Error:', error);
          this.loadingPokes = false; // En caso de error, también termina la carga
        });
    }
  },
  mounted() {
    this.getTeams();
    this.getPokes();
  }
};
</script>
