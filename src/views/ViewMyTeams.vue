<!-- Componente optimizado con estilo verde eléctrico de ViewTeamsPublic -->

<template>
  <main
    class="teams-page"
    :class="{ 'teams-page--dark': isDark }"
  >
    <div class="container py-4 py-lg-5">
      <header
        v-if="!sessionError"
        class="teams-header text-center"
      >

        <h1 class="teams-header__title">
          {{ $t('teamsSeccion.myTitle') }}
        </h1>

        <p
          v-if="!isLoading && !loadError"
          class="teams-header__summary"
          aria-live="polite"
        >
          {{ filteredTeams.length }}
          {{
            filteredTeams.length === 1
              ? 'equipo encontrado'
              : 'equipos encontrados'
          }}
        </p>

        <router-link
          class="action-button action-button--primary teams-header__action"
          to="/vgc/create-team"
        >
          {{ $t('buttons.createTeam') }}
        </router-link>
      </header>

      <section
        v-if="isLoading"
        class="state-card"
        aria-label="Cargando equipos"
        aria-live="polite"
        aria-busy="true"
      >
        <img
          v-if="loadingImage"
          :src="loadingImage"
          class="state-card__loader-image"
          alt="Cargando equipos"
        >
        <span
          v-else
          class="loading-spinner"
          aria-hidden="true"
        ></span>
      </section>

      <section
        v-else-if="sessionError"
        class="state-card state-card--error"
        role="alert"
      >
        <h1 class="state-card__title">
          Sesión no válida
        </h1>

        <p class="state-card__text">
          {{ sessionError }}
        </p>

        <button
          type="button"
          class="action-button action-button--primary"
          @click="goToLogin"
        >
          Iniciar sesión
        </button>
      </section>

      <section
        v-else-if="loadError"
        class="state-card state-card--error"
        role="alert"
      >
        <h1 class="state-card__title">
          {{ $t('responseApisSeccion.oops') }}
        </h1>

        <p class="state-card__text">
          {{ loadError }}
        </p>

        <button
          type="button"
          class="action-button action-button--primary"
          @click="loadTeams"
        >
          Reintentar
        </button>
      </section>

      <template v-else>
        <section
          class="filters-card"
          aria-label="Filtros de equipos"
        >
          <div class="filters-grid">
            <div class="filter-field">
              <label
                class="visually-hidden"
                for="team-search"
              >
                Buscar equipo
              </label>

              <div class="search-control">
                <input
                  id="team-search"
                  v-model.trim="searchName"
                  class="form-control"
                  type="search"
                  autocomplete="off"
                  :placeholder="$t('teamsSeccion.searchTeam')"
                >

                <button
                  v-if="searchName"
                  type="button"
                  class="search-control__clear"
                  aria-label="Limpiar búsqueda"
                  @click="searchName = ''"
                >
                  ×
                </button>
              </div>
            </div>

            <div class="filter-field">
              <label
                class="visually-hidden"
                for="team-subformat"
              >
                {{ $t('teamsSeccion.subFormat') }}
              </label>

              <div class="select-row">
                <select
                  id="team-subformat"
                  v-model="searchSubFormat"
                  class="form-select"
                  :disabled="isLoadingSubFormats"
                >
                  <option value="">
                    {{ $t('teamsSeccion.subFormat') }}
                  </option>

                  <option
                    v-for="subFormat in subFormats"
                    :key="subFormat.id"
                    :value="subFormat.name"
                  >
                    {{ subFormat.name }}
                  </option>
                </select>

                <button
                  v-if="subFormatsError"
                  type="button"
                  class="retry-button"
                  :disabled="isLoadingSubFormats"
                  @click="loadSubFormats"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </div>

          <div class="filters-card__footer">
            <p class="filters-card__summary">
              {{ filteredTeams.length }}
              {{
                filteredTeams.length === 1
                  ? 'equipo encontrado'
                  : 'equipos encontrados'
              }}
            </p>

            <button
              v-if="hasActiveFilters"
              type="button"
              class="clear-filters-button"
              @click="clearFilters"
            >
              Limpiar filtros
            </button>
          </div>

          <p
            v-if="subFormatsError"
            class="catalog-error"
            role="alert"
          >
            {{ subFormatsError }}
          </p>
        </section>

        <section
          v-if="currentItems.length"
          class="teams-grid"
          aria-label="Listado de equipos"
          aria-live="polite"
        >
          <article
            v-for="team in currentItems"
            :key="team.id"
            class="team-card"
          >
            <div class="team-card__content">
              <header class="team-card__heading">
                <h2 class="team-card__title">
                  {{ team.name }}
                </h2>

                <span
                  v-if="team.subFormatName"
                  class="team-card__format"
                >
                  {{ team.subFormatName }}
                </span>
              </header>

              <div
                class="pokemon-list"
                :aria-label="`Pokémon del equipo ${team.name}`"
              >
                <div
                  v-for="pokemon in team.pokemons"
                  :key="pokemon.clientId"
                  class="pokemon-slot"
                  :title="pokemon.name"
                >
                  <img
                    v-if="pokemon.image && !pokemon.imageError"
                    :src="pokemon.image"
                    :alt="pokemon.name"
                    class="pokemon-slot__image"
                    loading="lazy"
                    decoding="async"
                    @error="pokemon.imageError = true"
                  >

                  <span
                    v-else
                    class="pokemon-slot__placeholder"
                    aria-hidden="true"
                  >
                    {{ getPokemonInitial(pokemon.name) }}
                  </span>
                </div>
              </div>

              <footer class="team-card__footer">
                <router-link
                  class="action-button action-button--outline"
                  :to="`/vgc/my-team-detail/${team.id}`"
                  :aria-label="`${$t('buttons.seeTeam')}: ${team.name}`"
                >
                  {{ $t('buttons.seeTeam') }}
                </router-link>
              </footer>
            </div>
          </article>
        </section>

        <section
          v-else
          class="state-card"
          aria-live="polite"
        >
          <h2 class="state-card__title">
            {{ $t('teamsSeccion.notTeamsRegister') }}
          </h2>

          <p class="state-card__text">
            {{
              hasActiveFilters
                ? 'Prueba con otro nombre, Pokémon o subformato.'
                : $t('teamsSeccion.addTeam')
            }}
          </p>

          <button
            v-if="hasActiveFilters"
            type="button"
            class="action-button action-button--outline"
            @click="clearFilters"
          >
            Limpiar filtros
          </button>
        </section>

        <div
          v-if="filteredTeams.length > itemsPerPage"
          class="pagination-wrapper"
        >
          <Paginator
            :key="paginatorKey"
            :items="filteredTeams"
            :items-per-page="itemsPerPage"
            @page-changed="handlePageChanged"
          />
        </div>
      </template>
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
import { jwtDecode } from 'jwt-decode';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import Paginator from '@/components/AppPaginator.vue';
import { createEvent } from '@/services/eventService';

