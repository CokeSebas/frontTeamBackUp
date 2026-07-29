<!-- src/views/ViewTeamsPublic.vue -->
<template>
  <main
    class="teams-page"
    :class="{ 'teams-page--dark': mode === 'dark' }"
  >
    <div class="container py-4 py-lg-5">
      <header class="teams-header text-center">
        <h1 class="teams-header__title">
          {{ $t('teamsSeccion.title') }}
        </h1>

        <router-link
          class="btn btn-success teams-header__action"
          to="/vgc/create-team"
        >
          {{ $t('buttons.createTeam') }}
        </router-link>
      </header>

      <section
        class="filters-card"
        :aria-label="$t('teamsSeccion.title')"
      >
        <div class="filters-grid">
          <div class="filter-field">
            <label
              class="visually-hidden"
              for="team-search"
            >
              {{ $t('teamsSeccion.searchTeam') }}
            </label>

            <div class="search-control">
              <input
                id="team-search"
                v-model.trim="searchName"
                type="search"
                class="form-control"
                :placeholder="$t('teamsSeccion.searchTeam')"
                autocomplete="off"
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
              for="subformat-filter"
            >
              {{ $t('teamsSeccion.subFormat') }}
            </label>

            <select
              id="subformat-filter"
              v-model="searchSubFormat"
              class="form-select"
            >
              <option value="">
                {{ $t('teamsSeccion.subFormat') }}
              </option>

              <option
                v-for="format in subFormats"
                :key="format.id ?? format.subFormatName"
                :value="format.subFormatName"
              >
                {{ format.subFormatName }}
              </option>
            </select>
          </div>
        </div>

        <p
          v-if="!isLoading && !loadError"
          class="filters-card__summary"
          aria-live="polite"
        >
          {{ filteredTeams.length }}
          {{ filteredTeams.length === 1 ? 'equipo encontrado' : 'equipos encontrados' }}
        </p>
      </section>

      <section
        v-if="isLoading"
        class="state-card"
        aria-live="polite"
        aria-busy="true"
      >
        <img
          v-if="gifLoading"
          :src="gifLoading"
          class="state-card__loader-image"
          alt="Cargando equipos"
        >
        <span
          v-else
          class="spinner-border text-success"
          role="status"
          aria-hidden="true"
        />

      </section>

      <section
        v-else-if="loadError"
        class="state-card state-card--error"
        role="alert"
      >
        <h2 class="state-card__title">
          No fue posible cargar los equipos
        </h2>
        <p class="state-card__text">
          {{ loadError }}
        </p>
        <button
          type="button"
          class="btn btn-outline-success"
          @click="loadData"
        >
          Reintentar
        </button>
      </section>

      <template v-else>
        <section
          v-if="currentItems.length"
          class="teams-grid"
          aria-live="polite"
        >
          <article
            v-for="team in currentItems"
            :key="team.id"
            class="team-card"
          >
            <div class="team-card__content">
              <div class="team-card__heading">
                <h2 class="team-card__title">
                  {{ team.team_name || 'Equipo sin nombre' }}
                </h2>

                <span
                  v-if="team.subFormatName"
                  class="team-card__format"
                >
                  {{ team.subFormatName }}
                </span>
              </div>

              <div
                class="pokemon-list"
                :aria-label="`Pokémon del equipo ${team.team_name || ''}`"
              >
                <div
                  v-for="(pokemonUrl, index) in getPokemonUrls(team)"
                  :key="`${team.id}-${index}-${pokemonUrl}`"
                  class="pokemon-slot"
                  :title="getPokemonName(pokemonUrl)"
                >
                  <img
                    :src="pokemonUrl"
                    :alt="getPokemonName(pokemonUrl)"
                    class="pokemon-slot__image"
                    loading="lazy"
                    decoding="async"
                    @error="handleImageError"
                  >
                </div>
              </div>

              <router-link
                class="btn btn-outline-success team-card__link"
                :to="`/vgc/team/${team.id}`"
                :aria-label="`${$t('buttons.seeTeam')}: ${team.team_name || ''}`"
              >
                {{ $t('buttons.seeTeam') }}
              </router-link>
            </div>
          </article>
        </section>

        <section
          v-else
          class="state-card"
          aria-live="polite"
        >
          <h2 class="state-card__title">
            No se encontraron equipos
          </h2>
          <p class="state-card__text">
            Prueba con otro nombre, Pokémon o subformato.
          </p>
          <button
            v-if="searchName || searchSubFormat"
            type="button"
            class="btn btn-outline-success"
            @click="clearFilters"
          >
            Limpiar filtros
          </button>
        </section>

        <Paginator
          v-if="filteredTeams.length > itemsPerPage"
          :key="paginatorKey"
          :items="filteredTeams"
          :items-per-page="itemsPerPage"
          @page-changed="handlePageChanged"
        />
      </template>
    </div>
  </main>
