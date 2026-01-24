<template>
  <div :class="['form-container', { 'dark-mode': mode === 'dark' }]">
    <div :class="['form-card', { 'dark-card': mode === 'dark' }]">
      <h2 :class="['form-title', { 'dark-text': mode === 'dark' }]" style="text-align: center">{{ $t('createPokemon') }}</h2>
      <form @submit.prevent="createPokemon">
        <div class="form-group">
          <label for="nick_name">{{ $t('pokemonsSeccion.nickPokemon') }}:</label>
          <input type="text" v-model="pokemon.nickPoke" required />
        </div>

        <div class="form-group">
          <label for="paste_sd">{{ $t('pokemonsSeccion.dataPokemon') }}:</label>
          <textarea v-model="pokemon.pasteSd" 
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
          <label for="sub_format_id">{{ $t('teamsSeccion.subFormat') }}:</label>
            <select class="form-select" v-model="pokemon.subFormatId" required>
              <option value="" disabled>{{ $t('teamsSeccion.selectSubFormat') }}</option>
              <option v-for="subFormat in subFormats" :key="subFormat.id" :value="subFormat.id">
                {{ subFormat.abrevSubFormat }}
              </option>
            </select>
        </div>

        <div class="form-group">
          <label for="spread_use">{{ $t('pokemonsSeccion.useSpread') }}:</label>
          <textarea v-model="pokemon.spreadUse"></textarea>
        </div>

        <div class="form-group">
          <label for="team_mates">{{ $t('pokemonsSeccion.teamMates') }}:</label>
          <textarea v-model="pokemon.teamMates"></textarea>
        </div>

        <div class="form-group">
          <label for="calculos_principales">{{ $t('pokemonsSeccion.calculations') }}:</label>
          <textarea v-model="pokemon.calculosPrincipales"></textarea>
        </div>

        <div class="form-group form-group-inline">
            <label for="is_public">{{ $t('pokemonsSeccion.isPublic') }}:</label>
            <input type="checkbox" v-model="pokemon.isPublic" />
        </div>

        <!-- Spinner de carga -->
        <div v-if="isLoading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">{{ $t('loading') }}</span>
          </div>
        </div>
  
        <button type="submit" class="submit-btn" :disabled="isLoading">{{ $t('buttons.createPokemon') }}</button>
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
