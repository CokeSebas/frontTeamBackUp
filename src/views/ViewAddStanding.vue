<template>
  <div :class="['container', { 'dark-mode': mode === 'dark' }]">
    <div :class="['card', { 'dark-card': mode === 'dark' }]">

      <!-- 🔄 LOADING -->
      <div v-if="loading" style="align-items: center; display: flex; justify-content: center;">
        <img :src="gifLoading">
      </div>

      <template v-else>
        <h2 class="title">
          {{ $t('tournamentsSeccion.topPlayer') }} – {{ tournamentTop.nombre }}
        </h2>
  
        <div
          v-for="(player, index) in players"
          :key="index"
          class="player-card"
        >
          <h4 class="player-title">
            {{ $t('tournamentsSeccion.position') }} {{ index + 1 }}
          </h4>
  
          <div class="row">
  
            <!-- 🟢 NO HAY STANDINGS → INPUTS -->
            <template v-if="!hasStandings">
              <input
                v-model="player.name"
                class="input"
                placeholder="Nombre"
                :disabled="hasStandings"
              />
  
              <input
                v-model="player.lastName"
                class="input"
                placeholder="Apellido"
              />
            </template>
  
            <!-- 🔵 HAY STANDINGS → COMBOBOX -->
            <template v-else>
              <select
                class="input"
                @change="onSelectPlayer(player, $event.target.value)"
              >
                <option value="" disabled selected>
                  {{ $t('tournamentsSeccion.selectPlayer') }}
                </option>
  
                <option
                  v-for="option in standingsOptions"
                  :key="option.id"
                  :value="option.id"
                >
                  {{ option.label }}
                </option>
              </select>
            </template>
  
          </div>
  
  
          <div class="pokemon-grid">
            <div
              v-for="(poke, i) in player.pokemons"
              :key="i"
              class="autocomplete"
            >
              <!-- Input -->
              <input
                v-model="player.pokemons[i]"
                class="input"
                placeholder="Pokémon"
                @input="onPokemonInput(player, i)"
              />
  
              <!-- Suggestions -->
              <ul
                v-if="player.suggestions[i]?.length"
                class="suggestions"
              >
                <li
                  v-for="pokemon in player.suggestions[i]"
                  :key="pokemon.id"
                  @click="selectPokemon(player, i, pokemon)"
                  class="suggestion-item"
                >
                  <img
                    :src="pokemon.imageUrl"
                    class="pokemon-thumb"
                    alt="pokemon"
                  />
                  <span>{{ pokemon.name }}</span>
                </li>
              </ul>
            </div>
  
          </div>
        </div>
  
        <div class="actions">
          <button class="btn btn-add" @click="addPlayer">
            + {{ $t('tournamentsSeccion.addPlayer') }}
          </button>
  
          <button
            class="btn btn-save"
            :disabled="saving"
            @click="saveTop"
          >
            <span v-if="saving" class="spinner"></span>
            {{ saving ? 'Guardando...' : 'Guardar Top' }}
          </button>
        </div>
      </template>

    </div>
  </div>
</template>


<script setup>
  import { ref, inject, onMounted, computed } from 'vue'
  import { useRoute } from 'vue-router'
  import axios from 'axios'
  import Swal from 'sweetalert2'

  import { useRouter } from 'vue-router';

  const mode = inject('mode')
  const apiUrl = inject('apiUrl')

  const route = useRoute()
  const idTorneo = route.params.id_torneo

  const saving = ref(false)
  const router = useRouter();

  const loading = ref(true);
  const gifLoading = inject('gifLoading');


  // ===============================
  // State
  // ===============================
  const players = ref([
    createPlayer()
  ])

  const pokemonList = ref([])
  const tournamentTop = ref([])
  const playersTop = ref([])

  // ===============================
  // Helpers
  // ===============================
  function createPlayer() {
    return {
      name: '',
      lastName: '',
      pokemons: ['', '', '', '', '', ''],
      suggestions: [[], [], [], [], [], []]
    }
  }

  // ===============================
  // Load Pokémon
  // ===============================
  const loadPokemons = async () => {
    try {
      const response = await axios.get(`${apiUrl}pokemon-seeder`)
      pokemonList.value = response.data
    } catch (error) {
      console.error('Error cargando pokemons', error)
    }
  }


  const loadDataTorneo = async () => {
    try {
      const response = await axios.get(
        `${apiUrl}tournaments/with-standing/${idTorneo}`
      )

      tournamentTop.value = response.data;
      playersTop.value = response.data.standings;
      console.log('jugadores del top del torneo:', playersTop.value);

    } catch (error) {
      console.error('Error cargando datos del torneo', error)
    }
  }

  const onPokemonInput = (player, index) => {
    const query = player.pokemons[index]

    if (!query || query.length < 3) {
      player.suggestions[index] = []
      return
    }

    player.suggestions[index] = pokemonList.value
      .filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 8) // máximo 8 sugeridos
  }

  const selectPokemon = (player, index, pokemon) => {
    player.pokemons[index] = pokemon.name
    player.suggestions[index] = []
  }

  // ===============================
  // Actions
  // ===============================
  const addPlayer = () => {
    players.value.push(createPlayer())
  }

  const saveTop = async () => {
    if (saving.value) return

    try {
      const payload = {
        tournamentId: idTorneo,
        players: players.value
      }

      await axios.post(`${apiUrl}tournament-top-players/bulk`, payload).then(() => {
        Swal.fire({
          icon: 'success',
          title: 'Top guardado',
          showConfirmButton: false,
          timer: 1500
        });
      }).catch(() => {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo guardar el top'
        });
      }).finally(() => {
        router.push('/tournament/goToTops/' + idTorneo);
      });

    } catch (error) {
      console.error('Error guardando top', error)
    } finally {
      saving.value = false
    }
  }

  const hasStandings = computed(() => {
    return playersTop.value && playersTop.value.length > 0
  })

  
  const standingsOptions = computed(() => {
    if (!hasStandings.value) return []

    return playersTop.value.map(s => {
      const [name, ...lastName] = s.playerName.split(' ')
      return {
        id: s.id,
        name,
        lastName: lastName.join(' '),
        label: s.playerName
      }
    })
  })

  const onSelectPlayer = (player, selectedId) => {
    const selected = standingsOptions.value.find(
      p => p.id === Number(selectedId)
    )

    if (!selected) return

    player.name = selected.name
    player.lastName = selected.lastName
  }


  // ===============================
  // Lifecycle
  // ===============================
  onMounted(async () => {
    loading.value = true
    try {
      await Promise.all([
        loadPokemons(),
        loadDataTorneo(),
      ])
    } finally {
      loading.value = false
    }
  });


