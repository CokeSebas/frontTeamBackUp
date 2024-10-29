<!-- src/views/ViewMyPokemons.vue -->
<template>
  <div>
    <div class="container mt-4">
      <div class="text-center">
        <h2 class="mb-4">Mis Pokémon Registrados</h2>
        <router-link class="btn btn-primary btn-lg" to="/create-pokemon">Crear Pokémon</router-link>

        <button v-if="selectedPokemons.length == 6" class="btn btn-primary btn-lg" @click="createTeam()">Obtener Team formato SD</button>

        <!-- Campo de búsqueda -->
        <input type="text" v-model="searchQuery" placeholder="Buscar Pokémon por nombre" class="form-control mt-3 mb-3" />

        <div v-if="isLoading" class="text-center my-5" style="align-items: center; display: flex; justify-content: center;">
          <img :src="gifLoading">
        </div>

        <!-- Mostrar la lista de Pokémon filtrada -->
        <div v-else class="row">
          <div v-if="filteredPokes.length > 0" class="row">
            <template v-for="pokemon in filteredPokes" :key="pokemon.id">
              <div class="col-md-4">
                <label 
                  :class="['card', 'mb-4', 'shadow-sm', { 'selected-card': pokemon.checked }]" 
                  :for="'select-' + pokemon.id"
                >
                  <div class="card-body">
                    <div class="d-flex align-items-center justify-content-center">
                      <input
                        type="checkbox"
                        class="form-check-input d-none"
                        :id="'select-' + pokemon.id"
                        :checked="pokemon.checked"
                        :disabled="isMaxSelected && !pokemon.checked"
                        @change="toggleSelection(pokemon)"
                      />
                      <h5 class="card-title m-0">{{ pokemon.name }}</h5>
                    </div>
                    
                    <img :src="pokemon.imgPokemon" style="width: 30%;" class="card-img-top d-block mx-auto my-2" alt="Pokemon">
                    <div class="inline-paragraphs">
                      <p class="card-text">
                        <strong>Tera Type:</strong> {{ pokemon.teraType }}
                      </p>
                      <p class="card-text">
                        <strong>Item:</strong> {{ pokemon.item }}
                      </p>
                      <p class="card-text" style="margin-bottom: 0;">
                        <strong>Evs Spread:</strong> {{ pokemon.evs }}
                      </p>
                      <br>
                    </div>
                    <router-link class="btn btn-outline-primary btn-sm" :to="'/my-pokemon-detail/' + pokemon.id">Ver Pokemon</router-link>
                  </div>
                </label>
              </div>
            </template>
          </div>

          <div v-else>
            <p style="color: #ff6b6b; font-weight: bold; font-size: 1.2em; text-align: center;">
              ¡No se encontraron Pokémon con ese nombre!
            </p>
          </div>
        </div>
        
      </div>
    </div>

    <!-- Modal de Bootstrap -->
    <div class="modal fade" tabindex="-1" :class="{ show: isModalOpen }" style="display: block;" v-if="isModalOpen">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Team para Pokémon Showdown</h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <button class="btn btn-primary" @click="copyText">Copiar paste</button>
            <pre>{{ pasteSdTeam }}</pre>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
    <!-- Fondo del modal -->
    <div v-if="isModalOpen" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
  import axios from 'axios';
  import { jwtDecode } from 'jwt-decode';

  export default {
    inject: ['apiUrl', 'gifLoading'],
    name: 'ViewEditPokemons',
    data() {
      return {
        listPokes: [],
        isLoading: false,
        selectedPokemons: [],
        pasteSdTeam: '',
        isModalOpen: false,
        searchQuery: '', // Nueva variable para el término de búsqueda
      };
    },
    computed: {
      isMaxSelected() {
        return this.selectedPokemons.length >= 6;
      },
      filteredPokes() {
        // Filtrar los Pokémon en función de la búsqueda
        return this.listPokes.filter(pokemon => 
          pokemon.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
    },
    methods: {
      async getPokes() {
        this.isLoading = true;

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('El usuario no está autenticado');
        }

        const decodedToken = jwtDecode(token);
        const userId = decodedToken.userId;

        axios.get(this.apiUrl + 'pokemon/pokes-user/' + userId, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }).then(response => {
          // Añadir `checked` a cada Pokémon
          this.listPokes = response.data.data.map(pokemon => ({
            ...pokemon,
            checked: false
          }));
          this.isLoading = false;
        }).catch(error => {
          console.error('Error:', error);
          this.isLoading = false;
        });
      },
      toggleSelection(pokemon) {
        // Alternar el estado `checked` del Pokémon
        if (pokemon.checked) {
          pokemon.checked = false;
          this.selectedPokemons = this.selectedPokemons.filter(item => item.id !== pokemon.id);
        } else if (this.selectedPokemons.length < 6) {
          pokemon.checked = true;
          this.selectedPokemons.push({ id: pokemon.id, pasteSd: pokemon.pasteSd });
        }
      },
      async createTeam() {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('El usuario no está autenticado');
        }

        this.pasteSdTeam = this.selectedPokemons.map(element => element.pasteSd).join('\n');
        this.openModal();
      },
      openModal() {
        this.isModalOpen = true;
      },
      closeModal() {
        this.isModalOpen = false;
      },
      copyText() {
        navigator.clipboard.writeText(this.pasteSdTeam)
          .then(() => {
            this.copySuccess = 'Texto copiado con éxito!';
          })
          .catch(err => {
            console.error('Error al copiar el texto: ', err);
          });
      }
    },
    mounted() {
      this.getPokes();
    }
  };
</script>

<style scoped>
  .container {
    margin-top: 50px;
  }
  .selected-card {
    border: 2px solid #007bff;
  }

  .inline-paragraphs p {
    margin: 0;
  }
</style>
