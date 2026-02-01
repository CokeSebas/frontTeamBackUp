<template>
  <div :class="['form-container', { 'dark-mode': mode === 'dark' }]">

    <div :class="['form-card', { 'dark-card': mode === 'dark' }]">

      <h2 class="form-title">
        {{ $t('createPokemon') }}
      </h2>

      <form @submit.prevent="createPokemon" class="form-grid">

        <div class="field full">
          <label>{{ $t('pokemonsSeccion.nickPokemon') }}</label>
          <input v-model="pokemon.nickPoke" required />
        </div>

        <div class="field full">
          <label>{{ $t('pokemonsSeccion.dataPokemon') }}</label>
          <textarea
            v-model="pokemon.pasteSd"
            class="paste-box"
            placeholder="Pokémon @ Item
Ability: Ability
Tera Type: Normal
EVs: 100 HP / 100 Atk / 100 Def / 100 SpA / 100 SpD / 100 Spe
Timid Nature
IVs: 0 Atk
- Move 1
- Move 2
- Move 3
- Move 4"
          />
        </div>

        <div class="field full">
          <label>{{ $t('teamsSeccion.subFormat') }}</label>
          <select v-model="pokemon.subFormatId" required>
            <option disabled value="">
              {{ $t('teamsSeccion.selectSubFormat') }}
            </option>
            <option v-for="s in subFormats" :key="s.id" :value="s.id">
              {{ s.abrevSubFormat }}
            </option>
          </select>
        </div>

        <div class="field">
          <label>{{ $t('pokemonsSeccion.useSpread') }}</label>
          <textarea v-model="pokemon.spreadUse" />
        </div>

        <div class="field">
          <label>{{ $t('pokemonsSeccion.teamMates') }}</label>
          <textarea v-model="pokemon.teamMates" />
        </div>

        <div class="field full">
          <label>{{ $t('pokemonsSeccion.calculations') }}</label>
          <textarea v-model="pokemon.calculosPrincipales" />
        </div>

        <div class="field full switch-field">
          <span>{{ $t('pokemonsSeccion.isPublic') }}</span>
          <label class="switch">
            <input type="checkbox" v-model="pokemon.isPublic" />
            <span class="slider"></span>
          </label>
        </div>

        <div v-if="isLoading" class="loading">
          <div class="spinner-border"></div>
        </div>

        <button class="submit-btn" :disabled="isLoading">
          {{ $t('buttons.createPokemon') }}
        </button>

      </form>

    </div>
  </div>
</template>

<script setup>
  import { inject, ref, reactive, onMounted } from 'vue'; // Asegúrate de importar ref y onMounted
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  import Swal from 'sweetalert2';
  import { jwtDecode } from 'jwt-decode';
  const apiUrl = inject('apiUrl'); // Ahora tienes acceso a apiUrl

  // Importar el store de autenticación de Pinia
  import { useAuthStore } from '@/stores/authStore';

  import { useI18n } from 'vue-i18n'; // Importa useI18n

  import { useHead } from '@vueuse/head';

  const router = useRouter();
  const isLoading = ref(false);
  const authStore = useAuthStore(); // Instancia del store

  const mode = inject('mode');

  const { t } = useI18n(); // Usa `useI18n` para obtener `t`

  const subFormats = ref([]);

  const pokemon = reactive({
    paste_sd: '',
    user_id: null,
    spread_use: '',
    team_mates: '',
    calculos_principales: '',
    nick_poke: '',
    is_public: false,
    sub_format_id: null,
  });

  async function createPokemon() {

    if (!authStore.isAuthenticated) {
      localStorage.setItem('formPokemon', JSON.stringify(pokemon)); // Almacena el pokemon en localStorage
      const currentUrl = router.currentRoute.value.fullPath; // Obtiene la URL actual

      router.push({ path: '/login', query: { redirect: currentUrl } });
      return;  
    }

    const token = authStore.token;
    if (!token) {
      throw new Error('El usuario no está autenticado');
    }

    const decodedToken = jwtDecode(token);
    pokemon.userId = decodedToken.userId;

    isLoading.value = true;

    try {
      const response = await axios.post(apiUrl+'pokemon', pokemon, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.salida[0].status === "success") {
        Swal.fire({
          title: t('responseApisSeccion.addPokemonTitle'),
          text: t('responseApisSeccion.addPokemonSuccess'),
          icon: 'success', // Tipos: 'success', 'error', 'warning', 'info', 'question'
        });
        
        setTimeout(() => {
          localStorage.removeItem('formPokemon');
          const redirectTo = router.currentRoute.value.query.redirect || '/'; 
          router.push(redirectTo);
        }, 1500);
      }else{
        Swal.fire({
          title: t('responseApisSeccion.addPokemonTitle'),
          text: t('responseApisSeccion.addPokemonError'),
          icon: 'error', // Tipos: 'success', 'error', 'warning', 'info', 'question'
        });
      }

    } catch (error) {
      Swal.fire({
        title: t('responseApisSeccion.addPokemonTitle'),
        text: t('responseApisSeccion.addPokemonError'),
        icon: 'error', // Tipos: 'success', 'error', 'warning', 'info', 'question'
      });
    } finally {
      isLoading.value = false;
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

  async function setHead() {
    useHead({
      title: t('createPokemon'),
      meta: [
        { name: 'description', content: t('createPokemon') },
        { name: 'keywords', content: `VGC, Pokémon, Team, Tournament, Regiona, International Championship, Global Challenge, Regulation H` },
      ],
    });
  }

  onMounted(() => {
    getSubFormats();
    setHead();
    const storedData = JSON.parse(localStorage.getItem('formPokemon'));
    if (storedData) {
      Object.assign(pokemon, storedData); // Rellena los datos del formulario
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

  .paste-box {
    min-height: 180px;
    font-family: monospace;
    white-space: pre-wrap;
  }

  input:focus,
  select:focus,
  textarea:focus {
    border-color: #4CAF50;
    box-shadow: 0 0 0 2px rgba(76,175,80,.15);
  }

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
    transition: .15s;
  }

  .submit-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 15px rgba(76,175,80,.3);
  }

  /* SWITCH */

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

  /* DARK MODE */

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

  /* MOBILE */

  @media (max-width: 720px) {
    .form-grid {
      grid-template-columns: 1fr;
    }
  }

</style>
