<!-- src/viewas/PokemonDetail.vue -->
<template>
  <div>
    <!-- Contenido principal centrado -->
    <div class="container mt-4">
      <div class="text-center"></div>
        <h1 class="mb-4">Detalle de mi Pokémon</h1>
    </div>
    
    <div class="container">
      <div v-if="isLoading" style="align-items: center; display: flex; justify-content: center;">
        <img :src="gifLoading">
      </div>
      <div v-else-if="pokemon" class="row justify-content-center">
        <div class="col-md-6">
          
          <div v-if="!isEditing" class="d-flex align-items-stretch"> <!-- Columna Pokémon flexible para el estiramiento -->
            <div class="pokemon-card">
              <div class="pokemon-header text-center"> <!-- Contenido del Pokémon centrado -->
                <img :src="pokemon.urlImage	" alt="Pokemon Image" class="pokemon-image" />
                <div class="pokemon-info">
                  <h4>{{ pokemon.namePoke }} <span v-if="pokemon.item"> @ {{ pokemon.item }}</span></h4>
                  <p style="margin-bottom: 0;"><strong>Ability:</strong> {{ pokemon.ability }}</p>
                  <p style="margin-bottom: 0;"><strong>Level:</strong> {{ pokemon.level }}</p>
                  <p style="margin-bottom: 0;"><strong>Tera Type:</strong> {{ pokemon.teraType }}</p>
                  <p style="margin-bottom: 0;"><strong>EVs:</strong> {{ pokemon.evs }}</p>
                  <p style="margin-bottom: 0;"><strong>{{ pokemon.nature }} Nature</strong></p>
                  <p style="margin-bottom: 0;" v-if="pokemon.ivs"><strong>IVs:</strong> {{ pokemon.ivs }}</p>
                </div>
              </div>
              <div class="pokemon-moves">
                <ul>
                  <li v-for="(move, index) in pokemon.moves" :key="index">- {{ move }}</li>
                </ul>
              </div>
            </div>
          </div>

          <div v-else class="form-card">
            <div class="form-group">
              <label for="paste_sd">Datos Pokémon:</label>
              <textarea v-model="pokemon.pasteSd" style="width: 500px; height: 300px;"
                placeholder="Pokémon @ Item  
    Ability: Ability
    Tera Type: Normal
    EVs: 100 HP / 100 Atk / 100 Def / 100 SpA / 100 SpD / 100 Spe
    Timid Nature
    IVs: 0 Atk
    - Mov1
    - Mov2
    - Mov3
    - Mov4"
              >
                </textarea>
            </div>
          </div>

        </div>

        <div class="col-md-6"> 
          <div v-if="isEditing" class="form-card">
            <div class="form-group">
              <label for="spread_use">Usos del Spread:</label>
              <textarea v-model="pokemon.spreadUse"></textarea>
            </div>

            <div class="form-group">
              <label for="team_mates">Compañeros de Equipo:</label>
              <textarea v-model="pokemon.teamMates"></textarea>
            </div>

            <div class="form-group">
              <label for="calculos_principales">Cálculos Principales:</label>
              <textarea v-model="pokemon.calculosPrincipales"></textarea>
            </div>

            <div class="form-group form-group-inline">
              <label for="is_public">Hacerlo Público:</label>
              <input type="checkbox" v-model="pokemon.isPublic" />
          </div>
          
          </div>
          <div v-else>
            <button class="btn btn-primary" @click="copyText">Copiar paste</button>
            <p></p>
            <p v-if="pokemon.spreadUse"><strong>Uso de Spread: </strong> {{ pokemon.spreadUse }}</p>
            <p v-if="pokemon.teamMates"><strong>Compañeros de equipo: </strong> {{ pokemon.teamMates}}</p>
            <p v-if="pokemon.calculosPrincipales"><strong>Calculos principales: </strong> {{ pokemon.calculosPrincipales }}</p>
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
    inject: ['apiUrl', 'gifLoading'],
    name: 'PokemonDetail',
    props: {
      id: {
        type: Number,
        required: true
      }
    },
    data() {
      return {
        pokemon: null,
        isLoading: true,
        copySuccess: '',
        isEditing: false,
      }
    },
    methods:{
      async getPokeDetail() {
        this.isLoading = true;
        try {
          const response = await axios.get(this.apiUrl+'pokemon/poke-user/'+this.id, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          if(response.data.status == "success"){
            this.pokemon = response.data.data[0]; // Almacenar los datos recibidos
          }else{
            Swal.fire({
              icon: 'error',
              title: 'Oops...',
              text: 'Error al cargar los datos',
            })
          }
        } catch (err) {
          console.log(err);
        } finally {
          this.isLoading = false;
        }
      },

      copyText() {
        // Utilizamos la API de Clipboard para copiar el texto
        navigator.clipboard.writeText(this.pokemon.pasteSd)
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
        let { pasteSd, namePoke, moves, ivs, evs, ...filteredPokemon } = this.pokemon;

        try {
          const response = await axios.post(`${this.apiUrl}pokemon/edit/${this.id}`, filteredPokemon, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          console.log(response.data);
          if (response.data.status == 'success') {
            //this.pokemon = { ...this.editedPokemon };
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
        this.editedPokemon = { ...this.pokemon };
        //this.editedMoves = [...this.pokemon.moves];
        this.toggleEditMode();
      },

      toggleEditMode() {
        this.isEditing = !this.isEditing;
      },


    },
    mounted() {
      this.getPokeDetail();
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
    max-width: 800px; /* Ajusta este valor según el ancho máximo deseado */
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