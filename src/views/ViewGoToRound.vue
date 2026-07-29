<template>
  <main
    class="round-page"
    :class="{ 'theme-dark': isDark }"
  >
    <div class="round-container">
      <section
        v-if="loading"
        class="state-card loading-state"
        aria-label="Cargando ronda"
        aria-live="polite"
        aria-busy="true"
      >
        <img
          v-if="gifLoading"
          :src="gifLoading"
          class="loading-image"
          alt="Cargando ronda"
        >
        <span
          v-else
          class="loading-spinner"
          aria-hidden="true"
        ></span>
      </section>

      <section
        v-else-if="loadError"
        class="state-card error-state"
        role="alert"
      >
        <h1>{{ $t('responseApisSeccion.oops') }}</h1>
        <p>{{ loadError }}</p>

        <button
          type="button"
          class="action-button button-primary"
          @click="loadLatestRound"
        >
          Reintentar
        </button>
      </section>

      <section
        v-else
        class="round-content"
      >
        <header class="round-header">
          <div class="round-heading">
            <p
              v-if="category"
              class="category-label"
            >
              {{ category }}
            </p>

            <h1>
              {{ $t('tournamentsSeccion.matchRound') }}
              {{ round ?? '-' }}
            </h1>
          </div>

          <div
            v-if="tournamentName || organizer"
            class="tournament-summary"
          >
            <strong v-if="tournamentName">
              {{ tournamentName }}
            </strong>

            <span v-if="organizer">
              {{ organizer }}
            </span>
          </div>
        </header>

        <section
          v-if="matches.length"
          class="pairings-grid"
          aria-label="Emparejamientos de la ronda"
        >
          <article
            v-for="match in matches"
            :key="match.clientId"
            class="match-card"
          >
            <header class="match-header">
              <span class="table-badge">
                {{ $t('tournamentsSeccion.mesa') }}
                {{ match.table }}
              </span>
            </header>

            <div class="players">
              <div class="player">
                <strong>{{ match.player1.name }}</strong>
                <span class="player-record">
                  {{ match.player1.stats }}
                </span>
              </div>

              <span
                class="versus"
                aria-hidden="true"
              >
                VS
              </span>

              <div
                class="player"
                :class="{ 'bye-player': match.isBye }"
              >
                <strong>{{ match.player2.name }}</strong>
                <span
                  v-if="!match.isBye"
                  class="player-record"
                >
                  {{ match.player2.stats }}
                </span>
              </div>
            </div>
          </article>
        </section>

        <section
          v-else
          class="state-card empty-state"
        >
          <h2>No hay emparejamientos disponibles</h2>
          <p>
            Todavía no se han generado partidas para esta ronda.
          </p>
        </section>

        <footer
          v-if="formattedDate"
          class="round-footer"
        >
          <time :datetime="generatedAt">
            {{ formattedDate }}
          </time>
        </footer>
      </section>
    </div>
  </main>
</template>

<script setup>
import {
  computed,
  inject,
  onBeforeUnmount,
  watch,
  ref,
  unref
} from 'vue';
import axios from 'axios';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';

const apiUrl = inject('apiUrl', '');
const mode = inject('mode', 'light');
const gifLoading = inject('gifLoading', null);

const route = useRoute();
const { locale, t } = useI18n();

const loading = ref(true);
const loadError = ref('');

const round = ref(null);
const tournamentName = ref('');
const category = ref('');
const organizer = ref('');
const generatedAt = ref('');
const matches = ref([]);

let requestController = null;

const isDark = computed(() => unref(mode) === 'dark');

const tournamentId = computed(() => {
  const numericId = Number(route.params.id_torneo);

  return Number.isFinite(numericId) && numericId > 0
    ? numericId
    : null;
});

const formattedDate = computed(() => {
  if (!generatedAt.value) {
    return '';
  }

  const parsedDate = new Date(generatedAt.value);

  if (Number.isNaN(parsedDate.getTime())) {
    return '';
  }

  try {
    return new Intl.DateTimeFormat(
      locale.value || 'es-CL',
      {
        dateStyle: 'medium',
        timeStyle: 'short'
      }
    ).format(parsedDate);
  } catch {
    return parsedDate.toLocaleString('es-CL');
  }
});

const buildApiUrl = (path) => {
  const baseUrl = String(unref(apiUrl) || '')
    .replace(/\/+$/, '');
  const cleanPath = String(path || '')
    .replace(/^\/+/, '');

  return `${baseUrl}/${cleanPath}`;
};

const normalizePlayerName = (value, fallback) => {
  const normalizedValue = String(value || '').trim();

  return normalizedValue || fallback;
};

const normalizeRecord = (value) => {
  const normalizedValue = String(value || '').trim();

  return normalizedValue || '-';
};

