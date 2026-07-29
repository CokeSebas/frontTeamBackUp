<template>
  <main
    class="results-page"
    :class="{ 'theme-dark': isDark }"
  >
    <div class="results-container">
      <section
        v-if="loading"
        class="state-card loading-state"
        aria-label="Cargando resultados"
        aria-live="polite"
        aria-busy="true"
      >
        <img
          v-if="gifLoading"
          :src="gifLoading"
          class="loading-image"
          alt="Cargando resultados"
        >
        <span
          v-else
          class="loading-spinner"
          aria-hidden="true"
        />
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
          @click="fetchResults"
        >
          Reintentar
        </button>
      </section>

      <section
        v-else
        class="results-content"
      >
        <header class="results-header">
          <div>
            <p
              v-if="category"
              class="category-label"
            >
              {{ category }}
            </p>

            <h1>
              {{ $t('tournamentsSeccion.resultRound') }}
              {{ round ?? '-' }}
            </h1>
          </div>

          <div
            v-if="tournamentName || formattedDate"
            class="tournament-summary"
          >
            <strong v-if="tournamentName">
              {{ tournamentName }}
            </strong>

            <time
              v-if="formattedDate"
              :datetime="date"
            >
              {{ formattedDate }}
            </time>
          </div>
        </header>

        <section
          v-if="results.length"
          class="results-grid"
          aria-label="Resultados de la ronda"
        >
          <article
            v-for="(player, index) in results"
            :key="player.id || `${player.name}-${index}`"
            class="player-card"
            :class="`result-${player.result}`"
          >
            <header class="player-header">
              <span
                class="result-indicator"
                aria-hidden="true"
              />

              <h2>{{ player.name }}</h2>
            </header>

            <dl class="player-stats">
              <div>
                <dt>
                  {{ $t('tournamentsSeccion.resultVictorias') }}
                </dt>
                <dd>{{ player.wins }}</dd>
              </div>

              <div>
                <dt>
                  {{ $t('tournamentsSeccion.resultDerrotas') }}
                </dt>
                <dd>{{ player.losses }}</dd>
              </div>

              <div>
                <dt>
                  {{ $t('tournamentsSeccion.resultEmpates') }}
                </dt>
                <dd>{{ player.draws }}</dd>
              </div>
            </dl>
          </article>
        </section>

        <section
          v-else
          class="state-card empty-state"
        >
          <h2>No hay resultados disponibles</h2>
          <p>
            Todavía no existen resultados registrados para esta ronda.
          </p>
        </section>
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

const mode = inject('mode', 'light');
const apiUrl = inject('apiUrl', '');
const gifLoading = inject('gifLoading', null);

const route = useRoute();
const { locale, t } = useI18n();

const tournamentId = computed(() => {
  const numericId = Number(route.params.id_torneo);

  return Number.isFinite(numericId) && numericId > 0
    ? numericId
    : null;
});

const loading = ref(true);
const loadError = ref('');
const round = ref(null);
const category = ref('');
const date = ref('');
const tournamentName = ref('');
const results = ref([]);

let requestController = null;

const isDark = computed(() => unref(mode) === 'dark');

const formattedDate = computed(() => {
  if (!date.value) {
    return '';
  }

  const parsedDate = new Date(date.value);

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

const normalizeNumber = (value) => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue) && parsedValue >= 0
    ? parsedValue
    : 0;
};

const getResultStatus = ({ wins, losses, draws }) => {
  if (wins > losses && wins >= draws) {
    return 'win';
  }

  if (losses > wins && losses >= draws) {
    return 'loss';
  }

  return 'draw';
};

const normalizeResults = (data) => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .filter((player) => player && typeof player === 'object')
    .map((player, index) => {
      const wins = normalizeNumber(player.wins);
      const losses = normalizeNumber(player.losses);
      const draws = normalizeNumber(player.draws);

      return {
        id:
          player.id ??
          player.playerId ??
          player.player_id ??
          null,
        name:
          String(
            player.playerName ??
            player.name ??
            `Jugador ${index + 1}`
          ).trim() || `Jugador ${index + 1}`,
        wins,
        losses,
        draws,
        result: getResultStatus({
          wins,
          losses,
          draws
        })
      };
    });
};

const extractTournamentName = (data) =>
  String(
    data?.tournamentName ??
    data?.tournament?.name ??
    data?.tournament?.nombre ??
    data?.round?.tournamentName ??
    data?.round?.nombreTorneo ??
    ''
  ).trim();

const isCanceledRequest = (error) =>
  error?.name === 'CanceledError' ||
  error?.code === 'ERR_CANCELED';

const fetchResults = async () => {
  if (tournamentId.value == null) {
    loading.value = false;
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
        `tournament-results/latest-round/results/${tournamentId.value}`
      ),
      {
        signal: controller.signal
      }
    );

    const data = response?.data;
    const roundData = data?.round;

    if (!roundData || typeof roundData !== 'object') {
      throw new Error('INVALID_RESULTS_RESPONSE');
    }

    round.value =
      roundData.roundNumber ??
      roundData.round_number ??
      null;

    category.value = String(
      roundData.category ?? ''
    ).trim();

    date.value = String(
      roundData.generatedAt ??
      roundData.generated_at ??
      ''
    ).trim();

    tournamentName.value = extractTournamentName(data);
    results.value = normalizeResults(data?.results);
  } catch (error) {
    if (isCanceledRequest(error)) {
      return;
    }

    console.error('Error cargando resultados:', error);

    round.value = null;
    category.value = '';
    date.value = '';
    tournamentName.value = '';
    results.value = [];

    loadError.value =
      error?.response?.data?.message ||
      t('responseApisSeccion.loadingDataError');
  } finally {
    if (requestController === controller) {
      loading.value = false;
      requestController = null;
    }
  }
};