const apiUrl = inject('apiUrl', '');
const gifLoading = inject('gifLoading', '');
const mode = inject('mode', 'light');

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const teams = ref([]);
const subFormats = ref([]);
const currentItems = ref([]);

const isLoading = ref(true);
const isLoadingSubFormats = ref(false);
const loadError = ref('');
const subFormatsError = ref('');
const sessionError = ref('');

const searchName = ref('');
const searchSubFormat = ref('');
const itemsPerPage = 10;

let teamsController = null;
let subFormatsController = null;

const isDark = computed(() => unref(mode) === 'dark');

const loadingImage = computed(() =>
  String(unref(gifLoading) || '').trim()
);

const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();

const hasActiveFilters = computed(() =>
  Boolean(searchName.value.trim() || searchSubFormat.value)
);

const filteredTeams = computed(() => {
  const query = normalizeText(searchName.value);
  const selectedSubFormat = normalizeText(searchSubFormat.value);

  return teams.value.filter((team) => {
    const matchesName =
      !query ||
      normalizeText(team.name).includes(query);

    const matchesPokemon =
      !query ||
      team.pokemons.some((pokemon) =>
        normalizeText(pokemon.name).includes(query)
      );

    const matchesSubFormat =
      !selectedSubFormat ||
      normalizeText(team.subFormatName) === selectedSubFormat;

    return (matchesName || matchesPokemon) && matchesSubFormat;
  });
});

