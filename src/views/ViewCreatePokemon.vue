<template>
  <main
    class="create-pokemon-page"
    :class="{ 'theme-dark': isDark }"
  >
    <div class="pokemon-container">
      <section class="pokemon-card">
        <header class="page-header">
          <span class="page-header__kicker">
            Biblioteca competitiva
          </span>

          <h1>{{ $t('createPokemon') }}</h1>

          <p class="page-header__description">
            Guarda un set de Pokémon Showdown junto con sus
            compañeros, cálculos y notas de uso.
          </p>

          <div class="page-header__meta" aria-hidden="true">
            <span>Showdown</span>
            <span>Análisis</span>
            <span>Subformato</span>
          </div>
        </header>

        <form
          class="pokemon-form"
          novalidate
          :aria-busy="isSubmitting"
          @submit.prevent="createPokemon"
        >
          <div class="form-grid">
            <div class="field-group full-width">
              <label for="pokemon-nickname">
                {{ $t('pokemonsSeccion.nickPokemon') }}
              </label>

              <input
                id="pokemon-nickname"
                v-model="pokemon.nickPoke"
                class="form-control"
                :class="{
                  'is-invalid':
                    touched.nickPoke && validation.nickPoke
                }"
                type="text"
                autocomplete="off"
                maxlength="80"
                :disabled="isSubmitting"
                :aria-invalid="
                  touched.nickPoke && Boolean(validation.nickPoke)
                "
                :aria-describedby="
                  touched.nickPoke && validation.nickPoke
                    ? 'pokemon-nickname-error'
                    : undefined
                "
                @blur="touched.nickPoke = true"
                @input="clearFormError"
              >

              <p
                v-if="touched.nickPoke && validation.nickPoke"
                id="pokemon-nickname-error"
                class="field-error"
              >
                {{ validation.nickPoke }}
              </p>
            </div>

            <div class="field-group full-width">
              <label for="pokemon-paste">
                {{ $t('pokemonsSeccion.dataPokemon') }}
              </label>

              <textarea
                id="pokemon-paste"
                v-model="pokemon.pasteSd"
                class="form-control paste-box"
                :class="{
                  'is-invalid':
                    touched.pasteSd && validation.pasteSd
                }"
                rows="13"
                spellcheck="false"
                :disabled="isSubmitting"
                :aria-invalid="
                  touched.pasteSd && Boolean(validation.pasteSd)
                "
                :aria-describedby="
                  touched.pasteSd && validation.pasteSd
                    ? 'pokemon-paste-error'
                    : undefined
                "
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
                @blur="touched.pasteSd = true"
                @input="clearFormError"
              />

              <p
                v-if="touched.pasteSd && validation.pasteSd"
                id="pokemon-paste-error"
                class="field-error"
              >
                {{ validation.pasteSd }}
              </p>
            </div>

            <div class="field-group full-width">
              <label for="pokemon-subformat">
                {{ $t('teamsSeccion.subFormat') }}
              </label>

              <div class="select-row">
                <select
                  id="pokemon-subformat"
                  v-model="pokemon.subFormatId"
                  class="form-control"
                  :class="{
                    'is-invalid':
                      touched.subFormatId &&
                      validation.subFormatId
                  }"
                  :disabled="
                    isSubmitting ||
                    isLoadingSubFormats ||
                    Boolean(subFormatsError)
                  "
                  :aria-invalid="
                    touched.subFormatId &&
                    Boolean(validation.subFormatId)
                  "
                  :aria-describedby="
                    touched.subFormatId &&
                    validation.subFormatId
                      ? 'pokemon-subformat-error'
                      : undefined
                  "
                  @blur="touched.subFormatId = true"
                  @change="clearFormError"
                >
                  <option disabled value="">
                    {{ $t('teamsSeccion.selectSubFormat') }}
                  </option>

                  <option
                    v-for="subFormat in subFormats"
                    :key="subFormat.id"
                    :value="String(subFormat.id)"
                  >
                    {{ subFormat.abrevSubFormat }}
                  </option>
                </select>

                <button
                  v-if="subFormatsError"
                  type="button"
                  class="retry-button"
                  :disabled="isLoadingSubFormats || isSubmitting"
                  @click="getSubFormats"
                >
                  Reintentar
                </button>
              </div>

              <p
                v-if="
                  touched.subFormatId &&
                  validation.subFormatId
                "
                id="pokemon-subformat-error"
                class="field-error"
              >
                {{ validation.subFormatId }}
              </p>

              <p
                v-if="subFormatsError"
                class="field-error"
                role="alert"
              >
                {{ subFormatsError }}
              </p>
            </div>

            <div class="field-group">
              <label for="spread-use">
                {{ $t('pokemonsSeccion.useSpread') }}
              </label>

              <textarea
                id="spread-use"
                v-model="pokemon.spreadUse"
                class="form-control"
                rows="5"
                maxlength="2000"
                :disabled="isSubmitting"
                @input="clearFormError"
              />
            </div>

            <div class="field-group">
              <label for="team-mates">
                {{ $t('pokemonsSeccion.teamMates') }}
              </label>

              <textarea
                id="team-mates"
                v-model="pokemon.teamMates"
                class="form-control"
                rows="5"
                maxlength="2000"
                :disabled="isSubmitting"
                @input="clearFormError"
              />
            </div>

            <div class="field-group full-width">
              <label for="main-calculations">
                {{ $t('pokemonsSeccion.calculations') }}
              </label>

              <textarea
                id="main-calculations"
                v-model="pokemon.calculosPrincipales"
                class="form-control"
                rows="6"
                maxlength="4000"
                :disabled="isSubmitting"
                @input="clearFormError"
              />
            </div>

            <div class="field-group full-width public-field">
              <span id="public-label" class="public-label">
                {{ $t('pokemonsSeccion.isPublic') }}
              </span>

              <label class="switch" for="pokemon-is-public">
                <input
                  id="pokemon-is-public"
                  v-model="pokemon.isPublic"
                  type="checkbox"
                  :disabled="isSubmitting"
                  aria-labelledby="public-label"
                >
                <span class="slider" aria-hidden="true" />
              </label>
            </div>
          </div>

          <p
            v-if="formError"
            class="form-error"
            role="alert"
            aria-live="assertive"
          >
            {{ formError }}
          </p>

          <button
            type="submit"
            class="submit-button"
            :disabled="
              isSubmitting ||
              isLoadingSubFormats ||
              Boolean(subFormatsError)
            "
          >
            <span
              v-if="isSubmitting"
              class="button-spinner"
              aria-hidden="true"
            />

            <span>
              {{
                isSubmitting
                  ? 'Creando...'
                  : $t('buttons.createPokemon')
              }}
            </span>
          </button>
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
  reactive,
  ref,
  unref
} from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
import { useHead } from '@vueuse/head';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '@/stores/authStore';

