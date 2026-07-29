<template>
  <main
    class="pokemons-page"
    :class="{ 'pokemons-page--dark': isDark }"
  >
    <div class="container py-4 py-lg-5">
      <header class="pokemons-header text-center">
        <h1 class="pokemons-header__title">
          {{ $t('pokemonsSeccion.title') }}
        </h1>

        <p class="pokemons-header__subtitle">
          {{ $t('pokemonsSeccion.subtitle') }}
        </p>

        <div class="pokemons-header__actions">
          <router-link
            class="btn btn-outline-success pokemons-header__action"
            to="/vgc/create-pokemon"
          >
            {{ $t('buttons.createPokemon') }}
          </router-link>

          <button
            type="button"
            class="btn btn-success pokemons-header__action"
            :disabled="!canCreateTeam || isCopyingTeam"
            :aria-busy="isCopyingTeam"
            @click="createTeam"
          >
            <span
              v-if="isCopyingTeam"
              class="spinner-border spinner-border-sm"
              aria-hidden="true"
            ></span>

            {{
              isCopyingTeam
                ? 'Copiando equipo...'
                : $t('buttons.obtainFormatSd')
            }}
          </button>
        </div>
      </header>

      <section
        class="filters-card"
        aria-label="Filtros de Pokémon"
      >
        <div class="filters-grid">
          <div class="filter-field">
            <label
              class="visually-hidden"
              for="pokemon-search"
            >
              Buscar Pokémon
            </label>

            <div class="search-control">
              <input
                id="pokemon-search"
                v-model.trim="searchQuery"
                type="search"
                class="form-control"
                autocomplete="off"
                :placeholder="$t('pokemonsSeccion.searchPokemon')"
              >

              <button
                v-if="searchQuery"
                type="button"
                class="search-control__clear"
                aria-label="Limpiar búsqueda"
                @click="searchQuery = ''"
              >
                ×
              </button>
            </div>
          </div>

          <div class="filter-field">
            <label
              class="visually-hidden"
              for="pokemon-subformat"
            >
              {{ $t('teamsSeccion.subFormat') }}
            </label>

            <div class="subformat-control">
              <select
                id="pokemon-subformat"
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
                class="btn btn-outline-success"
                :disabled="isLoadingSubFormats"
                @click="loadSubFormats"
              >
                Reintentar
              </button>
            </div>
          </div>
        </div>

        <div class="filters-card__footer">
          <p
            v-if="!isLoading && !loadError"
            class="filters-card__summary"
            aria-live="polite"
          >
            {{ filteredPokemons.length }}
            {{
              filteredPokemons.length === 1
                ? 'Pokémon encontrado'
                : 'Pokémon encontrados'
            }}
          </p>

          <button
            v-if="hasActiveFilters"
            type="button"
            class="filters-card__clear"
            @click="clearFilters"
          >
            Limpiar filtros
          </button>
        </div>

        <p
          v-if="subFormatsError"
          class="filters-card__error"
          role="alert"
        >
          {{ subFormatsError }}
        </p>
      </section>

      <section
        v-if="!isLoading && !loadError"
        class="selection-card"
        aria-live="polite"
      >
        <div>
          <p class="selection-card__title">
            Equipo seleccionado
          </p>
          <p class="selection-card__description">
            Selecciona exactamente seis Pokémon para copiar el formato.
          </p>
        </div>

        <div class="selection-card__actions">
          <span class="selection-card__count">
            {{ selectedPokemonIds.length }}/6
          </span>

          <button
            v-if="selectedPokemonIds.length"
            type="button"
            class="selection-card__clear"
            @click="clearSelection"
          >
            Limpiar selección
          </button>
        </div>
      </section>

      <section
        v-if="isLoading"
        class="state-card"
        aria-label="Cargando Pokémon"
        aria-live="polite"
        aria-busy="true"
      >
        <img
          v-if="gifLoading"
          :src="gifLoading"
          class="state-card__loader-image"
          alt="Cargando Pokémon"
        >

        <span
          v-else
          class="spinner-border text-success"
          role="status"
          aria-hidden="true"
        ></span>
      </section>

      <section
        v-else-if="loadError"
        class="state-card state-card--error"
        role="alert"
      >
        <h2 class="state-card__title">
          {{ $t('responseApisSeccion.oops') }}
        </h2>

        <p class="state-card__text">
          {{ loadError }}
        </p>

        <button
          type="button"
          class="btn btn-outline-success"
          @click="loadPokemons"
        >
          Reintentar
        </button>
      </section>

      <template v-else>
        <section
          v-if="currentItems.length"
          class="pokemons-grid"
          aria-label="Listado de Pokémon"
          aria-live="polite"
        >
          <article
            v-for="pokemon in currentItems"
            :key="pokemon.id"
            class="pokemon-card"
            :class="{ 'pokemon-card--selected': isPokemonSelected(pokemon) }"
          >
            <div class="pokemon-card__content">
              <div class="pokemon-card__heading">
                <h2 class="pokemon-card__title">
                  {{ pokemon.name }}
                </h2>

                <span
                  v-if="pokemon.subFormatName"
                  class="pokemon-card__format"
                  :title="pokemon.subFormatName"
                >
                  {{ pokemon.subFormatName }}
                </span>
              </div>

              <div class="pokemon-card__main">
                <div class="pokemon-card__image-wrapper">
                  <img
                    v-if="pokemon.imgPokemon && !pokemon.imageError"
                    :src="pokemon.imgPokemon"
                    class="pokemon-card__image"
                    :alt="pokemon.name"
                    loading="lazy"
                    decoding="async"
                    @error="setPokemonImageError(pokemon)"
                  >

                  <div
                    v-else
                    class="pokemon-card__image-placeholder"
                    role="img"
                    :aria-label="`${pokemon.name} sin imagen disponible`"
                  >
                    Sin imagen
                  </div>
                </div>

                <dl class="pokemon-card__data">
                  <div v-if="shouldShowTeraType(pokemon)">
                    <dt>{{ $t('pokemonsSeccion.teraType') }}</dt>
                    <dd>{{ pokemon.teraType || '-' }}</dd>
                  </div>

                  <div>
                    <dt>{{ $t('pokemonsSeccion.item') }}</dt>
                    <dd>{{ pokemon.item || '-' }}</dd>
                  </div>

                  <div>
                    <dt>{{ $t('pokemonsSeccion.evsSpread') }}</dt>
                    <dd>{{ pokemon.evs || '-' }}</dd>
                  </div>
                </dl>
              </div>

              <div class="pokemon-card__footer">
                <label
                  class="pokemon-selector"
                  :class="{
                    'pokemon-selector--selected': isPokemonSelected(pokemon),
                    'pokemon-selector--disabled':
                      isMaxSelected && !isPokemonSelected(pokemon)
                  }"
                  :for="`pokemon-select-${pokemon.id}`"
                >
                  <input
                    :id="`pokemon-select-${pokemon.id}`"
                    class="pokemon-selector__input"
                    type="checkbox"
                    :checked="isPokemonSelected(pokemon)"
                    :disabled="
                      isMaxSelected &&
                      !isPokemonSelected(pokemon)
                    "
                    @change="toggleSelection(pokemon)"
                  >

                  <span aria-hidden="true">
                    {{ isPokemonSelected(pokemon) ? '✓' : '+' }}
                  </span>

                  {{
                    isPokemonSelected(pokemon)
                      ? 'Seleccionado'
                      : 'Seleccionar'
                  }}
                </label>

                <router-link
                  class="btn btn-outline-success pokemon-card__link"
                  :to="`/pokemon/${encodeURIComponent(pokemon.id)}`"
                  :aria-label="`${$t('buttons.seePokemon')}: ${pokemon.name}`"
                >
                  {{ $t('buttons.seePokemon') }}
                </router-link>
              </div>
            </div>
          </article>
        </section>

        <section
          v-else
          class="state-card"
          aria-live="polite"
        >
          <h2 class="state-card__title">
            {{ $t('pokemonsSeccion.notFound') }}
          </h2>

          <p class="state-card__text">
            Cambia los filtros o crea un nuevo Pokémon.
          </p>

          <button
            v-if="hasActiveFilters"
            type="button"
            class="btn btn-outline-success"
            @click="clearFilters"
          >
            Limpiar filtros
          </button>
        </section>

        <div
          v-if="filteredPokemons.length > itemsPerPage"
          class="pagination-wrapper"
        >
          <Paginator
            :key="paginationKey"
            :items="filteredPokemons"
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
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import Swal from 'sweetalert2';

