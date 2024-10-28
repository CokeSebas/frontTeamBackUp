<!-- src/views/ViewPokemonPublic.vue -->
<template>
  <div>
    <!-- Contenido principal centrado -->
    <div class="container mt-4">
        <div class="text-center">
            <h2 class="mb-4">Pokémon Registrados</h2>
            <router-link class="btn btn-primary btn-lg" to="/create-pokemon">Crear Pokémon</router-link>
            
            <!-- Mostrar el div de carga si está cargando -->
            <div v-if="isLoading" style="align-items: center; display: flex; justify-content: center;">
              <img src="https://i.pinimg.com/originals/c3/ef/e3/c3efe3c72dc3a0d598735ca29822e80a.gif">
            </div>

            <!-- Mostrar la lista de Pokémon si ya no está cargando -->
            <div v-else class="row">
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
                      <router-link class="btn btn-outline-primary btn-sm" :to="'/pokemon/' + pokemon.id">Ver Pokémon</router-link>
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
    inject: ['apiUrl'],
      name: 'ViewPokemonPublic',
      data() {
          return {
              listPokes: [],
              isLoading: false, // Controla el estado de carga
          };
      },
      methods: {
          async getPokes() {
              this.isLoading = true; // Activar el estado de carga
              
              axios.get(this.apiUrl+'pokemon/pokes-home')
                  .then(
                  response => {
                      this.listPokes = response.data.data;
                      this.isLoading = false; // Desactivar el estado de carga cuando termina
                  }
                  ).catch(
                  error => {
                      console.error('Error:', error);
                      this.isLoading = false; // Desactivar el estado de carga si hay un error
                  }
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

  .spinner-border {
      width: 3rem;
      height: 3rem;
  }
</style>