const normalizePairings = (pairings) => {
  if (!Array.isArray(pairings)) {
    return [];
  }

  return pairings
    .filter((pairing) => pairing && typeof pairing === 'object')
    .map((pairing, index) => {
      const opponentName = String(
        pairing.opponentName ??
        pairing.opponent_name ??
        ''
      ).trim();

      const table =
        pairing.tableNumber ??
        pairing.table_number ??
        index + 1;

      return {
        clientId:
          pairing.id ??
          pairing.pairingId ??
          pairing.pairing_id ??
          `${table}-${index}`,
        table,
        isBye: !opponentName,
        player1: {
          name: normalizePlayerName(
            pairing.playerName ?? pairing.player_name,
            `Jugador ${index + 1}`
          ),
          stats: normalizeRecord(
            pairing.playerRecord ?? pairing.player_record
          )
        },
        player2: {
          name: opponentName || 'BYE',
          stats: normalizeRecord(
            pairing.opponentRecord ??
            pairing.opponent_record
          )
        }
      };
    });
};

const isCanceledRequest = (error) =>
  error?.name === 'CanceledError' ||
  error?.code === 'ERR_CANCELED';

const clearRoundData = () => {
  round.value = null;
  tournamentName.value = '';
  category.value = '';
  organizer.value = '';
  generatedAt.value = '';
  matches.value = [];
};

const loadLatestRound = async () => {
  if (tournamentId.value == null) {
    loading.value = false;
    clearRoundData();
    loadError.value = 'No se encontró el torneo solicitado.';
    return;
  }

  loading.value = true;
  loadError.value = '';

  requestController?.abort();

  const controller = new AbortController();
  requestController = controller;

  try {
    const response = await axios.get(
      buildApiUrl(
        `tournament-rounds/latest-round/${tournamentId.value}`
      ),
      {
        signal: controller.signal
      }
    );

    const data = response?.data?.data ?? response?.data;

    if (!data || typeof data !== 'object') {
      throw new Error('INVALID_ROUND_RESPONSE');
    }

    round.value =
      data.roundNumber ??
      data.round_number ??
      null;

    category.value = String(
      data.category ?? ''
    ).trim();

    tournamentName.value = String(
      data.tournament?.name ??
      data.tournament?.nombre ??
      data.tournamentName ??
      ''
    ).trim();

    organizer.value = String(
      data.tournament?.organizer ??
      data.tournament?.organizador ??
      data.organizer ??
      ''
    ).trim();

    generatedAt.value = String(
      data.generatedAt ??
      data.generated_at ??
      ''
    ).trim();

    matches.value = normalizePairings(
      data.pairings
    );
  } catch (error) {
    if (isCanceledRequest(error)) {
      return;
    }

    console.error('Error al cargar la ronda:', error);
    clearRoundData();

    loadError.value =
      error?.response?.data?.message ||
      t('responseApisSeccion.loadingDataError') ||
      'No se pudo cargar la ronda.';
  } finally {
    if (requestController === controller) {
      loading.value = false;
      requestController = null;
    }
  }
};

watch(
  tournamentId,
  loadLatestRound,
  { immediate: true }
);

onBeforeUnmount(() => {
  requestController?.abort();
});
</script>

<style scoped>
.round-page {
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

  min-height: 100dvh;
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

.round-page.theme-dark {
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

.round-page,
.round-page * {
  box-sizing: border-box;
}

.round-container {
  width: min(100%, 1440px);
  margin: 0 auto;
}

.round-content {
  min-width: 0;
}

.round-header {
  position: relative;
  display: flex;
  min-width: 0;
  gap: 28px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding: clamp(24px, 4vw, 42px);
  overflow: hidden;
  border: 1px solid rgba(0, 102, 255, 0.18);
  border-radius: 24px;
  color: #ffffff;
  background:
    linear-gradient(
      135deg,
      var(--electric-blue-strong) 0%,
      var(--electric-blue) 55%,
      var(--electric-cyan) 100%
    );
  box-shadow: var(--shadow-soft);
}

.round-header::after {
  content: '';
  position: absolute;
  right: -65px;
  bottom: -105px;
  width: 260px;
  height: 260px;
  pointer-events: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.14);
}

.round-heading,
.tournament-summary {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.round-header h1,
.category-label,
.tournament-summary {
  margin: 0;
}

.round-header h1 {
  overflow-wrap: anywhere;
  font-size: clamp(1.9rem, 4vw, 3.2rem);
  font-weight: 850;
  letter-spacing: -0.035em;
  line-height: 1.05;
}

.category-label {
  margin-bottom: 8px;
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.15em;
  opacity: 0.92;
  text-transform: uppercase;
}

.tournament-summary {
  display: grid;
  flex: 0 1 340px;
  gap: 6px;
  padding: 16px 18px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.13);
  backdrop-filter: blur(8px);
  text-align: right;
}

.tournament-summary strong,
.tournament-summary span {
  overflow-wrap: anywhere;
}

.tournament-summary strong {
  font-size: 1rem;
}

.tournament-summary span {
  font-size: 0.9rem;
  opacity: 0.86;
}

.pairings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 18px;
}