</script>


<style scoped>
  .container {
    padding: 20px;
  }

  .card {
    background: #ffffff;
    border-radius: 14px;
    padding: 24px;
    color: #2c3e50;
  }

  .dark-mode {
    background: #121212;
  }

  .dark-card {
    background: #1e1e1e;
    color: #ecf0f1;
  }

  .title {
    text-align: center;
    margin-bottom: 24px;
  }

  .player-card {
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .dark-card .player-card {
    border-color: #333;
  }

  .player-title {
    margin-bottom: 12px;
  }

  .row {
    display: flex;
    gap: 10px;
    margin-bottom: 12px;
  }

  .input {
    flex: 1;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #ccc;
  }

  .dark-card .input {
    background: #2c2c2c;
    color: #ecf0f1;
    border-color: #444;
  }

  .pokemon-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .select {
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #ccc;
  }

  .dark-card .select {
    background: #2c2c2c;
    color: #ecf0f1;
    border-color: #444;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }

  .btn {
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
  }

  .btn-add {
    background: #3498db;
    color: white;
  }

  .btn-save {
    background: #2ecc71;
    color: white;
  }

  .autocomplete {
    position: relative;
  }

  .suggestions {
    position: absolute;
    width: 100%;
    max-height: 180px;
    overflow-y: auto;
    background: #ffffff;
    border: 1px solid #ccc;
    border-radius: 8px;
    z-index: 10;
    margin-top: 4px;
    padding: 0;
    list-style: none;
  }

  .suggestions li {
    padding: 8px 10px;
    cursor: pointer;
  }

  .suggestions li:hover {
    background: #f0f0f0;
  }

  /* 🌙 Dark mode */
  .dark-card .suggestions {
    background: #2c2c2c;
    border-color: #444;
  }

  .dark-card .suggestions li {
    color: #ecf0f1;
  }

  .dark-card .suggestions li:hover {
    background: #3a3a3a;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    cursor: pointer;
  }

  .pokemon-thumb {
    width: 28px;
    height: 28px;
    image-rendering: pixelated;
  }

  .suggestions li:hover {
    background: #f0f0f0;
  }

  /* 🌙 Dark mode */
  .dark-card .suggestions li:hover {
    background: #3a3a3a;
  }
  
  .btn-save:disabled {
    background-color: #999;
    pointer-events: none;
  }


  .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid #fff;
    border-top: 2px solid transparent;
    border-radius: 50%;
    display: inline-block;
    margin-right: 8px;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Evita overflow horizontal */
  .pokemon-grid {
    width: 100%;
    overflow: hidden;
  }

  .autocomplete {
    width: 100%;
    min-width: 0; /* CLAVE para grids */
  }

  .input {
    width: 100%;
    box-sizing: border-box;
  }



  /* ============================
   📱 RESPONSIVE (MOBILE)
   ============================ */
  @media (max-width: 768px) {

    /* Inputs de nombre / apellido */
    .row {
      flex-direction: column;
    }

    .player-card {
      padding: 14px;
    }

    .player-title {
      text-align: center;
      font-size: 1rem;
    }

    /* Pokémon: 2 por fila en mobile */
    .pokemon-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .autocomplete {
      max-width: 100%;
    }

    .suggestions {
      left: 0;
      right: 0;
      width: 100%;
    }

    /* Inputs más cómodos */
    .input {
      font-size: 0.95rem;
      padding: 10px;
    }

    /* Autocomplete no se salga */
    .autocomplete {
      width: 100%;
    }

    /* Botones apilados */
    .actions {
      flex-direction: column;
      gap: 12px;
    }

    .btn {
      width: 100%;
      font-size: 0.95rem;
    }

    .dark-card .player-card {
      background: #1f1f1f;
    }

    .dark-card .player-title {
      color: #ffffff;
    }

    .dark-card .input {
      background: #262626;
    }

    .dark-card .suggestions {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
    }
  }





</style>
