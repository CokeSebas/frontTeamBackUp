<!-- src/viewas/PokemonDetail.vue -->
<template>
  <div>
    <!-- Contenido principal centrado -->
    <div class="container mt-4">
      <div class="text-center"></div>
        <h1 class="mb-4">Detalle del Pokémon</h1>
    </div>
    
    <div class="container">
      <div v-if="isLoading" style="align-items: center; display: flex; justify-content: center;">
        <img src="https://i.pinimg.com/originals/c3/ef/e3/c3efe3c72dc3a0d598735ca29822e80a.gif">
      </div>
      <div v-else-if="pokemon" class="row justify-content-center">
        <div class="col-md-6">
          
          <div class="d-flex align-items-stretch"> <!-- Columna Pokémon flexible para el estiramiento -->
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

        </div>

        <div class="col-md-6">

          <button class="btn btn-primary" @click="copyText">Copiar paste</button>
          <p></p>
          <p v-if="pokemon.spreadUse"><strong>Uso de Spread: </strong> {{ pokemon.spreadUse }}</p>
          <p v-if="pokemon.teamMates"><strong>Compañeros de equipo: </strong> {{ pokemon.teamMates}}</p>
          <p v-if="pokemon.calculosPrincipales"><strong>Calculos principales: </strong> {{ pokemon.calculosPrincipales }}</p>  
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import axios from 'axios';

  export default {
    inject: ['apiUrl'],
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
        copySuccess: ''
      }
    },
    methods:{
      async getPokeDetail() {
        this.isLoading = true;
        try {
          const response = await axios.get(this.apiUrl+'pokemon/'+this.id);
          this.pokemon = response.data[0];
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
      }
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
</style>