.match-card,
.state-card {
  border: 1px solid var(--border-color);
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.match-card {
  min-width: 0;
  overflow: hidden;
  border-radius: 20px;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.match-card:hover {
  border-color: rgba(0, 102, 255, 0.42);
  box-shadow: 0 14px 34px rgba(0, 102, 255, 0.13);
  transform: translateY(-3px);
}

.match-header {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 14px 18px;
  border-bottom: 1px solid var(--border-color);
  background:
    linear-gradient(
      135deg,
      var(--electric-blue-soft),
      var(--surface-secondary)
    );
}

.table-badge {
  display: inline-flex;
  min-height: 30px;
  align-items: center;
  justify-content: center;
  padding: 5px 12px;
  border: 1px solid rgba(0, 102, 255, 0.24);
  border-radius: 999px;
  color: var(--electric-blue);
  background: var(--surface);
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.04em;
}

.players {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  gap: 14px;
  align-items: stretch;
  padding: 20px;
}

.player {
  display: grid;
  min-width: 0;
  min-height: 108px;
  place-items: center;
  align-content: center;
  gap: 9px;
  padding: 16px 12px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--surface-secondary);
  text-align: center;
}

.player strong {
  max-width: 100%;
  overflow-wrap: anywhere;
  font-size: 1rem;
  line-height: 1.35;
}

.player-record {
  display: inline-flex;
  min-height: 27px;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  color: var(--electric-blue);
  background: var(--electric-blue-soft);
  font-size: 0.8rem;
  font-weight: 800;
}

.bye-player {
  border-style: dashed;
  color: var(--text-secondary);
}

.versus {
  display: inline-grid;
  width: 42px;
  height: 42px;
  place-items: center;
  align-self: center;
  border: 1px solid rgba(0, 102, 255, 0.2);
  border-radius: 50%;
  color: #ffffff;
  background: var(--electric-blue);
  font-size: 0.72rem;
  font-weight: 900;
  box-shadow: 0 8px 18px rgba(0, 102, 255, 0.22);
}

.round-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
  color: var(--text-secondary);
  font-size: 0.88rem;
}

.round-footer time {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 999px;
  background: var(--surface);
}

.state-card {
  display: grid;
  min-height: 360px;
  place-items: center;
  align-content: center;
  gap: 16px;
  padding: 32px;
  border-radius: 22px;
  text-align: center;
}

.state-card h1,
.state-card h2,
.state-card p {
  margin: 0;
}

.state-card h1,
.state-card h2 {
  overflow-wrap: anywhere;
}

.state-card p {
  max-width: 620px;
  color: var(--text-secondary);
  line-height: 1.65;
}

.empty-state {
  margin-top: 18px;
}

.error-state {
  border-color: rgba(220, 53, 69, 0.28);
}

.loading-image {
  display: block;
  /*width: min(190px, 60vw);*/
  max-width: 100%;
  height: auto;
  object-fit: contain;
}

.loading-spinner {
  display: inline-block;
  width: 62px;
  height: 62px;
  border: 4px solid rgba(0, 102, 255, 0.2);
  border-top-color: var(--electric-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.action-button {
  display: inline-flex;
  min-height: 44px;
  align-items: center;
  justify-content: center;
  padding: 11px 18px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: #ffffff;
  background: var(--electric-blue);
  font: inherit;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 9px 20px rgba(0, 102, 255, 0.22);
  transition:
    box-shadow 150ms ease,
    filter 150ms ease,
    transform 150ms ease;
}

.action-button:hover:not(:disabled) {
  filter: brightness(1.06);
  box-shadow: 0 12px 26px rgba(0, 102, 255, 0.3);
  transform: translateY(-2px);
}

.action-button:focus-visible {
  outline: none;
  box-shadow:
    var(--focus-ring),
    0 9px 20px rgba(0, 102, 255, 0.22);
}

.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.button-primary {
  background: var(--electric-blue);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767.98px) {
  .round-page {
    padding: 18px 12px 32px;
  }

  .round-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
    margin-bottom: 18px;
    padding: 24px 20px;
    border-radius: 20px;
  }

  .tournament-summary {
    width: 100%;
    flex-basis: auto;
    text-align: left;
  }

  .pairings-grid {
    grid-template-columns: 1fr;
  }

  .players {
    grid-template-columns: 1fr;
    padding: 16px;
  }

  .versus {
    margin: -2px auto;
  }

  .player {
    min-height: 90px;
  }

  .state-card {
    min-height: 320px;
    padding: 24px 18px;
    border-radius: 18px;
  }

  .round-footer {
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .match-card,
  .action-button {
    transition: none;
  }

  .match-card:hover,
  .action-button:hover:not(:disabled) {
    transform: none;
  }

  .loading-spinner {
    animation-duration: 1.4s;
  }
}
</style>
