<!-- src/views/ViewEditPokemons.vue -->
<template>
    <div>
        <!-- Contenido principal centrado -->
        <div class="container mt-4">
            <div class="text-center">
                <h2 class="mb-4">Mis Equipos</h2>
                <router-link class="btn btn-primary mb-3" to="/create-team">Agregar Equipo</router-link>
                <ul class="list-group">
                    <li class="list-group-item" v-for="(team, index) in teams" :key="index">
                        {{ team.name }}
                        <button class="btn btn-danger btn-sm float-end" @click="deleteTeam(index)">Eliminar</button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
  export default {
      name: 'ViewEditPokemons',
      data() {
          return {
              teams: [
                  { name: 'Equipo 1' },
                  { name: 'Equipo 2' },
                  { name: 'Equipo 3' },
              ]
          };
      },
      methods: {
          addTeam() {
              // Lógica para agregar un nuevo equipo
              alert('Funcionalidad para agregar un equipo');
          },
          deleteTeam(index) {
              this.teams.splice(index, 1); // Elimina el equipo seleccionado
          }
      }
  };
</script>

<style scoped>
/* Agrega estilos específicos para ViewEditPokemons aquí, si lo deseas */
</style>
