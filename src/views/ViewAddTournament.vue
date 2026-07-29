<template>
  <main
    class="tournament-page"
    :class="{ 'theme-dark': isDark }"
    :data-bs-theme="isDark ? 'dark' : 'light'"
  >
    <div class="tournament-shell">
      <section
        v-if="accessDenied"
        class="state-card access-denied"
        role="alert"
      >
        <span class="state-icon" aria-hidden="true">!</span>
        <h1>No autorizado</h1>
        <p>No tienes permisos para administrar torneos.</p>

        <button
          type="button"
          class="btn-electric"
          @click="goBack"
        >
          Volver
        </button>
      </section>

      <template v-else>
        <header class="hero-card">
          <div class="hero-copy">
            <span class="hero-eyebrow">ORGANIZACIÓN</span>
            <h1 class="hero-title">
              {{ $t('tournamentsSeccion.addTournamet') }}
            </h1>
            <p class="hero-description">
              {{ $t('tournamentsSeccion.subAddTournament') }}
            </p>
          </div>

          <div class="hero-counter" aria-live="polite">
            <strong>{{ tournaments.length }}</strong>
            <span>
              {{ tournaments.length === 1 ? 'torneo creado' : 'torneos creados' }}
            </span>
          </div>
        </header>

        <div class="workspace-grid">
          <section class="content-card create-card" aria-labelledby="create-title">
            <div class="section-heading">
              <div>
                <span class="section-kicker">NUEVO TORNEO</span>
                <h2 id="create-title">Datos de la competencia</h2>
              </div>

              <span class="section-badge">Administrador</span>
            </div>

            <form
              class="tournament-form"
              novalidate
              @submit.prevent="createTournament"
            >
              <div class="field-group field-full">
                <label for="tournament-name">
                  {{ $t('tournamentsSeccion.tournamentName') }}
                </label>

                <input
                  id="tournament-name"
                  v-model.trim="form.name"
                  class="form-control"
                  type="text"
                  maxlength="150"
                  autocomplete="off"
                  placeholder="Ej. Regional Santiago 2026"
                  required
                  :disabled="isCreating"
                >
                <small>Utiliza un nombre claro y fácil de identificar.</small>
              </div>

              <div class="field-group">
                <label for="tournament-type">
                  {{ $t('tournamentsSeccion.selectType') }}
                </label>

                <select
                  id="tournament-type"
                  v-model="form.type"
                  class="form-control"
                  required
                  :disabled="isCreating"
                >
                  <option disabled value="">
                    {{ $t('tournamentsSeccion.selectType') }}
                  </option>
                  <option value="challenge">Challenge</option>
                  <option value="cup">Cup</option>
                  <option value="liga">Liga Casual</option>
                  <option value="vg_online">VG Online</option>
                </select>
              </div>

              <div class="field-group">
                <label for="tournament-format">
                  {{ $t('tournamentsSeccion.typeTournament') }}
                </label>

                <select
                  id="tournament-format"
                  v-model="form.format"
                  class="form-control"
                  required
                  :disabled="isCreating"
                >
                  <option disabled value="">
                    {{ $t('tournamentsSeccion.typeTournament') }}
                  </option>
                  <option value="tcg">Trading Card Game</option>
                  <option value="vgc">Video Game</option>
                </select>
              </div>

              <div class="field-group field-full">
                <label for="tournament-date">
                  {{ $t('tournamentsSeccion.dateTournament') }}
                </label>

                <input
                  id="tournament-date"
                  v-model="form.date"
                  class="form-control"
                  type="date"
                  required
                  :disabled="isCreating"
                >
              </div>

              <p
                v-if="formError"
                class="form-message error-message field-full"
                role="alert"
                aria-live="assertive"
              >
                {{ formError }}
              </p>

              <div class="form-actions field-full">
                <button
                  class="btn-electric submit-button"
                  type="submit"
                  :disabled="isCreating"
                  :aria-busy="isCreating"
                >
                  <span
                    v-if="isCreating"
                    class="button-spinner"
                    aria-hidden="true"
                  ></span>
                  <span>
                    {{
                      isCreating
                        ? 'Creando torneo...'
                        : $t('tournamentsSeccion.addTournamet')
                    }}
                  </span>
                </button>
              </div>
            </form>
          </section>

          <section
            class="content-card tournaments-card"
            :aria-busy="isLoadingTournaments"
            aria-labelledby="tournaments-title"
          >
            <div class="section-heading">
              <div>
                <span class="section-kicker">GESTIÓN</span>
                <h2 id="tournaments-title">
                  {{ $t('tournamentsSeccion.myTournaments') }}
                </h2>
              </div>

              <button
                v-if="loadError"
                type="button"
                class="btn-electric-soft button-small"
                :disabled="isLoadingTournaments"
                @click="loadTournaments"
              >
                Reintentar
              </button>
            </div>

            <div
              v-if="isLoadingTournaments"
              class="state-panel"
              role="status"
              aria-live="polite"
            >
              <img
                v-if="gifLoading"
                :src="gifLoading"
                class="loading-image"
                alt="Cargando torneos"
              >
              <span
                v-else
                class="loading-spinner"
                aria-hidden="true"
              ></span>
            </div>

            <div
              v-else-if="loadError"
              class="state-panel error-state"
              role="alert"
            >
              <span class="state-icon" aria-hidden="true">!</span>
              <h3>No pudimos cargar tus torneos</h3>
              <p>{{ loadError }}</p>
            </div>

            <div
              v-else-if="!hasTournaments"
              class="state-panel empty-state"
              role="status"
            >
              <span class="state-icon empty-icon" aria-hidden="true">＋</span>
              <h3>Aún no tienes torneos</h3>
              <p>{{ $t('tournamentsSeccion.noTournaments') }}</p>
            </div>

            <template v-else>
              <p class="results-summary" aria-live="polite">
                Tienes
                <strong>{{ tournaments.length }}</strong>
                {{ tournaments.length === 1 ? 'torneo disponible' : 'torneos disponibles' }}.
              </p>

              <div class="desktop-tournament-list">
                <div class="table-wrapper">
                  <table class="tournaments-table">
                    <thead>
                      <tr>
                        <th scope="col">
                          {{ $t('tournamentsSeccion.name') }}
                        </th>
                        <th scope="col">
                          {{ $t('tournamentsSeccion.type') }}
                        </th>
                        <th scope="col">
                          {{ $t('teamsSeccion.format') }}
                        </th>
                        <!--<th scope="col">
                          {{ $t('tournamentsSeccion.date') }}
                        </th>-->
                        <th scope="col" class="actions-column">
                          Acciones
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr
                        v-for="tournament in tournaments"
                        :key="tournament.id"
                      >
                        <td>
                          <div class="tournament-identity">
                            <span class="tournament-marker" aria-hidden="true"></span>
                            <div>
                              <strong>{{ tournament.nombre || 'Torneo sin nombre' }}</strong>
                              <small v-if="tournament.id != null">#{{ tournament.id }}</small>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span class="info-badge">
                            {{ getTournamentTypeLabel(tournament.tipo_torneo) }}
                          </span>
                        </td>

                        <td>
                          <span class="format-badge">
                            {{ getTournamentFormatLabel(tournament.formato_torneo) }}
                          </span>
                        </td>

                        <!--<td class="date-cell">
                          {{ formatTournamentDate(tournament.fecha_torneo) }}
                        </td>-->

                        <td>
                          <div class="row-actions">
                            <button
                              type="button"
                              class="action-button action-button-primary"
                              :disabled="tournament.id == null"
                              @click="viewOrganizerTournament(tournament.id)"
                            >
                              {{ $t('tournamentsSeccion.viewTournament') }}
                            </button>

                            <button
                              type="button"
                              class="action-button"
                              :disabled="tournament.id == null"
                              @click="uploadTeams(tournament.id)"
                            >
                              {{ $t('buttons.addTeam') }}
                            </button>
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="mobile-tournament-list">
                <article
                  v-for="tournament in tournaments"
                  :key="tournament.id"
                  class="tournament-item"
                >
                  <div class="tournament-item-header">
                    <span class="tournament-marker" aria-hidden="true"></span>
                    <div>
                      <h3>{{ tournament.nombre || 'Torneo sin nombre' }}</h3>
                      <small v-if="tournament.id != null">#{{ tournament.id }}</small>
                    </div>
                  </div>

                  <dl class="tournament-details">
                    <div>
                      <dt>{{ $t('tournamentsSeccion.type') }}</dt>
                      <dd>
                        <span class="info-badge">
                          {{ getTournamentTypeLabel(tournament.tipo_torneo) }}
                        </span>
                      </dd>
                    </div>

                    <div>
                      <dt>{{ $t('teamsSeccion.format') }}</dt>
                      <dd>
                        <span class="format-badge">
                          {{ getTournamentFormatLabel(tournament.formato_torneo) }}
                        </span>
                      </dd>
                    </div>

                    <div>
                      <dt>{{ $t('tournamentsSeccion.date') }}</dt>
                      <dd>{{ formatTournamentDate(tournament.fecha_torneo) }}</dd>
                    </div>
                  </dl>

                  <div class="card-actions">
                    <button
                      type="button"
                      class="action-button action-button-primary"
                      :disabled="tournament.id == null"
                      @click="viewOrganizerTournament(tournament.id)"
                    >
                      {{ $t('tournamentsSeccion.viewTournament') }}
                    </button>

                    <button
                      type="button"
                      class="action-button"
                      :disabled="tournament.id == null"
                      @click="uploadTeams(tournament.id)"
                    >
                      {{ $t('buttons.addTeam') }}
                    </button>
                  </div>
                </article>
              </div>
            </template>
          </section>
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
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const TOURNAMENT_TYPES = new Set([
  'challenge',
  'cup',
  'liga',
  'vg_online'
]);