const STORAGE_KEY = 'formPokemon';

const apiUrl = inject('apiUrl', '');
const mode = inject('mode', 'light');

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { t } = useI18n();

const isSubmitting = ref(false);
const isLoadingSubFormats = ref(false);
const subFormatsError = ref('');
const formError = ref('');
const subFormats = ref([]);
const domTheme = ref('');

let themeObserver = null;
let requestController = null;
let subFormatsController = null;

const pokemon = reactive({
  pasteSd: '',
  spreadUse: '',
  teamMates: '',
  calculosPrincipales: '',
  nickPoke: '',
  isPublic: false,
  subFormatId: ''
});

const touched = reactive({
  pasteSd: false,
  nickPoke: false,
  subFormatId: false
});

const normalizeThemeValue = (value) => {
  const resolvedValue = unref(value);

  if (typeof resolvedValue === 'string') {
    return resolvedValue.trim().toLowerCase();
  }

  if (resolvedValue && typeof resolvedValue === 'object') {
    const nestedValue =
      resolvedValue.value ??
      resolvedValue.mode ??
      resolvedValue.theme ??
      '';

    return String(unref(nestedValue)).trim().toLowerCase();
  }

  return '';
};

const readDomTheme = () => {
  if (typeof document === 'undefined') {
    return '';
  }

  const elements = [
    document.documentElement,
    document.body
  ].filter(Boolean);

  const hasDarkTheme = elements.some((element) => {
    const explicitTheme = String(
      element.getAttribute('data-theme') ||
      element.getAttribute('data-bs-theme') ||
      ''
    ).toLowerCase();

    return (
      explicitTheme === 'dark' ||
      element.classList.contains('dark') ||
      element.classList.contains('dark-mode') ||
      element.classList.contains('theme-dark') ||
      element.classList.contains('is-dark')
    );
  });

  return hasDarkTheme ? 'dark' : 'light';
};

