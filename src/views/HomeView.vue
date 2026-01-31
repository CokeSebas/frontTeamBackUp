<template>
  <div class="container mt-5">
    <!-- Encabezado -->
    <div class="text-center mb-4">
      <h1 class="display-4">{{ $t('home.title') }}</h1>
      <p class="lead">{{  $t('home.subtitle') }}</p>

      <div class="d-flex justify-content-between mt-4" style="max-width: 600px; margin: 0 auto;">
        <router-link class="btn btn-success btn-lg" to="/vgc/create-team">{{ $t('buttons.createTeam') }}</router-link>
        <router-link class="btn btn-success btn-lg" to="/vgc/create-pokemon">{{ $t('buttons.createPokemon') }}</router-link>
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
                      <!-- Contenedor de los 6 pokémon -->
                      <div class="pokemons">
                        <img :src="team.poke1" />
                        <img :src="team.poke2" />
                        <img :src="team.poke3" />
                        <img :src="team.poke4" />
                        <img :src="team.poke5" />
                        <img :src="team.poke6" />
                      </div>
                      <p></p>
                      <router-link class="btn btn-outline-success btn-sm" :to="'/vgc/team/' + team.id">{{ $t('buttons.seeTeam') }}</router-link>
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
  import logo from '@/assets/pokecircuit.png'; // 👈 ajusta el path si es necesario
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
      async setHead() {
        useHead({
          title: this.$t('lastTeamsAndLastPokemons'),
          meta: [
            // SEO básico
            {
              name: 'description',
              content: this.$t('descripcionMetaTag')
            },
            {
              name: 'robots',
              content: 'index, follow'
            },

            // Open Graph (Facebook, WhatsApp, etc.)
            {
              property: 'og:title',
              content: this.$t('lastTeamsAndLastPokemons')
            },
            {
              property: 'og:description',
              content: this.$t('descripcionMetaTag')
            },
            {
              property: 'og:type',
              content: 'website'
            },
            {
              property: 'og:url',
              content: window.location.origin
            },
            {
              property: 'og:image',
              content: logo
            },

            // Twitter
            {
              name: 'twitter:card',
              content: 'summary_large_image'
            },
            {
              name: 'twitter:title',
              content: this.$t('lastTeamsAndLastPokemons')
            },
            {
              name: 'twitter:description',
              content: this.$t('descripcionMetaTag')
            },
            {
              name: 'twitter:image',
              content: logo
            }
          ]
        })
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

  .pokemons img {
    width: 40px;
    height: 40px;
    object-fit: contain;
    /* border-radius: 50%;  // si quieres redondear */
  }
</style>