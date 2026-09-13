<template>
  <main
    class="tournament-page"
    :class="{ 'theme-dark': isDark }"
    :data-bs-theme="isDark ? 'dark' : 'light'"
  >
    <div class="tournament-shell">
      <header class="hero-card">
        <div class="hero-copy">
          <span class="hero-eyebrow">CLASIFICACIÓN</span>

          <h1 class="hero-title">
            {{ $t('tournamentsSeccion.topPlayer') }}
          </h1>

          <p class="hero-description">
            {{
              tournamentName
                ? `Configura las posiciones y los equipos del top en el torneo ${tournamentName}.`
                : 'Configura las posiciones y los equipos del top del torneo.'
            }}
          </p>

          <div class="hero-meta">
            <span v-if="formatName" class="hero-chip">
              {{ formatName }}
            </span>

            <span v-if="hasStandings" class="hero-chip">
              {{ standingsOptions.length }} jugadores disponibles
            </span>
          </div>
        </div>

        <div class="hero-counter" aria-live="polite">
          <strong>{{ players.length }}</strong>
          <span>
            {{ players.length === 1 ? 'posición' : 'posiciones' }}
          </span>
        </div>
      </header>

      <section
        class="content-card standing-card"
        :aria-busy="loading"
      >
        <div
          v-if="loading"
          class="state-panel"
          aria-live="polite"
          aria-busy="true"
        >
          <img
            v-if="gifLoadingValue"
            :src="gifLoadingValue"
            class="loading-image"
            alt="Cargando información del torneo"
          >

          <span
            v-else
            class="loading-spinner"
            aria-hidden="true"
          />
        </div>

        <div
          v-else-if="loadingError"
          class="state-panel error-state"
          role="alert"
        >
          <span class="state-icon" aria-hidden="true">!</span>
          <h2>{{ $t('responseApisSeccion.oops') }}</h2>
          <p>{{ loadingError }}</p>

          <button
            type="button"
            class="btn-electric"
            @click="initializeView"
          >
            Reintentar
          </button>
        </div>

        <form
          v-else
          class="standing-form"
          novalidate
          @submit.prevent="saveTop"
        >
          <div class="section-heading">
            <div>
              <span class="section-kicker">TOP DEL TORNEO</span>
              <h2>
                {{ tournamentName || 'Posiciones del torneo' }}
              </h2>
              <p>
                Agrega cada jugador y completa sus seis Pokémon.
              </p>
            </div>

            <span class="section-badge">
              {{ completedPlayers }}/{{ players.length }} completos
            </span>
          </div>

          <p
            v-if="validationError"
            class="form-message error-message"
            role="alert"
            aria-live="assertive"
          >
            {{ validationError }}
          </p>

          <div class="players-list">
            <article
              v-for="(player, playerIndex) in players"
              :key="player.clientId"
              class="player-card"
              :class="{ 'player-card-complete': isPlayerComplete(player) }"
            >
              <header class="player-header">
                <div class="player-heading">
                  <span class="position-marker">
                    {{ playerIndex + 1 }}
                  </span>

                  <div>
                    <span class="player-kicker">
                      {{ $t('tournamentsSeccion.position') }}
                      {{ playerIndex + 1 }}
                    </span>

                    <h3>
                      {{
                        getPlayerFullName(player) ||
                        `Jugador ${playerIndex + 1}`
                      }}
                    </h3>
                  </div>
                </div>

                <div class="player-header-actions">
                  <span
                    class="completion-badge"
                    :class="{
                      complete: isPlayerComplete(player)
                    }"
                  >
                    {{ getPokemonProgress(player) }}/6 Pokémon
                  </span>

                  <button
                    v-if="players.length > 1"
                    type="button"
                    class="button-remove"
                    :aria-label="`Eliminar posición ${playerIndex + 1}`"
                    title="Eliminar posición"
                    @click="removePlayer(playerIndex)"
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </div>
              </header>

              <div
                v-if="!hasStandings"
                class="player-fields"
              >
                <div class="field-group">
                  <label :for="`player-name-${player.clientId}`">
                    Nombre
                  </label>

                  <input
                    :id="`player-name-${player.clientId}`"
                    v-model.trim="player.name"
                    class="form-control"
                    type="text"
                    autocomplete="given-name"
                    maxlength="80"
                    placeholder="Nombre"
                    @input="clearValidation"
                  >
                </div>

                <div class="field-group">
                  <label :for="`player-lastname-${player.clientId}`">
                    Apellido
                  </label>

                  <input
                    :id="`player-lastname-${player.clientId}`"
                    v-model.trim="player.lastName"
                    class="form-control"
                    type="text"
                    autocomplete="family-name"
                    maxlength="100"
                    placeholder="Apellido"
                    @input="clearValidation"
                  >
                </div>
              </div>

              <div
                v-else
                class="field-group standing-selector"
              >
                <label :for="`standing-player-${player.clientId}`">
                  {{ $t('tournamentsSeccion.selectPlayer') }}
                </label>

                <select
                  :id="`standing-player-${player.clientId}`"
                  v-model="player.selectedStandingId"
                  class="form-control"
                  @change="onSelectPlayer(player)"
                >
                  <option value="">
                    {{ $t('tournamentsSeccion.selectPlayer') }}
                  </option>

                  <option
                    v-for="option in standingsOptions"
                    :key="option.id"
                    :value="String(option.id)"
                    :disabled="
                      isStandingOptionDisabled(option.id, player)
                    "
                  >
                    {{ option.label }}
                  </option>
                </select>
              </div>

              <fieldset class="pokemon-section">
                <legend>
                  <span>Equipo Pokémon</span>
                  <span class="pokemon-count">
                    {{ getPokemonProgress(player) }}/6
                  </span>
                </legend>

                <div class="pokemon-grid">
                  <div
                    v-for="(_, pokemonIndex) in player.pokemons"
                    :key="`${player.clientId}-${pokemonIndex}`"
                    class="field-group"
                  >
                    <label :for="getPokemonInputId(player, pokemonIndex)">
                      Pokémon {{ pokemonIndex + 1 }}
                    </label>

                    <div class="autocomplete">
                      <input
                        :id="getPokemonInputId(player, pokemonIndex)"
                        v-model.trim="player.pokemons[pokemonIndex]"
                        class="form-control"
                        type="text"
                        autocomplete="off"
                        placeholder="Buscar Pokémon"
                        role="combobox"
                        aria-autocomplete="list"
                        :aria-expanded="
                          isAutocompleteOpen(player, pokemonIndex)
                        "
                        :aria-controls="
                          getSuggestionListId(player, pokemonIndex)
                        "
                        @input="onPokemonInput(player, pokemonIndex)"
                        @focus="openAutocomplete(player, pokemonIndex)"
                        @keydown="
                          onPokemonKeyDown(
                            $event,
                            player,
                            pokemonIndex
                          )
                        "
                      >

                      <ul
                        v-if="
                          getSuggestions(player, pokemonIndex).length &&
                          isAutocompleteOpen(player, pokemonIndex)
                        "
                        :id="getSuggestionListId(player, pokemonIndex)"
                        class="suggestions"
                        role="listbox"
                      >
                        <li
                          v-for="(pokemon, suggestionIndex) in
                            getSuggestions(player, pokemonIndex)"
                          :key="pokemon.id"
                          class="suggestion-item"
                          :class="{
                            active:
                              suggestionIndex === activeSuggestionIndex
                          }"
                          role="option"
                          :aria-selected="
                            suggestionIndex === activeSuggestionIndex
                          "
                          @mousedown.prevent="
                            selectPokemon(
                              player,
                              pokemonIndex,
                              pokemon
                            )
                          "
                        >
                          <img
                            v-if="pokemon.imageUrl"
                            :src="pokemon.imageUrl"
                            class="pokemon-thumb"
                            :alt="`Imagen de ${pokemon.name}`"
                            width="36"
                            height="36"
                            loading="lazy"
                            @error="hideBrokenImage"
                          >
                          <span>{{ pokemon.name }}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </fieldset>
            </article>
          </div>

          <div class="secondary-actions">
            <button
              type="button"
              class="btn-electric-soft"
              :disabled="!canAddPlayer || saving"
              @click="addPlayer"
            >
              <span aria-hidden="true">＋</span>
              {{ $t('tournamentsSeccion.addPlayer') }}
            </button>

            <p
              v-if="hasStandings && !canAddPlayer"
              class="action-hint"
            >
              Todos los jugadores disponibles ya fueron agregados.
            </p>
          </div>

          <footer class="save-actions">
            <div class="save-summary">
              <strong>{{ completedPlayers }} posiciones completas</strong>
              <span>
                Revisa los datos antes de guardar el top.
              </span>
            </div>

            <button
              type="submit"
              class="btn-electric button-save"
              :disabled="saving"
              :aria-busy="saving"
            >
              <span
                v-if="saving"
                class="button-spinner"
                aria-hidden="true"
              />
              {{ saving ? 'Guardando...' : 'Guardar Top' }}
            </button>
          </footer>
        </form>
      </section>
    </div>
  </main>