const syncDomTheme = () => {
  domTheme.value = readDomTheme();
};

const isDark = computed(() => {
  const injectedTheme = normalizeThemeValue(mode);

  return (
    ['dark', 'dark-mode', 'theme-dark', 'is-dark'].includes(
      injectedTheme
    ) ||
    domTheme.value === 'dark'
  );
});

const validation = computed(() => ({
  nickPoke:
    pokemon.nickPoke.trim().length < 2
      ? 'Ingresa un nombre de al menos 2 caracteres.'
      : '',
  pasteSd:
    pokemon.pasteSd.trim().length < 10
      ? 'Ingresa la información del Pokémon.'
      : '',
  subFormatId:
    !pokemon.subFormatId
      ? 'Selecciona un subformato.'
      : ''
}));

const hasValidationErrors = computed(() =>
  Object.values(validation.value).some(Boolean)
);

useHead({
  title: computed(() => t('createPokemon')),
  meta: [
    {
      name: 'description',
      content: computed(() => t('createPokemon'))
    },
    {
      name: 'keywords',
      content:
        'VGC, Pokémon, Team, Tournament, Regional, International Championship, Global Challenge'
    }
  ]
});

const buildApiUrl = (path) => {
  const baseUrl = String(unref(apiUrl) || '').replace(/\/+$/, '');
  const cleanPath = String(path || '').replace(/^\/+/, '');

  return `${baseUrl}/${cleanPath}`;
};

const clearFormError = () => {
  formError.value = '';
};

const touchRequiredFields = () => {
  touched.nickPoke = true;
  touched.pasteSd = true;
  touched.subFormatId = true;
};

const normalizeSubFormats = (data) => {
  const source = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];

  return source
    .filter(
      (subFormat) =>
        subFormat &&
        subFormat.id != null &&
        typeof subFormat.abrevSubFormat === 'string'
    )
    .map((subFormat) => ({
      ...subFormat,
      abrevSubFormat: subFormat.abrevSubFormat.trim()
    }))
    .filter((subFormat) => subFormat.abrevSubFormat);
};

const createSerializablePokemon = () => ({
  pasteSd: pokemon.pasteSd,
  spreadUse: pokemon.spreadUse,
  teamMates: pokemon.teamMates,
  calculosPrincipales: pokemon.calculosPrincipales,
  nickPoke: pokemon.nickPoke,
  isPublic: Boolean(pokemon.isPublic),
  subFormatId: pokemon.subFormatId
});

const restoreStoredPokemon = () => {
  const storedValue = localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return;
  }

  try {
    const storedPokemon = JSON.parse(storedValue);

    if (!storedPokemon || typeof storedPokemon !== 'object') {
      throw new Error('INVALID_STORED_POKEMON');
    }

    pokemon.pasteSd = String(
      storedPokemon.pasteSd ?? storedPokemon.paste_sd ?? ''
    );
    pokemon.spreadUse = String(
      storedPokemon.spreadUse ?? storedPokemon.spread_use ?? ''
    );
    pokemon.teamMates = String(
      storedPokemon.teamMates ?? storedPokemon.team_mates ?? ''
    );
    pokemon.calculosPrincipales = String(
      storedPokemon.calculosPrincipales ??
      storedPokemon.calculos_principales ??
      ''
    );
    pokemon.nickPoke = String(
      storedPokemon.nickPoke ?? storedPokemon.nick_poke ?? ''
    );
    pokemon.isPublic = Boolean(
      storedPokemon.isPublic ?? storedPokemon.is_public
    );

    const storedSubFormat =
      storedPokemon.subFormatId ??
      storedPokemon.sub_format_id ??
      '';

    pokemon.subFormatId =
      storedSubFormat === null || storedSubFormat === undefined
        ? ''
        : String(storedSubFormat);
  } catch (error) {
    console.error(
      'No se pudo restaurar el formulario del Pokémon:',
      error
    );
    localStorage.removeItem(STORAGE_KEY);
  }
};

