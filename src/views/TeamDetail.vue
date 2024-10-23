<!-- src/views/TeamDetail.vue -->
<template>
  <div>
    <!-- Contenido principal centrado -->
    <div class="container mt-4">
      <h1 class="text-center">Detalle del Equipo</h1> <!-- Título centrado -->
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
          <p v-if="team.team_name" class="text-center">Nombre del equipo: {{ team.team_name }}</p> <!-- Texto centrado -->
          <p v-if="team.url_paste">
              URL Paste: <a :href="team.url_paste" target="_blank">{{ team.url_paste }}</a>
              <button class="btn btn-primary" @click="copyText">Copiar paste</button>
          </p>
          <p v-if="team.desc_uso">Descripción del Equipo: {{ team.desc_uso }}</p>
          <p v-if="team.tournament_using">Torneo donde se usó: {{ team.tournament_using }}</p>
          <p v-if="team.mus_fav">MatchUp Favorables: {{ team.mus_fav }}</p>
          <p v-if="team.counters">Teams Counter: {{ team.counters }}</p>
          <p v-if="team.damage_calcs">Cálculos de Daño: {{ team.damage_calcs }}</p>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import axios from 'axios';

export default {
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
            copySuccess: '' // Mensaje de éxito
        }
    },
    methods: {
      async getTeamDetail() {
        this.isLoading = true;

        try {
          const response = await axios.get('http://localhost:4000/api/teams/'+this.id); // Realiza la solicitud con Axios
          this.team = response.data.data; // Almacenar los datos recibidos
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
      }


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
</style>