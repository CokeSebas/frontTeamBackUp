<template>
  <main
    class="standing-page"
    :class="{ 'theme-dark': isDark }"
  >
    <div class="standing-container">
      <section
        v-if="loading"
        class="state-card loading-state"
        aria-label="Cargando clasificación"
        aria-live="polite"
        aria-busy="true"
      >
        <img
          v-if="gifLoading"
          :src="gifLoading"
          class="loading-image"
          alt="Cargando clasificación"
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
          @click="loadStandings"
        >
          Reintentar
        </button>
      </section>

      <section
        v-else
        class="standing-content"
      >
        <header class="standing-header">
          <div>
            <p
              v-if="tournamentName"
              class="tournament-name"
            >
              {{ tournamentName }}
            </p>

            <h1>
              {{ $t('tournamentsSeccion.standingRound') }}
              {{ currentRound }}/{{ totalRounds }}
            </h1>
          </div>

          <div
            v-if="organizer || formattedLastUpdate"
            class="standing-summary"
          >
            <span v-if="organizer">{{ organizer }}</span>

            <time
              v-if="formattedLastUpdate"
              :datetime="lastUpdate"
            >
              {{ formattedLastUpdate }}
            </time>
          </div>
        </header>

        <div
          v-if="categoryGroups.length"
          class="categories-list"
        >
          <section
            v-for="group in categoryGroups"
            :key="group.category"
            class="category-section"
          >
            <header class="category-header">
              <h2>{{ group.category }}</h2>

              <span class="category-count">
                {{ group.players.length }}
                {{
                  group.players.length === 1
                    ? 'jugador'
                    : 'jugadores'
                }}
              </span>
            </header>

            <div class="desktop-standing">
              <div class="table-scroll">
                <table class="standing-table">
                  <thead>
                    <tr>
                      <th scope="col">#</th>
                      <th scope="col">
                        {{ $t('tournamentsSeccion.name') }}
                      </th>
                      <th scope="col">
                        {{ $t('tournamentsSeccion.standingSeccion') }}
                      </th>
                      <th scope="col">
                        {{ $t('tournamentsSeccion.standingRoundDrop') }}
                      </th>
                      <th scope="col">
                        {{ $t('tournamentsSeccion.standingHistorial') }}
                      </th>
                      <th scope="col">
                        {{ $t('tournamentsSeccion.standingPuntos') }}
                      </th>
                      <th scope="col">
                        {{ $t('tournamentsSeccion.standingVictory1') }}
                      </th>
                      <th scope="col">
                        {{ $t('tournamentsSeccion.standingVictory2') }}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr
                      v-for="player in group.players"
                      :key="player.clientId"
                      :class="{ 'top-cut-row': player.isTopCut }"
                    >
                      <td class="rank-cell">
                        {{ player.rank }}
                      </td>

                      <td class="name-cell">
                        <div class="player-name">
                          <span>{{ player.name }}</span>

                          <span
                            v-if="player.isTopCut"
                            class="top-badge"
                          >
                            TOP {{ group.topCut }}
                          </span>
                        </div>
                      </td>

                      <td>{{ player.section }}</td>
                      <td>{{ player.withdrawRound }}</td>
                      <td>{{ player.record }}</td>
                      <td>{{ player.points }}</td>
                      <td>{{ player.opponentWinRate }}</td>
                      <td>{{ player.opponentOpponentWinRate }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="mobile-standing">
              <article
                v-for="player in group.players"
                :key="player.clientId"
                class="standing-card"
                :class="{ 'top-cut-card': player.isTopCut }"
              >
                <header class="card-header">
                  <div class="card-player-name">
                    <span class="rank-badge">
                      #{{ player.rank }}
                    </span>

                    <strong>{{ player.name }}</strong>
                  </div>

                  <span
                    v-if="player.isTopCut"
                    class="top-badge"
                  >
                    TOP {{ group.topCut }}
                  </span>
                </header>

                <dl class="card-details">
                  <div>
                    <dt>
                      {{ $t('tournamentsSeccion.standingSeccion') }}
                    </dt>
                    <dd>{{ player.section }}</dd>
                  </div>

                  <div>
                    <dt>
                      {{ $t('tournamentsSeccion.standingHistorial') }}
                    </dt>
                    <dd>{{ player.record }}</dd>
                  </div>

                  <div>
                    <dt>
                      {{ $t('tournamentsSeccion.standingPuntos') }}
                    </dt>
                    <dd>{{ player.points }}</dd>
                  </div>

                  <div>
                    <dt>
                      {{ $t('tournamentsSeccion.standingVictory1') }}
                    </dt>
                    <dd>{{ player.opponentWinRate }}</dd>
                  </div>

                  <div>
                    <dt>
                      {{ $t('tournamentsSeccion.standingVictory2') }}
                    </dt>
                    <dd>{{ player.opponentOpponentWinRate }}</dd>
                  </div>

                  <div>
                    <dt>
                      {{ $t('tournamentsSeccion.standingRoundDrop') }}
                    </dt>
                    <dd>{{ player.withdrawRound }}</dd>
                  </div>
                </dl>
              </article>
            </div>
          </section>
        </div>

        <section
          v-else
          class="state-card empty-state"
        >
          <h2>No hay clasificación disponible</h2>
          <p>
            Todavía no existen posiciones registradas para este torneo.
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

const apiUrl = inject('apiUrl', '');
const mode = inject('mode', 'light');
const gifLoading = inject('gifLoading', null);

const route = useRoute();
const { locale, t } = useI18n();

const loading = ref(true);
const loadError = ref('');

const tournamentName = ref('');
const organizer = ref('');
const currentRound = ref(0);
const totalRounds = ref(0);
const lastUpdate = ref('');
const standingsByCategory = ref({});

let requestController = null;

const isDark = computed(() => unref(mode) === 'dark');

const tournamentId = computed(() => {
  const numericId = Number(route.params.id_torneo);

  return Number.isFinite(numericId) && numericId > 0
    ? numericId
    : null;
});

const categoryGroups = computed(() =>
  Object.entries(standingsByCategory.value)
    .map(([category, players]) => ({
      category,
      players,
      topCut: getTopByCategory(players.length)
    }))
    .sort((firstGroup, secondGroup) =>
      firstGroup.category.localeCompare(
        secondGroup.category,
        locale.value || 'es'
      )
    )
);

const formattedLastUpdate = computed(() => {
  if (!lastUpdate.value) {
    return '';
  }

  const parsedDate = new Date(lastUpdate.value);

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

const normalizeNumber = (value, fallback = 0) => {
  const numericValue = Number(value);

  return Number.isFinite(numericValue)
    ? numericValue
    : fallback;
};

const normalizeText = (value, fallback = '-') => {
  const normalizedValue = String(value ?? '').trim();

  return normalizedValue || fallback;
};

const normalizePercentage = (value) => {
  const normalizedValue = String(value ?? '')
    .trim()
    .replace(/%+$/, '');

  if (!normalizedValue) {
    return '-';
  }

  const numericValue = Number(normalizedValue);

  if (Number.isFinite(numericValue)) {
    return `${numericValue}%`;
  }

  return `${normalizedValue}%`;
};

const getTopByCategory = (totalPlayers) => {
  if (totalPlayers <= 7) {
    return 2;
  }

  if (totalPlayers <= 16) {
    return 4;
  }

  return 8;
};

const parseRoundLabel = (value) => {
  const normalizedValue = String(value || '');
  const match = normalizedValue.match(/(\d+)\s*\/\s*(\d+)/);

  if (!match) {
    return {
      current: 0,
      total: 0
    };
  }

  return {
    current: normalizeNumber(match[1]),
    total: normalizeNumber(match[2])
  };
};

const normalizeStandingsResponse = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  if (Array.isArray(data?.standings)) {
    return data.standings;
  }

  return [];
};

const groupStandings = (standings) => {
  const grouped = {};

  standings.forEach((player, index) => {
    if (!player || typeof player !== 'object') {
      return;
    }

    const category = normalizeText(
      player.category,
      'General'
    );

    if (!grouped[category]) {
      grouped[category] = [];
    }

    const rank = normalizeNumber(
      player.position ?? player.rank,
      index + 1
    );

    const wins = normalizeNumber(player.wins);
    const losses = normalizeNumber(player.losses);
    const draws = normalizeNumber(player.draws);
    const points = normalizeNumber(player.points);

    grouped[category].push({
      clientId:
        player.id ??
        player.standingId ??
        player.standing_id ??
        `${category}-${rank}-${index}`,
      rank,
      name: normalizeText(
        player.playerName ?? player.player_name,
        `Jugador ${index + 1}`
      ),
      section: normalizeText(player.section),
      withdrawRound: normalizeText(
        player.withdrawalRound ??
        player.withdrawal_round
      ),
      record: `${wins}/${losses}/${draws} (${points})`,
      points,
      opponentWinRate: normalizePercentage(
        player.opponentWinPercentage ??
        player.opponent_win_percentage
      ),
      opponentOpponentWinRate: normalizePercentage(
        player.opponentOpponentWinPercentage ??
        player.opponent_opponent_win_percentage
      ),
      isTopCut: false
    });
  });

  Object.values(grouped).forEach((players) => {
    players.sort((firstPlayer, secondPlayer) =>
      firstPlayer.rank - secondPlayer.rank
    );

    const topCut = getTopByCategory(players.length);

    players.forEach((player) => {
      player.isTopCut = player.rank <= topCut;
    });
  });

  return grouped;
};

const clearStandingData = () => {
  tournamentName.value = '';
  organizer.value = '';
  currentRound.value = 0;
  totalRounds.value = 0;
  lastUpdate.value = '';
  standingsByCategory.value = {};
};

const isCanceledRequest = (error) =>
  error?.name === 'CanceledError' ||
  error?.code === 'ERR_CANCELED';

const loadStandings = async () => {
  if (tournamentId.value == null) {
    loading.value = false;
    clearStandingData();
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
        `tournament-standing/${tournamentId.value}`
      ),
      {
        signal: controller.signal
      }
    );

    const standings = normalizeStandingsResponse(
      response?.data
    );

    if (!standings.length) {
      clearStandingData();
      return;
    }

    const firstStanding = standings[0];
    const roundInfo = parseRoundLabel(
      firstStanding.roundLabel ??
      firstStanding.round_label
    );

    currentRound.value = roundInfo.current;
    totalRounds.value = roundInfo.total;

    lastUpdate.value = String(
      firstStanding.createdAt ??
      firstStanding.created_at ??
      ''
    ).trim();

    tournamentName.value = normalizeText(
      firstStanding.tournamentName ??
      firstStanding.tournament_name,
      ''
    );

    organizer.value = normalizeText(
      firstStanding.organizer ??
      firstStanding.organizador,
      ''
    );

    standingsByCategory.value =
      groupStandings(standings);
  } catch (error) {
    if (isCanceledRequest(error)) {
      return;
    }

    console.error(
      'Error al cargar la clasificación:',
      error
    );

    clearStandingData();

    loadError.value =
      error?.response?.data?.message ||
      t('responseApisSeccion.loadingDataError') ||
      'No se pudo cargar la clasificación.';
  } finally {
    if (requestController === controller) {
      loading.value = false;
      requestController = null;
    }
  }
};