const getSubFormats = async () => {
  if (isLoadingSubFormats.value) {
    return;
  }

  isLoadingSubFormats.value = true;
  subFormatsError.value = '';

  subFormatsController?.abort();
  subFormatsController = new AbortController();

  try {
    const response = await axios.get(
      buildApiUrl('subformats'),
      {
        signal: subFormatsController.signal
      }
    );

    const normalizedSubFormats = normalizeSubFormats(
      response?.data
    );

    if (!normalizedSubFormats.length) {
      throw new Error('EMPTY_SUBFORMATS');
    }

    subFormats.value = normalizedSubFormats;
  } catch (error) {
    if (
      error?.name === 'CanceledError' ||
      error?.code === 'ERR_CANCELED'
    ) {
      return;
    }

    console.error('Error al obtener subformatos:', error);
    subFormats.value = [];
    subFormatsError.value =
      'No se pudieron cargar los subformatos.';
  } finally {
    isLoadingSubFormats.value = false;
    subFormatsController = null;
  }
};

const getAuthenticatedUserId = () => {
  const token = authStore.token;

  if (!authStore.isAuthenticated || !token) {
    return null;
  }

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken?.userId ?? decodedToken?.id ?? null;
  } catch (error) {
    console.error('Token inválido:', error);
    return null;
  }
};

const redirectToLogin = async () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(createSerializablePokemon())
  );

  await router.push({
    path: '/login',
    query: {
      redirect: route.fullPath
    }
  });
};

const createPayload = (userId) => ({
  pasteSd: pokemon.pasteSd.trim(),
  userId,
  spreadUse: pokemon.spreadUse.trim(),
  teamMates: pokemon.teamMates.trim(),
  calculosPrincipales:
    pokemon.calculosPrincipales.trim(),
  nickPoke: pokemon.nickPoke.trim(),
  isPublic: Boolean(pokemon.isPublic),
  subFormatId: Number(pokemon.subFormatId)
});

const isSuccessfulResponse = (data) =>
  data?.salida?.[0]?.status === 'success' ||
  data?.status === 'success' ||
  data?.success === true;

const createPokemon = async () => {
  if (isSubmitting.value) {
    return;
  }

  touchRequiredFields();
  clearFormError();

  if (hasValidationErrors.value) {
    formError.value =
      'Revisa los campos obligatorios antes de continuar.';
    return;
  }

  const userId = getAuthenticatedUserId();

  if (userId == null) {
    await redirectToLogin();
    return;
  }

  isSubmitting.value = true;
  requestController = new AbortController();

  try {
    const response = await axios.post(
      buildApiUrl('pokemon'),
      createPayload(userId),
      {
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        signal: requestController.signal
      }
    );

    if (!isSuccessfulResponse(response?.data)) {
      throw new Error(
        response?.data?.message || 'CREATE_POKEMON_FAILED'
      );
    }

    localStorage.removeItem(STORAGE_KEY);

    await Swal.fire({
      title: t('responseApisSeccion.addPokemonTitle'),
      text: t('responseApisSeccion.addPokemonSuccess'),
      icon: 'success',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    });

    const redirectTo =
      typeof route.query.redirect === 'string'
        ? route.query.redirect
        : '/';

    await router.replace(redirectTo);
  } catch (error) {
    if (
      error?.name === 'CanceledError' ||
      error?.code === 'ERR_CANCELED'
    ) {
      return;
    }

    console.error('Error al crear el Pokémon:', error);

    formError.value =
      error?.response?.data?.message ||
      t('responseApisSeccion.addPokemonError');

    await Swal.fire({
      title: t('responseApisSeccion.addPokemonTitle'),
      text: formError.value,
      icon: 'error'
    });
  } finally {
    isSubmitting.value = false;
    requestController = null;
  }
};

