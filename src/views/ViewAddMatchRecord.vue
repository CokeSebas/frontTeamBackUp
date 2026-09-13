<template>
  <main
    class="match-record-page"
    :class="{ 'theme-dark': isDark }"
  >
    <div class="view-container">
      <section class="form-card">
        <div
          v-if="loading"
          class="state-panel"
          aria-live="polite"
          aria-busy="true"
        >
          <img
            v-if="gifLoading"
            :src="gifLoading"
            class="loading-image"
            alt="Cargando Pokémon"
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
          <h2>{{ $t('responseApisSeccion.oops') }}</h2>
          <p>{{ loadingError }}</p>
          <button
            type="button"
            class="button button-primary"
            @click="initializeView"
          >
            Reintentar
          </button>
        </div>

        <form
          v-else
          novalidate
          @submit.prevent="saveAll"
        >
          <header class="page-header">
            <div class="header-kicker">
              <span class="header-kicker-dot" aria-hidden="true" />
              {{ $t('matchRecordSection.subTittle1') }}
            </div>

            <h1>{{ $t('matchRecordSection.title') }}</h1>

            <p class="page-description">
              {{ $t('matchRecordSection.subTittle2') }}
            </p>

            <div class="header-stats" aria-label="Resumen del registro">
              <span class="stat-chip">
                <strong>{{ form.matches.length }}</strong>
                {{
                  form.matches.length === 1
                    ? 'ronda'
                    : 'rondas'
                }}
              </span>

              <span class="stat-chip">
                <strong>{{ completedMatches }}</strong>
                {{ $t('matchRecordSection.complete') }}
              </span>
            </div>
          </header>

          <section class="tournament-panel">
            <div class="field-group tournament-field">
              <label for="tournament-name">
                {{ $t('matchRecordSection.nameTournament') }}
              </label>
              <input
                id="tournament-name"
                v-model.trim="form.tournamentName"
                class="form-control"
                type="text"
                autocomplete="organization"
                placeholder="Ej: Liga semanal, Regional..."
                maxlength="150"
                @input="validationError = ''"
              >
              <small class="field-help">
                {{ $t('matchRecordSection.nameTournamentTip') }}
              </small>
            </div>
          </section>

          <p
            v-if="validationError"
            class="validation-message"
            role="alert"
            aria-live="assertive"
          >
            {{ validationError }}
          </p>

          <div class="matches-list">
            <article
              v-for="(match, matchIndex) in form.matches"
              :key="match.clientId"
              class="match-card"
            >
              <header class="match-header">
                <div class="match-heading">
                  <span class="round-badge">
                    {{ $t('matchRecordSection.round') }}
                    {{ matchIndex + 1 }}
                  </span>

                  <h2>
                    {{
                      match.opponentName
                        ? `vs ${match.opponentName}`
                        : '...'
                    }}
                  </h2>
                </div>

                <button
                  v-if="form.matches.length > 1"
                  type="button"
                  class="button button-remove"
                  :aria-label="`Eliminar ronda ${matchIndex + 1}`"
                  title="Eliminar ronda"
                  @click="removeMatch(matchIndex)"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </header>

              <div class="match-fields">
                <div class="field-group">
                  <label :for="`opponent-${match.clientId}`">
                    {{ $t('matchRecordSection.oponente') }}
                  </label>
                  <input
                    :id="`opponent-${match.clientId}`"
                    v-model.trim="match.opponentName"
                    class="form-control"
                    type="text"
                    autocomplete="off"
                    placeholder="Oponente"
                    maxlength="120"
                    @input="validationError = ''"
                  >
                </div>

                <div class="field-group">
                  <label :for="`result-${match.clientId}`">
                    {{ $t('matchRecordSection.result') }}
                  </label>
                  <select
                    :id="`result-${match.clientId}`"
                    v-model="match.result"
                    class="form-control"
                    :class="
                      match.result
                        ? `result-${match.result}`
                        : ''
                    "
                    @change="validationError = ''"
                  >
                    <option value="" disabled>
                      {{ $t('matchRecordSection.result') }}
                    </option>
                    <option value="win">
                      {{ $t('matchRecordSection.victory') }}
                    </option>
                    <option value="loss">
                      {{ $t('matchRecordSection.defeat') }}
                    </option>
                    <option value="tie">
                      {{ $t('matchRecordSection.draw') }}
                    </option>
                  </select>
                </div>
              </div>

              <fieldset class="pokemon-section">
                <legend>
                  <span>{{  $t('matchRecordSection.teamPokemon') }}</span>
                  <span class="pokemon-progress">
                    {{ getSelectedPokemonCount(match) }}
                    / {{ POKEMON_SLOTS }}
                  </span>
                </legend>

                <div class="pokemon-grid">
                  <div
                    v-for="(_, pokemonIndex) in match.pokemons"
                    :key="`${match.clientId}-${pokemonIndex}`"
                    class="field-group pokemon-field"
                  >
                    <label
                      :for="getPokemonInputId(match, pokemonIndex)"
                    >
                      Pokémon {{ pokemonIndex + 1 }}
                    </label>

                    <div class="autocomplete">
                      <input
                        :id="getPokemonInputId(match, pokemonIndex)"
                        v-model="match.pokemons[pokemonIndex].name"
                        class="form-control"
                        type="text"
                        autocomplete="off"
                        placeholder="Pokémon"
                        role="combobox"
                        aria-autocomplete="list"
                        :aria-expanded="
                          isAutocompleteOpen(match, pokemonIndex)
                        "
                        :aria-controls="
                          getSuggestionListId(match, pokemonIndex)
                        "
                        @input="
                          onPokemonInput(matchIndex, pokemonIndex)
                        "
                        @focus="
                          openAutocomplete(matchIndex, pokemonIndex)
                        "
                        @keydown="
                          onPokemonKeyDown(
                            $event,
                            matchIndex,
                            pokemonIndex
                          )
                        "
                      >

                      <ul
                        v-if="
                          getSuggestions(matchIndex, pokemonIndex).length &&
                          isAutocompleteOpen(match, pokemonIndex)
                        "
                        :id="getSuggestionListId(match, pokemonIndex)"
                        class="suggestions"
                        role="listbox"
                      >
                        <li
                          v-for="(pokemon, suggestionIndex) in
                            getSuggestions(matchIndex, pokemonIndex)"
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
                              matchIndex,
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
                            width="32"
                            height="32"
                            loading="lazy"
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
              class="button button-primary"
              @click="addMatch"
            >
              <span class="button-icon" aria-hidden="true">+</span>
              {{ $t('matchRecordSection.addOpponent') }}
            </button>
          </div>

          <footer class="save-actions">
            <button
              type="submit"
              class="button button-save"
              :disabled="saving"
              :aria-busy="saving"
            >
              <span
                v-if="saving"
                class="button-spinner"
                aria-hidden="true"
              />
              {{
                saving
                  ? 'Guardando...'
                  : t('matchRecordSection.saveRecord')
              }}
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
  unref
} from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import { jwtDecode } from 'jwt-decode';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/authStore';

