<template>
  <main
    class="create-team-page"
    :class="{ 'theme-dark': isDark }"
  >
    <div class="team-container">
      <section class="team-card">
        <header class="page-header">
          <span class="page-header__kicker">
            Constructor competitivo
          </span>

          <h1>{{ $t('createTeam') }}</h1>

          <p class="page-header__description">
            Importa un Poképaste o un equipo de Showdown y agrega
            toda la información necesaria para compartirlo.
          </p>

          <div class="page-header__meta" aria-hidden="true">
            <span>Poképaste</span>
            <span>Showdown</span>
            <span>Rental team</span>
          </div>
        </header>

        <form
          class="team-form"
          novalidate
          :aria-busy="isSubmitting"
          @submit.prevent="saveTeam"
        >
          <div class="form-layout">
            <section class="paste-panel">
              <div class="field-group paste-field">
                <label for="team-raw-input">
                  {{ $t('teamsSeccion.urlPaste') }}
                </label>

                <textarea
                  id="team-raw-input"
                  v-model="team.rawInput"
                  class="form-control big-textarea"
                  :class="{
                    'is-invalid':
                      touched.rawInput && validation.rawInput
                  }"
                  spellcheck="false"
                  :disabled="isSubmitting"
                  :aria-invalid="
                    touched.rawInput &&
                    Boolean(validation.rawInput)
                  "
                  :aria-describedby="
                    touched.rawInput && validation.rawInput
                      ? 'team-raw-input-error'
                      : undefined
                  "
                  placeholder="https://pokepast.es/...