const TOURNAMENT_FORMATS = new Set(['tcg', 'vgc']);

const mode = inject('mode', 'light');
const apiUrl = inject('apiUrl', '');
const gifLoading = inject('gifLoading', '');

const router = useRouter();
const { t } = useI18n();

const isCreating = ref(false);
const isLoadingTournaments = ref(false);
const accessDenied = ref(false);
const formError = ref('');
const loadError = ref('');
const tournaments = ref([]);
const globalThemeDark = ref(false);

let requestId = 0;
let themeObserver = null;

const form = ref({
  name: '',
  type: '',
  format: '',
  date: ''
});

const tournamentTypeLabels = {
  liga: 'Liga Casual',
  challenge: 'Challenge',
  cup: 'Cup',
  vg_online: 'VG Online'
};

const tournamentFormatLabels = {
  tcg: 'Trading Card Game',
  vgc: 'Video Game'
};

const injectedDarkMode = computed(
  () => String(unref(mode) || '').toLowerCase() === 'dark'
);

const isDark = computed(
  () => injectedDarkMode.value || globalThemeDark.value
);

const hasTournaments = computed(
  () => tournaments.value.length > 0
);

const updateGlobalTheme = () => {
  if (typeof document === 'undefined') {
    globalThemeDark.value = false;
    return;
  }

  const roots = [document.documentElement, document.body].filter(Boolean);

  globalThemeDark.value = roots.some((element) => {
    const classList = element.classList;
    const dataTheme = element.getAttribute('data-theme');
    const bootstrapTheme = element.getAttribute('data-bs-theme');

    return (
      classList.contains('dark')
      || classList.contains('dark-mode')
      || classList.contains('theme-dark')
      || classList.contains('is-dark')
      || dataTheme === 'dark'
      || bootstrapTheme === 'dark'
    );
  });
};

