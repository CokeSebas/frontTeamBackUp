<!-- src/views/TeamDetail.vue -->
<template>
  <div>
    <!-- Contenido principal centrado -->
    <div class="container mt-4">
      <h1 class="text-center">{{ $t('teamsSeccion.detailMyTeam') }}</h1> <!-- Título centrado -->
    </div>

    
    <div class="container">
      <div v-if="isLoading" style="align-items: center; display: flex; justify-content: center;">
        <img :src="gifLoading">
      </div>
      <div v-else-if="team"  class="row justify-content-center"> <!-- Contenedor centrado -->
        <div class="col-md-8">
          <div class="row justify-content-center">
            <template v-for="pokes in team.pokemons" :key="pokes.species">
              <div class="col-md-4 d-flex align-items-stretch" :class="mode === 'dark' ? 'dark-mode' : ''"> <!-- Columna Pokémon flexible para el estiramiento -->
                <div :class="mode === 'dark' ? 'pokemon-card-dark' : 'pokemon-card'">
                  <div class="pokemon-header text-center"> <!-- Contenido del Pokémon centrado -->
                    <img :src="pokes.pokeImg" alt="Pokemon Image" class="pokemon-image" />
                    <div class="pokemon-info">
                      <h4>{{ pokes.species }} <span v-if="pokes.item"> @ {{ pokes.item }}</span></h4>
                      <p style="margin-bottom: 0;"><strong>{{ $t('teamsSeccion.ability') }}:</strong> {{ pokes.ability }}</p>
                      <p style="margin-bottom: 0;"><strong>{{ $t('teamsSeccion.level') }}:</strong> {{ pokes.level }}</p>
                      <p style="margin-bottom: 0;"><strong>{{ $t('teamsSeccion.teraType') }}:</strong> {{ pokes.teraType }}</p>
                      <p style="margin-bottom: 0;"><strong>EVs:</strong> {{ pokes.evs }}</p>
                      <p style="margin-bottom: 0;"><strong>{{ pokes.nature }} Nature</strong></p>
                      <p style="margin-bottom: 0;" v-if="pokes.ivs"><strong>IVs:</strong> {{ pokes.ivs }}</p>
                    </div>
                  </div>
                  <div class="pokemon-moves">
                    <ul>
                      <li v-for="(move, index) in pokes.moves" :key="index">- {{ move }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </template>
          </div>
        </div>

        <div class="col-md-4">

          <div v-if="!isEditing" >
            <p v-if="team.team_name"><strong>{{ $t('teamsSeccion.name') }}: </strong> {{ team.team_name }}</p> <!-- Texto centrado -->
            <p v-if="team.url_paste">
                <strong>{{ $t('teamsSeccion.urlPaste') }}: </strong>: <a :href="team.url_paste" target="_blank">{{ team.url_paste }}</a>
                <button class="btn btn-success" @click="copyText">{{ $t('buttons.copyPaste') }}</button>
            </p>
            <p></p>
            <p v-if="team.subFormatName"><strong>{{ $t('teamsSeccion.subFormat') }}: </strong> {{ team.subFormatName }}</p>
            <p v-if="team.desc_uso"><strong>{{ $t('teamsSeccion.description') }}: </strong> {{ team.desc_uso }}</p>
            <p v-if="team.tournament_using"><strong>{{ $t('teamsSeccion.tournament') }}: </strong> {{ team.tournament_using }}</p>
            <p v-if="team.mus_fav"><strong>{{ $t('teamsSeccion.musFav') }}: </strong> {{ team.mus_fav }}</p>
            <p v-if="team.counters"><strong>{{ $t('teamsSeccion.teamsCounter') }}: </strong> {{ team.counters }}</p>
            <p v-if="team.damage_calcs"><strong>{{ $t('teamsSeccion.damageCalcs') }}: </strong> {{ team.damage_calcs }}</p>
          </div>

          <div v-else class="d-flex align-items-stretch"> <!-- Columna Pokémon flexible para el estiramiento -->
            <div :class="['form-card', { 'dark-card': mode === 'dark' }]">
              <div class="form-group">
                <label for="team_name">{{ $t('teamsSeccion.name') }}:</label>
                <input type="text" v-model="team.team_name" required />
              </div>

              <div class="form-group">
                <label for="url_paste">{{ $t('teamsSeccion.urlPaste') }}:</label>
                <input type="text" v-model="team.url_paste" />
              </div>

              <div class="form-group">
                <label for="desc_uso">{{ $t('teamsSeccion.description') }}:</label>
                <textarea v-model="team.desc_uso"></textarea>
              </div>

              <div class="form-group">
                <label for="tournament_using">{{ $t('teamsSeccion.tournament') }}:</label>
                <input type="text" v-model="team.tournament_using" />
              </div>

              <div class="form-group">
                <label for="mus_fav">{{ $t('teamsSeccion.musFav') }}:</label>
                <textarea v-model="team.mus_fav"></textarea>
              </div>

              <div class="form-group">
                <label for="counters">{{ $t('teamsSeccion.teamsCounter') }}:</label>
                <textarea v-model="team.counters"></textarea>
              </div>

              <div class="form-group">
                <label for="damage_calcs">{{ $t('teamsSeccion.damageCalcs') }}:</label>
                <textarea v-model="team.damage_calcs"></textarea>
              </div>

              <div class="form-group form-group-inline">
                  <label for="is_public">{{ $t('teamsSeccion.isPublic') }}:</label>
                  <input type="checkbox" v-model="team.is_public" />
              </div>
            </div>
          </div>


          <!-- Botón para alternar entre vista y edición -->
          <button v-if="!isEditing" class="btn btn-warning mt-3" @click="toggleEditMode">{{ $t('buttons.editTeam') }}</button>
          <button v-if="isEditing" class="btn btn-success mt-3" @click="saveChanges">{{ $t('buttons.saveChanges') }}</button>
          <button v-if="isEditing" class="btn btn-secondary mt-3" @click="cancelEdit">{{ $t('buttons.cancel') }}</button>

        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import axios from 'axios';
  import Swal from 'sweetalert2';

  export default {
    inject: ['apiUrl', 'gifLoading', 'mode'],
      name: 'TeamDetail',
      props: {
        id: {
            type: String,
            required: true
        }
      },data() {
          return {
              team: {},
              isLoading: false, // Controla el estado de carga
              error: null, // Para manejar errores opcionalmente
              copySuccess: '', // Mensaje de éxito
              isEditing: false,
              formats: []
          }
      },
      methods: {
        async getTeamDetail() {
          this.isLoading = true;

          try {
            const response = await axios.get(this.apiUrl+'teams/team-user/'+this.id, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }); // Realiza la solicitud con Axios

            if(response.data.status == "success"){
              this.team = response.data.data; // Almacenar los datos recibidos
            }else{
              Swal.fire({
                icon: 'error',
                title: this.$t('responseApisSeccion.oops'),
              text: this.$t('responseApisSeccion.loadingDataError'),
              })
            }

          } catch (err) {
            this.error = this.$t('responseApisSeccion.loadingDataError')
          } finally {
            this.isLoading = false; // Finaliza la carga
          }
        },

        copyText() {
          // Utilizamos la API de Clipboard para copiar el texto
          navigator.clipboard.writeText(this.team.url_paste)
            .then(() => {
            // Mostramos un mensaje de éxito al copiar el texto
            this.copySuccess = this.$t('responseApisSeccion.copySuccess');
          })
          .catch(err => {
            // Manejar cualquier error si ocurre
            console.error(this.$t('responseApisSeccion.copyError'), err);
          });
        },

        async saveChanges() {
          
          const objTeam = {
            teamName: this.team.team_name,
            descUso: this.team.desc_uso,
            tournamentUsing: this.team.tournament_using,
            musFav: this.team.mus_fav,
            counters: this.team.counters,
            damageCalcs: this.team.damage_calcs,
            isPublic: this.team.is_public
          }

          // eslint-disable-next-line no-unused-vars
          let { url_json, pokemons,  ...filteredTeam } = objTeam;

          try {
            const response = await axios.post(`${this.apiUrl}teams/edit/${this.id}`, filteredTeam, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            if (response.data.status == 'success') {
              //this.pokemon = { ...this.editedTeam };
              this.toggleEditMode();
              Swal.fire(this.$t('responseApisSeccion.exito'), this.$t('responseApisSeccion.updateTeamSuccess'), 'success');
            } else {
              Swal.fire(this.$t('responseApisSeccion.error'), this.$t('responseApisSeccion.errorUpdateTeam'), 'error');
            }
          } catch (err) {
            console.error(err);
            Swal.fire(this.$t('responseApisSeccion.error'), this.$t('responseApisSeccion.errorUpdateTeam'), 'error');
          }
        },

        cancelEdit() {
          this.editedTeam = { ...this.pokemon };
          //this.editedMoves = [...this.pokemon.moves];
          this.toggleEditMode();
        },

        toggleEditMode() {
          this.isEditing = !this.isEditing;
        },
      },
      mounted() {
          this.getTeamDetail();
      }
    
  };
</script>

<style scoped>
  
  .spinner {
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #22a6b3;
    height: 40px;
    width: 40px;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .pokemon-card {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px; /* Espacio entre tarjetas */
    background-color: #f9f9f9;
  }

  .pokemon-image {
    width: 100px; /* Ajusta el tamaño de la imagen */
    height: auto;
    margin-bottom: 15px;
  }

  .pokemon-header {
    margin-bottom: 15px;
  }

  .pokemon-moves ul {
    list-style-type: none;
    padding-left: 0;
  }

  .pokemon-moves li {
    margin-bottom: 5px;
  }

  .pokemon-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .row.justify-content-center {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
  }

  .form-card {
    background-color: #ffffff;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 800px;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    font-weight: bold;
    display: block;
    margin-bottom: 0.5rem;
  }

  input, textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  input[type="checkbox"] {
    width: auto;
  }

  .dark-mode .card {
    background-color: #1e1e1e;
    color: #e0e0e0;
    border-color: #e0e0e0;
  }
  
  .pokemon-card-dark {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px; /* Espacio entre tarjetas */
  }

  /* Estilos de modo oscuro */
  .dark-mode {
    background-color: #121212;
  }
  .dark-card {
    background-color: #333;
    box-shadow: 0 4px 10px rgba(255, 255, 255, 0.1);
  }
  .dark-text {
    color: #ffffff;
  }
  .dark-input {
    background-color: #444;
    color: #fff;
    border: 1px solid #555;
  }
  .btn-dark {
    background-color: #444;
    color: #fff;
  }

</style>