o pega aquí el equipo completo de Pokémon Showdown..."
                  @blur="touched.rawInput = true"
                  @input="clearFormError"
                />

                <p
                  v-if="
                    touched.rawInput &&
                    validation.rawInput
                  "
                  id="team-raw-input-error"
                  class="field-error"
                >
                  {{ validation.rawInput }}
                </p>
              </div>
            </section>

            <section class="details-panel">
              <div class="form-grid">
                <div class="field-group full-width">
                  <label for="team-name">
                    {{ $t('teamsSeccion.name') }}
                  </label>

                  <input
                    id="team-name"
                    v-model="team.teamName"
                    class="form-control"
                    :class="{
                      'is-invalid':
                        touched.teamName &&
                        validation.teamName
                    }"
                    type="text"
                    autocomplete="off"
                    maxlength="120"
                    :disabled="isSubmitting"
                    :aria-invalid="
                      touched.teamName &&
                      Boolean(validation.teamName)
                    "
                    :aria-describedby="
                      touched.teamName &&
                      validation.teamName
                        ? 'team-name-error'
                        : undefined
                    "
                    @blur="touched.teamName = true"
                    @input="clearFormError"
                  >

                  <p
                    v-if="
                      touched.teamName &&
                      validation.teamName
                    "
                    id="team-name-error"
                    class="field-error"
                  >
                    {{ validation.teamName }}
                  </p>
                </div>

                <div class="field-group">
                  <label for="team-format">
                    {{ $t('teamsSeccion.format') }}
                  </label>

                  <div class="select-row">
                    <select
                      id="team-format"
                      v-model="team.formatId"
                      class="form-control"
                      :class="{
                        'is-invalid':
                          touched.formatId &&
                          validation.formatId
                      }"
                      :disabled="
                        isSubmitting ||
                        isLoadingFormats ||
                        Boolean(formatsError)
                      "
                      :aria-invalid="
                        touched.formatId &&
                        Boolean(validation.formatId)
                      "
                      :aria-describedby="
                        touched.formatId &&
                        validation.formatId
                          ? 'team-format-error'
                          : undefined
                      "
                      @blur="touched.formatId = true"
                      @change="clearFormError"
                    >
                      <option disabled value="">
                        {{
                          isLoadingFormats
                            ? 'Cargando...'
                            : $t('teamsSeccion.selectFormat')
                        }}
                      </option>

                      <option
                        v-for="format in formats"
                        :key="format.id"
                        :value="String(format.id)"
                      >
                        {{ format.formatName }}
                      </option>
                    </select>

                    <button
                      v-if="formatsError"
                      type="button"
                      class="retry-button"
                      :disabled="
                        isLoadingFormats || isSubmitting
                      "
                      @click="fetchFormats"
                    >
                      Reintentar
                    </button>
                  </div>

                  <p
                    v-if="
                      touched.formatId &&
                      validation.formatId
                    "
                    id="team-format-error"
                    class="field-error"
                  >
                    {{ validation.formatId }}
                  </p>

                  <p
                    v-if="formatsError"
                    class="field-error"
                    role="alert"
                  >
                    {{ formatsError }}
                  </p>
                </div>

                <div class="field-group">
                  <label for="team-subformat">
                    {{ $t('teamsSeccion.subFormat') }}
                  </label>

                  <div class="select-row">
                    <select
                      id="team-subformat"
                      v-model="team.subFormatId"
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
                          ? 'team-subformat-error'
                          : undefined
                      "
                      @blur="touched.subFormatId = true"
                      @change="clearFormError"
                    >
                      <option disabled value="">
                        {{
                          isLoadingSubFormats
                            ? 'Cargando...'
                            : $t('teamsSeccion.selectSubFormat')
                        }}
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
                      :disabled="
                        isLoadingSubFormats || isSubmitting
                      "
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
                    id="team-subformat-error"
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

                <div class="field-group full-width">
                  <label for="team-rental-code">
                    {{ $t('teamsSeccion.codeRental') }}
                  </label>

                  <input
                    id="team-rental-code"
                    v-model="team.codeRental"
                    class="form-control"
                    type="text"
                    autocomplete="off"
                    maxlength="100"
                    :disabled="isSubmitting"
                    @input="clearFormError"
                  >
                </div>

                <div class="field-group full-width">
                  <label for="team-description">
                    {{ $t('teamsSeccion.description') }}
                  </label>

                  <textarea
                    id="team-description"
                    v-model="team.descUso"
                    class="form-control"
                    rows="4"
                    maxlength="3000"
                    :disabled="isSubmitting"
                    @input="clearFormError"
                  />
                </div>

                <div class="field-group full-width">
                  <label for="team-tournament">
                    {{ $t('teamsSeccion.tournament') }}
                  </label>

                  <input
                    id="team-tournament"
                    v-model="team.tournamentUsing"
                    class="form-control"
                    type="text"
                    autocomplete="off"
                    maxlength="160"
                    :disabled="isSubmitting"
                    @input="clearFormError"
                  >
                </div>

                <div class="field-group">
                  <label for="team-favorable-matchups">
                    {{ $t('teamsSeccion.musFav') }}
                  </label>

                  <textarea
                    id="team-favorable-matchups"
                    v-model="team.musFav"
                    class="form-control"
                    rows="5"
                    maxlength="3000"
                    :disabled="isSubmitting"
                    @input="clearFormError"
                  />
                </div>

                <div class="field-group">
                  <label for="team-counters">
                    {{ $t('teamsSeccion.teamsCounter') }}
                  </label>

                  <textarea
                    id="team-counters"
                    v-model="team.counters"
                    class="form-control"
                    rows="5"
                    maxlength="3000"
                    :disabled="isSubmitting"
                    @input="clearFormError"
                  />
                </div>

                <div class="field-group full-width">
                  <label for="team-damage-calculations">
                    {{ $t('teamsSeccion.damageCalcs') }}
                  </label>

                  <textarea
                    id="team-damage-calculations"
                    v-model="team.damageCalcs"
                    class="form-control"
                    rows="6"
                    maxlength="5000"
                    :disabled="isSubmitting"
                    @input="clearFormError"
                  />
                </div>

                <div class="field-group full-width public-field">
                  <span id="team-public-label" class="public-label">
                    {{ $t('teamsSeccion.isPublic') }}
                  </span>

                  <label class="switch" for="team-is-public">
                    <input
                      id="team-is-public"
                      v-model="team.isPublic"
                      type="checkbox"
                      :disabled="isSubmitting"
                      aria-labelledby="team-public-label"
                    >
                    <span class="slider" aria-hidden="true" />
                  </label>
                </div>
              </div>
            </section>
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
              isLoadingFormats ||
              isLoadingSubFormats ||
              Boolean(formatsError) ||
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
                  : $t('buttons.createTeam')
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