onMounted(() => {
  syncDomTheme();

  if (
    typeof MutationObserver !== 'undefined' &&
    typeof document !== 'undefined'
  ) {
    themeObserver = new MutationObserver(syncDomTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      subtree: true,
      attributeFilter: [
        'class',
        'data-theme',
        'data-bs-theme'
      ]
    });
  }

  restoreStoredPokemon();
  getSubFormats();
});

onBeforeUnmount(() => {
  themeObserver?.disconnect();
  requestController?.abort();
  subFormatsController?.abort();
});
</script>

<style scoped>
.create-pokemon-page {
  --page-bg: #f3f6f5;
  --surface: #ffffff;
  --surface-muted: #f3f6f5;
  --surface-accent: #f5fbf7;
  --text-primary: #1f2a25;
  --text-secondary: #647068;
  --border-color: #dce4df;
  --input-border: #cad6cf;
  --accent: #198754;
  --accent-strong: #126b42;
  --accent-soft: rgba(25, 135, 84, 0.12);
  --accent-border: rgba(25, 135, 84, 0.42);
  --accent-glow: rgba(25, 135, 84, 0.22);
  --danger: #c92a2a;
  --danger-soft: rgba(201, 42, 42, 0.08);
  --shadow: 0 16px 40px rgba(25, 50, 37, 0.08);

  min-height: 100dvh;
  padding: clamp(1rem, 3vw, 2.5rem) 0;
  background:
    radial-gradient(
      circle at 50% 0%,
      rgba(25, 135, 84, 0.1),
      transparent 30rem
    ),
    radial-gradient(
      circle at 100% 30%,
      rgba(25, 135, 84, 0.06),
      transparent 22rem
    ),
    var(--page-bg);
  color: var(--text-primary);
}

.create-pokemon-page.theme-dark {
  --page-bg: #101412;
  --surface: #19201c;
  --surface-muted: #222b26;
  --surface-accent: #1c2821;
  --text-primary: #eef5f1;
  --text-secondary: #aab8b0;
  --border-color: #334139;
  --input-border: #435248;
  --accent: #37be78;
  --accent-strong: #5bd68f;
  --accent-soft: rgba(55, 190, 120, 0.14);
  --accent-border: rgba(55, 190, 120, 0.48);
  --accent-glow: rgba(55, 190, 120, 0.2);
  --danger: #ff8787;
  --danger-soft: rgba(255, 135, 135, 0.1);
  --shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
}

.create-pokemon-page,
.create-pokemon-page * {
  box-sizing: border-box;
}

.pokemon-container {
  width: min(calc(100% - 2rem), 68rem);
  margin: 0 auto;
}

.pokemon-card {
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 1.25rem;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.page-header {
  padding: clamp(1.5rem, 4vw, 2.5rem);
  border-bottom: 1px solid var(--border-color);
  background:
    linear-gradient(
      145deg,
      var(--accent-soft),
      transparent 58%
    ),
    var(--surface);
  text-align: center;
}

.page-header__kicker {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  margin-bottom: 0.75rem;
  padding: 0.3rem 0.75rem;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.07em;
  text-transform: uppercase;
}

.page-header h1 {
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(1.8rem, 4vw, 2.65rem);
  font-weight: 850;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.page-header__description {
  max-width: 42rem;
  margin: 0.8rem auto 0;
  color: var(--text-secondary);
  line-height: 1.65;
  text-wrap: balance;
}

.page-header__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1.1rem;
}

.page-header__meta span {
  padding: 0.32rem 0.65rem;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--surface-muted);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 750;
}

