<template>
  <div :class="['container', { 'dark-mode': mode === 'dark' }]">
    <div :class="['card', { 'dark-card': mode === 'dark' }]">

      <!-- LOADING -->
      <div v-if="loading" class="loading">
        <img :src="gifLoading">
      </div>

      <template v-else>
        <h2 class="title">{{ $t('matchRecordSection.title') }}</h2>

        <!-- GLOBAL INFO -->
        <div class="row">
          <input v-model="form.tournamentName" class="input" placeholder="Torneo" />
        </div>

        <!-- MATCHES -->
        <div
          class="player-card"
          v-for="(m, mIndex) in form.matches"
          :key="mIndex"
        >
          <div class="player-header">
            <h3>{{ $t('matchRecordSection.round') }} {{ mIndex + 1 }}</h3>
            <small>vs {{ m.opponentName || '...' }}</small>

            <button
              class="btn btn-remove"
              @click="removeMatch(mIndex)"
              v-if="form.matches.length > 1"
            >
              ✕
            </button>
          </div>

          <div class="row">
            <input v-model="m.opponentName" class="input" placeholder="Oponente" />

            <select v-model="m.result" class="input">
              <option value="" disabled>{{ $t('matchRecordSection.result') }}</option>
              <option value="win">{{ $t('matchRecordSection.victory') }}</option>
              <option value="loss">{{ $t('matchRecordSection.defeat') }}</option>
              <option value="tie">{{ $t('matchRecordSection.draw') }}</option>
            </select>
          </div>

          <!-- POKEMON GRID -->
          <div class="pokemon-grid">
            <div
              v-for="(poke, i) in m.pokemons"
              :key="i"
              class="autocomplete"
            >
              <input
                v-model="m.pokemons[i].name"
                class="input"
                placeholder="Pokémon"
                @input="onPokemonInput(mIndex, i)"
                @focus="activeAutocompleteId = `${mIndex}-${i}`; activeSuggestionIndex = -1"
                @keydown="onKeyDown(
                  $event,
                  suggestions[mIndex][i],
                  (pokemon) => selectPokemon(mIndex, i, pokemon)
                )"
              />

              <!-- Suggestions -->
              <ul
                v-if="
                  suggestions[mIndex][i]?.length &&
                  activeAutocompleteId === `${mIndex}-${i}`
                "
                class="suggestions"
              >
                <li
                  v-for="(pokemon, idx) in suggestions[mIndex][i]"
                  :key="pokemon.id"
                  class="suggestion-item"
                  :class="{ active: idx === activeSuggestionIndex }"
                  @mousedown.prevent="selectPokemon(mIndex, i, pokemon)"
                >
                  <img :src="pokemon.imageUrl" class="pokemon-thumb" />
                  {{ pokemon.name }}
                </li>
              </ul>
            </div>
          </div>
          
        </div>

        <!-- ADD MATCH -->
        <button class="btn btn-add" @click="addMatch">
          + {{ $t('matchRecordSection.addOpponent') }}
        </button>

        <!-- SAVE -->
        <div class="actions">
          <button class="btn btn-save" :disabled="saving" @click="saveAll">
            <span v-if="saving" class="spinner"></span>
            {{ saving ? 'Guardando...' : t('matchRecordSection.saveRecord') }}
          </button>
        </div>

      </template>
    </div>
  </div>
</template>

