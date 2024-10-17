<!-- src/views/HomeView.vue -->
<template>
  <div class="container mt-5">
      <!-- Encabezado -->
      <div class="text-center mb-4">
          <h1 class="display-4">Registra tus Equipos de Pokémon o Pokémon de manera individual.</h1>
          <p class="lead">Crea y organiza tus equipos para estar listo en la competición</p>

          <div class="d-flex justify-content-between mt-4">
              <router-link class="btn btn-primary btn-lg" to="/create-team">Crear Equipo</router-link>
              <router-link class="btn btn-primary btn-lg" to="/create-pokemon">Crear Pokémon</router-link>
          </div>
      </div>

      

      <!-- Sección de equipos registrados -->
      <div class="mt-5">
        <div class="row">
          <div class="col-md-6">
              <h2 class="text-center mb-4">Últimos Equipos Registrados</h2>
              <div class="col-md-6">
                <!-- Ejemplo de tarjeta de equipo registrado -->
                    <div class="card mb-4 shadow-sm">
                        <template v-for="team in listTeams" :key="team.id">
                            <div class="card-body">
                                <h5 class="card-title">{{ team.team_name }}</h5>
                                <p class="card-text">{{ team.desc_uso	 }}</p>
                                <a href="#" class="btn btn-outline-primary btn-sm">Ver Equipo</a>
                            </div>
                        </template>
                    </div>
                </div>
              </div>
              <!-- Repite tarjetas según sea necesario -->
              
              <div class="col-md-6">
                <h2 class="text-center mb-4">Pokémon Registrados Recientemente</h2>
                <div class="col-md-6">
                  <!-- Ejemplo de tarjeta de pokemon registrado -->
                      <div class="card mb-4 shadow-sm">
                          <div class="card-body">
                              <h5 class="card-title">Pikachu</h5>
                              <p class="card-text">Un pokemon de tipo electrico, muy poderoso y resistente.</p>
                              <a href="#" class="btn btn-outline-primary btn-sm">Ver Pokemon</a>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'HomeView',
  data() {
    return {
      listTeams: [],
      listPokes: []
    };
  },
  methods: {
    async getTeams() {
      //const response = await fetch('http://localhost:4000/api/teams');
      //const data = await response.json();
      //this.listTeams = data;

      axios.get('http://localhost:4000/api/teams')
        .then(
        response => {
            this.listTeams = response.data.data;
            //console.log(response.data.data);
        }
        ).catch(
        error => console.error('Error:', error)
        );
    },
    //async getPokes() {
    //  const response = await fetch('http://localhost:3000/pokemons');
    //  const data = await response.json();
    //  this.listPokes = data;
    //}
  },
  mounted() {
    this.getTeams();
    //this.getPokes();
  }
};
</script>

<style scoped>
/* Puedes agregar estilos específicos para la vista aquí */
</style>