watch(
  tournamentId,
  fetchResults,
  { immediate: true }
);

onBeforeUnmount(() => {
  requestController?.abort();
});
</script>

<style scoped>
.results-page {
  --electric-blue: #0066ff;
  --electric-blue-strong: #004de6;
  --electric-blue-soft: #e9f2ff;
  --electric-cyan: #00a6ff;
  --page-bg: #f4f8ff;
  --surface: #ffffff;
  --surface-secondary: #f7f9fc;
  --text-primary: #101828;
  --text-secondary: #667085;
  --border-color: #dce6f3;
  --loss: #e5484d;
  --loss-soft: #fff0f0;
  --draw: #7b8794;
  --draw-soft: #f1f4f7;
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

.results-page.theme-dark {
  --electric-blue: #3b82ff;
  --electric-blue-strong: #1f6fff;
  --electric-blue-soft: rgba(59, 130, 255, 0.15);
  --page-bg: #070d1a;
  --surface: #101827;
  --surface-secondary: #151f31;
  --text-primary: #f8fafc;
  --text-secondary: #aab7ca;
  --border-color: #253553;
  --loss: #ff6b6b;
  --loss-soft: rgba(255, 107, 107, 0.12);
  --draw: #aab4c0;
  --draw-soft: rgba(170, 180, 192, 0.12);
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

.results-page,
.results-page * {
  box-sizing: border-box;
}

.results-container {
  width: min(100%, 1440px);
  margin: 0 auto;
}

.results-content {
  min-width: 0;
}

.results-header {
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

.results-header::after {
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

.results-header > div {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.results-header h1,
.category-label,
.tournament-summary {
  margin: 0;
}

.results-header h1 {
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
  flex: 0 1 360px;
  gap: 6px;
  padding: 16px 18px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.13);
  backdrop-filter: blur(8px);
  text-align: right;
}

.tournament-summary strong,
.tournament-summary time {
  overflow-wrap: anywhere;
}

.tournament-summary time {
  font-size: 0.88rem;
  opacity: 0.88;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 18px;
}

.player-card,
.state-card {
  border: 1px solid var(--border-color);
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.player-card {
  position: relative;
  min-width: 0;
  padding: 20px;
  overflow: hidden;
  border-left-width: 5px;
  border-radius: 20px;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.player-card:hover {
  box-shadow: 0 14px 34px rgba(0, 102, 255, 0.13);
  transform: translateY(-3px);
}

.result-win {
  border-left-color: var(--electric-blue);
  background:
    linear-gradient(
      135deg,
      var(--electric-blue-soft),
      var(--surface) 58%
    );
}

.result-loss {
  border-left-color: var(--loss);
  background:
    linear-gradient(
      135deg,
      var(--loss-soft),
      var(--surface) 58%
    );
}

.result-draw {
  border-left-color: var(--draw);
  background:
    linear-gradient(
      135deg,
      var(--draw-soft),
      var(--surface) 58%
    );
}

.player-header {
  display: flex;
  min-width: 0;
  gap: 10px;
  align-items: center;
  margin-bottom: 16px;
}

.player-header h2 {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 1.1rem;
  font-weight: 850;
  line-height: 1.35;
}

.result-indicator {
  width: 12px;
  height: 12px;
  flex: 0 0 12px;
  border: 3px solid var(--surface);
  border-radius: 50%;
  background: var(--draw);
  box-shadow: 0 0 0 2px var(--draw);
}

.result-win .result-indicator {
  background: var(--electric-blue);
  box-shadow: 0 0 0 2px var(--electric-blue);
}

.result-loss .result-indicator {
  background: var(--loss);
  box-shadow: 0 0 0 2px var(--loss);
}

.player-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

.player-stats > div {
  min-width: 0;
  padding: 13px 9px;
  border: 1px solid var(--border-color);
  border-radius: 14px;
  background: var(--surface-secondary);
  text-align: center;
}

.player-stats dt {
  color: var(--text-secondary);
  font-size: 0.76rem;
  font-weight: 750;
  overflow-wrap: anywhere;
}

.player-stats dd {
  margin: 5px 0 0;
  font-size: 1.3rem;
  font-weight: 900;
}

.result-win .player-stats dd {
  color: var(--electric-blue);
}

.result-loss .player-stats dd {
  color: var(--loss);
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

.button-primary {
  background: var(--electric-blue);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767.98px) {
  .results-page {
    padding: 18px 12px 32px;
  }

  .results-header {
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

  .results-grid {
    grid-template-columns: 1fr;
  }

  .player-card,
  .state-card {
    border-radius: 18px;
  }

  .player-stats {
    grid-template-columns: 1fr;
  }

  .state-card {
    min-height: 320px;
    padding: 24px 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .player-card,
  .action-button {
    transition: none;
  }

  .player-card:hover,
  .action-button:hover:not(:disabled) {
    transform: none;
  }

  .loading-spinner {
    animation-duration: 1.4s;
  }
}
</style>
