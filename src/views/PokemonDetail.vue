<!-- src/viewas/PokemonDetail.vue -->
<template>
  <div>
    <!-- Contenido principal centrado -->
    <div class="container mt-4">
      <div class="text-center">
        <h1 class="mb-4">{{ $t('pokemonsSeccion.detail') }}</h1>
      </div>
    </div>
    
    <div class="container">
      <div v-if="isLoading" style="align-items: center; display: flex; justify-content: center;">
        <img :src="gifLoading">
      </div>
      <div v-else-if="pokemon" class="row justify-content-center">
        <div class="col-md-6">
          
          <div class="d-flex align-items-stretch"> <!-- Columna Pokémon flexible para el estiramiento -->
            <div :class="mode === 'dark' ? 'pokemon-card-dark' : 'pokemon-card'">
              <div class="pokemon-header text-center"> <!-- Contenido del Pokémon centrado -->
                <img :src="pokemon.urlImage	" alt="Pokemon Image" class="pokemon-image" />
                <div class="pokemon-info">
                  <h4>{{ pokemon.namePoke }} <span v-if="pokemon.item"> @ {{ pokemon.item }}</span></h4>
                  <p style="margin-bottom: 0;"><strong>{{ $t('pokemonsSeccion.ability') }}:</strong> {{ pokemon.ability }}</p>
                  <!--<p style="margin-bottom: 0;"><strong>{{ $t('pokemonsSeccion.level') }}:</strong> {{ pokemon.level }}</p>-->
                  <p style="margin-bottom: 0;"><strong>{{ $t('pokemonsSeccion.teraType') }}:</strong> {{ pokemon.teraType }}</p>
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
          <button class="btn btn-success" @click="copyText">{{ $t('buttons.copyPaste') }}</button>
          <p></p>
          <p v-if="pokemon.subFormatName"><strong>{{ $t('teamsSeccion.subFormat') }}: </strong> {{ pokemon.subFormatName }}</p>
          <p v-if="pokemon.spreadUse"><strong>{{ $t('pokemonsSeccion.useSpread') }}: </strong> {{ pokemon.spreadUse }}</p>
          <p v-if="pokemon.teamMates"><strong>{{ $t('pokemonsSeccion.teamMates') }}: </strong> {{ pokemon.teamMates}}</p>
          <p v-if="pokemon.calculosPrincipales"><strong>{{ $t('pokemonsSeccion.calculations') }}: </strong> {{ pokemon.calculosPrincipales }}</p>  
          
          <div>
            <h3>{{ $t('share') }}</h3>
            <ShareButtons
              :shareUrl="currentUrl"
              shareText="Check out this Pokemon"
            />
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script>
  import axios from 'axios';
  import ShareButtons from "../components/ShareButtons.vue";
  import { useHead } from '@vueuse/head';

  export default {
    inject: ['apiUrl', 'gifLoading', 'mode'],
    name: 'PokemonDetail',
    props: {
      id: {
        type: Number,
        required: true
      }
    },
    components: {
      ShareButtons
    },
    data() {
      return {
        pokemon: null,
        isLoading: true,
        copySuccess: '',
        currentUrl: window.location.href,
      }
    },
    methods: {
      async getPokeDetail() {
        this.isLoading = true;
        try {
          const response = await axios.get(this.apiUrl + 'pokemon/' + this.id);
          this.pokemon = response.data[0];

          // Configura el título y meta descripción una vez que tienes los datos del Pokémon
          useHead({
            title: 'Pokémon ' + this.pokemon.name, // Usa el nombre del Pokémon en el título
            meta: [
              { name: 'description', content: `Detalles sobre ${this.pokemon.name}` },
              { name: 'keywords', content: `${this.pokemon.name}, Pokemon, SpreadUse, VGC ` },
              { name: 'og:title', content: 'Pokémon ' + this.pokemon.name },
              { name: 'og:description', content: `Detalles sobre ${this.pokemon.name}` },
              { name: 'og:image', content: this.pokemon.urlImage },
              { name: 'og:regulation', content: this.pokemon.subFormatName },
              { name: 'og:format', content: 'VGC' },
            ]
          });
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
    display: flex;
    flex-direction: column;
    justify-content: space-between;
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

  .row.justify-content-center {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
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
  
  .pokemon-card-dark {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 20px; /* Espacio entre tarjetas */
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
</style>