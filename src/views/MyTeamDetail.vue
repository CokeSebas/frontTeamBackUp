<!-- src/views/TeamDetail.vue -->
<template>
  <div>
    <!-- Contenido principal centrado -->
    <div class="container mt-4">
      <h1 class="text-center">Detalle de mi Equipo</h1> <!-- Título centrado -->
    </div>

    
    <div class="container">
      <div v-if="isLoading" style="align-items: center; display: flex; justify-content: center;">
        <img src="https://i.pinimg.com/originals/c3/ef/e3/c3efe3c72dc3a0d598735ca29822e80a.gif">
      </div>
      <div v-else-if="team"  class="row justify-content-center"> <!-- Contenedor centrado -->
        <div class="col-md-8">
          <div class="row justify-content-center">
            <template v-for="pokes in team.pokemons" :key="pokes.species">
              <div class="col-md-4 d-flex align-items-stretch"> <!-- Columna Pokémon flexible para el estiramiento -->
                <div class="pokemon-card">
                  <div class="pokemon-header text-center"> <!-- Contenido del Pokémon centrado -->
                    <img :src="pokes.pokeImg" alt="Pokemon Image" class="pokemon-image" />
                    <div class="pokemon-info">
                      <h4>{{ pokes.species }} <span v-if="pokes.item"> @ {{ pokes.item }}</span></h4>
                      <p style="margin-bottom: 0;"><strong>Ability:</strong> {{ pokes.ability }}</p>
                      <p style="margin-bottom: 0;"><strong>Level:</strong> {{ pokes.level }}</p>
                      <p style="margin-bottom: 0;"><strong>Tera Type:</strong> {{ pokes.teraType }}</p>
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
            <p v-if="team.team_name" class="text-center"><strong>Nombre del equipo: </strong> {{ team.team_name }}</p> <!-- Texto centrado -->
            <p></p>
            <p v-if="team.url_paste">
                <strong>URL Paste: </strong> <a :href="team.url_paste" target="_blank">{{ team.url_paste }}</a>
                <button class="btn btn-primary" @click="copyText">Copiar paste</button>
            </p>
            <p v-if="team.desc_uso"><strong>Descripción del Equipo: </strong> {{ team.desc_uso }}</p>
            <p v-if="team.tournament_using"><strong>Torneo donde se usó: </strong> {{ team.tournament_using }}</p>
            <p v-if="team.mus_fav"><strong>MatchUp Favorables: </strong> {{ team.mus_fav }}</p>
            <p v-if="team.counters"><strong>Teams Counter: </strong> {{ team.counters }}</p>
            <p v-if="team.damage_calcs"><strong>Cálculos de Daño: </strong> {{ team.damage_calcs }}</p>
          </div>

          <div v-else class="d-flex align-items-stretch"> <!-- Columna Pokémon flexible para el estiramiento -->
            <div class="form-card">
              <div class="form-group">
                <label for="team_name">Nombre del Equipo:</label>
                <input type="text" v-model="team.team_name" required />
              </div>

              <div class="form-group">
                <label for="url_paste">URL Paste:</label>
                <input type="text" v-model="team.url_paste" />
              </div>

              <div class="form-group">
                <label for="desc_uso">Descripción de Uso:</label>
                <textarea v-model="team.desc_uso"></textarea>
              </div>

              <div class="form-group">
                <label for="tournament_using">Torneo Usado:</label>
                <input type="text" v-model="team.tournament_using" />
              </div>

              <div class="form-group">
                <label for="mus_fav">MatchUp Favorables:</label>
                <textarea v-model="team.mus_fav"></textarea>
              </div>

              <div class="form-group">
                <label for="counters">Principales Teams Counter:</label>
                <textarea v-model="team.counters"></textarea>
              </div>

              <div class="form-group">
                <label for="damage_calcs">Cálculos de Daño:</label>
                <textarea v-model="team.damage_calcs"></textarea>
              </div>

              <div class="form-group form-group-inline">
                  <label for="is_public">Hacerlo Público:</label>
                  <input type="checkbox" v-model="team.is_public" />
              </div>
            </div>
          </div>


          <!-- Botón para alternar entre vista y edición -->
          <button v-if="!isEditing" class="btn btn-warning mt-3" @click="toggleEditMode">Editar</button>
          <button v-if="isEditing" class="btn btn-success mt-3" @click="saveChanges">Guardar Cambios</button>
          <button v-if="isEditing" class="btn btn-secondary mt-3" @click="cancelEdit">Cancelar</button>

        </div>
      </div>
    </div>
  </div>
</template>


<script>
  import axios from 'axios';
  import Swal from 'sweetalert2';

  export default {
    inject: ['apiUrl'],
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
                title: 'Oops...',
                text: 'Error al cargar los datos',
              })
            }

          } catch (err) {
            this.error = 'Error al cargar los datos'; // Manejar errores
          } finally {
            this.isLoading = false; // Finaliza la carga
          }

          
        },

        copyText() {
          // Utilizamos la API de Clipboard para copiar el texto
          navigator.clipboard.writeText(this.team.url_paste)
            .then(() => {
              // Mostramos un mensaje de éxito al copiar el texto
              this.copySuccess = 'Texto copiado con éxito!';
            })
            .catch(err => {
              // Manejar cualquier error si ocurre
              console.error('Error al copiar el texto: ', err);
            });
        },

        async saveChanges() {
          // eslint-disable-next-line no-unused-vars
          let { url_json, pokemons,  ...filteredTeam } = this.team;

          try {
            const response = await axios.post(`${this.apiUrl}api/teams/edit/${this.id}`, filteredTeam, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
            console.log(response.data);
            if (response.data.status == 'success') {
              //this.pokemon = { ...this.editedTeam };
              this.toggleEditMode();
              Swal.fire('¡Éxito!', 'El Pokémon ha sido actualizado correctamente.', 'success');
            } else {
              Swal.fire('Error', 'Hubo un problema al actualizar el Pokémon.', 'error');
            }
          } catch (err) {
            console.error(err);
            Swal.fire('Error', 'Hubo un problema al actualizar el Pokémon.', 'error');
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

</style>