<script setup>
  import { ref, inject, onMounted, onBeforeUnmount } from 'vue'
  import axios from 'axios'
  import Swal from 'sweetalert2'
  import { useRouter } from 'vue-router';
  import { jwtDecode } from 'jwt-decode';
  // Importar el store de autenticación de Pinia
  import { useAuthStore } from '@/stores/authStore';
  import { useI18n } from 'vue-i18n'; // Importa useI18n

  const mode = inject('mode')
  const apiUrl = inject('apiUrl')
  const gifLoading = inject('gifLoading')

  const router = useRouter();
  const loading = ref(true)
  const saving = ref(false)

  const pokemonList = ref([])

  const { t } = useI18n(); // Usa `useI18n` para obtener `t`

  const authStore = useAuthStore(); // Instancia del store

  const activeSuggestionIndex = ref(-1)
  const activeAutocompleteId = ref(null)

  const emptyPokemon = () => ({
    name: '',
    id: null
  })

  const form = ref({
    tournamentName: '',
    matches: [
      {
        opponentName: '',
        result: '',
        pokemons: Array.from({ length: 6 }, emptyPokemon)
      }
    ]
  })


  const suggestions = ref([
    [[], [], [], [], [], []]
  ])

  //const activeAutocomplete = ref(null)

  // ===============================
  // LOAD POKEMONS
  // ===============================
  const loadPokemons = async () => {
    const res = await axios.get(`${apiUrl}pokemon-seeder`)
    pokemonList.value = res.data
  }


  // ===============================
  // ADD MATCH
  // ===============================
  const addMatch = () => {
    form.value.matches.push({
      opponentName: '',
      result: '',
      pokemons: Array.from({ length: 6 }, emptyPokemon)
    })

    suggestions.value.push([[], [], [], [], [], []])
  }


  // ===============================
  // AUTOCOMPLETE
  // ===============================
  const onPokemonInput = (mIndex, i) => {
    const query = form.value.matches[mIndex].pokemons[i].name

    if (!query || query.length < 2) {
      suggestions.value[mIndex][i] = []
      return
    }

    suggestions.value[mIndex][i] = pokemonList.value
      .filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8)
  }

  const selectPokemon = (mIndex, i, pokemon) => {
    form.value.matches[mIndex].pokemons[i] = {
      name: pokemon.name,
      id: pokemon.id
    }

    suggestions.value[mIndex][i] = []
  }

  const onKeyDown = (event, suggestionsList, onSelect) => {
    if (!suggestionsList?.length) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        activeSuggestionIndex.value =
          (activeSuggestionIndex.value + 1) % suggestionsList.length
        break

      case 'ArrowUp':
        event.preventDefault()
        activeSuggestionIndex.value =
          (activeSuggestionIndex.value - 1 + suggestionsList.length) % suggestionsList.length
        break

      case 'Enter':
        event.preventDefault()
        if (activeSuggestionIndex.value >= 0) {
          onSelect(suggestionsList[activeSuggestionIndex.value])
        }
        break

      case 'Escape':
        closeSuggestions()
        break
    }
  }

  const closeSuggestions = () => {
    activeSuggestionIndex.value = -1
    activeAutocompleteId.value = null
  }

  const handleClickOutside = (event) => {
    if (!event.target.closest('.autocomplete')) {
      closeSuggestions()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })


  // ===============================
  // SAVE
  // ===============================
  const saveAll = async () => {
    if (saving.value) return

    if (!form.value.tournamentName)
      return Swal.fire('Error', 'Falta torneo', 'error')

    for (const m of form.value.matches) {
      if (!m.opponentName)
        return Swal.fire('Error', 'Falta oponente', 'error')

      if (!m.result)
        return Swal.fire('Error', 'Falta resultado', 'error')

      if (m.pokemons.some(p => !p.name || !p.id))
      return Swal.fire('Error', 'Completa los 6 Pokémon', 'error')
    }

    saving.value = true;

    if (!authStore.isAuthenticated) {
      // 🔥 guardar TODO el form
      localStorage.setItem('pendingMatchForm', JSON.stringify(form.value));
      const currentUrl = router.currentRoute.value.fullPath;
      router.push({
        path: '/login',
        query: { redirect: currentUrl }
      });

      return;
    }

    const token = authStore.token;
    if (!token) {
      throw new Error('El usuario no está autenticado');
    }
    
    try {
      
      const decodedToken = jwtDecode(token);
      const payload = {
        tournamentName: form.value.tournamentName,
        userId: decodedToken.userId,
        matches: form.value.matches.map((m, index) => ({
          opponentName: m.opponentName,
          result: m.result,
          round: index + 1,
          pokemons: m.pokemons.map(p => ({
            name: p.name,
            id: p.id
          }))
        }))
      }

      console.log('PAYLOAD:', payload);

      const response = await axios.post(apiUrl+'matches/bulk', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('RESPONSE:', response);

      Swal.fire({
        title: t('matchRecordSection.saveRecordSuccess'),
        text: t('matchRecordSection.saveRecordText'),
        icon: 'success', // Tipos: 'success', 'error', 'warning', 'info', 'question'
      });

      setTimeout(() => {
        localStorage.removeItem('pendingMatchForm');
        const redirectTo = '/vgc/match-record/tournament/'+decodedToken.userId // redirigir a pagina para descargar imagen o a home 
        router.push(redirectTo);
      }, 1500);    

    } catch (e) {
      console.error(e)
      Swal.fire('Error', 'No se pudo guardar', 'error')
    } finally {
      saving.value = false
    }
  }

  const removeMatch = (index) => {
    form.value.matches.splice(index, 1)
    suggestions.value.splice(index, 1)
  }


  // ===============================
  // LIFECYCLE
  // ===============================
  onMounted(async () => {
    await loadPokemons();

    // 🔥 recuperar form si existe
    const saved = localStorage.getItem('pendingMatchForm');

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        form.value = parsed;

        // 🔥 reconstruir suggestions (muy importante)
        suggestions.value = parsed.matches.map(() => [[], [], [], [], [], []]);

      } catch (e) {
        console.error('Error restaurando form', e);
      }
    }

    loading.value = false;
  });