</template>

<script setup>
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  unref,
  watch
} from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRoute, useRouter } from 'vue-router';

const POKEMON_SLOTS = 6;
const MAX_SUGGESTIONS = 8;

let playerSequence = 0;
let requestController = null;
let themeObserver = null;

const mode = inject('mode', ref('light'));
const apiUrl = inject('apiUrl', '');
const gifLoading = inject('gifLoading', '');

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const saving = ref(false);
const loadingError = ref('');
const validationError = ref('');
const detectedDarkTheme = ref(false);

const pokemonList = ref([]);
const tournamentTop = ref(null);
const playersTop = ref([]);
const formatoTorneo = ref('');

const activeSuggestionIndex = ref(-1);
const activeAutocompleteId = ref(null);

const tournamentId = computed(() =>
  String(route.params.id_torneo || '').trim()
);

const gifLoadingValue = computed(() =>
  String(unref(gifLoading) || '').trim()
);

const modeValue = computed(() =>
  String(unref(mode) || '').trim().toLowerCase()
);

const isDark = computed(
  () =>
    modeValue.value === 'dark' ||
    modeValue.value === 'oscuro' ||
    detectedDarkTheme.value
);

const createPlayerId = () => {
  playerSequence += 1;
  return `player-${Date.now()}-${playerSequence}`;
};