</template>

<script>
import axios from 'axios';
import Paginator from '@/components/AppPaginator.vue';
import { createEvent } from '@/services/eventService';

const POKEMON_FIELDS = ['poke1', 'poke2', 'poke3', 'poke4', 'poke5', 'poke6'];

export default {
  name: 'ViewTeamsPublic',

  components: {
    Paginator
  },

  inject: {
    apiUrl: {
      from: 'apiUrl',
      default: ''
    },
    gifLoading: {
      from: 'gifLoading',
      default: ''
    },
    mode: {
      from: 'mode',
      default: 'light'
    }
  },

  data() {
    return {
      listTeams: [],
      subFormats: [],
      currentItems: [],
      searchName: '',
      searchSubFormat: '',
      isLoading: false,
      loadError: '',
      itemsPerPage: 10
    };
  },

  computed: {
    normalizedSearch() {
      return this.normalizeText(this.searchName);
    },

    normalizedSubFormat() {
      return this.normalizeText(this.searchSubFormat);
    },

    filteredTeams() {
      return this.listTeams.filter((team) => {
        const teamName = this.normalizeText(team?.team_name);
        const subFormat = this.normalizeText(team?.subFormatName);

        const matchesName = !this.normalizedSearch
          || teamName.includes(this.normalizedSearch);

        const matchesPokemon = !this.normalizedSearch
          || this.getPokemonUrls(team).some((url) => (
            this.normalizeText(this.getPokemonName(url))
              .includes(this.normalizedSearch)
          ));

        const matchesSubFormat = !this.normalizedSubFormat
          || subFormat === this.normalizedSubFormat;

        return (matchesName || matchesPokemon) && matchesSubFormat;
      });
    },

    paginatorKey() {
      return [
        this.normalizedSearch,
        this.normalizedSubFormat,
        this.filteredTeams.length
      ].join('|');
    }
  },

  watch: {
    filteredTeams: {
      handler(teams) {
        this.currentItems = teams.slice(0, this.itemsPerPage);
      },
      immediate: true
    }
  },

  mounted() {
    this.loadData();
  },

  methods: {
    buildApiUrl(path = '') {
      const baseUrl = String(this.apiUrl || '').replace(/\/+$/, '');
      const cleanPath = String(path).replace(/^\/+/, '');

      return `${baseUrl}/${cleanPath}`;
    },

    normalizeText(value) {
      return String(value ?? '')
        .trim()
        .toLocaleLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    },

    extractArray(payload, preferredKey = '') {
      if (Array.isArray(payload)) {
        return payload;
      }

      if (
        preferredKey
        && payload
        && Array.isArray(payload[preferredKey])
      ) {
        return payload[preferredKey];
      }

      if (payload?.data && Array.isArray(payload.data)) {
        return payload.data;
      }

      return [];
    },

    async loadData() {
      this.isLoading = true;
      this.loadError = '';

      const [teamsResult, subFormatsResult] = await Promise.allSettled([
        axios.get(this.buildApiUrl('teams/')),
        axios.get(this.buildApiUrl('subformats'))
      ]);

      if (teamsResult.status === 'fulfilled') {
        this.listTeams = this.extractArray(
          teamsResult.value?.data,
          'data'
        );
      } else {
        console.error('Error al cargar los equipos:', teamsResult.reason);
        this.listTeams = [];
        this.loadError = this.getErrorMessage(
          teamsResult.reason,
          'Ocurrió un error al obtener el listado.'
        );
      }

      if (subFormatsResult.status === 'fulfilled') {
        this.subFormats = this.extractArray(
          subFormatsResult.value?.data,
          'data'
        ).filter((format) => format?.subFormatName);
      } else {
        console.error(
          'Error al cargar los subformatos:',
          subFormatsResult.reason
        );
        this.subFormats = [];
      }

      this.isLoading = false;

      if (teamsResult.status === 'fulfilled') {
        this.trackPageVisit();
      }
    },

    async trackPageVisit() {
      try {
        await createEvent({
          userAgent: navigator.userAgent,
          date: new Date().toISOString(),
          type: 'list_teams_public',
          description: 'listado de equipos publicos'
        });
      } catch (error) {
        console.warn('No fue posible registrar la visita:', error);
      }
    },

    getErrorMessage(error, fallbackMessage) {
      return error?.response?.data?.message
        || error?.response?.data?.error
        || error?.message
        || fallbackMessage;
    },

    getPokemonUrls(team) {
      return POKEMON_FIELDS
        .map((field) => team?.[field])
        .filter((url) => typeof url === 'string' && url.trim());
    },

    getPokemonName(url) {
      if (!url) {
        return 'Pokémon';
      }

      try {
        const cleanUrl = String(url).split(/[?#]/)[0];
        const fileName = cleanUrl.split('/').pop() || '';
        const decodedName = decodeURIComponent(fileName)
          .replace(/\.[a-z0-9]+$/i, '')
          .replace(/[-_]+/g, ' ')
          .trim();

        if (!decodedName) {
          return 'Pokémon';
        }

        return decodedName.replace(/\b\w/g, (letter) => letter.toUpperCase());
      } catch (error) {
        return 'Pokémon';
      }
    },

    handleImageError(event) {
      event.currentTarget.closest('.pokemon-slot')
        ?.classList.add('pokemon-slot--error');
      event.currentTarget.remove();
    },

    handlePageChanged(paginatedItems) {
      this.currentItems = Array.isArray(paginatedItems)
        ? paginatedItems
        : [];
    },

    clearFilters() {
      this.searchName = '';
      this.searchSubFormat = '';
    }
  }
};
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
  --accent-soft: rgba(25, 135, 84, 0.12);
  --danger-soft: #fff4f4;
  --danger-border: #f2c3c3;
  --shadow: 0 16px 40px rgba(25, 50, 37, 0.08);

  min-height: 100%;
  background:
    radial-gradient(
      circle at top center,
      rgba(25, 135, 84, 0.08),
      transparent 28rem
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
  --accent-soft: rgba(55, 190, 120, 0.14);
  --danger-soft: #2a1a1a;
  --danger-border: #704141;
  --shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
}

.teams-header {
  max-width: 48rem;
  margin: 0 auto 2rem;
}

.teams-header__title {
  margin-bottom: 1.25rem;
  color: var(--text-primary);
  font-size: clamp(1.8rem, 4vw, 2.65rem);
  font-weight: 800;
  line-height: 1.15;
}

.teams-header__action {
  min-height: 2.75rem;
  padding-inline: 1.4rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.75rem;
  font-weight: 700;
}

.filters-card,
.state-card,
.team-card {
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

.form-control,
.form-select {
  min-height: 3rem;
  border-color: var(--border-color);
  background-color: var(--surface-muted);
  color: var(--text-primary);
  border-radius: 0.75rem;
}

.form-control::placeholder {
  color: var(--text-secondary);
  opacity: 0.8;
}

.form-control:focus,
.form-select:focus {
  border-color: var(--accent);
  background-color: var(--surface);
  color: var(--text-primary);
  box-shadow: 0 0 0 0.22rem var(--accent-soft);
}

.teams-page--dark .form-select {
  color-scheme: dark;
}

.search-control {
  position: relative;
}

.search-control .form-control {
  padding-right: 3rem;
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

.filters-card__summary {
  margin: 0.8rem 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  text-align: left;
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
  border-color: rgba(25, 135, 84, 0.45);
  transform: translateY(-3px);
}

.team-card__content {
  height: 100%;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
}

.team-card__heading {
  min-width: 0;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.team-card__title {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 800;
  text-align: left;
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
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pokemon-list {
  min-height: 4.3rem;
  margin-bottom: 1.25rem;
  padding: 0.7rem;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.45rem;
  border-radius: 0.85rem;
  background: var(--surface-muted);
}

.pokemon-slot {
  aspect-ratio: 1;
  min-width: 0;
  display: grid;
  place-items: center;
  border: 1px solid var(--border-color);
  border-radius: 0.7rem;
  background: var(--surface);
}

.pokemon-slot--error::after {
  content: "?";
  color: var(--text-secondary);
  font-weight: 800;
}

.pokemon-slot__image {
  width: 100%;
  max-width: 3.2rem;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
}

.team-card__link {
  align-self: flex-start;
  margin-top: auto;
  border-radius: 0.65rem;
  font-weight: 700;
}

.state-card {
  max-width: 42rem;
  min-height: 15rem;
  margin: 0 auto 1.5rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  text-align: center;
}

.state-card--error {
  border-color: var(--danger-border);
  background: var(--danger-soft);
}

.state-card__loader-image {
  /*max-width: 4.5rem;
  max-height: 4.5rem;*/
  object-fit: contain;
}

.state-card__title {
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 800;
}

.state-card__text {
  margin: 0.65rem 0 1rem;
  color: var(--text-secondary);
}

@media (max-width: 767.98px) {
  .filters-grid,
  .teams-grid {
    grid-template-columns: 1fr;
  }

  .filters-card {
    padding: 0.85rem;
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
  .container {
    padding-inline: 0.75rem;
  }

  .team-card__content {
    padding: 1rem;
  }

  .state-card {
    padding: 1.5rem 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .team-card {
    transition: none;
  }
}
</style>
