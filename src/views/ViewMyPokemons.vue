<!-- src/views/ViewMyPokemons.vue -->
<template>
  <div>
    <!-- Contenido principal centrado -->
    <div class="container mt-4">
      <div class="text-center">
        <h2 class="mb-4">{{ $t('pokemonsSeccion.myTitle') }}</h2>
        <router-link class="btn btn-success btn-lg" to="/create-pokemon">{{ $t('buttons.createPokemon') }}</router-link>

        <button v-if="selectedPokemons.length === 6" class="btn btn-success btn-lg" @click="createTeam">{{ $t('buttons.obtainFormatSd') }}</button>

        <!-- Formulario de búsqueda -->
        <div class="mt-4 d-flex align-items-center gap-2">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control flex-grow-1"
            :placeholder="$t('pokemonsSeccion.searchPokemon')"
          />
          
          <!-- Selector de subformato -->
          <select v-model="searchSubFormat" class="form-control w-50">
            <option value="">{{ $t('teamsSeccion.subFormat') }}</option>
            <option v-for="format in subFormats" :key="format.id" :value="format.subFormatName">
              {{ format.subFormatName }}
            </option>
          </select>
        </div>

        <div class="col-12"><br></div>

        <!-- Mostrar el div de carga si está cargando -->
        <div v-if="isLoading" style="align-items: center; display: flex; justify-content: center;">
          <img :src="gifLoading" />
        </div>

        <!-- Mostrar la lista de Pokémon filtrada -->
        <div v-else class="row">
          <div v-if="filteredPokes.length > 0" class="row">
            <template v-for="pokemon in filteredPokes" :key="pokemon.id">
              <div class="col-md-4" :class="mode === 'dark' ? 'dark-mode' : ''">
                <label
                  :class="[
                    'card',
                    'mb-4',
                    'shadow-sm',
                    { 
                      'selected-card': pokemon.checked && mode !== 'dark', 
                      'selected-card-dark': pokemon.checked && mode === 'dark',
                      'dark-mode': mode === 'dark' 
                    }
                  ]"
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
                    
                    <img
                      :src="pokemon.imgPokemon"
                      style="width: 30%;"
                      class="card-img-top d-block mx-auto my-2"
                      alt="Pokemon"
                    />
                    <div class="inline-paragraphs">
                      <p v-if="pokemon.subFormatName" class="card-text">
                        <strong>{{ $t('teamsSeccion.subFormat') }}:</strong> {{ pokemon.subFormatName }}
                      </p>
                      <p class="card-text">
                        <strong>{{ $t('pokemonsSeccion.teraType') }}:</strong> {{ pokemon.teraType }}
                      </p>
                      <p class="card-text">
                        <strong>{{ $t('pokemonsSeccion.item') }}:</strong> {{ pokemon.item }}
                      </p>
                      <p class="card-text" style="margin-bottom: 0;">
                        <strong>{{ $t('pokemonsSeccion.evsSpread') }}:</strong> {{ pokemon.evs }}
                      </p>
                      <br>
                    </div>
                    <router-link 
                      class="btn btn-outline-success btn-sm" 
                      :to="'/my-pokemon-detail/' + pokemon.id"
                      >{{ $t('buttons.seePokemon') }}</router-link>
                  </div>
                </label>
              </div>
            </template>
          </div>

          <div v-else>
            <p style="color: #ff6b6b; font-weight: bold; font-size: 1.2em; text-align: center;">
              {{ $t('pokemonsSeccion.notFound') }}
            </p>
          </div>
        </div>
        
      </div>
    </div>

    <!-- Modal de Bootstrap -->
    <div
      class="modal fade"
      tabindex="-1"
      :class="{ show: isModalOpen, 'dark-mode': mode === 'dark' }"
      style="display: block;"
      v-if="isModalOpen"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ $t('pokemonsSeccion.modalTittle') }}</h5>
            <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <button class="btn btn-success" @click="copyText">{{ $t('buttons.copyPaste') }}</button>
            <pre>{{ pasteSdTeam }}</pre>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">{{ $t('buttons.close') }}</button>
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
  import Swal from 'sweetalert2';

  export default {
    inject: ['apiUrl', 'gifLoading', 'mode'],
    name: 'ViewEditPokemons',
    data() {
      return {
        listPokes: [],
        subFormats: [],
        isLoading: false,
        selectedPokemons: [],
        pasteSdTeam: '',
        isModalOpen: false,
        searchQuery: '', // Campo de búsqueda por nombre
        searchSubFormat: '', // Campo para el filtro de subformato
      };
    },
    computed: {
      isMaxSelected() {
        return this.selectedPokemons.length >= 6;
      },
      filteredPokes() {
        return this.listPokes.filter(pokemon => {
          const matchesName = pokemon.name.toLowerCase().includes(this.searchQuery.toLowerCase());
          const matchesSubFormat = this.searchSubFormat
            ? pokemon.subFormatName === this.searchSubFormat
            : true;
          return matchesName && matchesSubFormat;
        });
      },
      darkMode() {
        return this.mode;
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
          this.listPokes = response.data.data;
          this.isLoading = false;
        }).catch(error => {
          console.error('Error:', error);
          this.isLoading = false;
        });
      },
      async getSubFormats() {
        try {
          const response = await axios.get(this.apiUrl + 'subformats');
          this.subFormats = response.data;
        } catch (error) {
          console.error('Error al cargar los subformatos:', error);
        }
      },
      async createTeam() {
        this.pasteSdTeam = this.selectedPokemons.map(element => element.pasteSd).join('\n');
        //this.openModal();
        this.copyText();
        Swal.fire({
          title: this.$t('pokemonsSeccion.modalTittle'),
          text: this.$t('pokemonsSeccion.pasteForSd'),
          icon: 'success',
          confirmButtonText: this.$t('buttons.accept')
        })
      },
      toggleSelection(pokemon) {
        if (pokemon.checked) {
          pokemon.checked = false;
          this.selectedPokemons = this.selectedPokemons.filter(item => item.id !== pokemon.id);
        } else if (this.selectedPokemons.length < 6) {
          pokemon.checked = true;
          this.selectedPokemons.push({ id: pokemon.id, pasteSd: pokemon.pasteSd });
        }
      },
      isPokemonSelected(pokemon) {
          return this.selectedPokemons.some(item => item.id === pokemon.id);
        },    
      openModal() {
        this.isModalOpen = true;
      },
      closeModal() {
        this.isModalOpen = false;
      },
      copyText() {
          // Utilizamos la API de Clipboard para copiar el texto
          navigator.clipboard.writeText(this.pasteSdTeam)
            .then(() => {
              // Mostramos un mensaje de éxito al copiar el texto
              this.copySuccess = 'Texto copiado con éxito!';
            })
            .catch(err => {
              // Manejar cualquier error si ocurre
              console.error('Error al copiar el texto: ', err);
            });
        },
    },
    mounted() {
      this.getPokes();
      this.getSubFormats(); // Cargar los subformatos al montar el componente
    }
  };
</script>

<style scoped>
  .container {
    margin-top: 50px;
  }
  
  .selected-card {
    border: 2px solid #06b600;
  }

  .selected-card-dark {
    border: 2px solid #01711b;
  }

  .inline-paragraphs p {
    margin: 0;
  }

  .dark-mode .modal-content {
    background-color: #1e1e1e;
    color: #e0e0e0;
    border-color: #e0e0e0;
  }

  .dark-mode .modal-header,
  .dark-mode .modal-footer {
    border-color: #333333;
  }

  .dark-mode .btn-close {
    filter: invert(1);
  }

  .dark-mode .card {
    background-color: #333; /* Fondo oscuro para la tarjeta */
    color: #f0f0f0; /* Color de texto claro */
    /*border-color: #444; /* Borde oscuro */
  }

  .dark-mode .card .card-title {
    color: #ffffff; /* Color de título en modo oscuro */
  }

  .dark-mode .card .btn-outline-success {
    color: #f0f0f0;
    /*border-color: #888;*/
  }

  .dark-mode .card .btn-outline-success:hover {
    background-color: #444;
    color: #fff;
  }
</style>