const POKEMON_SLOTS = 6;
const MAX_SUGGESTIONS = 8;
const VALID_RESULTS = new Set(['win', 'loss', 'tie']);

let clientIdSequence = 0;

const mode = inject('mode', ref('light'));
const apiUrl = inject('apiUrl', '');
const gifLoading = inject('gifLoading', '');

const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const loading = ref(true);
const saving = ref(false);
const loadingError = ref('');
const validationError = ref('');

const pokemonList = ref([]);
const activeSuggestionIndex = ref(-1);
const activeAutocompleteId = ref(null);

const isDark = computed(() => unref(mode) === 'dark');

const createClientId = () => {
  clientIdSequence += 1;
  return `match-${Date.now()}-${clientIdSequence}`;
};

const createEmptyPokemon = () => ({
  name: '',
  id: null
});

const createSuggestionsRow = () =>
  Array.from({ length: POKEMON_SLOTS }, () => []);

const createMatch = () => ({
  clientId: createClientId(),
  opponentName: '',
  result: '',
  pokemons: Array.from(
    { length: POKEMON_SLOTS },
    createEmptyPokemon
  )
});

const form = ref({
  tournamentName: '',
  matches: [createMatch()]
});

const suggestions = ref([createSuggestionsRow()]);

const getSelectedPokemonCount = (match) =>
  match.pokemons.filter(
    (pokemon) =>
      pokemon.id != null &&
      pokemon.name.trim()
  ).length;

