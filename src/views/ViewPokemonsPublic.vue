<!-- src/views/ViewPokemonPublic.vue -->
<template>
  <div>
    <!-- Contenido principal centrado -->
    <div class="container mt-4">
        <div class="text-center">
            <h2 class="mb-4">Pokémon Registrados</h2>
            <router-link class="btn btn-primary btn-lg" to="/create-pokemon">Crear Pokémon</router-link>
            <div class="row">
              <template v-for="pokemon in listPokes" :key="pokemon.id">
                <div class="col-md-4">
                  <!-- Tarjeta de Pokémon registrada -->
                  <div class="card mb-4 shadow-sm">
                    <div class="card-body">
                      <h5 class="card-title">{{ pokemon.name }}</h5>
                      <img :src="pokemon.imgPokemon" style="width: 30%;" class="card-img-top d-block mx-auto" alt="Pokemon">
                      <p class="card-text">
                        Tera Type: {{ pokemon.teraType }}
                      </p>
                      <p class="card-text">
                        Items: {{ pokemon.item }}
                      </p>
                      <router-link class="btn btn-outline-primary btn-sm" :to="'/pokemon/' + pokemon.id">Ver Pokemon</router-link>
                    </div>
                  </div>
                </div>
              </template>
            </div>
        </div>
    </div>
  </div>
</template>


<script>
  import axios from 'axios';

  export default {
      name: 'ViewPokemonPublic',
      data() {
          return {
              listPokes: [],
              isLoading: false, // Controla el estado de carga
          };
      },
      methods: {
          async getPokes() {
      
              axios.get('http://localhost:4000/api/pokemon/pokes-home')
                  .then(
                  response => {
                      this.listPokes = response.data.data;
                      //console.log(response.data);
                  }
                  ).catch(
                  error => console.error('Error:', error)
                  );
              
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
</style>