watch(
  tournamentId,
  loadStandings,
  { immediate: true }
);

onBeforeUnmount(() => {
  requestController?.abort();
});
</script>

<style scoped>
.standing-page {
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
  --table-header: #eef5ff;
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

.standing-page.theme-dark {
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
  --table-header: #172a46;
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

.standing-page,
.standing-page * {
  box-sizing: border-box;
}

.standing-container {
  width: min(100%, 1440px);
  margin: 0 auto;
}

.standing-content,
.category-section {
  min-width: 0;
}

.standing-header {
  position: relative;
  display: flex;
  min-width: 0;
  gap: 28px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 26px;
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

.standing-header::after {
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

.standing-header > div {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.standing-header h1,
.tournament-name,
.standing-summary {
  margin: 0;
}

.standing-header h1 {
  overflow-wrap: anywhere;
  font-size: clamp(1.9rem, 4vw, 3.2rem);
  font-weight: 850;
  letter-spacing: -0.035em;
  line-height: 1.05;
}

.tournament-name {
  margin-bottom: 8px;
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.15em;
  opacity: 0.92;
  text-transform: uppercase;
}

.standing-summary {
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

.standing-summary span,
.standing-summary time {
  overflow-wrap: anywhere;
}

.standing-summary span {
  font-weight: 750;
}

.standing-summary time {
  font-size: 0.88rem;
  opacity: 0.88;
}

.categories-list {
  display: grid;
  gap: 24px;
}

.category-section {
  padding: 20px;
  border: 1px solid var(--border-color);
  border-radius: 22px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.category-header {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.category-header h2 {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: clamp(1.2rem, 2.5vw, 1.55rem);
  font-weight: 850;
  letter-spacing: -0.02em;
}

.category-count {
  display: inline-flex;
  min-height: 30px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  padding: 5px 11px;
  border: 1px solid rgba(0, 102, 255, 0.2);
  border-radius: 999px;
  color: var(--electric-blue);
  background: var(--electric-blue-soft);
  font-size: 0.78rem;
  font-weight: 850;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--surface);
  scrollbar-color: var(--electric-blue) var(--surface-secondary);
}

.standing-table {
  width: 100%;
  min-width: 980px;
  border-collapse: separate;
  border-spacing: 0;
  color: var(--text-primary);
}

.standing-table th,
.standing-table td {
  padding: 13px 12px;
  border-bottom: 1px solid var(--border-color);
  text-align: center;
  vertical-align: middle;
}

.standing-table th {
  position: sticky;
  top: 0;
  z-index: 1;
  color: var(--text-secondary);
  background: var(--table-header);
  font-size: 0.78rem;
  font-weight: 850;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.standing-table tbody tr {
  background: var(--surface);
  transition: background-color 140ms ease;
}

.standing-table tbody tr:hover {
  background: var(--surface-hover);
}

.standing-table tbody tr:last-child td {
  border-bottom: 0;
}

.top-cut-row {
  background:
    linear-gradient(
      90deg,
      var(--electric-blue-soft),
      var(--surface) 45%
    ) !important;
}

.top-cut-row td:first-child {
  border-left: 5px solid var(--electric-blue);
}

.rank-cell {
  color: var(--electric-blue);
  font-weight: 900;
}

.name-cell {
  min-width: 210px;
  text-align: left !important;
}

.player-name {
  display: flex;
  min-width: 0;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
}

.player-name > span:first-child {
  min-width: 0;
  overflow-wrap: anywhere;
  font-weight: 750;
}

.top-badge,
.rank-badge {
  display: inline-flex;
  min-height: 27px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 900;
  white-space: nowrap;
}

.top-badge {
  padding: 4px 9px;
  color: #ffffff;
  background: var(--electric-blue);
  box-shadow: 0 5px 12px rgba(0, 102, 255, 0.2);
}

.rank-badge {
  min-width: 38px;
  padding: 4px 8px;
  color: var(--electric-blue);
  background: var(--electric-blue-soft);
}

.mobile-standing {
  display: none;
}

.standing-card,
.state-card {
  border: 1px solid var(--border-color);
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.standing-card {
  min-width: 0;
  padding: 18px;
  border-radius: 18px;
}

.top-cut-card {
  border-left: 5px solid var(--electric-blue);
  background:
    linear-gradient(
      135deg,
      var(--electric-blue-soft),
      var(--surface) 58%
    );
}

.card-header {
  display: flex;
  min-width: 0;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 12px;
}

.card-player-name {
  display: flex;
  min-width: 0;
  gap: 9px;
  align-items: center;
}

.card-player-name strong {
  min-width: 0;
  overflow-wrap: anywhere;
}

.card-details {
  margin: 0;
}

.card-details > div {
  display: grid;
  grid-template-columns: minmax(120px, 0.9fr) minmax(0, 1.1fr);
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-color);
}

.card-details > div:last-child {
  border-bottom: 0;
}

.card-details dt {
  color: var(--text-secondary);
  font-size: 0.86rem;
  font-weight: 750;
}

.card-details dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  font-weight: 700;
  text-align: right;
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

@media (max-width: 1023.98px) {
  .desktop-standing {
    display: none;
  }

  .mobile-standing {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 14px;
  }
}

@media (max-width: 767.98px) {
  .standing-page {
    padding: 18px 12px 32px;
  }

  .standing-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 18px;
    margin-bottom: 18px;
    padding: 24px 20px;
    border-radius: 20px;
  }

  .standing-summary {
    width: 100%;
    flex-basis: auto;
    text-align: left;
  }

  .category-section {
    padding: 16px;
    border-radius: 18px;
  }

  .category-header {
    align-items: flex-start;
  }

  .mobile-standing {
    grid-template-columns: 1fr;
  }

  .card-details > div {
    grid-template-columns: 1fr;
    gap: 4px;
  }

  .card-details dd {
    text-align: left;
  }

  .state-card {
    min-height: 320px;
    padding: 24px 18px;
    border-radius: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .standing-table tbody tr,
  .action-button {
    transition: none;
  }

  .action-button:hover:not(:disabled) {
    transform: none;
  }

  .loading-spinner {
    animation-duration: 1.4s;
  }
}
</style>
