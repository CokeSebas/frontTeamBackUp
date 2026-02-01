<template>
  <div :class="['form-container', { 'dark-mode': mode === 'dark' }]">

    <div :class="['form-card', { 'dark-card': mode === 'dark' }]">

      <h2 class="form-title">
        {{ $t('createTeam') }}
      </h2>

      <form @submit.prevent="saveTeam" class="form-grid">

        <!-- Team name -->
        <div class="field full">
          <label>{{ $t('teamsSeccion.name') }}</label>
          <input v-model="team.teamName" required />
        </div>

        <!-- Paste -->
        <div class="field full">
          <label>{{ $t('teamsSeccion.urlPaste') }}</label>
          <input v-model="team.urlPaste" placeholder="https://pokepaste.es/..." />
        </div>

        <!-- Format -->
        <div class="field">
          <label>{{ $t('teamsSeccion.format') }}</label>
          <select v-model="team.formatId" required>
            <option disabled value="">{{ $t('teamsSeccion.selectFormat') }}</option>
            <option v-for="f in formats" :key="f.id" :value="f.id">
              {{ f.formatName }}
            </option>
          </select>
        </div>

        <!-- Subformat -->
        <div class="field">
          <label>{{ $t('teamsSeccion.subFormat') }}</label>
          <select v-model="team.subFormatId" required>
            <option disabled value="">{{ $t('teamsSeccion.selectSubFormat') }}</option>
            <option v-for="s in subFormats" :key="s.id" :value="s.id">
              {{ s.abrevSubFormat }}
            </option>
          </select>
        </div>

        <div class="field full">
          <label>{{ $t('teamsSeccion.description') }}</label>
          <textarea v-model="team.descUso"></textarea>
        </div>

        <div class="field full">
          <label>{{ $t('teamsSeccion.tournament') }}</label>
          <input v-model="team.tournamentUsing" />
        </div>

        <div class="field">
          <label>{{ $t('teamsSeccion.musFav') }}</label>
          <textarea v-model="team.musFav"></textarea>
        </div>

        <div class="field">
          <label>{{ $t('teamsSeccion.teamsCounter') }}</label>
          <textarea v-model="team.counters"></textarea>
        </div>

        <div class="field full">
          <label>{{ $t('teamsSeccion.damageCalcs') }}</label>
          <textarea v-model="team.damageCalcs"></textarea>
        </div>

        <!-- Switch moderno -->
        <div class="field full switch-field">
          <span>{{ $t('teamsSeccion.isPublic') }}</span>
          <label class="switch">
            <input type="checkbox" v-model="team.isPublic" />
            <span class="slider"></span>
          </label>
        </div>

        <!-- Loader -->
        <div v-if="isLoading" class="loading">
          <div class="spinner-border"></div>
        </div>

        <button class="submit-btn" :disabled="isLoading">
          {{ $t('buttons.createTeam') }}
        </button>

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
  .form-container {
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1.5rem;
    background: #f4f6f9;
  }

  .form-card {
    width: 100%;
    max-width: 900px;
    background: #fff;
    border-radius: 16px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0,0,0,.08);
  }

  .form-title {
    text-align: center;
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    font-weight: 600;
  }

  /* GRID RESPONSIVE */
  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.2rem;
  }

  .field {
    display: flex;
    flex-direction: column;
  }

  .field.full {
    grid-column: 1 / -1;
  }

  label {
    font-size: .9rem;
    margin-bottom: .3rem;
    font-weight: 600;
    color: #444;
  }

  input,
  select,
  textarea {
    padding: .7rem .8rem;
    border-radius: 10px;
    border: 1px solid #ddd;
    outline: none;
    transition: .2s;
    font-size: .95rem;
  }

  textarea {
    resize: vertical;
    min-height: 90px;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76,175,80,.15);
  }

  /* Botón */
  .submit-btn {
    grid-column: 1 / -1;
    padding: .9rem;
    border-radius: 12px;
    border: none;
    background: linear-gradient(135deg, #4CAF50, #43a047);
    color: white;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: transform .15s, box-shadow .15s;
  }

  .submit-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 15px rgba(76,175,80,.3);
  }

  /* SWITCH MODERNO */
  .switch-field {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .switch {
    position: relative;
    width: 52px;
    height: 28px;
  }

  .switch input {
    opacity: 0;
  }

  .slider {
    position: absolute;
    inset: 0;
    background: #ccc;
    border-radius: 30px;
    transition: .3s;
  }

  .slider::before {
    content: "";
    position: absolute;
    width: 22px;
    height: 22px;
    left: 3px;
    top: 3px;
    background: white;
    border-radius: 50%;
    transition: .3s;
  }

  .switch input:checked + .slider {
    background: #4CAF50;
  }

  .switch input:checked + .slider::before {
    transform: translateX(24px);
  }

  /* Dark mode elegante */
  .dark-mode {
    background: #0f1115;
  }

  .dark-card {
    background: #1c1f26;
    box-shadow: 0 10px 25px rgba(0,0,0,.6);
  }

  .dark-card label {
    color: #ddd;
  }

  .dark-card input,
  .dark-card textarea,
  .dark-card select {
    background: #2a2e38;
    border-color: #3a3f4b;
    color: white;
  }

  .dark-card input:focus,
  .dark-card textarea:focus,
  .dark-card select:focus {
    border-color: #4CAF50;
  }

  /* Mobile */
  @media (max-width: 720px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }

</style>