const createSuggestionsRow = () =>
  Array.from({ length: POKEMON_SLOTS }, () => []);

const createPlayer = () => ({
  clientId: createPlayerId(),
  selectedStandingId: '',
  name: '',
  lastName: '',
  pokemons: Array.from({ length: POKEMON_SLOTS }, () => ''),
  suggestions: createSuggestionsRow()
});

const players = ref([createPlayer()]);

const tournamentName = computed(() =>
  String(
    tournamentTop.value?.nombre ||
    tournamentTop.value?.name ||
    ''
  ).trim()
);

const formatName = computed(() =>
  String(formatoTorneo.value || '').trim()
);

const hasStandings = computed(() => playersTop.value.length > 0);

const standingsOptions = computed(() =>
  playersTop.value
    .map((standing) => {
      const label = String(
        standing?.playerName ||
        standing?.player_name ||
        standing?.name ||
        ''
      ).trim();

      const [name = '', ...lastNameParts] = label.split(/\s+/);

      return {
        id:
          standing?.id ??
          standing?.standing_id ??
          standing?.player_id,
        name,
        lastName: lastNameParts.join(' '),
        label
      };
    })
    .filter(
      (option) =>
        option.id != null &&
        option.label
    )
);

const selectedStandingIds = computed(() =>
  new Set(
    players.value
      .map((player) =>
        String(player.selectedStandingId || '')
      )
      .filter(Boolean)
  )
);

const canAddPlayer = computed(() => {
  if (!hasStandings.value) {
    return true;
  }

  return players.value.length < standingsOptions.value.length;
});

const completedPlayers = computed(() =>
  players.value.filter(isPlayerComplete).length
);

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[♀]/g, ' female ')
    .replace(/[♂]/g, ' male ')
    .trim()
    .toLocaleLowerCase();

const buildApiUrl = (path) => {
  const baseUrl = String(unref(apiUrl) || '').replace(/\/+$/, '');
  const cleanPath = String(path || '').replace(/^\/+/, '');

  return baseUrl ? `${baseUrl}/${cleanPath}` : `/${cleanPath}`;
};

const normalizePokemonList = (data) => {
  const source = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];

  return source
    .filter(
      (pokemon) =>
        pokemon &&
        pokemon.id != null &&
        typeof pokemon.name === 'string'
    )
    .map((pokemon) => ({
      ...pokemon,
      name: pokemon.name.trim(),
      searchName: normalizeText(pokemon.name)
    }))
    .filter((pokemon) => pokemon.name);
};

const normalizeStandings = (data) =>
  Array.isArray(data) ? data.filter(Boolean) : [];

const getPokemonProgress = (player) =>
  player.pokemons.filter((pokemon) =>
    String(pokemon || '').trim()
  ).length;

function isPlayerComplete(player) {
  return Boolean(
    String(player.name || '').trim() &&
    String(player.lastName || '').trim() &&
    getPokemonProgress(player) === POKEMON_SLOTS
  );
}

const loadPokemons = async (signal) => {
  const response = await axios.get(
    buildApiUrl('pokemon-seeder'),
    { signal }
  );

  const normalizedList = normalizePokemonList(response?.data);

  if (!normalizedList.length) {
    throw new Error('EMPTY_POKEMON_LIST');
  }

  pokemonList.value = normalizedList;
};

const loadTournamentData = async (signal) => {
  if (!tournamentId.value) {
    throw new Error('INVALID_TOURNAMENT_ID');
  }

  const response = await axios.get(
    buildApiUrl(
      `tournaments/with-standing/${encodeURIComponent(
        tournamentId.value
      )}`
    ),
    { signal }
  );

  const responseData = response?.data?.data || response?.data;

  if (!responseData || typeof responseData !== 'object') {
    throw new Error('INVALID_TOURNAMENT_RESPONSE');
  }

  tournamentTop.value = responseData;
  playersTop.value = normalizeStandings(responseData.standings);
  formatoTorneo.value =
    responseData.formato_torneo ||
    responseData.formatoTorneo ||
    responseData.format ||
    '';
};