import Paginator from '@/components/AppPaginator.vue';
import { createEvent } from '@/services/eventService';

const apiUrl = inject('apiUrl', '');
const gifLoading = inject('gifLoading', null);
const mode = inject('mode', 'light');

const { t } = useI18n();

const itemsPerPage = 9;

const pokemons = ref([]);
const subFormats = ref([]);
const currentItems = ref([]);
const selectedPokemonIds = ref([]);

const searchQuery = ref('');
const searchSubFormat = ref('');

const isLoading = ref(true);
const isLoadingSubFormats = ref(false);
const isCopyingTeam = ref(false);

const loadError = ref('');
const subFormatsError = ref('');

let pokemonsController = null;
let subFormatsController = null;

const isDark = computed(() => unref(mode) === 'dark');

const isMaxSelected = computed(
  () => selectedPokemonIds.value.length >= 6
);

const canCreateTeam = computed(
  () => selectedPokemonIds.value.length === 6
);

const hasActiveFilters = computed(
  () =>
    Boolean(searchQuery.value.trim()) ||
    Boolean(searchSubFormat.value)
);

const normalizeSearchValue = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase();

const filteredPokemons = computed(() => {
  const query = normalizeSearchValue(searchQuery.value);
  const selectedSubFormat = normalizeSearchValue(
    searchSubFormat.value
  );

  return pokemons.value.filter((pokemon) => {
    const matchesName = normalizeSearchValue(
      pokemon.name
    ).includes(query);

    const matchesSubFormat = selectedSubFormat
      ? normalizeSearchValue(pokemon.subFormatName) ===
        selectedSubFormat
      : true;

    return matchesName && matchesSubFormat;
  });
});