const observeTheme = () => {
  if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') {
    return;
  }

  updateGlobalTheme();

  themeObserver = new MutationObserver(updateGlobalTheme);

  [document.documentElement, document.body]
    .filter(Boolean)
    .forEach((element) => {
      themeObserver.observe(element, {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'data-bs-theme']
      });
    });
};

const isOrganizer = () =>
  typeof window !== 'undefined'
  && sessionStorage.getItem('isOrganizer') === 'true';

const buildApiUrl = (path = '') => {
  const baseUrl = String(unref(apiUrl) || '').replace(/\/+$/, '');
  const cleanPath = String(path || '').replace(/^\/+/, '');

  return baseUrl
    ? `${baseUrl}/${cleanPath}`
    : `/${cleanPath}`;
};

const getToken = () =>
  typeof window !== 'undefined'
    ? localStorage.getItem('token')
    : null;

const getAuthHeaders = () => {
  const token = getToken();

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

const getUserId = () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const decodedToken = jwtDecode(token);

    return (
      decodedToken?.userId
      ?? decodedToken?.id
      ?? decodedToken?.sub
      ?? null
    );
  } catch (error) {
    console.error('Token inválido:', error);
    return null;
  }
};

const normalizeTournaments = (data) => {
  const source = Array.isArray(data)
    ? data
    : Array.isArray(data?.datos)
      ? data.datos
      : Array.isArray(data?.data)
        ? data.data
        : [];

  return source.filter(
    (tournament) =>
      tournament
      && typeof tournament === 'object'
  );
};