const resetForm = () => {
  players.value = [createPlayer()];
  validationError.value = '';
  closeSuggestions();
};

const initializeView = async () => {
  requestController?.abort();
  requestController = new AbortController();

  loading.value = true;
  loadingError.value = '';
  resetForm();

  const currentController = requestController;

  try {
    await Promise.all([
      loadPokemons(currentController.signal),
      loadTournamentData(currentController.signal)
    ]);
  } catch (error) {
    if (
      error?.name === 'CanceledError' ||
      error?.name === 'AbortError' ||
      axios.isCancel?.(error)
    ) {
      return;
    }

    console.error(
      'Error al cargar la información del torneo:',
      error
    );

    loadingError.value =
      error?.response?.data?.message ||
      'No se pudo cargar la información necesaria.';
  } finally {
    if (requestController === currentController) {
      loading.value = false;
    }
  }
};

const clearValidation = () => {
  validationError.value = '';
};

const addPlayer = () => {
  if (!canAddPlayer.value || saving.value) {
    return;
  }

  players.value.push(createPlayer());
  clearValidation();
  closeSuggestions();
};

const removePlayer = (playerIndex) => {
  if (players.value.length <= 1 || saving.value) {
    return;
  }

  players.value.splice(playerIndex, 1);
  clearValidation();
  closeSuggestions();
};

const getPlayerFullName = (player) =>
  [player.name, player.lastName]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' ');

const onSelectPlayer = (player) => {
  const selected = standingsOptions.value.find(
    (option) =>
      String(option.id) ===
      String(player.selectedStandingId)
  );

  if (!selected) {
    player.name = '';
    player.lastName = '';
    clearValidation();
    return;
  }

  player.name = selected.name;
  player.lastName = selected.lastName;
  clearValidation();
};

const isStandingOptionDisabled = (optionId, currentPlayer) => {
  const normalizedOptionId = String(optionId);

  return (
    normalizedOptionId !==
      String(currentPlayer.selectedStandingId || '') &&
    selectedStandingIds.value.has(normalizedOptionId)
  );
};

const getPokemonInputId = (player, pokemonIndex) =>
  `pokemon-${player.clientId}-${pokemonIndex}`;

const getSuggestionListId = (player, pokemonIndex) =>
  `pokemon-suggestions-${player.clientId}-${pokemonIndex}`;

const getAutocompleteId = (player, pokemonIndex) =>
  `${player.clientId}-${pokemonIndex}`;

const isAutocompleteOpen = (player, pokemonIndex) =>
  activeAutocompleteId.value ===
  getAutocompleteId(player, pokemonIndex);

const getSuggestions = (player, pokemonIndex) =>
  player.suggestions?.[pokemonIndex] || [];

const openAutocomplete = (player, pokemonIndex) => {
  activeAutocompleteId.value =
    getAutocompleteId(player, pokemonIndex);
  activeSuggestionIndex.value = -1;
  updatePokemonSuggestions(player, pokemonIndex);
};

const onPokemonInput = (player, pokemonIndex) => {
  clearValidation();
  activeAutocompleteId.value =
    getAutocompleteId(player, pokemonIndex);
  activeSuggestionIndex.value = -1;
  updatePokemonSuggestions(player, pokemonIndex);
};

const updatePokemonSuggestions = (player, pokemonIndex) => {
  const query = normalizeText(player.pokemons[pokemonIndex]);

  if (query.length < 2) {
    player.suggestions[pokemonIndex] = [];
    return;
  }

  player.suggestions[pokemonIndex] = pokemonList.value
    .filter((pokemon) =>
      pokemon.searchName.includes(query)
    )
    .sort((firstPokemon, secondPokemon) => {
      const firstStartsWith =
        firstPokemon.searchName.startsWith(query);
      const secondStartsWith =
        secondPokemon.searchName.startsWith(query);

      if (firstStartsWith !== secondStartsWith) {
        return firstStartsWith ? -1 : 1;
      }

      return firstPokemon.name.localeCompare(secondPokemon.name);
    })
    .slice(0, MAX_SUGGESTIONS);
};

const selectPokemon = (
  player,
  pokemonIndex,
  pokemon
) => {
  player.pokemons[pokemonIndex] = pokemon.name;
  player.suggestions[pokemonIndex] = [];
  clearValidation();
  closeSuggestions();
};

const onPokemonKeyDown = (
  event,
  player,
  pokemonIndex
) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeSuggestions();
    return;
  }

  if (event.key === 'Tab') {
    closeSuggestions();
    return;
  }

  const suggestionList = getSuggestions(player, pokemonIndex);

  if (event.key === 'Enter') {
    event.preventDefault();

    if (
      activeSuggestionIndex.value >= 0 &&
      suggestionList[activeSuggestionIndex.value]
    ) {
      selectPokemon(
        player,
        pokemonIndex,
        suggestionList[activeSuggestionIndex.value]
      );
    }

    return;
  }

  if (!suggestionList.length) {
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    activeSuggestionIndex.value =
      (activeSuggestionIndex.value + 1) %
      suggestionList.length;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    activeSuggestionIndex.value =
      (
        activeSuggestionIndex.value -
        1 +
        suggestionList.length
      ) % suggestionList.length;
  }
};