const completedMatches = computed(() =>
  form.value.matches.filter(
    (match) =>
      match.opponentName.trim() &&
      VALID_RESULTS.has(match.result) &&
      getSelectedPokemonCount(match) === POKEMON_SLOTS
  ).length
);

const buildApiUrl = (path) => {
  const baseUrl = String(unref(apiUrl) || '').replace(/\/+$/, '');
  const cleanPath = String(path || '').replace(/^\/+/, '');

  return `${baseUrl}/${cleanPath}`;
};

const getPokemonInputId = (match, pokemonIndex) =>
  `pokemon-${match.clientId}-${pokemonIndex}`;

const getSuggestionListId = (match, pokemonIndex) =>
  `pokemon-suggestions-${match.clientId}-${pokemonIndex}`;

const getAutocompleteId = (match, pokemonIndex) =>
  `${match.clientId}-${pokemonIndex}`;

const isAutocompleteOpen = (match, pokemonIndex) =>
  activeAutocompleteId.value ===
  getAutocompleteId(match, pokemonIndex);

const getSuggestions = (matchIndex, pokemonIndex) =>
  suggestions.value[matchIndex]?.[pokemonIndex] || [];

const ensureSuggestionSlot = (matchIndex, pokemonIndex) => {
  if (!suggestions.value[matchIndex]) {
    suggestions.value[matchIndex] = createSuggestionsRow();
  }

  if (!Array.isArray(suggestions.value[matchIndex][pokemonIndex])) {
    suggestions.value[matchIndex][pokemonIndex] = [];
  }
};

const normalizePokemonSlot = (pokemon) => ({
  name: String(pokemon?.name || ''),
  id: pokemon?.id ?? null
});

const normalizeMatch = (match) => {
  const sourcePokemons = Array.isArray(match?.pokemons)
    ? match.pokemons
    : [];

  const normalizedPokemons = Array.from(
    { length: POKEMON_SLOTS },
    (_, index) => normalizePokemonSlot(sourcePokemons[index])
  );

  return {
    clientId: createClientId(),
    opponentName: String(match?.opponentName || ''),
    result: VALID_RESULTS.has(match?.result)
      ? match.result
      : '',
    pokemons: normalizedPokemons
  };
};

const restorePendingForm = () => {
  try {
    const savedForm = localStorage.getItem('pendingMatchForm');

    if (!savedForm) {
      return;
    }

    const parsed = JSON.parse(savedForm);
    const matches = Array.isArray(parsed?.matches)
      ? parsed.matches.map(normalizeMatch)
      : [];

    form.value = {
      tournamentName: String(parsed?.tournamentName || ''),
      matches: matches.length ? matches : [createMatch()]
    };

    suggestions.value = form.value.matches.map(
      createSuggestionsRow
    );
  } catch (error) {
    console.error('Error restaurando el formulario:', error);

    try {
      localStorage.removeItem('pendingMatchForm');
    } catch (storageError) {
      console.error(
        'No se pudo limpiar el formulario guardado:',
        storageError
      );
    }
  }
};

const normalizeSearchText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[♀]/g, ' f')
    .replace(/[♂]/g, ' m')
    .toLocaleLowerCase()
    .trim();

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
      searchName: normalizeSearchText(pokemon.name)
    }))
    .filter((pokemon) => pokemon.name);
};