const getTournamentTypeLabel = (type) => {
  const normalizedType = String(type || '').trim().toLowerCase();

  return tournamentTypeLabels[normalizedType]
    || normalizedType
    || '-';
};

const getTournamentFormatLabel = (format) => {
  const normalizedFormat = String(format || '').trim().toLowerCase();

  return tournamentFormatLabels[normalizedFormat]
    || normalizedFormat.toUpperCase()
    || '-';
};

const formatTournamentDate = (value) => {
  if (!value) {
    return '-';
  }

  const normalizedValue = String(value).trim();
  const dateMatch = normalizedValue.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (dateMatch) {
    const [, year, month, day] = dateMatch;
    return `${day}/${month}/${year}`;
  }

  const parsedDate = new Date(normalizedValue);

  if (Number.isNaN(parsedDate.getTime())) {
    return '-';
  }

  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(parsedDate);
};

const loadTournaments = async () => {
  const currentRequestId = ++requestId;
  const userId = getUserId();

  if (!isOrganizer() || userId == null) {
    accessDenied.value = true;
    isLoadingTournaments.value = false;
    return;
  }

  isLoadingTournaments.value = true;
  loadError.value = '';

  try {
    const response = await axios.get(
      buildApiUrl(`tournaments/torneos-user/${userId}`),
      {
        headers: getAuthHeaders()
      }
    );

    if (currentRequestId !== requestId) {
      return;
    }

    tournaments.value = normalizeTournaments(response?.data);
  } catch (error) {
    if (currentRequestId !== requestId) {
      return;
    }

    console.error('Error al cargar los torneos:', error);
    tournaments.value = [];

    loadError.value =
      error?.response?.data?.message
      || error?.response?.data?.error
      || t('responseApisSeccion.loadingDataError')
      || 'No fue posible cargar los torneos.';
  } finally {
    if (currentRequestId === requestId) {
      isLoadingTournaments.value = false;
    }
  }
};

const validateForm = () => {
  const name = form.value.name.trim();

  if (!name) {
    return 'Ingresa el nombre del torneo.';
  }

  if (!TOURNAMENT_TYPES.has(form.value.type)) {
    return 'Selecciona un tipo de torneo válido.';
  }

  if (!TOURNAMENT_FORMATS.has(form.value.format)) {
    return 'Selecciona un formato válido.';
  }

  if (!form.value.date) {
    return 'Selecciona la fecha del torneo.';
  }

  return '';
};

const resetForm = () => {
  form.value = {
    name: '',
    type: '',
    format: '',
    date: ''
  };
};

