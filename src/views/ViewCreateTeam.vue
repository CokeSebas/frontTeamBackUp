<template>
  <div class="form-container">
    <div class="form-card">
      <h2>Registrar Equipo de Pokémon</h2>
      <form @submit.prevent="saveTeam">
        <div class="form-group">
          <label for="team_name">Nombre del Equipo:</label>
          <input type="text" v-model="team.team_name" required />
        </div>

        <div class="form-group">
          <label for="url_paste">URL Paste:</label>
          <input type="text" v-model="team.url_paste" />
        </div>

        <div class="form-group">
          <label for="format_id">Formato:</label>
          <select v-model="team.format_id" required>
            <option value="" disabled>Seleccione un formato</option>
            <option v-for="format in formats" :key="format.id" :value="format.id">
              {{ format.formatName }}
            </option>
          </select>
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

        <button type="submit" class="submit-btn">Guardar</button>
      </form>
    </div>
  </div>
</template>

<script setup>
  import { inject, reactive, ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  import Swal from 'sweetalert2';
  import { jwtDecode } from 'jwt-decode';
  


  // Importar el store de autenticación de Pinia
  import { useAuthStore } from '@/stores/authStore';

  const router = useRouter();
  const authStore = useAuthStore(); // Instancia del store

  const apiUrl = inject('apiUrl'); // Ahora tienes acceso a apiUrl

  const team = reactive({
    team_name: '',
    url_paste: '',
    format_id: null,
    date_created: new Date(),
    user_id: null,
    desc_uso: '',
    tournament_using: '',
    mus_fav: '',
    counters: '',
    damage_calcs: '',
    is_public: false,
  });

  const formats = ref([]);

  async function fetchFormats() {
    try {
      const response = await axios.get(apiUrl+'formats');
      formats.value = response.data;
    } catch (error) {
      console.error('Error al obtener formatos:', error);
    }
  }

  async function saveTeam() {
    if (!authStore.isAuthenticated) {
      localStorage.setItem('formTeam', JSON.stringify(team)); // Almacena el equipo en localStorage
      const currentUrl = router.currentRoute.value.fullPath; // Obtiene la URL actual

      router.push({ path: '/login', query: { redirect: currentUrl } });
      return;
    }

    const token = authStore.token; // Obtener el token desde el store
    if (!token) {
      throw new Error('El usuario no está autenticado');
    }

    const decodedToken = jwtDecode(token);
    team.user_id = decodedToken.userId;
    
    try {
      const response = await axios.post(apiUrl+'teams', team, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        title: 'Registrar Equipo',
        text: response.data.salida.message,
        icon: 'success',
      });
      
      setTimeout(() => {
        localStorage.removeItem('formTeam');
        const redirectTo = router.currentRoute.value.query.redirect || '/';
        router.push(redirectTo);
      }, 1500);
    } catch (error) {
      console.error('Error al guardar el equipo:', error);
    }
  }

  onMounted(() => {
    fetchFormats();

    const storedData = JSON.parse(localStorage.getItem('formTeam'));
    if (storedData) {
      Object.assign(team, storedData); // Rellena los datos del formulario si están guardados
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
  max-width: 800px;
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
  margin-right: 0.5rem;
}
</style>