const closeSuggestions = () => {
  activeSuggestionIndex.value = -1;
  activeAutocompleteId.value = null;
};

const handleClickOutside = (event) => {
  if (
    event.target instanceof Element &&
    !event.target.closest('.autocomplete')
  ) {
    closeSuggestions();
  }
};

const hideBrokenImage = (event) => {
  event.currentTarget.style.display = 'none';
};

const validatePlayers = () => {
  for (
    let playerIndex = 0;
    playerIndex < players.value.length;
    playerIndex += 1
  ) {
    const player = players.value[playerIndex];
    const position = playerIndex + 1;

    if (hasStandings.value && !player.selectedStandingId) {
      return `Selecciona el jugador de la posición ${position}.`;
    }

    if (!String(player.name || '').trim()) {
      return `Falta el nombre del jugador de la posición ${position}.`;
    }

    //if (!String(player.lastName || '').trim()) {
    //  return `Falta el apellido del jugador de la posición ${position}.`;
    //}

    const normalizedPokemons = player.pokemons.map((pokemon) =>
      String(pokemon || '').trim()
    );

    if (normalizedPokemons.some((pokemon) => !pokemon)) {
      return `Completa los 6 Pokémon de la posición ${position}.`;
    }

    if (new Set(normalizedPokemons.map(normalizeText)).size !== POKEMON_SLOTS) {
      return `No repitas Pokémon en la posición ${position}.`;
    }
  }

  return '';
};

const createPayloadPlayers = () =>
  players.value.map((player) => ({
    name: String(player.name || '').trim(),
    lastName: String(player.lastName || '').trim(),
    pokemons: player.pokemons.map((pokemon) =>
      String(pokemon || '').trim()
    )
  }));

const showValidationError = async (message) => {
  validationError.value = message;

  await Swal.fire({
    icon: 'error',
    title: 'Datos incompletos',
    text: message
  });
};

const saveTop = async () => {
  if (saving.value) {
    return;
  }

  clearValidation();

  const validationMessage = validatePlayers();

  if (validationMessage) {
    await showValidationError(validationMessage);
    return;
  }

  saving.value = true;

  try {
    const payload = {
      tournamentId: tournamentId.value,
      formatoTorneo: formatoTorneo.value,
      players: createPayloadPlayers()
    };

    await axios.post(
      buildApiUrl('tournament-top-players/bulk'),
      payload
    );

    await Swal.fire({
      icon: 'success',
      title: 'Top guardado',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    });

    await router.push(
      `/tournament/goToTops/${tournamentId.value}`
    );
  } catch (error) {
    console.error('Error guardando top:', error);

    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text:
        error?.response?.data?.message ||
        'No se pudo guardar el top'
    });
  } finally {
    saving.value = false;
  }
};

const detectGlobalTheme = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const body = document.body;
  const classNames = [
    root?.className || '',
    body?.className || ''
  ].join(' ');

  const dataTheme =
    root?.dataset?.theme ||
    body?.dataset?.theme ||
    root?.dataset?.bsTheme ||
    body?.dataset?.bsTheme ||
    '';

  detectedDarkTheme.value =
    /(^|\s)(dark|dark-mode|theme-dark|is-dark)(\s|$)/i.test(
      classNames
    ) ||
    String(dataTheme).toLowerCase() === 'dark';
};

watch(
  tournamentId,
  (newId, previousId) => {
    if (!newId) {
      loadingError.value = 'El identificador del torneo no es válido.';
      loading.value = false;
      return;
    }

    if (newId !== previousId) {
      initializeView();
    }
  }
);

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  detectGlobalTheme();

  themeObserver = new MutationObserver(detectGlobalTheme);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme', 'data-bs-theme']
  });

  if (document.body) {
    themeObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-bs-theme']
    });
  }

  initializeView();
});