const createTournament = async () => {
  if (isCreating.value) {
    return;
  }

  formError.value = '';

  const validationMessage = validateForm();

  if (validationMessage) {
    formError.value = validationMessage;
    return;
  }

  const userId = getUserId();

  if (!isOrganizer() || userId == null) {
    accessDenied.value = true;
    return;
  }

  isCreating.value = true;

  const payload = {
    nombre: form.value.name.trim(),
    tipo_torneo: form.value.type,
    formato_torneo: form.value.format,
    fecha_torneo: form.value.date,
    userId
  };

  try {
    await axios.post(
      buildApiUrl('tournaments'),
      payload,
      {
        headers: getAuthHeaders()
      }
    );

    await Swal.fire({
      icon: 'success',
      title: 'Torneo creado',
      text: 'La competencia se creó correctamente.',
      showConfirmButton: false,
      timer: 1600,
      timerProgressBar: true
    });

    resetForm();
    await loadTournaments();
  } catch (error) {
    console.error('Error al crear el torneo:', error);

    await Swal.fire({
      icon: 'error',
      title: 'No pudimos crear el torneo',
      text:
        error?.response?.data?.message
        || error?.response?.data?.error
        || 'Revisa los datos e intenta nuevamente.'
    });
  } finally {
    isCreating.value = false;
  }
};

const viewOrganizerTournament = (tournamentId) => {
  if (tournamentId == null) {
    return;
  }

  router.push({
    name: 'ViewOrgTorneo',
    params: {
      id_torneo: tournamentId
    }
  });
};

const uploadTeams = (tournamentId) => {
  if (tournamentId == null) {
    return;
  }

  router.push({
    name: 'ViewAddStanding',
    params: {
      id_torneo: tournamentId
    }
  });
};

const goBack = () => {
  router.back();
};

const initializeView = async () => {
  observeTheme();

  if (!isOrganizer() || getUserId() == null) {
    accessDenied.value = true;
    return;
  }

  await loadTournaments();
};

watch(
  form,
  () => {
    if (formError.value) {
      formError.value = '';
    }
  },
  { deep: true }
);

onMounted(initializeView);