const paginationKey = computed(
  () =>
    `${normalizeSearchValue(searchQuery.value)}|` +
    `${normalizeSearchValue(searchSubFormat.value)}|` +
    `${filteredPokemons.value.length}`
);

const buildApiUrl = (path) => {
  const baseUrl = String(unref(apiUrl) || '')
    .trim()
    .replace(/\/+$/, '');

  const cleanPath = String(path || '')
    .trim()
    .replace(/^\/+/, '');

  return baseUrl
    ? `${baseUrl}/${cleanPath}`
    : `/${cleanPath}`;
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

const normalizeNumber = (value) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : null;
};

const normalizePokemons = (data) => {
  const normalized = normalizeArrayResponse(data)
    .filter(
      (pokemon) =>
        pokemon &&
        typeof pokemon === 'object' &&
        (
          pokemon.id != null ||
          pokemon.pokemonId != null ||
          pokemon.pokemon_id != null
        )
    )
    .map((pokemon, index) => ({
      id:
        pokemon.id ??
        pokemon.pokemonId ??
        pokemon.pokemon_id,
      name:
        String(
          pokemon.name ??
          pokemon.nickPoke ??
          pokemon.nick_poke ??
          `Pokémon ${index + 1}`
        ).trim() || `Pokémon ${index + 1}`,
      imgPokemon: String(
        pokemon.imgPokemon ??
        pokemon.img_pokemon ??
        pokemon.imageUrl ??
        ''
      ).trim(),
      subFormatName: String(
        pokemon.subFormatName ??
        pokemon.sub_format_name ??
        pokemon.abrevSubFormat ??
        ''
      ).trim(),
      subFormatId: normalizeNumber(
        pokemon.subFormatId ??
        pokemon.sub_format_id
      ),
      teraType: String(
        pokemon.teraType ??
        pokemon.tera_type ??
        ''
      ).trim(),
      item: String(pokemon.item ?? '').trim(),
      evs: String(
        pokemon.evs ??
        pokemon.evsSpread ??
        pokemon.evs_spread ??
        ''
      ).trim(),
      pasteSd: String(
        pokemon.pasteSd ??
        pokemon.paste_sd ??
        ''
      ).trim(),
      imageError: false
    }));

  return Array.from(
    new Map(
      normalized.map((pokemon) => [
        String(pokemon.id),
        pokemon
      ])
    ).values()
  );
};