.pokemon-form {
  width: 100%;
  padding: clamp(1rem, 3vw, 2rem);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.field-group {
  min-width: 0;
}

.full-width {
  grid-column: 1 / -1;
}

.field-group label,
.public-label {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--text-primary);
  font-weight: 800;
  line-height: 1.35;
}

.form-control {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 3rem;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--input-border);
  border-radius: 0.75rem;
  outline: none;
  background: var(--surface-muted);
  color: var(--text-primary);
  font: inherit;
  line-height: 1.45;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    transform 160ms ease;
}

textarea.form-control {
  resize: vertical;
}

.form-control::placeholder {
  color: var(--text-secondary);
  opacity: 0.78;
}

.form-control:hover:not(:disabled) {
  border-color: var(--accent-border);
}

.form-control:focus {
  border-color: var(--accent);
  background: var(--surface);
  box-shadow: 0 0 0 0.22rem var(--accent-soft);
}

.form-control.is-invalid {
  border-color: var(--danger);
  box-shadow: 0 0 0 0.18rem var(--danger-soft);
}

.form-control:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.create-pokemon-page.theme-dark select.form-control {
  color-scheme: dark;
}

.paste-box {
  min-height: 17rem;
  border-color: var(--accent-border);
  background:
    linear-gradient(
      145deg,
      var(--accent-soft),
      transparent 48%
    ),
    var(--surface-muted);
  font-family:
    ui-monospace,
    SFMono-Regular,
    Menlo,
    Monaco,
    Consolas,
    "Liberation Mono",
    "Courier New",
    monospace;
  font-size: 0.9rem;
  tab-size: 2;
  white-space: pre-wrap;
}

.paste-box:focus {
  background: var(--surface);
}

.select-row {
  display: flex;
  gap: 0.65rem;
  align-items: stretch;
}

.select-row .form-control {
  min-width: 0;
  flex: 1;
}

.retry-button {
  min-height: 3rem;
  padding: 0.65rem 0.95rem;
  border: 1px solid var(--accent);
  border-radius: 0.75rem;
  background: transparent;
  color: var(--accent);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    transform 150ms ease;
}

.retry-button:hover:not(:disabled) {
  background: var(--accent-soft);
  transform: translateY(-1px);
}

.retry-button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.public-field {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid var(--accent-border);
  border-radius: 0.9rem;
  background:
    linear-gradient(
      145deg,
      var(--accent-soft),
      transparent 70%
    ),
    var(--surface-accent);
}

.public-label {
  margin: 0;
}

.switch {
  position: relative;
  width: 3.25rem;
  height: 1.75rem;
  flex: 0 0 3.25rem;
  cursor: pointer;
}

.switch input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.slider {
  position: absolute;
  inset: 0;
  border: 1px solid var(--input-border);
  border-radius: 999px;
  background: var(--surface-muted);
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.slider::before {
  position: absolute;
  top: 0.19rem;
  left: 0.2rem;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 2px 6px rgba(15, 25, 19, 0.22);
  content: "";
  transition: transform 160ms ease;
}

.switch input:checked + .slider {
  border-color: var(--accent);
  background: var(--accent);
}

.switch input:checked + .slider::before {
  transform: translateX(1.43rem);
}

.switch input:focus-visible + .slider {
  box-shadow: 0 0 0 0.22rem var(--accent-soft);
}

.switch input:disabled + .slider {
  cursor: not-allowed;
  opacity: 0.62;
}

.field-error {
  margin: 0.4rem 0 0;
  color: var(--danger);
  font-size: 0.86rem;
  font-weight: 650;
  line-height: 1.4;
}

.form-error {
  margin: 1.1rem 0 0;
  padding: 0.85rem 1rem;
  border: 1px solid var(--danger);
  border-radius: 0.75rem;
  background: var(--danger-soft);
  color: var(--danger);
  font-weight: 750;
  text-align: center;
}

.submit-button {
  display: inline-flex;
  width: 100%;
  min-height: 3.15rem;
  gap: 0.55rem;
  align-items: center;
  justify-content: center;
  margin-top: 1.25rem;
  padding: 0.78rem 1.1rem;
  border: 0;
  border-radius: 0.8rem;
  background:
    linear-gradient(
      135deg,
      var(--accent-strong),
      var(--accent)
    );
  color: #ffffff;
  font: inherit;
  font-weight: 850;
  cursor: pointer;
  box-shadow: 0 10px 22px var(--accent-glow);
  transition:
    filter 140ms ease,
    transform 140ms ease,
    box-shadow 140ms ease;
}

.submit-button:hover:not(:disabled) {
  filter: brightness(1.04);
  transform: translateY(-2px);
  box-shadow: 0 14px 28px var(--accent-glow);
}

.submit-button:focus-visible,
.retry-button:focus-visible,
.form-control:focus-visible {
  outline: 3px solid var(--accent-soft);
  outline-offset: 3px;
}

.submit-button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
  box-shadow: none;
}