const STORAGE_KEY = 'formTeam';

const apiUrl = inject('apiUrl', '');
const mode = inject('mode', 'light');

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const { t } = useI18n();

const isSubmitting = ref(false);
const isLoadingFormats = ref(false);
const isLoadingSubFormats = ref(false);
const formatsError = ref('');
const subFormatsError = ref('');
const formError = ref('');

const formats = ref([]);
const subFormats = ref([]);
const domTheme = ref('');

let themeObserver = null;
let requestController = null;
let formatsController = null;
let subFormatsController = null;

const team = reactive({
  teamName: '',
  rawInput: '',
  formatId: '',
  subFormatId: '',
  descUso: '',
  codeRental: '',
  tournamentUsing: '',
  musFav: '',
  counters: '',
  damageCalcs: '',
  isPublic: false
});

const touched = reactive({
  teamName: false,
  rawInput: false,
  formatId: false,
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
  teamName:
    team.teamName.trim().length < 2
      ? 'Ingresa un nombre de al menos 2 caracteres.'
      : '',
  rawInput:
    team.rawInput.trim().length < 10
      ? 'Debes pegar un Poképaste o un equipo de Showdown.'
      : '',
  formatId:
    !team.formatId
      ? `${t('teamsSeccion.format')} es obligatorio.`
      : '',
  subFormatId:
    !team.subFormatId
      ? `${t('teamsSeccion.subFormat')} es obligatorio.`
      : ''
}));

const hasValidationErrors = computed(() =>
  Object.values(validation.value).some(Boolean)
);