onBeforeUnmount(() => {
  requestId += 1;
  themeObserver?.disconnect();
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
    radial-gradient(circle at top right, rgba(0, 166, 255, 0.15), transparent 32rem),
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
    radial-gradient(circle at top right, rgba(0, 102, 255, 0.2), transparent 34rem),
    linear-gradient(180deg, #0a1221 0%, var(--page-bg) 100%);
}

.tournament-page,
.tournament-page * {
  box-sizing: border-box;
}

.tournament-shell {
  width: min(100%, 1440px);
  margin: 0 auto;
}

.hero-card,
.content-card,
.state-card {
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
  max-width: 780px;
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
  font-size: clamp(2rem, 4.8vw, 3.7rem);
  font-weight: 850;
  letter-spacing: -0.045em;
  line-height: 1.02;
  overflow-wrap: anywhere;
}

.hero-description {
  max-width: 700px;
  margin: 0;
  color: var(--text-secondary);
  font-size: clamp(0.98rem, 1.7vw, 1.12rem);
  line-height: 1.7;
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

.workspace-grid {
  display: grid;
  grid-template-columns: minmax(330px, 0.76fr) minmax(0, 1.24fr);
  gap: 22px;
  align-items: start;
  margin-top: 22px;
}

.content-card {
  min-width: 0;
  padding: clamp(20px, 3vw, 30px);
  border-radius: 22px;
  box-shadow: var(--shadow-card);
}

.create-card {
  position: sticky;
  top: 18px;
}

.section-heading {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 22px;
}

.section-heading h2 {
  margin: 5px 0 0;
  color: var(--text-primary);
  font-size: clamp(1.25rem, 2vw, 1.55rem);
  font-weight: 800;
}

.section-badge {
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  padding: 5px 10px;
  border: 1px solid rgba(0, 102, 255, 0.2);
  border-radius: 999px;
  color: var(--electric-blue);
  background: var(--electric-blue-soft);
  font-size: 0.76rem;
  font-weight: 800;
  white-space: nowrap;
}

.tournament-form {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.field-group {
  min-width: 0;
}

.field-full {
  grid-column: 1 / -1;
}

.field-group label {
  display: block;
  margin-bottom: 7px;
  color: var(--text-primary);
  font-size: 0.88rem;
  font-weight: 700;
}

.field-group small {
  display: block;
  margin-top: 7px;
  color: var(--text-secondary);
  font-size: 0.8rem;
  line-height: 1.45;
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
  background: var(--surface-secondary);
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
  background: var(--surface);
  box-shadow: var(--focus-ring);
}

.form-control:disabled {
  cursor: not-allowed;
  opacity: 0.68;
}

select.form-control {
  cursor: pointer;
}

select.form-control option {
  color: var(--text-primary);
  background: var(--surface);
}

.form-message {
  margin: 0;
  padding: 0.8rem 0.95rem;
  border-radius: 12px;
  font-weight: 700;
}

.error-message {
  border: 1px solid rgba(220, 53, 69, 0.42);
  color: #b42318;
  background: rgba(220, 53, 69, 0.08);
}

.theme-dark .error-message {
  color: #ff9b9b;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  padding-top: 4px;
}

.submit-button {
  width: 100%;
}

.btn-electric,
.btn-electric-soft,
.action-button {
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

.btn-electric-soft,
.action-button {
  padding: 9px 12px;
  border: 1px solid rgba(0, 102, 255, 0.28);
  color: var(--electric-blue);
  background: var(--electric-blue-soft);
}

.btn-electric:hover:not(:disabled),
.btn-electric-soft:hover:not(:disabled),
.action-button:hover:not(:disabled) {
  transform: translateY(-1px);
}

.btn-electric:hover:not(:disabled) {
  filter: brightness(1.04);
  box-shadow: 0 11px 24px rgba(0, 102, 255, 0.3);
}

.btn-electric-soft:hover:not(:disabled),
.action-button:hover:not(:disabled) {
  border-color: var(--electric-blue);
  color: #ffffff;
  background: var(--electric-blue);
}

.btn-electric:focus-visible,
.btn-electric-soft:focus-visible,
.action-button:focus-visible,
.form-control:focus-visible {
  outline: 3px solid rgba(0, 102, 255, 0.24);
  outline-offset: 3px;
}

.btn-electric:disabled,
.btn-electric-soft:disabled,
.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.button-small {
  min-height: 36px;
  padding: 7px 10px;
  font-size: 0.84rem;
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

.results-summary {
  margin: 0 0 16px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.results-summary strong {
  color: var(--text-primary);
}

.state-panel,
.state-card {
  display: grid;
  place-items: center;
  align-content: center;
  gap: 10px;
  text-align: center;
}

.state-panel {
  min-height: 330px;
  padding: 24px;
  color: var(--text-secondary);
}

.state-panel h3,
.state-panel p,
.state-card h1,
.state-card p {
  margin: 0;
}

.state-panel h3,
.state-card h1 {
  color: var(--text-primary);
}

.state-card {
  min-height: 420px;
  padding: 32px;
  border-radius: 22px;
  box-shadow: var(--shadow-card);
}

.state-card .btn-electric {
  margin-top: 10px;
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

.empty-icon {
  font-size: 1.8rem;
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

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.tournaments-table {
  width: 100%;
  min-width: 920px;
  border-collapse: collapse;
  color: var(--text-primary);
}

.tournaments-table th,
.tournaments-table td {
  padding: 15px 14px;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.tournaments-table th {
  color: var(--text-secondary);
  background: var(--surface-secondary);
  font-size: 0.76rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-align: left;
  text-transform: uppercase;
  white-space: nowrap;
}

.tournaments-table tbody tr {
  background: var(--surface);
  transition: background-color 160ms ease;
}

.tournaments-table tbody tr:hover {
  background: var(--surface-hover);
}

.tournaments-table tbody tr:last-child td {
  border-bottom: 0;
}

.actions-column {
  min-width: 220px;
  text-align: center !important;
}

.tournament-identity,
.tournament-item-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.tournament-identity {
  min-width: 210px;
}

.tournament-marker {
  flex: 0 0 10px;
  width: 10px;
  height: 40px;
  border-radius: 999px;
  background: linear-gradient(
    180deg,
    var(--electric-cyan),
    var(--electric-blue)
  );
  box-shadow: 0 0 18px rgba(0, 102, 255, 0.34);
}

.tournament-identity strong,
.tournament-item-header h3 {
  display: block;
  margin: 0;
  color: var(--text-primary);
  font-size: 0.96rem;
  overflow-wrap: anywhere;
}

.tournament-identity small,
.tournament-item-header small {
  color: var(--text-secondary);
}

.info-badge,
.format-badge {
  display: inline-flex;
  min-height: 28px;
  align-items: center;
  padding: 5px 10px;
  border-radius: 999px;
  font-size: 0.76rem;
  font-weight: 800;
  white-space: nowrap;
}

.info-badge {
  border: 1px solid rgba(0, 102, 255, 0.2);
  color: var(--electric-blue);
  background: var(--electric-blue-soft);
}

.format-badge {
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  background: var(--surface-secondary);
}

.date-cell {
  color: var(--text-secondary);
  white-space: nowrap;
}

.row-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(92px, 1fr));
  gap: 8px;
}

.action-button {
  min-height: 38px;
  font-size: 0.78rem;
}

.action-button-primary {
  border-color: var(--electric-blue);
  color: #ffffff;
  background: var(--electric-blue);
}

.mobile-tournament-list {
  display: none;
}

.tournament-item {
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--surface-secondary);
}

.tournament-item + .tournament-item {
  margin-top: 12px;
}

.tournament-details {
  margin: 16px 0 0;
}

.tournament-details > div {
  display: grid;
  grid-template-columns: minmax(90px, auto) minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
}

.tournament-details > div:last-child {
  border-bottom: 0;
}

.tournament-details dt {
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 700;
}

.tournament-details dd {
  min-width: 0;
  margin: 0;
  color: var(--text-primary);
  overflow-wrap: anywhere;
}

.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
  margin-top: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1199.98px) {
  .workspace-grid {
    grid-template-columns: 1fr;
  }

  .create-card {
    position: static;
  }
}

@media (max-width: 991.98px) {
  .desktop-tournament-list {
    display: none;
  }

  .mobile-tournament-list {
    display: block;
  }
}

@media (max-width: 767.98px) {
  .tournament-page {
    padding: 18px 12px 32px;
  }

  .hero-card {
    align-items: flex-start;
    flex-direction: column;
  }

  .hero-counter {
    width: 100%;
    min-height: 96px;
    flex-basis: auto;
  }

  .hero-counter strong {
    font-size: 2.15rem;
  }
}

@media (max-width: 575.98px) {
  .hero-card,
  .content-card,
  .state-card {
    border-radius: 16px;
  }

  .tournament-form {
    grid-template-columns: 1fr;
  }

  .field-full {
    grid-column: auto;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .section-badge,
  .section-heading .btn-electric-soft {
    align-self: stretch;
    justify-content: center;
  }

  .card-actions {
    grid-template-columns: 1fr;
  }

  .tournament-details > div {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .btn-electric,
  .btn-electric-soft,
  .action-button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn-electric,
  .btn-electric-soft,
  .action-button,
  .tournaments-table tbody tr {
    transition: none;
  }

  .btn-electric:hover:not(:disabled),
  .btn-electric-soft:hover:not(:disabled),
  .action-button:hover:not(:disabled) {
    transform: none;
  }

  .button-spinner,
  .loading-spinner {
    animation-duration: 1.4s;
  }
}
</style>
