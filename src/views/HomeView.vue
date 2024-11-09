<template>
  <div class="container mt-5">
    <!-- Encabezado -->
    <div class="text-center mb-4">
      <h1 class="display-4">{{ $t('home.title') }}</h1>
      <p class="lead">{{  $t('home.subtitle') }}</p>

      <div class="d-flex justify-content-between mt-4" style="max-width: 600px; margin: 0 auto;">
        <router-link class="btn btn-success btn-lg" to="/create-team">{{ $t('buttons.createTeam') }}</router-link>
        <router-link class="btn btn-success btn-lg" to="/create-pokemon">{{ $t('buttons.createPokemon') }}</router-link>
      </div>
    </div>

    <!-- Sección de equipos registrados -->
    <div class="mt-5">
      <div class="row">
        <div class="col-md-6">
          <h2 class="text-center mb-4">{{ $t('home.teamSeccion') }}</h2>

          <!-- Indicador de carga para equipos -->
          <div v-if="loadingTeams" class="text-center">
            <img :src="gifLoading">
          </div>
          <div v-else>
            <div class="row">
              <template v-for="team in listTeams" :key="team.id">
                <div class="col-md-6" :class="mode === 'dark' ? 'dark-mode' : ''">
                  <!-- Tarjeta de equipo registrado -->
                  <div class="card mb-4 shadow-sm">
                    <div class="card-body">
                      <h5 class="card-title">{{ team.team_name }}</h5>
                      <p class="card-text" style="margin-bottom: 0;">{{ team.desc_uso }}</p>
                      <p class="card-text" style="margin-bottom: 0;">{{ team.subFormatName }}</p>
                      <p></p>
                      <router-link class="btn btn-outline-success btn-sm" :to="'/team/' + team.id">{{ $t('buttons.seeTeam') }}</router-link>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Sección de Pokémon registrados -->
        <div class="col-md-6">
          <h2 class="text-center mb-4">{{ $t('home.pokemonSeccion') }}</h2>

          <!-- Indicador de carga para Pokémon -->
          <div v-if="loadingPokes" class="text-center">
            <img :src="gifLoading">
          </div>
          <div v-else>
            <div class="row">
              <template v-for="pokemon in listPokes" :key="pokemon.id">
                <div class="col-md-4 " :class="mode === 'dark' ? 'dark-mode' : ''">
                  <!-- Tarjeta de Pokémon registrada -->
                  <div class="card mb-4 shadow-sm">
                    <div class="card-body">
                      <h5 class="card-title" align="center">{{ pokemon.name }}</h5>
                      <img :src="pokemon.imgPokemon" style="width: 30%;" class="card-img-top d-block mx-auto" alt="Pokemon">
                      <p class="card-text">
                        <strong>{{ $t('pokemonsSeccion.teraType') }}: </strong> {{ pokemon.teraType }}
                      </p>
                      <p class="card-text">
                        <strong>{{ $t('pokemonsSeccion.item') }}: </strong> {{ pokemon.item }}
                      </p>
                      <router-link class="btn btn-outline-success btn-sm" :to="'/pokemon/' + pokemon.id">{{ $t('buttons.seePokemon') }}</router-link>
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
  import { useHead } from '@vueuse/head';
  export default {
    inject: ['apiUrl', 'gifLoading', 'mode'],
    name: 'HomeView',
    data() {
      return {
        listTeams: [],
        listPokes: [],
        loadingTeams: true,  // Variable de estado para equipos
        loadingPokes: true   // Variable de estado para Pokémon
      };
    },
    computed: {
      // Accede a isDarkMode para usarlo en el template
      darkMode() {
        return this.mode;
      }
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
      },
      async setHead(){
        useHead({
          title: this.$t('lastTeamsAndLastPokemons'),
          meta: [
            { name: 'description', content: this.$t('lastTeamsAndLastPokemons') },
            { name: 'keywords', content: `VGC, Pokémon, Team, Tournament, Regiona, International Championship, Global Challenge, Regulation H` },
          ]
        });
      }
    },
    mounted() {
      this.getTeams();
      this.getPokes();
      this.setHead();
    }
  };
</script>


<style scoped>
  .dark-mode {
    background-color: #121212;
    color: #e0e0e0;
  }

  .dark-mode .card {
    background-color: #1e1e1e;
    color: #e0e0e0;
    border-color: #e0e0e0;
  }
</style>