const paginatorKey = computed(() =>
  [
    normalizeText(searchName.value),
    normalizeText(searchSubFormat.value),
    filteredTeams.value.length
  ].join('|')
);

const buildApiUrl = (path) => {
  const baseUrl = String(unref(apiUrl) || '')
    .replace(/\/+$/, '');
  const cleanPath = String(path || '')
    .replace(/^\/+/, '');

  return `${baseUrl}/${cleanPath}`;
};

const getSessionData = () => {
  let token = '';

  try {
    token = localStorage.getItem('token') || '';
  } catch (error) {
    console.error('No fue posible acceder a la sesión:', error);
    return null;
  }

  if (!token) {
    return null;
  }

  try {
    const decodedToken = jwtDecode(token);
    const userId =
      decodedToken?.userId ??
      decodedToken?.id ??
      null;

    const isExpired =
      Number.isFinite(Number(decodedToken?.exp)) &&
      Date.now() >= Number(decodedToken.exp) * 1000;

    if (userId == null || isExpired) {
      return null;
    }

    return {
      token,
      userId
    };
  } catch (error) {
    console.error('Token inválido:', error);
    return null;
  }
};

const normalizeArrayResponse = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.salida?.[0]?.data)) {
    return data.salida[0].data;
  }

  return [];
};