const normalizeSubFormats = (data) => {
  const normalized = normalizeArrayResponse(data)
    .filter(
      (subFormat) =>
        subFormat &&
        typeof subFormat === 'object' &&
        subFormat.id != null
    )
    .map((subFormat) => ({
      id: subFormat.id,
      name: String(
        subFormat.subFormatName ??
        subFormat.abrevSubFormat ??
        subFormat.name ??
        ''
      ).trim()
    }))
    .filter((subFormat) => subFormat.name);

  return Array.from(
    new Map(
      normalized.map((subFormat) => [
        normalizeSearchValue(subFormat.name),
        subFormat
      ])
    ).values()
  ).sort((first, second) =>
    first.name.localeCompare(second.name, undefined, {
      sensitivity: 'base'
    })
  );
};

const isCanceledRequest = (error) =>
  error?.name === 'CanceledError' ||
  error?.code === 'ERR_CANCELED';

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const registerListEvent = async () => {
  try {
    await createEvent({
      userAgent: navigator.userAgent,
      date: new Date().toISOString(),
      type: 'list_pokemons_public',
      description: 'listado de pokemons publicos'
    });
  } catch (error) {
    console.error(
      'No se pudo registrar el evento del listado:',
      error
    );
  }
};

const loadPokemons = async () => {
  pokemonsController?.abort();

  const controller = new AbortController();
  pokemonsController = controller;

  isLoading.value = true;
  loadError.value = '';

  try {
    const response = await axios.get(
      buildApiUrl('pokemon'),
      {
        signal: controller.signal
      }
    );

    if (pokemonsController !== controller) {
      return;
    }

    pokemons.value = normalizePokemons(response?.data);
    selectedPokemonIds.value = [];

    void registerListEvent();
  } catch (error) {
    if (isCanceledRequest(error)) {
      return;
    }

    console.error('Error al cargar Pokémon:', error);

    pokemons.value = [];
    selectedPokemonIds.value = [];
    loadError.value = getErrorMessage(
      error,
      t('responseApisSeccion.loadingDataError') ||
        'No se pudieron cargar los Pokémon.'
    );
  } finally {
    if (pokemonsController === controller) {
      isLoading.value = false;
      pokemonsController = null;
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

    if (subFormatsController !== controller) {
      return;
    }

    subFormats.value = normalizeSubFormats(response?.data);
  } catch (error) {
    if (isCanceledRequest(error)) {
      return;
    }

    console.error('Error al cargar subformatos:', error);

    subFormats.value = [];
    subFormatsError.value = getErrorMessage(
      error,
      'No se pudieron cargar los subformatos.'
    );
  } finally {
    if (subFormatsController === controller) {
      isLoadingSubFormats.value = false;
      subFormatsController = null;
    }
  }
};

const isPokemonSelected = (pokemon) =>
  selectedPokemonIds.value.includes(pokemon.id);

const toggleSelection = async (pokemon) => {
  if (isPokemonSelected(pokemon)) {
    selectedPokemonIds.value =
      selectedPokemonIds.value.filter(
        (pokemonId) => pokemonId !== pokemon.id
      );
    return;
  }

  if (isMaxSelected.value) {
    return;
  }

  selectedPokemonIds.value = [
    ...selectedPokemonIds.value,
    pokemon.id
  ];

  if (selectedPokemonIds.value.length === 6) {
    await Swal.fire({
      title: t('pokemonsSeccion.tittleSwal'),
      text: t('pokemonsSeccion.subTittleSwal'),
      icon: 'info',
      confirmButtonText: t('buttons.accept')
    });

    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

const copyToClipboard = async (text) => {
  if (
    navigator.clipboard &&
    window.isSecureContext
  ) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const temporaryTextarea =
    document.createElement('textarea');

  try {
    temporaryTextarea.value = text;
    temporaryTextarea.setAttribute('readonly', '');
    temporaryTextarea.style.position = 'fixed';
    temporaryTextarea.style.left = '-9999px';
    temporaryTextarea.style.opacity = '0';

    document.body.appendChild(temporaryTextarea);
    temporaryTextarea.select();

    const copied = document.execCommand('copy');

    if (!copied) {
      throw new Error('CLIPBOARD_COPY_FAILED');
    }
  } finally {
    temporaryTextarea.remove();
  }
};

const createTeam = async () => {
  if (!canCreateTeam.value || isCopyingTeam.value) {
    return;
  }

  const pokemonById = new Map(
    pokemons.value.map((pokemon) => [
      pokemon.id,
      pokemon
    ])
  );

  const selectedPokemons = selectedPokemonIds.value
    .map((pokemonId) => pokemonById.get(pokemonId))
    .filter(Boolean);

  if (selectedPokemons.length !== 6) {
    await Swal.fire({
      title: t('pokemonsSeccion.modalTittle'),
      text: 'Selecciona exactamente seis Pokémon.',
      icon: 'warning',
      confirmButtonText: t('buttons.accept')
    });
    return;
  }

  const pokemonsWithoutPaste = selectedPokemons
    .filter((pokemon) => !pokemon.pasteSd)
    .map((pokemon) => pokemon.name);

  if (pokemonsWithoutPaste.length) {
    await Swal.fire({
      title: t('pokemonsSeccion.modalTittle'),
      text:
        'No se pudo generar el equipo porque falta información en: ' +
        pokemonsWithoutPaste.join(', '),
      icon: 'error',
      confirmButtonText: t('buttons.accept')
    });
    return;
  }

  const pasteSdTeam = selectedPokemons
    .map((pokemon) => pokemon.pasteSd)
    .join('\n\n');

  isCopyingTeam.value = true;

  try {
    await copyToClipboard(pasteSdTeam);

    await Swal.fire({
      title: t('pokemonsSeccion.modalTittle'),
      text: t('pokemonsSeccion.pasteForSd'),
      icon: 'success',
      confirmButtonText: t('buttons.accept')
    });
  } catch (error) {
    console.error('Error al copiar el equipo:', error);

    await Swal.fire({
      title: t('pokemonsSeccion.modalTittle'),
      text: 'No se pudo copiar el equipo al portapapeles.',
      icon: 'error',
      confirmButtonText: t('buttons.accept')
    });
  } finally {
    isCopyingTeam.value = false;
  }
};

const clearFilters = () => {
  searchQuery.value = '';
  searchSubFormat.value = '';
};

const clearSelection = () => {
  selectedPokemonIds.value = [];
};

const setPokemonImageError = (pokemon) => {
  pokemon.imageError = true;
};

const shouldShowTeraType = (pokemon) =>
  pokemon.subFormatId !== null &&
  pokemon.subFormatId < 6;

const handlePageChanged = (paginatedItems) => {
  currentItems.value = Array.isArray(paginatedItems)
    ? paginatedItems
    : [];
};

watch(
  filteredPokemons,
  (newFilteredPokemons) => {
    currentItems.value = newFilteredPokemons.slice(
      0,
      itemsPerPage
    );
  },
  {
    immediate: true
  }
);

onMounted(() => {
  void loadPokemons();
  void loadSubFormats();
});

onBeforeUnmount(() => {
  pokemonsController?.abort();
  subFormatsController?.abort();
});
</script>

<style scoped>
.pokemons-page {
  --page-bg: #f3f6f5;
  --surface: #ffffff;
  --surface-muted: #f3f6f5;
  --text-primary: #1f2a25;
  --text-secondary: #647068;
  --border-color: #dce4df;
  --accent: #198754;
  --accent-soft: rgba(25, 135, 84, 0.12);
  --accent-border: rgba(25, 135, 84, 0.42);
  --danger-soft: #fff4f4;
  --danger-border: #f2c3c3;
  --shadow: 0 16px 40px rgba(25, 50, 37, 0.08);

  min-height: 100dvh;
  background:
    radial-gradient(
      circle at top center,
      rgba(25, 135, 84, 0.08),
      transparent 28rem
    ),
    var(--page-bg);
  color: var(--text-primary);
}

.pokemons-page--dark {
  --page-bg: #101412;
  --surface: #19201c;
  --surface-muted: #222b26;
  --text-primary: #eef5f1;
  --text-secondary: #aab8b0;
  --border-color: #334139;
  --accent: #37be78;
  --accent-soft: rgba(55, 190, 120, 0.14);
  --accent-border: rgba(55, 190, 120, 0.48);
  --danger-soft: #2a1a1a;
  --danger-border: #704141;
  --shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
}

.pokemons-page,
.pokemons-page * {
  box-sizing: border-box;
}

.pokemons-header {
  max-width: 52rem;
  margin: 0 auto 2rem;
}

.pokemons-header__title {
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(1.8rem, 4vw, 2.65rem);
  font-weight: 800;
  line-height: 1.15;
}

.pokemons-header__subtitle {
  max-width: 46rem;
  margin: 0.8rem auto 1.25rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.pokemons-header__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
}

.pokemons-header__action {
  min-height: 2.75rem;
  padding-inline: 1.35rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.75rem;
  font-weight: 700;
}

.filters-card,
.selection-card,
.state-card,
.pokemon-card {
  border: 1px solid var(--border-color);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.filters-card {
  max-width: 62rem;
  margin: 0 auto 1rem;
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
  border-radius: 0.75rem;
  background-color: var(--surface-muted);
  color: var(--text-primary);
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

.pokemons-page--dark .form-select {
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

.subformat-control {
  display: flex;
  gap: 0.6rem;
}

.subformat-control .form-select {
  min-width: 0;
  flex: 1;
}

.subformat-control .btn {
  flex: 0 0 auto;
  border-radius: 0.75rem;
  font-weight: 700;
}

.filters-card__footer {
  min-height: 1.4rem;
  margin-top: 0.8rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.filters-card__summary {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.filters-card__clear,
.selection-card__clear {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--accent);
  font-weight: 800;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.filters-card__error {
  margin: 0.55rem 0 0;
  color: #c92a2a;
  font-size: 0.85rem;
  font-weight: 700;
}

.pokemons-page--dark .filters-card__error {
  color: #ff8787;
}

.selection-card {
  max-width: 62rem;
  margin: 0 auto 2rem;
  padding: 0.9rem 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border-radius: 1rem;
}

.selection-card__title,
.selection-card__description {
  margin: 0;
}

.selection-card__title {
  color: var(--text-primary);
  font-weight: 800;
}

.selection-card__description {
  margin-top: 0.15rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.selection-card__actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.75rem;
}

.selection-card__count {
  min-width: 3.7rem;
  min-height: 2.3rem;
  padding: 0.35rem 0.7rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 900;
}

.pokemons-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.pokemon-card {
  min-width: 0;
  overflow: hidden;
  border-radius: 1rem;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.pokemon-card:hover {
  border-color: var(--accent-border);
  transform: translateY(-3px);
}

.pokemon-card--selected {
  border-color: var(--accent);
  box-shadow:
    0 0 0 2px var(--accent),
    var(--shadow);
}

.pokemon-card__content {
  height: 100%;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
}

.pokemon-card__heading {
  min-width: 0;
  min-height: 2.3rem;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.7rem;
}

.pokemon-card__title {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 800;
  line-height: 1.3;
}

.pokemon-card__format {
  flex: 0 0 auto;
  max-width: 48%;
  padding: 0.3rem 0.55rem;
  overflow: hidden;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pokemon-card__main {
  margin: 0.8rem 0 1rem;
  padding: 0.85rem;
  display: grid;
  grid-template-columns: 7.2rem minmax(0, 1fr);
  gap: 0.9rem;
  align-items: center;
  border-radius: 0.85rem;
  background: var(--surface-muted);
}

.pokemon-card__image-wrapper {
  min-height: 7rem;
  display: grid;
  place-items: center;
}

.pokemon-card__image {
  width: 7rem;
  height: 7rem;
  object-fit: contain;
}

.pokemon-card__image-placeholder {
  width: 6.6rem;
  height: 6.6rem;
  display: grid;
  place-items: center;
  border: 1px dashed var(--border-color);
  border-radius: 50%;
  background: var(--surface);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 800;
  text-align: center;
}

.pokemon-card__data {
  min-width: 0;
  margin: 0;
  display: grid;
  gap: 0.45rem;
}

.pokemon-card__data > div {
  min-width: 0;
  padding-bottom: 0.35rem;
  display: grid;
  grid-template-columns: minmax(4.5rem, auto) minmax(0, 1fr);
  gap: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.pokemon-card__data > div:last-child {
  padding-bottom: 0;
  border-bottom: 0;
}

.pokemon-card__data dt {
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 700;
}

.pokemon-card__data dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: 0.82rem;
  text-align: right;
}

.pokemon-card__footer {
  margin-top: auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.7rem;
}

.pokemon-selector {
  min-height: 2.55rem;
  padding: 0.55rem 0.8rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: 1px solid var(--border-color);
  border-radius: 0.65rem;
  background: var(--surface-muted);
  color: var(--text-primary);
  font-size: 0.88rem;
  font-weight: 800;
  cursor: pointer;
  user-select: none;
  transition:
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease;
}

.pokemon-selector:hover {
  border-color: var(--accent-border);
}

.pokemon-selector--selected {
  border-color: var(--accent);
  background: var(--accent-soft);
  color: var(--accent);
}

.pokemon-selector--disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.pokemon-selector__input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.pokemon-selector:focus-within {
  outline: 3px solid var(--accent-soft);
  outline-offset: 2px;
}

.pokemon-card__link {
  min-height: 2.55rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.65rem;
  font-size: 0.88rem;
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

.state-card__title {
  margin: 0 0 0.55rem;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 800;
}

.state-card__text {
  max-width: 34rem;
  margin: 0 0 1rem;
  color: var(--text-secondary);
}

.state-card__loader-image {
  /*width: min(11rem, 70vw);*/
  height: auto;
  object-fit: contain;
}

.pagination-wrapper {
  margin-top: 1.5rem;
}

.btn:focus-visible,
.form-control:focus-visible,
.form-select:focus-visible,
.filters-card__clear:focus-visible,
.selection-card__clear:focus-visible {
  outline: 3px solid var(--accent-soft);
  outline-offset: 3px;
}

@media (max-width: 1199.98px) {
  .pokemons-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767.98px) {
  .pokemons-header__actions {
    flex-direction: column;
  }

  .pokemons-header__action {
    width: 100%;
  }

  .filters-grid,
  .pokemons-grid {
    grid-template-columns: 1fr;
  }

  .subformat-control {
    flex-direction: column;
  }

  .subformat-control .btn {
    width: 100%;
  }

  .selection-card {
    align-items: stretch;
    flex-direction: column;
  }

  .selection-card__actions {
    justify-content: space-between;
  }

  .pokemon-card__main {
    grid-template-columns: 6.5rem minmax(0, 1fr);
  }

  .pokemon-card__image {
    width: 6.2rem;
    height: 6.2rem;
  }

  .pokemon-card__image-placeholder {
    width: 6rem;
    height: 6rem;
  }
}

@media (max-width: 479.98px) {
  .filters-card__footer,
  .selection-card__actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .pokemon-card__main {
    grid-template-columns: 1fr;
  }

  .pokemon-card__image-wrapper {
    min-height: auto;
  }

  .pokemon-card__footer {
    grid-template-columns: 1fr;
  }

  .pokemon-card__link,
  .pokemon-selector {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pokemon-card,
  .pokemon-selector {
    transition: none;
  }

  .pokemon-card:hover {
    transform: none;
  }
}
</style>