const loadPokemons = async () => {
  const response = await axios.get(
    buildApiUrl('pokemon-seeder')
  );

  const normalizedList = normalizePokemonList(response?.data);

  if (!normalizedList.length) {
    throw new Error('EMPTY_POKEMON_LIST');
  }

  pokemonList.value = normalizedList;
};

const initializeView = async () => {
  loading.value = true;
  loadingError.value = '';

  try {
    await loadPokemons();
    restorePendingForm();
  } catch (error) {
    console.error('Error al cargar los Pokémon:', error);
    loadingError.value =
      t('responseApisSeccion.loadingDataError');
  } finally {
    loading.value = false;
  }
};

const addMatch = () => {
  form.value.matches.push(createMatch());
  suggestions.value.push(createSuggestionsRow());
  validationError.value = '';
  closeSuggestions();
};

const removeMatch = (matchIndex) => {
  if (form.value.matches.length <= 1) {
    return;
  }

  form.value.matches.splice(matchIndex, 1);
  suggestions.value.splice(matchIndex, 1);
  validationError.value = '';
  closeSuggestions();
};

const openAutocomplete = (matchIndex, pokemonIndex) => {
  const match = form.value.matches[matchIndex];

  if (!match) {
    return;
  }

  activeAutocompleteId.value =
    getAutocompleteId(match, pokemonIndex);
  activeSuggestionIndex.value = -1;

  onPokemonInput(matchIndex, pokemonIndex, false);
};

const onPokemonInput = (
  matchIndex,
  pokemonIndex,
  clearSelectedId = true
) => {
  const pokemonSlot =
    form.value.matches[matchIndex]?.pokemons?.[pokemonIndex];

  if (!pokemonSlot) {
    return;
  }

  ensureSuggestionSlot(matchIndex, pokemonIndex);

  if (clearSelectedId) {
    pokemonSlot.id = null;
  }

  validationError.value = '';
  activeSuggestionIndex.value = -1;

  const query = normalizeSearchText(pokemonSlot.name);

  if (query.length < 2) {
    suggestions.value[matchIndex][pokemonIndex] = [];
    return;
  }

  suggestions.value[matchIndex][pokemonIndex] =
    pokemonList.value
      .filter((pokemon) => pokemon.searchName.includes(query))
      .sort((firstPokemon, secondPokemon) => {
        const firstStartsWith =
          firstPokemon.searchName.startsWith(query);
        const secondStartsWith =
          secondPokemon.searchName.startsWith(query);

        if (firstStartsWith !== secondStartsWith) {
          return firstStartsWith ? -1 : 1;
        }

        return firstPokemon.name.localeCompare(
          secondPokemon.name
        );
      })
      .slice(0, MAX_SUGGESTIONS);
};

const selectPokemon = (
  matchIndex,
  pokemonIndex,
  pokemon
) => {
  const match = form.value.matches[matchIndex];

  if (!match) {
    return;
  }

  match.pokemons[pokemonIndex] = {
    name: pokemon.name,
    id: pokemon.id
  };

  ensureSuggestionSlot(matchIndex, pokemonIndex);
  suggestions.value[matchIndex][pokemonIndex] = [];
  validationError.value = '';
  closeSuggestions();
};