.button-spinner {
  display: inline-block;
  width: 1.1rem;
  height: 1.1rem;
  border: 3px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767.98px) {
  .create-pokemon-page {
    padding: 0.75rem 0;
  }

  .pokemon-container {
    width: min(calc(100% - 1rem), 68rem);
  }

  .pokemon-card {
    border-radius: 1rem;
  }

  .page-header {
    padding: 1.4rem 1rem;
  }

  .pokemon-form {
    padding: 1rem;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }

  .select-row {
    flex-direction: column;
  }

  .retry-button {
    width: 100%;
  }
}

@media (max-width: 420px) {
  .page-header__meta {
    display: none;
  }

  .public-field {
    align-items: flex-start;
  }
}

@media (prefers-reduced-motion: reduce) {
  .form-control,
  .slider,
  .slider::before,
  .submit-button,
  .retry-button {
    transition: none;
  }

  .submit-button:hover:not(:disabled),
  .retry-button:hover:not(:disabled) {
    transform: none;
  }

  .button-spinner {
    animation-duration: 1.4s;
  }
}


/* Refuerzo de contraste para controles en modo oscuro. */
.create-pokemon-page.theme-dark {
  color-scheme: dark;
}

.create-pokemon-page.theme-dark .form-control,
.create-pokemon-page.theme-dark input:not([type='checkbox']):not([type='radio']),
.create-pokemon-page.theme-dark textarea,
.create-pokemon-page.theme-dark select {
  background-color: var(--surface-muted) !important;
  color: var(--text-primary) !important;
  caret-color: var(--accent);
  -webkit-text-fill-color: var(--text-primary) !important;
}

.create-pokemon-page.theme-dark .form-control:focus,
.create-pokemon-page.theme-dark input:not([type='checkbox']):not([type='radio']):focus,
.create-pokemon-page.theme-dark textarea:focus,
.create-pokemon-page.theme-dark select:focus {
  background-color: var(--surface) !important;
  color: var(--text-primary) !important;
  -webkit-text-fill-color: var(--text-primary) !important;
}

.create-pokemon-page.theme-dark .form-control::placeholder,
.create-pokemon-page.theme-dark input::placeholder,
.create-pokemon-page.theme-dark textarea::placeholder {
  color: var(--text-secondary) !important;
  opacity: 0.9;
  -webkit-text-fill-color: var(--text-secondary) !important;
}

.create-pokemon-page.theme-dark select option {
  background: var(--surface);
  color: var(--text-primary);
}

.create-pokemon-page.theme-dark input:-webkit-autofill,
.create-pokemon-page.theme-dark input:-webkit-autofill:hover,
.create-pokemon-page.theme-dark input:-webkit-autofill:focus,
.create-pokemon-page.theme-dark textarea:-webkit-autofill,
.create-pokemon-page.theme-dark select:-webkit-autofill {
  border-color: var(--input-border);
  -webkit-box-shadow: 0 0 0 1000px var(--surface-muted) inset !important;
  box-shadow: 0 0 0 1000px var(--surface-muted) inset !important;
  -webkit-text-fill-color: var(--text-primary) !important;
  caret-color: var(--accent);
}

</style>