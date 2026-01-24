<template>
  <div :class="['form-container', { 'dark-mode': mode === 'dark' }]">
    <div :class="['form-card', { 'dark-card': mode === 'dark' }]">
      <h2 :class="['form-title', { 'dark-text': mode === 'dark' }]" style="text-align: center">{{ $t('createTeam') }}</h2>
      <form @submit.prevent="saveTeam">
        <div class="form-group">
          <label for="team_name">{{ $t('teamsSeccion.name') }}:</label>
          <input type="text" v-model="team.teamName" required />
        </div>

        <div class="form-group">
          <label for="url_paste">{{ $t('teamsSeccion.urlPaste') }}:</label>
          <input type="text" v-model="team.urlPaste" />
        </div>

        <div class="form-group">
          <div class="row">
            <div class="col-6">
              <label for="format_id">{{ $t('teamsSeccion.format') }}:</label>
              <select class="form-select" v-model="team.formatId" required>
                <option value="" disabled>{{ $t('teamsSeccion.selectFormat') }}</option>
                <option v-for="format in formats" :key="format.id" :value="format.id">
                  {{ format.formatName }}
                </option>
              </select>
            </div>
            <div class="col-6">
              <label for="sub_format_id">{{ $t('teamsSeccion.subFormat') }}:</label>
              <select class="form-select" v-model="team.subFormatId" required>
                <option value="" disabled>{{ $t('teamsSeccion.selectSubFormat') }}</option>
                <option v-for="subFormat in subFormats" :key="subFormat.id" :value="subFormat.id">
                  {{ subFormat.abrevSubFormat }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="desc_uso">{{ $t('teamsSeccion.description') }}:</label>
          <textarea v-model="team.descUso"></textarea>
        </div>

        <div class="form-group">
          <label for="tournament_using">{{ $t('teamsSeccion.tournament') }}:</label>
          <input type="text" v-model="team.tournamentUsing" />
        </div>

        <div class="form-group">
          <label for="mus_fav">{{ $t('teamsSeccion.musFav') }}:</label>
          <textarea v-model="team.musFav"></textarea>
        </div>

        <div class="form-group">
          <label for="counters">{{ $t('teamsSeccion.teamsCounter') }}:</label>
          <textarea v-model="team.counters"></textarea>
        </div>

        <div class="form-group">
          <label for="damage_calcs">{{ $t('teamsSeccion.damageCalcs') }}:</label>
          <textarea v-model="team.damageCalcs"></textarea>
        </div>

        <div class="form-group form-group-inline">
            <label for="is_public">{{ $t('teamsSeccion.isPublic') }}:</label>
            <input type="checkbox" v-model="team.isPublic" />
        </div>

        <!-- Spinner de carga -->
        <div v-if="isLoading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">{{ $t('loading') }}</span>
          </div>
        </div>

        <button type="submit" class="submit-btn" :disabled="isLoading">{{ $t('buttons.createTeam') }}</button>
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
  import { useHead } from '@vueuse/head';
  
  // Importar el store de autenticación de Pinia
  import { useAuthStore } from '@/stores/authStore';
  import { useI18n } from 'vue-i18n'; // Importa useI18n

  const router = useRouter();
  const isLoading = ref(false);
  const authStore = useAuthStore(); // Instancia del store

  const apiUrl = inject('apiUrl'); // Ahora tienes acceso a apiUrl

  const mode = inject('mode');

  const { t } = useI18n(); // Usa `useI18n` para obtener `t`

  const team = reactive({
    teamName: '',
    urlPaste: '',
    formatId: null,
    dateCreated: new Date(),
    userId: null,
    descUso: '',
    tournamentUsing: '',
    musFav: '',
    counters: '',
    damageCalcs: '',
    isPublic: false,
    subFormatId: null
  });

  const formats = ref([]);
  const subFormats = ref([]);

  async function fetchFormats() {
    try {
      const response = await axios.get(apiUrl+'formats');
      formats.value = response.data;
    } catch (error) {
      console.error('Error al obtener formatos:', error);
    }
  }

  async function getSubFormats() {
    try {
      const response = await axios.get(apiUrl+'subformats');
      subFormats.value = response.data;
    } catch (error) {
      console.error('Error al obtener subformatos:', error);
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
    team.userId = decodedToken.userId;

    isLoading.value = true;
    
    try {
      const response = await axios.post(apiUrl+'teams', team, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if(response.data.status == "success"){
        Swal.fire({
          title: t('responseApisSeccion.addTeamTitle'),
          text: t('responseApisSeccion.addTeamSuccess'),
          icon: 'success',
        });
        
        setTimeout(() => {
          localStorage.removeItem('formTeam');
          const redirectTo = router.currentRoute.value.query.redirect || '/';
          router.push(redirectTo);
        }, 1500);
      }else{
        Swal.fire({
          title: t('responseApisSeccion.addTeamTitle'),
          text: t('responseApisSeccion.addTeamError'),
          icon: 'error',
        });
      }

    } catch (error) {
      Swal.fire({
        title: t('responseApisSeccion.addTeamTitle'),
        text: t('responseApisSeccion.addTeamError'),
        icon: 'error',
      });

      console.error('Error al crear equipo:', error);
    } finally {
      isLoading.value = false;
    }
  }

  async function setHead() {
    useHead({
      title: t('createTeam'),
      meta: [
        { name: 'description', content: t('createTeam') },
        { name: 'keywords', content: `VGC, Pokémon, Team, Tournament, Regiona, International Championship, Global Challenge, Regulation H` },
      ]
    });
  }

  onMounted(() => {
    fetchFormats();
    getSubFormats();
    setHead();

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


  /* Estilos de modo oscuro */
  .dark-mode {
    background-color: #121212;
  }
  .dark-card {
    background-color: #333;
    box-shadow: 0 4px 10px rgba(255, 255, 255, 0.1);
  }
  .dark-text {
    color: #ffffff;
  }
  .dark-input {
    background-color: #444;
    color: #fff;
    border: 1px solid #555;
  }
  .btn-dark {
    background-color: #444;
    color: #fff;
  }
</style>