const onPokemonKeyDown = (
  event,
  matchIndex,
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

  const suggestionList =
    getSuggestions(matchIndex, pokemonIndex);

  if (event.key === 'Enter') {
    event.preventDefault();

    if (
      activeSuggestionIndex.value >= 0 &&
      suggestionList[activeSuggestionIndex.value]
    ) {
      selectPokemon(
        matchIndex,
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

const showValidationError = async (message) => {
  validationError.value = message;

  await Swal.fire({
    title: 'Error',
    text: message,
    icon: 'error'
  });
};

const validateForm = () => {
  const tournamentName = form.value.tournamentName.trim();

  if (!tournamentName) {
    return 'Falta torneo';
  }

  for (
    let matchIndex = 0;
    matchIndex < form.value.matches.length;
    matchIndex += 1
  ) {
    const match = form.value.matches[matchIndex];
    const round = matchIndex + 1;

    if (!match.opponentName.trim()) {
      return `Falta el oponente de la ronda ${round}`;
    }

    if (!VALID_RESULTS.has(match.result)) {
      return `Falta el resultado de la ronda ${round}`;
    }

    const hasIncompletePokemon = match.pokemons.some(
      (pokemon) =>
        !pokemon.name.trim() ||
        pokemon.id == null
    );

    if (hasIncompletePokemon) {
      return `Completa los 6 Pokémon de la ronda ${round}`;
    }
  }

  return '';
};

const createSerializableForm = () => ({
  tournamentName: form.value.tournamentName.trim(),
  matches: form.value.matches.map((match) => ({
    opponentName: match.opponentName.trim(),
    result: match.result,
    pokemons: match.pokemons.map((pokemon) => ({
      name: pokemon.name.trim(),
      id: pokemon.id
    }))
  }))
});

const redirectToLogin = async () => {
  try {
    localStorage.setItem(
      'pendingMatchForm',
      JSON.stringify(createSerializableForm())
    );
  } catch (error) {
    console.error(
      'No se pudo guardar temporalmente el formulario:',
      error
    );
  }

  await router.push({
    path: '/login',
    query: {
      redirect: router.currentRoute.value.fullPath
    }
  });
};

const saveAll = async () => {
  if (saving.value) {
    return;
  }

  validationError.value = '';

  const validationMessage = validateForm();

  if (validationMessage) {
    await showValidationError(validationMessage);
    return;
  }

  if (!authStore.isAuthenticated || !authStore.token) {
    await redirectToLogin();
    return;
  }

  saving.value = true;

  try {
    const decodedToken = jwtDecode(authStore.token);
    const userId = decodedToken?.userId;

    if (userId == null) {
      throw new Error('INVALID_USER_TOKEN');
    }

    const serializableForm = createSerializableForm();

    const payload = {
      tournamentName: serializableForm.tournamentName,
      userId,
      matches: serializableForm.matches.map(
        (match, matchIndex) => ({
          opponentName: match.opponentName,
          result: match.result,
          round: matchIndex + 1,
          pokemons: match.pokemons
        })
      )
    };

    await axios.post(
      buildApiUrl('matches/bulk'),
      payload,
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        }
      }
    );

    try {
      localStorage.removeItem('pendingMatchForm');
    } catch (storageError) {
      console.error(
        'No se pudo limpiar el formulario guardado:',
        storageError
      );
    }

    await Swal.fire({
      title: t('matchRecordSection.saveRecordSuccess'),
      text: t('matchRecordSection.saveRecordText'),
      icon: 'success',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false
    });

    await router.push(
      `/vgc/match-record/tournament/${userId}`
    );
  } catch (error) {
    console.error('Error al guardar el registro:', error);

    const message =
      error?.response?.data?.message ||
      'No se pudo guardar';

    await Swal.fire({
      title: 'Error',
      text: message,
      icon: 'error'
    });
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  initializeView();
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.match-record-page {
  --accent: #7357d5;
  --accent-strong: #6446c4;
  --accent-dark: #4d3196;
  --accent-light: #8b72e6;
  --accent-soft: rgba(115, 87, 213, 0.10);
  --accent-border: rgba(115, 87, 213, 0.28);
  --accent-glow: rgba(115, 87, 213, 0.18);
  --page-bg: #faf8ff;
  --page-text: #292333;
  --card-bg: rgba(255, 255, 255, 0.94);
  --card-border: #e3deef;
  --card-shadow: 0 24px 60px rgba(77, 49, 150, 0.10);
  --match-bg: #fdfcff;
  --input-bg: #ffffff;
  --input-text: #292333;
  --input-border: #d6d0e2;
  --muted-text: #746d7f;
  --suggestion-bg: #ffffff;
  --suggestion-hover: rgba(115, 87, 213, 0.08);
  --focus-ring: rgba(115, 87, 213, 0.20);
  --danger-bg: #9f3042;

  min-height: 100%;
  background:
    radial-gradient(
      circle at 10% 0%,
      rgba(115, 87, 213, 0.10),
      transparent 28rem
    ),
    radial-gradient(
      circle at 92% 18%,
      rgba(139, 114, 230, 0.08),
      transparent 24rem
    ),
    linear-gradient(180deg, #faf8ff 0%, #fff 56%, #fbf9ff 100%);
  color: var(--page-text);
}

.match-record-page.theme-dark {
  --accent: #9278e7;
  --accent-strong: #7b5fd7;
  --accent-dark: #5d42b0;
  --accent-light: #c4b5ff;
  --accent-soft: rgba(146, 120, 231, 0.12);
  --accent-border: rgba(146, 120, 231, 0.28);
  --accent-glow: rgba(146, 120, 231, 0.20);
  --page-bg: #14111c;
  --page-text: #f7f3ff;
  --card-bg: rgba(35, 30, 46, 0.96);
  --card-border: #484057;
  --card-shadow: 0 24px 60px rgba(0, 0, 0, 0.42);
  --match-bg: #211d2a;
  --input-bg: #2c2637;
  --input-text: #f7f3ff;
  --input-border: #625970;
  --muted-text: #cbc3d5;
  --suggestion-bg: #2c2637;
  --suggestion-hover: rgba(146, 120, 231, 0.14);
  --focus-ring: rgba(146, 120, 231, 0.24);
  --danger-bg: #ad3b4d;

  background:
    radial-gradient(
      circle at 8% 0%,
      rgba(123, 95, 215, 0.14),
      transparent 30rem
    ),
    radial-gradient(
      circle at 94% 20%,
      rgba(146, 120, 231, 0.09),
      transparent 26rem
    ),
    linear-gradient(180deg, #14111c 0%, #191521 55%, #100d16 100%);
}

.match-record-page,
.match-record-page * {
  box-sizing: border-box;
}

.view-container {
  width: min(100%, 1180px);
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 2.25rem);
}

.form-card {
  overflow: hidden;
  border: 1px solid var(--card-border);
  border-radius: 24px;
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(12px);
}

.form-card > form {
  padding: 0 clamp(1rem, 3vw, 2rem) clamp(1.25rem, 3vw, 2rem);
}

.page-header {
  position: relative;
  margin: 0 clamp(-2rem, -3vw, -1rem) 1.75rem;
  padding: clamp(1.0rem, 3vw, 1.65rem);
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      var(--accent-dark) 0%,
      var(--accent) 58%,
      var(--accent-light) 100%
    );
  color: #ffffff;
  text-align: center;
  isolation: isolate;
}

.page-header::before,
.page-header::after {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 50%;
  content: '';
  pointer-events: none;
}

.page-header::before {
  top: -6rem;
  right: -3rem;
  width: 15rem;
  height: 15rem;
}

.page-header::after {
  bottom: -8rem;
  left: -4rem;
  width: 18rem;
  height: 18rem;
}

.header-kicker {
  position: relative;
  z-index: 1;
  display: inline-flex;
  gap: 0.45rem;
  align-items: center;
  margin-bottom: 0.7rem;
  padding: 0.4rem 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.header-kicker-dot {
  width: 0.48rem;
  height: 0.48rem;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 12px rgba(255, 255, 255, 0.85);
}

.page-header h1 {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: clamp(1.75rem, 4.5vw, 2.7rem);
  line-height: 1.12;
  text-wrap: balance;
}

.page-description {
  position: relative;
  z-index: 1;
  max-width: 680px;
  margin: 0.75rem auto 0;
  color: rgba(255, 255, 255, 0.88);
  line-height: 1.6;
  text-wrap: balance;
}

.header-stats {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  justify-content: center;
  margin-top: 1.15rem;
}

.stat-chip {
  display: inline-flex;
  gap: 0.35rem;
  align-items: center;
  padding: 0.45rem 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 0.88rem;
}

.stat-chip strong {
  font-size: 1rem;
}

.tournament-panel {
  max-width: 760px;
  margin: 0 auto 1.5rem;
  padding: clamp(1rem, 2.5vw, 1.35rem);
  border: 1px solid var(--accent-border);
  border-radius: 16px;
  background:
    linear-gradient(135deg, var(--accent-soft), transparent 70%);
}

.field-group {
  min-width: 0;
}

.field-group label {
  display: block;
  margin-bottom: 0.45rem;
  font-weight: 800;
  line-height: 1.3;
}

.field-help {
  display: block;
  margin-top: 0.45rem;
  color: var(--muted-text);
  line-height: 1.45;
}

.form-control {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 46px;
  padding: 0.72rem 0.88rem;
  border: 1px solid var(--input-border);
  border-radius: 11px;
  outline: none;
  background: var(--input-bg);
  color: var(--input-text);
  font: inherit;
  line-height: 1.3;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    transform 160ms ease;
}

.form-control::placeholder {
  color: var(--muted-text);
  opacity: 0.78;
}

.form-control:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 0.23rem var(--focus-ring);
}

select.form-control {
  cursor: pointer;
}

select.form-control.result-win {
  border-color: #22a06b;
  box-shadow: inset 4px 0 0 #22a06b;
}

select.form-control.result-loss {
  border-color: var(--accent);
  box-shadow: inset 4px 0 0 var(--accent);
}

select.form-control.result-tie {
  border-color: #d69514;
  box-shadow: inset 4px 0 0 #d69514;
}

.validation-message {
  max-width: 760px;
  margin: -0.5rem auto 1.25rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--accent-border);
  border-radius: 12px;
  background: var(--accent-soft);
  color: var(--accent-dark);
  font-weight: 800;
  text-align: center;
}

.theme-dark .validation-message {
  color: var(--accent-light);
}

.matches-list {
  display: grid;
  gap: 1.35rem;
}

.match-card {
  position: relative;
  min-width: 0;
  padding: clamp(1rem, 2.6vw, 1.5rem);
  overflow: visible;
  border: 1px solid var(--card-border);
  border-radius: 18px;
  background: var(--match-bg);
  box-shadow: 0 12px 28px rgba(77, 49, 150, 0.06);
}

.match-card::before {
  position: absolute;
  top: 1rem;
  bottom: 1rem;
  left: 0;
  width: 4px;
  border-radius: 0 999px 999px 0;
  background: linear-gradient(
    180deg,
    var(--accent),
    var(--accent-strong)
  );
  content: '';
  box-shadow: 0 0 16px var(--accent-glow);
}

.match-header {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.15rem;
  padding-left: 0.25rem;
}

.match-heading {
  min-width: 0;
}

.round-badge {
  display: inline-flex;
  align-items: center;
  margin-bottom: 0.45rem;
  padding: 0.32rem 0.6rem;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.theme-dark .round-badge {
  color: var(--accent-light);
}

.match-heading h2 {
  margin: 0;
  overflow: hidden;
  font-size: clamp(1.08rem, 3vw, 1.35rem);
  line-height: 1.3;
  text-overflow: ellipsis;
  overflow-wrap: anywhere;
}

.match-fields {
  display: grid;
  grid-template-columns:
    minmax(0, 1.4fr)
    minmax(190px, 0.6fr);
  gap: 1rem;
  margin-bottom: 1.35rem;
}

.pokemon-section {
  min-width: 0;
  margin: 0;
  padding: 1rem;
  border: 1px solid var(--card-border);
  border-radius: 14px;
  background: var(--card-bg);
  background: color-mix(in srgb, var(--card-bg) 70%, transparent);
}

.pokemon-section legend {
  display: flex;
  width: auto;
  gap: 0.75rem;
  align-items: center;
  margin: 0;
  padding: 0 0.45rem;
  color: var(--page-text);
  font-size: 1rem;
  font-weight: 900;
}

.pokemon-progress {
  padding: 0.22rem 0.5rem;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 0.75rem;
}

.theme-dark .pokemon-progress {
  color: var(--accent-light);
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.autocomplete {
  position: relative;
}

.suggestions {
  position: absolute;
  z-index: 80;
  top: calc(100% + 0.35rem);
  right: 0;
  left: 0;
  max-height: 280px;
  margin: 0;
  padding: 0.35rem;
  overflow-y: auto;
  border: 1px solid var(--input-border);
  border-radius: 11px;
  background: var(--suggestion-bg);
  box-shadow: 0 18px 36px rgba(48, 35, 70, 0.18);
  list-style: none;
}

.suggestion-item {
  display: flex;
  min-height: 44px;
  gap: 0.65rem;
  align-items: center;
  padding: 0.55rem 0.65rem;
  border-radius: 8px;
  cursor: pointer;
  overflow-wrap: anywhere;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: var(--suggestion-hover);
  color: var(--accent-strong);
}

.theme-dark .suggestion-item:hover,
.theme-dark .suggestion-item.active {
  color: var(--accent-light);
}

.pokemon-thumb {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  object-fit: contain;
}

.secondary-actions,
.save-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.35rem;
}

.secondary-actions {
  justify-content: flex-start;
}

.save-actions {
  justify-content: flex-end;
  padding-top: 1.35rem;
  border-top: 1px solid var(--card-border);
}

.button {
  display: inline-flex;
  min-height: 44px;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  padding: 0.68rem 1.05rem;
  border: 0;
  border-radius: 11px;
  color: #ffffff;
  font: inherit;
  font-weight: 800;
  line-height: 1.2;
  cursor: pointer;
  transition:
    transform 140ms ease,
    filter 140ms ease,
    box-shadow 140ms ease;
}

.button:hover:not(:disabled) {
  filter: brightness(1.04);
  transform: translateY(-2px);
}

.button:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}

.button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.button-primary,
.button-save {
  background:
    linear-gradient(
      135deg,
      var(--accent-strong),
      var(--accent),
      var(--accent-light)
    );
  box-shadow: 0 10px 22px var(--accent-glow);
}

.button-save {
  min-width: 180px;
}

.button-remove {
  min-width: 40px;
  min-height: 40px;
  padding: 0.45rem 0.72rem;
  background: var(--danger-bg);
  box-shadow: 0 8px 18px rgba(159, 48, 66, 0.18);
}

.button-icon {
  display: inline-grid;
  width: 1.4rem;
  height: 1.4rem;
  place-items: center;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.18);
  font-size: 1.05rem;
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
  min-height: 420px;
  place-items: center;
  align-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.state-panel h2,
.state-panel p {
  margin: 0;
}

.loading-image {
  display: block;
  /*max-width: min(100%, 240px);*/
  height: auto;
  object-fit: contain;
}

.loading-spinner {
  width: 66px;
  height: 66px;
  color: var(--accent);
  filter: drop-shadow(0 0 10px var(--accent-glow));
}

.error-state {
  color: var(--page-text);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767.98px) {
  .match-fields {
    grid-template-columns: 1fr;
  }

  .pokemon-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 479.98px) {
  .view-container {
    padding: 0.65rem;
  }

  .form-card {
    border-radius: 16px;
  }

  .form-card > form {
    padding-right: 0.8rem;
    padding-left: 0.8rem;
  }

  .page-header {
    margin-right: -0.8rem;
    margin-left: -0.8rem;
  }

  .match-card {
    border-radius: 14px;
  }

  .pokemon-section {
    padding: 0.8rem;
  }

  .pokemon-grid {
    grid-template-columns: 1fr;
  }

  .secondary-actions,
  .save-actions {
    align-items: stretch;
  }

  .secondary-actions .button,
  .save-actions .button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;
  }

  .button:hover:not(:disabled) {
    transform: none;
  }

  .button-spinner,
  .loading-spinner {
    animation-duration: 1.4s;
  }
}
</style>