useHead({
  title: computed(() => t('createTeam')),
  meta: [
    {
      name: 'description',
      content: computed(() => t('createTeam'))
    },
    {
      name: 'keywords',
      content:
        'VGC, Pokémon, Team, Tournament, Regional, International Championship, Global Challenge, Pokémon Champions'
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
  touched.teamName = true;
  touched.rawInput = true;
  touched.formatId = true;
  touched.subFormatId = true;
};

const normalizeFormats = (data) => {
  const source = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];

  return source
    .filter(
      (format) =>
        format &&
        format.id != null &&
        typeof format.formatName === 'string'
    )
    .map((format) => ({
      ...format,
      formatName: format.formatName.trim()
    }))
    .filter((format) => format.formatName);
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

const fetchFormats = async () => {
  if (isLoadingFormats.value) {
    return;
  }

  isLoadingFormats.value = true;
  formatsError.value = '';

  formatsController?.abort();
  formatsController = new AbortController();

  try {
    const response = await axios.get(
      buildApiUrl('formats'),
      {
        signal: formatsController.signal
      }
    );

    const normalizedFormats = normalizeFormats(response?.data);

    if (!normalizedFormats.length) {
      throw new Error('EMPTY_FORMATS');
    }

    formats.value = normalizedFormats;
  } catch (error) {
    if (
      error?.name === 'CanceledError' ||
      error?.code === 'ERR_CANCELED'
    ) {
      return;
    }

    console.error('Error al obtener formatos:', error);
    formats.value = [];
    formatsError.value = 'No se pudieron cargar los formatos.';
  } finally {
    isLoadingFormats.value = false;
    formatsController = null;
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

const createSerializableTeam = () => ({
  teamName: team.teamName,
  rawInput: team.rawInput,
  formatId: team.formatId,
  subFormatId: team.subFormatId,
  descUso: team.descUso,
  codeRental: team.codeRental,
  tournamentUsing: team.tournamentUsing,
  musFav: team.musFav,
  counters: team.counters,
  damageCalcs: team.damageCalcs,
  isPublic: Boolean(team.isPublic)
});

const restoreStoredTeam = () => {
  const storedValue = localStorage.getItem(STORAGE_KEY);

  if (!storedValue) {
    return;
  }

  try {
    const storedTeam = JSON.parse(storedValue);

    if (!storedTeam || typeof storedTeam !== 'object') {
      throw new Error('INVALID_STORED_TEAM');
    }

    team.teamName = String(storedTeam.teamName || '');
    team.rawInput = String(
      storedTeam.rawInput ||
      storedTeam.urlPaste ||
      storedTeam.showdownText ||
      ''
    );
    team.formatId =
      storedTeam.formatId == null
        ? ''
        : String(storedTeam.formatId);
    team.subFormatId =
      storedTeam.subFormatId == null
        ? ''
        : String(storedTeam.subFormatId);
    team.descUso = String(storedTeam.descUso || '');
    team.codeRental = String(storedTeam.codeRental || '');
    team.tournamentUsing = String(
      storedTeam.tournamentUsing || ''
    );
    team.musFav = String(storedTeam.musFav || '');
    team.counters = String(storedTeam.counters || '');
    team.damageCalcs = String(
      storedTeam.damageCalcs || ''
    );
    team.isPublic = Boolean(storedTeam.isPublic);
  } catch (error) {
    console.error(
      'No se pudo restaurar el formulario del equipo:',
      error
    );
    localStorage.removeItem(STORAGE_KEY);
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
    JSON.stringify(createSerializableTeam())
  );

  await router.push({
    path: '/login',
    query: {
      redirect: route.fullPath
    }
  });
};

const normalizeId = (value) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : value;
};

const isPokepasteUrl = (value) => {
  try {
    const parsedUrl = new URL(value);

    return (
      ['http:', 'https:'].includes(parsedUrl.protocol) &&
      (
        parsedUrl.hostname === 'pokepast.es' ||
        parsedUrl.hostname.endsWith('.pokepast.es')
      )
    );
  } catch {
    return false;
  }
};

const createPayload = (userId) => {
  const rawInput = team.rawInput.trim();
  const usesPokepaste = isPokepasteUrl(rawInput);

  return {
    teamName: team.teamName.trim(),
    rawInput,
    urlPaste: usesPokepaste ? rawInput : null,
    showdownText: usesPokepaste ? null : rawInput,
    formatId: normalizeId(team.formatId),
    subFormatId: normalizeId(team.subFormatId),
    dateCreated: new Date().toISOString(),
    userId,
    descUso: team.descUso.trim(),
    codeRental: team.codeRental.trim(),
    tournamentUsing: team.tournamentUsing.trim(),
    musFav: team.musFav.trim(),
    counters: team.counters.trim(),
    damageCalcs: team.damageCalcs.trim(),
    isPublic: Boolean(team.isPublic)
  };
};

const isSuccessfulResponse = (data) =>
  data?.salida?.[0]?.status === 'success' ||
  data?.status === 'success' ||
  data?.success === true;

const saveTeam = async () => {
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
      buildApiUrl('teams'),
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
        response?.data?.message || 'CREATE_TEAM_FAILED'
      );
    }

    localStorage.removeItem(STORAGE_KEY);

    await Swal.fire({
      title: t('responseApisSeccion.addTeamTitle'),
      text: t('responseApisSeccion.addTeamSuccess'),
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

    console.error('Error al crear equipo:', error);

    formError.value =
      error?.response?.data?.message ||
      t('responseApisSeccion.addTeamError');

    await Swal.fire({
      title: t('responseApisSeccion.addTeamTitle'),
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

  restoreStoredTeam();
  fetchFormats();
  getSubFormats();
});

onBeforeUnmount(() => {
  themeObserver?.disconnect();
  requestController?.abort();
  formatsController?.abort();
  subFormatsController?.abort();
});
</script>

<style scoped>
.create-team-page {
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

.create-team-page.theme-dark {
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

.create-team-page,
.create-team-page * {
  box-sizing: border-box;
}

.team-container {
  width: min(calc(100% - 2rem), 88rem);
  margin: 0 auto;
}

.team-card {
  min-width: 0;
}

.page-header {
  max-width: 52rem;
  margin: 0 auto 1.5rem;
  padding: clamp(1.25rem, 3vw, 2rem);
  border: 1px solid var(--border-color);
  border-radius: 1.15rem;
  background:
    linear-gradient(
      145deg,
      var(--accent-soft),
      transparent 58%
    ),
    var(--surface);
  box-shadow: var(--shadow);
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

.team-form {
  width: 100%;
}

.form-layout {
  display: grid;
  grid-template-columns:
    minmax(20rem, 0.82fr)
    minmax(0, 1.35fr);
  gap: 1.25rem;
  align-items: stretch;
}

.paste-panel,
.details-panel {
  min-width: 0;
  padding: clamp(1rem, 2.5vw, 1.5rem);
  border: 1px solid var(--border-color);
  border-radius: 1.1rem;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.paste-panel,
.paste-field {
  display: flex;
  min-height: 100%;
  flex-direction: column;
}

.paste-field {
  flex: 1;
}

.big-textarea {
  min-height: 43rem;
  flex: 1;
  border-color: var(--accent-border);
  background:
    linear-gradient(
      145deg,
      var(--accent-soft),
      transparent 42%
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

.big-textarea:focus {
  background: var(--surface);
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

.create-team-page.theme-dark select.form-control {
  color-scheme: dark;
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
  width: min(100%, 26rem);
  min-height: 3.15rem;
  gap: 0.55rem;
  align-items: center;
  justify-content: center;
  margin: 1.35rem auto 0;
  padding: 0.78rem 1.2rem;
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

@media (max-width: 1050px) {
  .form-layout {
    grid-template-columns: 1fr;
  }

  .big-textarea {
    min-height: 23rem;
  }
}

@media (max-width: 767.98px) {
  .create-team-page {
    padding: 0.75rem 0;
  }

  .team-container {
    width: min(calc(100% - 1rem), 88rem);
  }

  .page-header,
  .paste-panel,
  .details-panel {
    border-radius: 1rem;
  }

  .page-header {
    padding: 1.4rem 1rem;
  }

  .paste-panel,
  .details-panel {
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

  .submit-button {
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
.create-team-page.theme-dark {
  color-scheme: dark;
}

.create-team-page.theme-dark .form-control,
.create-team-page.theme-dark input:not([type='checkbox']):not([type='radio']),
.create-team-page.theme-dark textarea,
.create-team-page.theme-dark select {
  background-color: var(--surface-muted) !important;
  color: var(--text-primary) !important;
  caret-color: var(--accent);
  -webkit-text-fill-color: var(--text-primary) !important;
}

.create-team-page.theme-dark .form-control:focus,
.create-team-page.theme-dark input:not([type='checkbox']):not([type='radio']):focus,
.create-team-page.theme-dark textarea:focus,
.create-team-page.theme-dark select:focus {
  background-color: var(--surface) !important;
  color: var(--text-primary) !important;
  -webkit-text-fill-color: var(--text-primary) !important;
}

.create-team-page.theme-dark .form-control::placeholder,
.create-team-page.theme-dark input::placeholder,
.create-team-page.theme-dark textarea::placeholder {
  color: var(--text-secondary) !important;
  opacity: 0.9;
  -webkit-text-fill-color: var(--text-secondary) !important;
}

.create-team-page.theme-dark select option {
  background: var(--surface);
  color: var(--text-primary);
}

.create-team-page.theme-dark input:-webkit-autofill,
.create-team-page.theme-dark input:-webkit-autofill:hover,
.create-team-page.theme-dark input:-webkit-autofill:focus,
.create-team-page.theme-dark textarea:-webkit-autofill,
.create-team-page.theme-dark select:-webkit-autofill {
  border-color: var(--input-border);
  -webkit-box-shadow: 0 0 0 1000px var(--surface-muted) inset !important;
  box-shadow: 0 0 0 1000px var(--surface-muted) inset !important;
  -webkit-text-fill-color: var(--text-primary) !important;
  caret-color: var(--accent);
}

</style>