onBeforeUnmount(() => {
  requestController?.abort();
  themeObserver?.disconnect();
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.tournament-page {
  --electric-blue: #0066ff;
  --electric-blue-strong: #004de6;
  --electric-blue-soft: #e9f2ff;
  --electric-cyan: #00a6ff;
  --page-bg: #f4f8ff;
  --surface: #ffffff;
  --surface-secondary: #f7f9fc;
  --surface-hover: #eef5ff;
  --text-primary: #101828;
  --text-secondary: #667085;
  --border-color: #dce6f3;
  --shadow-soft: 0 14px 38px rgba(0, 65, 170, 0.09);
  --shadow-card: 0 8px 24px rgba(16, 24, 40, 0.08);
  --focus-ring: 0 0 0 4px rgba(0, 102, 255, 0.18);

  min-height: 100%;
  padding: 30px 16px 44px;
  color: var(--text-primary);
  background:
    radial-gradient(
      circle at top right,
      rgba(0, 166, 255, 0.15),
      transparent 32rem
    ),
    linear-gradient(180deg, #f9fbff 0%, var(--page-bg) 100%);
}

.tournament-page.theme-dark {
  --electric-blue: #3b82ff;
  --electric-blue-strong: #1f6fff;
  --electric-blue-soft: rgba(59, 130, 255, 0.15);
  --page-bg: #070d1a;
  --surface: #101827;
  --surface-secondary: #151f31;
  --surface-hover: #172a46;
  --text-primary: #f8fafc;
  --text-secondary: #aab7ca;
  --border-color: #253553;
  --shadow-soft: 0 18px 46px rgba(0, 0, 0, 0.32);
  --shadow-card: 0 10px 28px rgba(0, 0, 0, 0.24);
  --focus-ring: 0 0 0 4px rgba(59, 130, 255, 0.28);

  background:
    radial-gradient(
      circle at top right,
      rgba(0, 102, 255, 0.2),
      transparent 34rem
    ),
    linear-gradient(180deg, #0a1221 0%, var(--page-bg) 100%);
}

.tournament-page,
.tournament-page * {
  box-sizing: border-box;
}

.tournament-shell {
  width: min(100%, 1320px);
  margin: 0 auto;
}

.hero-card,
.content-card {
  border: 1px solid var(--border-color);
  background: var(--surface);
}

.hero-card {
  position: relative;
  display: flex;
  gap: 32px;
  align-items: center;
  justify-content: space-between;
  padding: clamp(24px, 4vw, 44px);
  overflow: hidden;
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
}

.hero-card::after {
  position: absolute;
  right: -70px;
  bottom: -100px;
  width: 260px;
  height: 260px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(0, 166, 255, 0.25) 0%,
    rgba(0, 102, 255, 0.05) 48%,
    transparent 70%
  );
  content: '';
  pointer-events: none;
}

.hero-copy {
  position: relative;
  z-index: 1;
  max-width: 820px;
}

.hero-eyebrow,
.section-kicker {
  display: inline-block;
  color: var(--electric-blue);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.14em;
}

.hero-title {
  margin: 8px 0 12px;
  color: var(--text-primary);
  font-size: clamp(2rem, 4.8vw, 3.6rem);
  font-weight: 850;
  letter-spacing: -0.045em;
  line-height: 1.02;
}

.hero-description {
  max-width: 720px;
  margin: 0;
  color: var(--text-secondary);
  font-size: clamp(0.98rem, 1.7vw, 1.12rem);
  line-height: 1.7;
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 18px;
}

.hero-chip,
.section-badge,
.completion-badge,
.pokemon-count {
  display: inline-flex;
  align-items: center;
  border: 1px solid rgba(0, 102, 255, 0.22);
  border-radius: 999px;
  color: var(--electric-blue);
  background: var(--electric-blue-soft);
  font-weight: 800;
}

.hero-chip {
  min-height: 30px;
  padding: 5px 11px;
  font-size: 0.78rem;
}

.hero-counter {
  position: relative;
  z-index: 1;
  display: grid;
  flex: 0 0 170px;
  min-height: 132px;
  place-items: center;
  align-content: center;
  padding: 20px;
  border: 1px solid rgba(0, 102, 255, 0.22);
  border-radius: 22px;
  color: var(--electric-blue);
  background: linear-gradient(
    145deg,
    var(--electric-blue-soft),
    rgba(0, 166, 255, 0.08)
  );
  text-align: center;
}

.hero-counter strong {
  font-size: 2.55rem;
  line-height: 1;
}

.hero-counter span {
  margin-top: 8px;
  color: var(--text-secondary);
  font-size: 0.84rem;
  font-weight: 700;
}

.content-card {
  min-width: 0;
  margin-top: 22px;
  padding: clamp(20px, 3vw, 32px);
  border-radius: 22px;
  box-shadow: var(--shadow-card);
}

.section-heading {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22px;
}

.section-heading h2 {
  margin: 5px 0 5px;
  color: var(--text-primary);
  font-size: clamp(1.25rem, 2vw, 1.6rem);
  font-weight: 800;
}

.section-heading p {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.55;
}

.section-badge {
  min-height: 30px;
  flex: 0 0 auto;
  padding: 5px 11px;
  font-size: 0.78rem;
  white-space: nowrap;
}

.form-message {
  margin: 0 0 18px;
  padding: 0.85rem 1rem;
  border-radius: 12px;
  font-weight: 700;
  text-align: center;
}

.error-message {
  border: 1px solid rgba(220, 53, 69, 0.42);
  color: #b42318;
  background: rgba(220, 53, 69, 0.08);
}

.theme-dark .error-message {
  color: #ff9b9b;
}

.players-list {
  display: grid;
  gap: 18px;
}

.player-card {
  position: relative;
  min-width: 0;
  padding: clamp(18px, 2.7vw, 28px);
  overflow: visible;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--surface-secondary);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.player-card::before {
  position: absolute;
  top: 18px;
  bottom: 18px;
  left: 0;
  width: 4px;
  border-radius: 0 999px 999px 0;
  background: linear-gradient(
    180deg,
    var(--electric-cyan),
    var(--electric-blue)
  );
  content: '';
  box-shadow: 0 0 16px rgba(0, 102, 255, 0.28);
}

.player-card:hover {
  border-color: rgba(0, 102, 255, 0.32);
  box-shadow: 0 12px 28px rgba(0, 65, 170, 0.09);
}

.player-card-complete {
  border-color: rgba(0, 102, 255, 0.38);
}

.player-header {
  display: flex;
  gap: 18px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
}

.player-heading {
  display: flex;
  min-width: 0;
  gap: 13px;
  align-items: center;
}

.position-marker {
  display: grid;
  flex: 0 0 46px;
  width: 46px;
  height: 46px;
  place-items: center;
  border-radius: 14px;
  color: #ffffff;
  background: linear-gradient(
    135deg,
    var(--electric-blue),
    var(--electric-cyan)
  );
  box-shadow: 0 8px 20px rgba(0, 102, 255, 0.24);
  font-size: 1.12rem;
  font-weight: 900;
}

.player-kicker {
  color: var(--electric-blue);
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.player-heading h3 {
  margin: 3px 0 0;
  color: var(--text-primary);
  font-size: clamp(1.05rem, 2.5vw, 1.3rem);
  overflow-wrap: anywhere;
}

.player-header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: flex-end;
}

.completion-badge {
  min-height: 29px;
  padding: 5px 10px;
  font-size: 0.75rem;
}

.completion-badge.complete {
  border-color: rgba(0, 102, 255, 0.44);
  color: #ffffff;
  background: var(--electric-blue);
}

.player-fields {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.standing-selector {
  max-width: 720px;
  margin-bottom: 20px;
}

.field-group {
  min-width: 0;
}

.field-group label {
  display: block;
  margin-bottom: 7px;
  color: var(--text-primary);
  font-size: 0.86rem;
  font-weight: 700;
}

.form-control {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 46px;
  padding: 0.72rem 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  outline: none;
  color: var(--text-primary);
  background: var(--surface);
  font: inherit;
  line-height: 1.3;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.form-control::placeholder {
  color: var(--text-secondary);
  opacity: 0.72;
}

.form-control:focus {
  border-color: var(--electric-blue);
  box-shadow: var(--focus-ring);
}

select.form-control {
  cursor: pointer;
}

select.form-control option {
  color: var(--text-primary);
  background: var(--surface);
}

.pokemon-section {
  min-width: 0;
  margin: 0;
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--surface);
}

.pokemon-section legend {
  display: flex;
  width: auto;
  gap: 10px;
  align-items: center;
  margin: 0;
  padding: 0 8px;
  color: var(--text-primary);
  font-size: 0.95rem;
  font-weight: 800;
}

.pokemon-count {
  min-height: 25px;
  padding: 3px 8px;
  font-size: 0.72rem;
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.autocomplete {
  position: relative;
}

.suggestions {
  position: absolute;
  z-index: 80;
  top: calc(100% + 6px);
  right: 0;
  left: 0;
  max-height: 280px;
  margin: 0;
  padding: 6px;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  border-radius: 13px;
  background: var(--surface);
  box-shadow: 0 18px 38px rgba(16, 24, 40, 0.18);
  list-style: none;
}

.suggestion-item {
  display: flex;
  min-height: 46px;
  gap: 9px;
  align-items: center;
  padding: 7px 9px;
  border-radius: 9px;
  color: var(--text-primary);
  cursor: pointer;
  overflow-wrap: anywhere;
}

.suggestion-item:hover,
.suggestion-item.active {
  color: var(--electric-blue);
  background: var(--surface-hover);
}

.pokemon-thumb {
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  object-fit: contain;
}

.secondary-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  margin-top: 20px;
}

.action-hint {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.save-actions {
  display: flex;
  gap: 24px;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  padding-top: 22px;
  border-top: 1px solid var(--border-color);
}

.save-summary {
  display: grid;
  gap: 4px;
}

.save-summary strong {
  color: var(--text-primary);
}

.save-summary span {
  color: var(--text-secondary);
  font-size: 0.86rem;
}

.btn-electric,
.btn-electric-soft,
.button-remove {
  display: inline-flex;
  min-height: 42px;
  gap: 8px;
  align-items: center;
  justify-content: center;
  border-radius: 11px;
  font: inherit;
  font-weight: 800;
  line-height: 1.15;
  cursor: pointer;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease,
    filter 160ms ease;
}

.btn-electric {
  padding: 11px 18px;
  border: 1px solid var(--electric-blue);
  color: #ffffff;
  background: linear-gradient(
    135deg,
    var(--electric-blue),
    var(--electric-cyan)
  );
  box-shadow: 0 8px 20px rgba(0, 102, 255, 0.24);
}

.btn-electric-soft {
  padding: 10px 15px;
  border: 1px solid rgba(0, 102, 255, 0.28);
  color: var(--electric-blue);
  background: var(--electric-blue-soft);
}

.button-remove {
  min-width: 38px;
  min-height: 38px;
  padding: 7px 10px;
  border: 1px solid rgba(220, 53, 69, 0.25);
  color: #ffffff;
  background: #c0392b;
}

.btn-electric:hover:not(:disabled),
.btn-electric-soft:hover:not(:disabled),
.button-remove:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-electric:hover:not(:disabled) {
  filter: brightness(1.04);
  box-shadow: 0 11px 24px rgba(0, 102, 255, 0.3);
}

.btn-electric-soft:hover:not(:disabled) {
  border-color: var(--electric-blue);
  color: #ffffff;
  background: var(--electric-blue);
}

.button-remove:hover:not(:disabled) {
  filter: brightness(1.06);
}

.btn-electric:focus-visible,
.btn-electric-soft:focus-visible,
.button-remove:focus-visible,
.form-control:focus-visible {
  outline: 3px solid rgba(0, 102, 255, 0.24);
  outline-offset: 3px;
}

.btn-electric:disabled,
.btn-electric-soft:disabled,
.button-remove:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.button-save {
  min-width: 170px;
}

.button-spinner,
.loading-spinner {
  display: inline-block;
  border: 3px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.button-spinner {
  width: 18px;
  height: 18px;
}

.state-panel {
  display: grid;
  min-height: 390px;
  place-items: center;
  align-content: center;
  gap: 10px;
  padding: 24px;
  color: var(--text-secondary);
  text-align: center;
}

.state-panel h2,
.state-panel p {
  margin: 0;
}

.state-panel h2 {
  color: var(--text-primary);
}

.state-panel .btn-electric {
  margin-top: 8px;
}

.state-icon {
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border-radius: 50%;
  color: var(--electric-blue);
  background: var(--electric-blue-soft);
  font-size: 1.65rem;
  font-weight: 900;
}

.loading-image {
  display: block;
  /*max-width: min(100%, 220px);*/
  height: auto;
  object-fit: contain;
}

.loading-spinner {
  width: 64px;
  height: 64px;
  color: var(--electric-blue);
  filter: drop-shadow(0 0 10px rgba(0, 102, 255, 0.28));
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 899.98px) {
  .hero-card {
    align-items: stretch;
  }

  .hero-counter {
    flex-basis: 145px;
  }

  .pokemon-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 679.98px) {
  .tournament-page {
    padding: 18px 10px 32px;
  }

  .hero-card {
    display: grid;
    gap: 20px;
    border-radius: 20px;
  }

  .hero-counter {
    display: flex;
    min-height: auto;
    gap: 8px;
    align-items: baseline;
    justify-content: center;
  }

  .hero-counter strong {
    font-size: 2rem;
  }

  .section-heading,
  .player-header,
  .save-actions {
    display: grid;
  }

  .section-badge {
    width: fit-content;
  }

  .player-header-actions {
    justify-content: flex-start;
  }

  .player-fields,
  .pokemon-grid {
    grid-template-columns: 1fr;
  }

  .save-actions {
    align-items: stretch;
  }

  .button-save {
    width: 100%;
  }
}

@media (max-width: 439.98px) {
  .content-card {
    padding: 15px;
    border-radius: 16px;
  }

  .player-card {
    padding: 16px 13px;
    border-radius: 15px;
  }

  .player-heading {
    align-items: flex-start;
  }

  .position-marker {
    flex-basis: 40px;
    width: 40px;
    height: 40px;
    border-radius: 12px;
  }

  .pokemon-section {
    padding: 12px;
  }

  .secondary-actions {
    align-items: stretch;
  }

  .secondary-actions .btn-electric-soft {
    width: 100%;
  }

  .action-hint {
    width: 100%;
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .player-card,
  .btn-electric,
  .btn-electric-soft,
  .button-remove {
    transition: none;
  }

  .btn-electric:hover:not(:disabled),
  .btn-electric-soft:hover:not(:disabled),
  .button-remove:hover:not(:disabled) {
    transform: none;
  }

  .button-spinner,
  .loading-spinner {
    animation-duration: 1.4s;
  }
}
</style>