</script>

<style scoped>
  /* ===== Layout ===== */
  .container {
    padding: 20px;
  }

  .row {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
  }

  .player-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }

  /* ===== Cards ===== */
  .card {
    background: #fff;
    border-radius: 14px;
    padding: 24px;
  }

  .player-card {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 20px;
  }

  /* ===== Dark mode ===== */
  .dark-mode {
    background: #121212;
  }

  .dark-card {
    background: #1e1e1e;
    color: #fff;
  }

  /* ===== Typography ===== */
  .title {
    text-align: center;
    margin-bottom: 20px;
  }

  /* ===== Inputs ===== */
  .input {
    flex: 1;
    width: auto;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #ccc;
  }

  .input[type="number"] {
    max-width: 220px;
  }

  /* Dark inputs */
  .dark-card .input,
  .dark-card select.input {
    background: #2c2c2c;
    color: #ecf0f1;
    border-color: #444;
  }

  .dark-card .input::placeholder {
    color: #aaa;
  }

  .dark-card .input:focus,
  .dark-card select.input:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 1px #3498db;
  }

  /* ===== Grid ===== */
  .pokemon-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  /* ===== Autocomplete ===== */
  .autocomplete {
    position: relative;
  }

  .suggestions {
    position: absolute;
    width: 100%;
    background: #2c2c2c;
    border: 1px solid #444;
    border-radius: 8px;
    list-style: none;
    padding: 0;
    z-index: 10;
  }

  .suggestion-item {
    display: flex;
    gap: 8px;
    padding: 8px;
    cursor: pointer;
  }

  .suggestion-item:hover,
  .suggestion-item.active {
    background: rgba(52, 152, 219, 0.25);
  }

  .pokemon-thumb {
    width: 24px;
  }

  /* ===== Buttons ===== */
  .btn {
    padding: 10px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    color: #fff;
  }

  .btn-add {
    background: #3498db;
    margin-bottom: 15px;
  }

  .btn-save {
    background: #2ecc71;
  }

  .btn-remove {
    background: #e74c3c;
    padding: 4px 10px;
    border-radius: 6px;
    font-size: 0.8rem;
  }

  .btn-remove:hover {
    background: #c0392b;
  }

  /* ===== Spinner ===== */
  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid #fff;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
