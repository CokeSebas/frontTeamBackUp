<template>
  <div class="form-container">
    <div class="form-card">
      <h2>Crear Pokemon</h2>
      <form @submit.prevent="createPokemon">
        <div class="form-group">
          <label for="nick_name">Nick Pokemon:</label>
          <input type="text" v-model="pokemon.nick_poke" required />
        </div>

        <div class="form-group">
          <label for="paste_sd">Datos Pokémon:</label>
          <textarea v-model="pokemon.paste_sd" 
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

        <div class="form-group">
          <label for="spread_use">Usos del Spread:</label>
          <textarea v-model="pokemon.spread_use"></textarea>
        </div>

        <div class="form-group">
          <label for="team_mates">Compañeros de Equipo:</label>
          <textarea v-model="pokemon.team_mates"></textarea>
        </div>

        <div class="form-group">
          <label for="calculos_principales">Cálculos Principales:</label>
          <textarea v-model="pokemon.calculos_principales"></textarea>
        </div>

        <div class="form-group form-group-inline">
            <label for="is_public">Hacerlo Público:</label>
            <input type="checkbox" v-model="pokemon.is_public" />
        </div>
  
        <button type="submit" class="submit-btn">Crear</button>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { reactive, onMounted } from 'vue'; // Asegúrate de importar ref y onMounted
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  import { isAuthenticated } from '../services/isAuthenticated';
  import Swal from 'sweetalert2';

  import { jwtDecode } from 'jwt-decode';

  const router = useRouter();

  const pokemon = reactive({
    paste_sd: '',
    user_id: null,
    spread_use: '',
    team_mates: '',
    calculos_principales: '',
    nick_poke: '',
    is_public: false,
  });

  async function createPokemon() {

    if (!isAuthenticated.value) {
      localStorage.setItem('formPokemon', JSON.stringify(pokemon)); // Almacena el pokemon en localStorage
      const currentUrl = router.currentRoute.value.fullPath; // Obtiene la URL actual

      router.push({ path: '/login', query: { redirect: currentUrl } });
      return;  
    }

    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('El usuario no está autenticado');
    }

    const decodedToken = jwtDecode(token);
    pokemon.user_id = decodedToken.userId;

    try {
      const response = await axios.post('http://localhost:4000/api/pokemon', pokemon, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        title: 'Registrar Pokemon',
        text: response.data.salida.message,
        icon: 'success', // Tipos: 'success', 'error', 'warning', 'info', 'question'
        //confirmButtonText: 'Aceptar'
      });
      
      setTimeout(() => {
        localStorage.removeItem('formPokemon');
        console.log('Formulario guardado con éxito', response.data);
        const redirectTo = router.currentRoute.value.query.redirect || '/'; 
        router.push(redirectTo);
      }, 1500);
    } catch (error) {
      console.error(error);
    }
  }

  onMounted(() => {
    const storedData = JSON.parse(localStorage.getItem('formPokemon'));
    if (storedData) {
      Object.assign(pokemon, storedData); // Rellena los datos del formulario
    }
  });

</script>

<style scoped>
/* Estilos para centrar el formulario y hacerlo ocupar todo el espacio central */
.form-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5;
}

.form-card {
  background-color: #ffffff;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px; /* Ajusta este valor según el ancho máximo deseado */
}

h2 {
  text-align: center;
  margin-bottom: 1.5rem;
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

.submit-btn {
  background-color: #4CAF50;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  margin-top: 1rem;
}

.submit-btn:hover {
  background-color: #45a049;
}

.form-group-inline {
  display: flex;
  align-items: center;
}

.form-group-inline label {
  margin-right: 0.5rem; /* Espacio entre la etiqueta y el checkbox */
}
</style>