const getPokemonNameFromUrl = (url, index) => {
  try {
    const cleanUrl = String(url || '').split(/[?#]/)[0];
    const filename = cleanUrl.split('/').pop() || '';

    return (
      decodeURIComponent(filename)
        .replace(/\.(png|jpe?g|webp|gif)$/i, '')
        .replace(/[-_]+/g, ' ')
        .trim() ||
      `Pokémon ${index + 1}`
    );
  } catch (error) {
    return `Pokémon ${index + 1}`;
  }
};

const normalizeTeams = (data) =>
  normalizeArrayResponse(data)
    .filter(
      (team) =>
        team &&
        typeof team === 'object' &&
        (
          team.id != null ||
          team.teamId != null ||
          team.team_id != null
        )
    )
    .map((team, teamIndex) => {
      const teamId =
        team.id ??
        team.teamId ??
        team.team_id;

      const pokemons = [
        team.poke1,
        team.poke2,
        team.poke3,
        team.poke4,
        team.poke5,
        team.poke6
      ]
        .filter(Boolean)
        .map((image, pokemonIndex) => ({
          clientId: `${teamId ?? teamIndex}-${pokemonIndex}`,
          image: String(image || '').trim(),
          name: getPokemonNameFromUrl(image, pokemonIndex),
          imageError: false
        }));

      return {
        id: teamId,
        name:
          String(
            team.teamName ??
            team.team_name ??
            team.name ??
            `Equipo ${teamIndex + 1}`
          ).trim() || `Equipo ${teamIndex + 1}`,
        subFormatName: String(
          team.subFormatName ??
          team.sub_format_name ??
          team.abrevSubFormat ??
          ''
        ).trim(),
        pokemons
      };
    });

const normalizeSubFormats = (data) => {
  const uniqueSubFormats = new Map();

  normalizeArrayResponse(data)
    .filter(
      (subFormat) =>
        subFormat &&
        typeof subFormat === 'object'
    )
    .forEach((subFormat, index) => {
      const name = String(
        subFormat.subFormatName ??
        subFormat.abrevSubFormat ??
        subFormat.name ??
        ''
      ).trim();

      if (!name) {
        return;
      }

      const key = normalizeText(name);

      if (!uniqueSubFormats.has(key)) {
        uniqueSubFormats.set(key, {
          id: subFormat.id ?? `subformat-${index}`,
          name
        });
      }
    });

  return Array.from(uniqueSubFormats.values())
    .sort((first, second) =>
      first.name.localeCompare(second.name)
    );
};

const isCanceledRequest = (error) =>
  error?.name === 'CanceledError' ||
  error?.code === 'ERR_CANCELED';

const registerListEvent = async () => {
  try {
    let userName = '';

    try {
      userName = localStorage.getItem('userName') || '';
    } catch (error) {
      userName = '';
    }

    await createEvent({
      userAgent: navigator.userAgent,
      date: new Date().toISOString(),
      type: 'list_teams_user',
      description:
        `userName: ${userName} listado de equipos`
    });
  } catch (error) {
    console.warn(
      'No se pudo registrar el evento del listado:',
      error
    );
  }
};

const loadTeams = async () => {
  const session = getSessionData();

  teamsController?.abort();
  teamsController = null;

  if (!session) {
    teams.value = [];
    currentItems.value = [];
    loadError.value = '';
    sessionError.value =
      'Tu sesión no es válida. Inicia sesión nuevamente.';
    isLoading.value = false;
    return;
  }

  const controller = new AbortController();
  teamsController = controller;

  isLoading.value = true;
  loadError.value = '';
  sessionError.value = '';

  try {
    const response = await axios.get(
      buildApiUrl(`teams/teams-user/${session.userId}`),
      {
        headers: {
          Authorization: `Bearer ${session.token}`
        },
        signal: controller.signal
      }
    );

    teams.value = normalizeTeams(response?.data);
    void registerListEvent();
  } catch (error) {
    if (isCanceledRequest(error)) {
      return;
    }

    console.error('Error al cargar equipos:', error);

    teams.value = [];
    loadError.value =
      error?.response?.data?.message ||
      t('responseApisSeccion.loadingDataError') ||
      'No se pudieron cargar los equipos.';
  } finally {
    if (teamsController === controller) {
      isLoading.value = false;
      teamsController = null;
    }
  }
};

const loadSubFormats = async () => {
  subFormatsController?.abort();

  const controller = new AbortController();
  subFormatsController = controller;

  isLoadingSubFormats.value = true;
  subFormatsError.value = '';

  try {
    const response = await axios.get(
      buildApiUrl('subformats'),
      {
        signal: controller.signal
      }
    );

    subFormats.value = normalizeSubFormats(response?.data);
  } catch (error) {
    if (isCanceledRequest(error)) {
      return;
    }

    console.error('Error al cargar subformatos:', error);

    subFormats.value = [];
    subFormatsError.value =
      'No se pudieron cargar los subformatos.';
  } finally {
    if (subFormatsController === controller) {
      isLoadingSubFormats.value = false;
      subFormatsController = null;
    }
  }
};

const handlePageChanged = (paginatedItems) => {
  currentItems.value = Array.isArray(paginatedItems)
    ? paginatedItems
    : [];
};

const getPokemonInitial = (name) =>
  String(name || '?')
    .trim()
    .charAt(0)
    .toLocaleUpperCase() || '?';

const clearFilters = () => {
  searchName.value = '';
  searchSubFormat.value = '';
};

const goToLogin = () => {
  router.push({
    path: '/login',
    query: {
      redirect: route.fullPath
    }
  });
};

watch(
  filteredTeams,
  (newFilteredTeams) => {
    currentItems.value = newFilteredTeams.slice(
      0,
      itemsPerPage
    );
  },
  {
    immediate: true
  }
);

onMounted(() => {
  void Promise.allSettled([
    loadTeams(),
    loadSubFormats()
  ]);
});

onBeforeUnmount(() => {
  teamsController?.abort();
  subFormatsController?.abort();
});
</script>

<style scoped>
.teams-page {
  --page-bg: #f5f7f8;
  --surface: #ffffff;
  --surface-muted: #f3f6f5;
  --text-primary: #1f2a25;
  --text-secondary: #647068;
  --border-color: #dce4df;
  --accent: #198754;
  --accent-strong: #11683e;
  --accent-soft: rgba(25, 135, 84, 0.12);
  --accent-border: rgba(25, 135, 84, 0.36);
  --focus-ring: rgba(25, 135, 84, 0.23);
  --danger-soft: #fff4f4;
  --danger-border: #f2c3c3;
  --danger-text: #b4232f;
  --shadow: 0 16px 40px rgba(25, 50, 37, 0.08);

  min-height: 100dvh;
  background:
    radial-gradient(
      circle at top center,
      rgba(25, 135, 84, 0.09),
      transparent 29rem
    ),
    var(--page-bg);
  color: var(--text-primary);
}

.teams-page--dark {
  --page-bg: #101412;
  --surface: #19201c;
  --surface-muted: #222b26;
  --text-primary: #eef5f1;
  --text-secondary: #aab8b0;
  --border-color: #334139;
  --accent: #37be78;
  --accent-strong: #69db9c;
  --accent-soft: rgba(55, 190, 120, 0.14);
  --accent-border: rgba(105, 219, 156, 0.36);
  --focus-ring: rgba(105, 219, 156, 0.27);
  --danger-soft: #2a1a1a;
  --danger-border: #704141;
  --danger-text: #ff9ca5;
  --shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
}

.teams-page,
.teams-page * {
  box-sizing: border-box;
}

.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.teams-header {
  max-width: 50rem;
  margin: 0 auto 2rem;
}

.teams-header__eyebrow {
  display: inline-flex;
  margin-bottom: 0.75rem;
  padding: 0.38rem 0.72rem;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.76rem;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.teams-header__title {
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(1.85rem, 4vw, 2.7rem);
  font-weight: 850;
  line-height: 1.13;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.teams-header__summary {
  margin: 0.65rem 0 0;
  color: var(--text-secondary);
}

.teams-header__action {
  margin-top: 1.15rem;
}

.filters-card,
.team-card,
.state-card {
  border: 1px solid var(--border-color);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.filters-card {
  max-width: 62rem;
  margin: 0 auto 2rem;
  padding: 1rem;
  border-radius: 1rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(14rem, 0.7fr);
  gap: 0.85rem;
}

.filter-field {
  min-width: 0;
}

.search-control {
  position: relative;
}

.form-control,
.form-select {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 3rem;
  padding: 0.7rem 0.85rem;
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  outline: none;
  background-color: var(--surface-muted);
  color: var(--text-primary);
  font: inherit;
  line-height: 1.35;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.form-control {
  padding-right: 3rem;
}

.form-control::placeholder {
  color: var(--text-secondary);
  opacity: 0.8;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--accent);
  background-color: var(--surface);
  box-shadow: 0 0 0 0.22rem var(--accent-soft);
}

.form-select:disabled {
  cursor: not-allowed;
  opacity: 0.68;
}

.teams-page--dark .form-select {
  color-scheme: dark;
}

.search-control__clear {
  position: absolute;
  top: 50%;
  right: 0.6rem;
  width: 2rem;
  height: 2rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--text-secondary);
  font-size: 1.45rem;
  line-height: 1;
  transform: translateY(-50%);
}

.search-control__clear:hover,
.search-control__clear:focus-visible {
  background: var(--accent-soft);
  color: var(--accent);
  outline: none;
}

.select-row {
  display: flex;
  gap: 0.6rem;
}

.select-row .form-select {
  min-width: 0;
  flex: 1;
}

.filters-card__footer {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.8rem;
}

.filters-card__summary {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.clear-filters-button,
.retry-button {
  display: inline-flex;
  min-height: 2.3rem;
  align-items: center;
  justify-content: center;
  padding: 0.48rem 0.75rem;
  border: 1px solid var(--accent-border);
  border-radius: 0.65rem;
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-size: 0.84rem;
  font-weight: 800;
  cursor: pointer;
}

.clear-filters-button:hover,
.retry-button:hover:not(:disabled) {
  background: var(--accent-soft);
}

.retry-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.catalog-error {
  margin: 0.6rem 0 0;
  color: var(--danger-text);
  font-size: 0.84rem;
  font-weight: 750;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.team-card {
  min-width: 0;
  overflow: hidden;
  border-radius: 1rem;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.team-card:hover {
  border-color: var(--accent-border);
  transform: translateY(-3px);
}

.team-card__content {
  display: flex;
  min-height: 100%;
  flex-direction: column;
  padding: 1.25rem;
}

.team-card__heading {
  display: flex;
  min-width: 0;
  gap: 0.75rem;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.team-card__title {
  min-width: 0;
  margin: 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 850;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.team-card__format {
  flex: 0 0 auto;
  max-width: 50%;
  padding: 0.3rem 0.55rem;
  overflow: hidden;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.74rem;
  font-weight: 850;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pokemon-list {
  min-height: 4.3rem;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.45rem;
  margin-bottom: 1.25rem;
  padding: 0.7rem;
  border-radius: 0.85rem;
  background: var(--surface-muted);
}

.pokemon-slot {
  display: grid;
  min-width: 0;
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid var(--border-color);
  border-radius: 0.7rem;
  background: var(--surface);
}

.pokemon-slot__image {
  display: block;
  width: 100%;
  max-width: 3.2rem;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
}

.pokemon-slot__placeholder {
  display: grid;
  width: 2.35rem;
  height: 2.35rem;
  place-items: center;
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 900;
}

.team-card__footer {
  margin-top: auto;
}

.action-button {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  padding: 0.68rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.72rem;
  font: inherit;
  font-weight: 800;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 150ms ease,
    filter 150ms ease,
    border-color 150ms ease,
    background-color 150ms ease;
}

.action-button:hover:not(:disabled) {
  filter: brightness(0.96);
  transform: translateY(-1px);
}

.action-button:focus-visible,
.clear-filters-button:focus-visible,
.retry-button:focus-visible,
.form-control:focus-visible,
.form-select:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}

.action-button--primary {
  background: var(--accent);
  color: #ffffff;
  box-shadow: 0 10px 22px var(--accent-soft);
}

.action-button--outline {
  width: 100%;
  border-color: var(--accent);
  background: transparent;
  color: var(--accent);
}

.action-button--outline:hover {
  background: var(--accent-soft);
}

.state-card {
  max-width: 42rem;
  min-height: 16rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
}

.state-card--error {
  border-color: var(--danger-border);
  background: var(--danger-soft);
}

.state-card__loader-image {
  display: block;
  /*max-width: min(100%, 15rem);*/
  height: auto;
  object-fit: contain;
}

.state-card__title,
.state-card__text {
  margin: 0;
}

.state-card__title {
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 850;
}

.state-card__text {
  color: var(--text-secondary);
  line-height: 1.55;
}

.loading-spinner {
  display: inline-block;
  width: 4rem;
  height: 4rem;
  border: 4px solid var(--accent);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  filter: drop-shadow(0 0 9px var(--accent-soft));
}

.pagination-wrapper {
  margin-top: 1.5rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 991.98px) {
  .teams-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767.98px) {
  .container {
    padding-inline: 0.75rem;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }

  .select-row {
    flex-direction: column;
  }

  .retry-button {
    width: 100%;
  }

  .team-card__heading {
    flex-direction: column;
  }

  .team-card__format {
    max-width: 100%;
  }

  .pokemon-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .pokemon-slot__image {
    max-width: 3.6rem;
  }
}

@media (max-width: 399.98px) {
  .filters-card,
  .team-card__content,
  .state-card {
    padding: 1rem;
  }

  .filters-card__footer {
    align-items: stretch;
    flex-direction: column;
  }

  .clear-filters-button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .team-card,
  .action-button {
    transition: none;
  }

  .team-card:hover,
  .action-button:hover:not(:disabled) {
    transform: none;
  }

  .loading-spinner {
    animation-duration: 1.4s;
  }
}
</style>
