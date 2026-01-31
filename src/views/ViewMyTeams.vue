<!-- src/views/ViewTeamsPublic.vue -->
<template>
  <div>
    <!-- Contenido principal centrado -->
    <div class="container mt-4">
      <div class="text-center">
        <h2 class="mb-4">{{ $t('teamsSeccion.myTitle') }}</h2>
        <router-link class="btn btn-success btn-lg" to="/vgc/create-team">{{ $t('buttons.createTeam') }}</router-link>

        <!-- Formulario de búsqueda -->
        <div class="mt-4 d-flex align-items-center gap-2">
          <input v-model="searchName" type="text" class="form-control flex-grow-1" :placeholder="$t('teamsSeccion.searchTeam')"/>
          
          <!-- Selector de subformato -->
          <select v-model="searchSubFormat" class="form-control w-50 form-select">
              <option value="">{{ $t('teamsSeccion.subFormat') }}</option>
              <option v-for="format in subFormats" :key="format.id" :value="format.subFormatName">{{ format.subFormatName }}</option>
          </select>
        </div>

        <div class="col-12"><br></div>

        <!-- Mostrar el div de carga si está cargando -->
        <div v-if="isLoading" class="text-center my-5" style="align-items: center; display: flex; justify-content: center;">
          <img :src="gifLoading">
        </div>

        <!-- Mostrar la lista de equipos si ya no está cargando -->
        <div v-else class="row">
          <div v-if="listTeams.length > 0" class="row">
            <template v-for="team in currentItems" :key="team.id">
              <div class="col-md-6" :class="mode === 'dark' ? 'dark-mode' : ''">
                  <!-- Ejemplo de tarjeta de equipo registrado -->
                <div class="card mb-4 shadow-sm">
                  <div class="card-body">
                    <h5 class="card-title">{{ team.team_name }}</h5>
                    <p v-if="team.desc_uso" class="card-text" style="margin-bottom: 0;">{{ team.desc_uso }}</p>
                    <p v-if="team.subFormatName" class="card-text" style="margin-bottom: 0;">{{ team.subFormatName }}</p>
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
                    <router-link class="btn btn-outline-success btn-sm" :to="'/vgc/my-team-detail/' + team.id">{{ $t('buttons.seeTeam') }}</router-link>
                  </div>
                </div>
              </div>
            </template>

            <Paginator
              :items="filteredTeams"
              :itemsPerPage="10"
              @page-changed="handlePageChanged"
            />

          </div> 
          <div v-else>
            <p style="color: #ff6b6b; font-weight: bold; font-size: 1.2em; text-align: center;">
              {{ $t('teamsSeccion.notTeamsRegister') }} 
            </p>
            <p style="text-align: center;">
              {{ $t('teamsSeccion.addTeam') }}
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
  import Paginator from '@/components/AppPaginator.vue';

  export default {
    inject: ['apiUrl', 'gifLoading', 'mode'],
    name: 'ViewTeamsPublic',
    components: {
      Paginator
    },
    data() {
      return {
        listTeams: [],
        subFormats: [],            // Lista de subformatos cargados desde la API
        isLoading: false,
        searchName: '',            // Campo de búsqueda por nombre
        searchSubFormat: '',        // Campo de búsqueda para el selector de subformato
        currentItems: [], // Elementos de la página actual
      };
    },
    computed: {
      // Accede a isDarkMode para usarlo en el template
      darkMode() {
        return this.mode;
      },
      filteredTeams() {
        return this.listTeams.filter(team => {
          const matchesName = team.team_name.toLowerCase().includes(this.searchName.toLowerCase());
          const matchesSubFormat = this.searchSubFormat
            ? team.subFormatName === this.searchSubFormat
            : true;
          return matchesName && matchesSubFormat;
        });
      }
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
            this.currentItems = this.filteredTeams.slice(0, 10); 
            this.isLoading = false; // Desactivar el estado de carga cuando termina
        })
        .catch(error => {
            console.error('Error:', error);
            this.isLoading = false; // Desactivar el estado de carga si hay un error
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
      handlePageChanged(paginatedItems) {
        this.currentItems = paginatedItems;
      },
    },
    watch: {
      filteredTeams(newFilteredTeams) {
        this.currentItems = newFilteredTeams.slice(0, 10); // Muestra los primeros 5 elementos en la página inicial
      }
    },
    mounted() {
      this.getTeams();
      this.getSubFormats();   // Cargar los subformatos cuando se monta el componente
    }
  };
</script>

<style scoped>
  /* Agrega estilos específicos para ViewTeamsPublic aquí, si lo deseas */
  .spinner-border {
      width: 3rem;
      height: 3rem;
  }

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
    width: 48px;
    height: 48px;
    object-fit: contain;
    /* border-radius: 50%;  // si quieres redondear */
  }
</style>

