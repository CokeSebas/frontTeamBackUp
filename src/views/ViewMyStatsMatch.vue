<template>
  <main
    class="stats-match-view"
    :class="{ 'theme-dark': isDark }"
  >
    <div class="view-container">
      <section class="list-card" aria-labelledby="tournaments-title">
        <div
          v-if="loading"
          class="state-panel"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <img
            v-if="gifLoading"
            :src="gifLoading"
            alt="Cargando torneos"
            class="loading-image"
          >
          <span
            v-else
            class="loading-spinner"
            aria-hidden="true"
          />
        </div>

        <template v-else>
          <header class="page-header">
            <div class="header-kicker">
              <span class="header-kicker-dot" aria-hidden="true" />
              {{ $t('matchRecordSection.subTittle1') }}
            </div>

            <h1 id="tournaments-title">
              {{ $t('matchRecordSection.myTournaments') }}
            </h1>

            <p class="page-description">
              {{ $t('matchRecordSection.subTittle2') }}
            </p>

            <div
              v-if="tournaments.length"
              class="header-stats"
              aria-label="Resumen de estadísticas"
            >
              <span class="stat-chip">
                <strong>{{ tournaments.length }}</strong>
                {{ tournaments.length === 1 ? 'torneo' : 'torneos' }}
              </span>

              <span class="stat-chip">
                <strong>{{ totalRounds }}</strong>
                {{ totalRounds === 1 ? 'ronda' : 'rondas' }}
              </span>

              <span class="stat-chip">
                <strong>{{ totalWins }}</strong>
                {{ totalWins === 1 ? 'victoria' : 'victorias' }}
              </span>
            </div>
          </header>

          <div
            v-if="errorMessage"
            class="state-panel error-state"
            role="alert"
          >
            <div class="state-icon" aria-hidden="true">!</div>
            <h2>No pudimos cargar tus estadísticas</h2>
            <p>{{ errorMessage }}</p>
            <button
              type="button"
              class="button button-primary"
              @click="retryLoadStats"
            >
              Reintentar
            </button>
          </div>

          <div
            v-else-if="tournaments.length"
            class="content-section"
          >
            <div class="section-summary">
              <div>
                <h2>Resumen por torneo</h2>
                <p>
                  {{ $t('matchRecordSection.textTip1') }}
                </p>
              </div>

              <span class="summary-badge">
                {{ tournaments.length }}
                {{ tournaments.length === 1 ? 'registro' : 'registros' }}
              </span>
            </div>

            <div
              class="table-scroll"
              role="region"
              :aria-label="$t('matchRecordSection.myTournaments')"
              tabindex="0"
            >
              <table class="tournaments-table">
                <thead>
                  <tr>
                    <th scope="col" class="text-center">
                      {{ $t('matchRecordSection.tournament') }}
                    </th>
                    <th scope="col" class="text-center">
                      {{ $t('matchRecordSection.round') }}
                    </th>
                    <th scope="col" class="text-center">
                      {{ $t('matchRecordSection.victorys') }}
                    </th>
                    <th scope="col" class="text-center">
                      {{ $t('matchRecordSection.defeats') }}
                    </th>
                    <th scope="col" class="text-center">
                      {{ $t('matchRecordSection.draws') }}
                    </th>
                    <th scope="col" class="text-center">
                      {{ $t('matchRecordSection.winRate') }}
                    </th>
                    <th scope="col" class="actions-column">
                      <span class="visually-hidden">Acciones</span>
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <template
                    v-for="tournament in tournaments"
                    :key="getTournamentKey(tournament)"
                  >
                    <tr class="tournament-row">
                      <td class="tournament-name text-center">
                        {{ formatName(tournament.tournamentName) }}
                      </td>
                      <td class="text-center">{{ tournament.totalRounds ?? 0 }}</td>
                      <td class="text-center">
                        <span class="metric-value metric-value--win">
                          {{ tournament.wins ?? 0 }}
                        </span>
                      </td>
                      <td class="text-center">
                        <span class="metric-value metric-value--loss">
                          {{ tournament.losses ?? 0 }}
                        </span>
                      </td>
                      <td class="text-center">
                        <span class="metric-value metric-value--tie">
                          {{ tournament.ties ?? 0 }}
                        </span>
                      </td>
                      <td class="text-center">
                        <span :class="getWinrateClass(tournament.winRate)">
                          {{ formatWinRate(tournament.winRate) }}%
                        </span>
                      </td>
                      <td class="text-center">
                        <button
                          type="button"
                          class="details-button"
                          :aria-expanded="expandedTournament === tournament.tournamentName"
                          :aria-controls="getTournamentDetailId(tournament)"
                          @click="viewDetailTournament(
                            tournament.userId,
                            tournament.tournamentName
                          )"
                        >
                          {{
                            expandedTournament === tournament.tournamentName
                              ? $t('matchRecordSection.ocultarDetails')
                              : $t('matchRecordSection.seeDetails')
                          }}
                        </button>
                      </td>
                    </tr>

                    <tr
                      v-if="expandedTournament === tournament.tournamentName"
                      class="expanded-row"
                    >
                      <td colspan="7" class="details-cell">
                        <div
                          :id="getTournamentDetailId(tournament)"
                          class="detail-box"
                        >
                          <div class="detail-header">
                            <div>
                              <span class="detail-kicker">Detalle competitivo</span>
                              <h3>{{ formatName(tournament.tournamentName) }}</h3>
                              <p>
                                {{ formatWinRate(tournament.winRate) }}%
                                {{ $t('matchRecordSection.winRate') }}
                              </p>
                            </div>
                          </div>

                          <div
                            v-if="detailLoading[tournament.tournamentName]"
                            class="detail-loading"
                            role="status"
                            aria-live="polite"
                          >
                            <img
                              v-if="gifLoading"
                              :src="gifLoading"
                              alt="Cargando detalles"
                              class="detail-loading-image"
                            >
                            <span
                              v-else
                              class="loading-spinner loading-spinner--small"
                              aria-hidden="true"
                            />
                          </div>

                          <div
                            v-else-if="detailErrors[tournament.tournamentName]"
                            class="error-message error-message--compact"
                            role="alert"
                          >
                            {{ detailErrors[tournament.tournamentName] }}
                          </div>

                          <template v-else>
                            <div class="matches-list">
                              <article
                                v-for="match in getTournamentMatches(
                                  tournament.tournamentName
                                )"
                                :key="`${tournament.tournamentName}-${match.round}`"
                                class="match-card"
                                :class="`match-card--${normalizeResult(match.result)}`"
                              >
                                <div class="match-top">
                                  <span class="badge-round">
                                    {{ $t('matchRecordSection.round') }}
                                    {{ match.round }}
                                  </span>

                                  <div class="opponent">
                                    vs {{ match.opponentName || '—' }}
                                  </div>

                                  <div
                                    :class="[
                                      'result-badge',
                                      normalizeResult(match.result)
                                    ]"
                                  >
                                    {{ formatResult(match.result) }}
                                  </div>
                                </div>

                                <div class="pokemon-row">
                                  <div
                                    v-for="(pokemon, index) in getMatchPokemons(match)"
                                    :key="`${match.round}-${pokemon.id
                                      ?? pokemon.name
                                      ?? index}`"
                                    class="poke-slot"
                                  >
                                    <img
                                      :src="pokemon.image"
                                      :alt="pokemon.name || 'Pokémon'"
                                      loading="lazy"
                                    >
                                  </div>
                                </div>
                              </article>
                            </div>

                            <div
                              v-if="!getTournamentMatches(
                                tournament.tournamentName
                              ).length"
                              class="empty-details"
                            >
                              No hay partidas disponibles para este torneo.
                            </div>
                          </template>
                        </div>

                        <button
                          type="button"
                          class="download-button"
                          :disabled="
                            detailLoading[tournament.tournamentName]
                            || !getTournamentMatches(
                              tournament.tournamentName
                            ).length
                            || isExporting(tournament)
                          "
                          @click="downloadShareCard(tournament)"
                        >
                          <span
                            v-if="isExporting(tournament)"
                            class="button-spinner"
                            aria-hidden="true"
                          />
                          <span v-else aria-hidden="true">📸</span>
                          {{
                            isExporting(tournament)
                              ? 'Generando imagen...'
                              : $t('matchRecordSection.shareCard')
                          }}
                        </button>
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>

          <div v-else class="state-panel empty-state">
            <div class="state-icon state-icon--empty" aria-hidden="true">🏆</div>
            <h2>{{ $t('matchRecordSection.noTournaments') }}</h2>
            <p>
              Cuando registres partidas, aquí podrás revisar tus resultados.
            </p>
          </div>
        </template>
      </section>
    </div>

    <div
      ref="exportCard"
      class="export-card"
      :class="exportTheme"
      aria-hidden="true"
    >
      <div class="export-header">
        <div>🏆 {{ exportData?.name }}</div>
        <div class="export-subtitle">
          {{ formatWinRate(exportData?.winRate) }}% Win Rate
        </div>
      </div>

      <div class="export-matches">
        <div
          v-for="match in exportMatches"
          :key="`export-${match.round}`"
          class="export-match"
          :class="normalizeResult(match.result)"
        >
          <div class="match-banner">
            <span class="round-badge">
              {{ $t('matchRecordSection.round') }} {{ match.round }}
            </span>

            <div class="match-center">
              <div class="match-opponent">
                vs {{ match.opponentName || '—' }}
              </div>

              <div class="match-pokemons">
                <img
                  v-for="(pokemon, index) in getMatchPokemons(match)"
                  :key="`export-${match.round}-${pokemon.id
                    ?? pokemon.name
                    ?? index}`"
                  :src="pokemon.image"
                  :alt="pokemon.name || 'Pokémon'"
                >
              </div>
            </div>

            <span
              class="match-result"
              :class="normalizeResult(match.result)"
            >
              {{ formatResult(match.result) }}
            </span>
          </div>
        </div>
      </div>

      <div class="export-footer">
        <div class="footer-brand">
          <img :src="logoSrc" alt="PokéCircuit" class="export-logo">
          <span>pokecircuit.com</span>
        </div>
      </div>
    </div>
  </main>
</template>

<script>
import axios from 'axios';
import html2canvas from 'html2canvas';
import { jwtDecode } from 'jwt-decode';
import { useAuthStore } from '@/stores/authStore';
import logo from '@/assets/pokecircuit.png';

export default {
  name: 'ViewMyStatsMatch',

  inject: {
    apiUrl: {
      default: ''
    },
    gifLoading: {
      default: ''
    },
    mode: {
      default: 'light'
    }
  },

  data() {
    return {
      tournaments: [],
      loading: true,
      errorMessage: '',
      expandedTournament: null,
      tournamentDetails: {},
      detailLoading: {},
      detailErrors: {},
      logoSrc: logo,
      exportData: null,
      exportTheme: 'dark',
      exportingTournament: '',
      globalThemeDark: false,
      themeObserver: null
    };
  },

  computed: {
    isDark() {
      const injectedMode = this.mode?.value ?? this.mode;

      return injectedMode === 'dark' || this.globalThemeDark;
    },

    exportMatches() {
      return Array.isArray(this.exportData?.matches)
        ? this.exportData.matches
        : [];
    },

    totalRounds() {
      return this.tournaments.reduce(
        (total, tournament) => total + Number(tournament?.totalRounds || 0),
        0
      );
    },

    totalWins() {
      return this.tournaments.reduce(
        (total, tournament) => total + Number(tournament?.wins || 0),
        0
      );
    }
  },

  methods: {
    buildApiUrl(path) {
      const baseUrl = String(this.apiUrl ?? '').replace(/\/+$/, '');
      const normalizedPath = String(path ?? '').replace(/^\/+/, '');

      return `${baseUrl}/${normalizedPath}`;
    },

    detectGlobalTheme() {
      if (typeof document === 'undefined') {
        this.globalThemeDark = false;
        return;
      }

      const elements = [document.documentElement, document.body]
        .filter(Boolean);

      this.globalThemeDark = elements.some((element) => {
        const classes = element.classList;

        return classes.contains('dark')
          || classes.contains('dark-mode')
          || classes.contains('theme-dark')
          || classes.contains('is-dark')
          || element.dataset.theme === 'dark'
          || element.dataset.bsTheme === 'dark';
      });
    },

    initializeThemeObserver() {
      this.detectGlobalTheme();

      if (typeof MutationObserver === 'undefined'
        || typeof document === 'undefined') {
        return;
      }

      this.themeObserver = new MutationObserver(() => {
        this.detectGlobalTheme();
      });

      [document.documentElement, document.body]
        .filter(Boolean)
        .forEach((element) => {
          this.themeObserver.observe(element, {
            attributes: true,
            attributeFilter: ['class', 'data-theme', 'data-bs-theme']
          });
        });
    },

    getAuthData() {
      const authStore = useAuthStore();
      const token = authStore.token;

      if (!token) {
        throw new Error('No se encontró un token de autenticación.');
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken?.userId;

      if (!userId) {
        throw new Error(
          'El token no contiene un identificador de usuario válido.'
        );
      }

      return { token, userId };
    },

    async loadStats() {
      this.errorMessage = '';

      try {
        const { token, userId } = this.getAuthData();
        const response = await axios.get(
          this.buildApiUrl(`matches/tournament-users/${userId}`),
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        this.tournaments = Array.isArray(response.data)
          ? response.data
          : [];
      } catch (error) {
        console.error('Error al cargar los torneos:', error);
        this.tournaments = [];
        this.errorMessage = this.getErrorMessage(
          error,
          'No fue posible cargar tus torneos. Intenta nuevamente.'
        );
      }
    },

    async retryLoadStats() {
      if (this.loading) return;

      this.loading = true;

      try {
        await this.loadStats();
      } finally {
        this.loading = false;
      }
    },

    async viewDetailTournament(userId, tournamentName) {
      if (!tournamentName) return;

      if (this.expandedTournament === tournamentName) {
        this.expandedTournament = null;
        return;
      }

      this.expandedTournament = tournamentName;

      if (Object.prototype.hasOwnProperty.call(
        this.tournamentDetails,
        tournamentName
      )) {
        return;
      }

      this.detailLoading[tournamentName] = true;
      this.detailErrors[tournamentName] = '';

      try {
        const { token } = this.getAuthData();
        const response = await axios.post(
          this.buildApiUrl('matches/tournament-detail'),
          {
            userId,
            name: tournamentName
          },
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        this.tournamentDetails[tournamentName] = Array.isArray(response.data)
          ? response.data
          : [];
      } catch (error) {
        console.error('Error al cargar el detalle del torneo:', error);
        this.detailErrors[tournamentName] = this.getErrorMessage(
          error,
          'No fue posible cargar el detalle del torneo.'
        );
      } finally {
        this.detailLoading[tournamentName] = false;
      }
    },

    async downloadShareCard(tournament) {
      const tournamentKey = this.getTournamentKey(tournament);

      if (this.exportingTournament) return;

      const matches = this.getTournamentMatches(
        tournament.tournamentName
      );

      if (!matches.length) return;

      this.exportingTournament = tournamentKey;
      this.errorMessage = '';
      this.exportData = {
        name: this.formatName(tournament.tournamentName),
        winRate: tournament.winRate,
        matches
      };
      this.exportTheme = this.isDark ? 'dark' : 'light';

      try {
        await this.$nextTick();
        await document.fonts?.ready;
        await this.waitForImages(this.$refs.exportCard);
        await new Promise((resolve) => setTimeout(resolve, 100));

        const element = this.$refs.exportCard;
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
          logging: false
        });

        const link = document.createElement('a');
        link.download = `${
          this.toSafeFileName(tournament.tournamentName)
        }-share.png`;
        link.href = canvas.toDataURL('image/png');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (error) {
        console.error(
          'Error al generar la tarjeta compartible:',
          error
        );
        this.errorMessage =
          'No fue posible generar la imagen para compartir.';
      } finally {
        this.exportingTournament = '';
      }
    },

    waitForImages(container) {
      if (!container) return Promise.resolve();

      const images = Array.from(container.querySelectorAll('img'));

      return Promise.all(
        images.map((image) => {
          if (image.complete) return Promise.resolve();

          return new Promise((resolve) => {
            image.addEventListener('load', resolve, { once: true });
            image.addEventListener('error', resolve, { once: true });
          });
        })
      );
    },

    isExporting(tournament) {
      return this.exportingTournament === this.getTournamentKey(tournament);
    },

    formatName(name) {
      const normalizedName = String(name ?? '').trim();

      if (!normalizedName) return '';

      return normalizedName.charAt(0).toUpperCase()
        + normalizedName.slice(1);
    },

    formatWinRate(rate) {
      const numericRate = Number(rate);

      if (!Number.isFinite(numericRate)) return 0;

      return Math.round(numericRate * 10) / 10;
    },

    formatResult(result) {
      return this.normalizeResult(result).toUpperCase();
    },

    normalizeResult(result) {
      const normalizedResult = String(result ?? '').toLowerCase();

      return ['win', 'loss', 'tie'].includes(normalizedResult)
        ? normalizedResult
        : 'tie';
    },

    getWinrateClass(rate) {
      const numericRate = Number(rate);

      if (numericRate >= 70) return 'winrate winrate--high';
      if (numericRate >= 50) return 'winrate winrate--medium';
      return 'winrate winrate--low';
    },

    getTournamentMatches(tournamentName) {
      const matches = this.tournamentDetails[tournamentName];
      return Array.isArray(matches) ? matches : [];
    },

    getMatchPokemons(match) {
      if (!Array.isArray(match?.pokemons)) return [];

      return match.pokemons.filter((pokemon) => pokemon?.image);
    },

    getTournamentKey(tournament) {
      return `${
        tournament.userId ?? 'user'
      }-${
        tournament.tournamentName ?? 'tournament'
      }`;
    },

    getTournamentDetailId(tournament) {
      return `tournament-detail-${
        this.toSafeFileName(this.getTournamentKey(tournament))
      }`;
    },

    toSafeFileName(value) {
      return String(value ?? 'tournament')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase() || 'tournament';
    },

    getErrorMessage(error, fallbackMessage) {
      return error?.response?.data?.message
        || error?.message
        || fallbackMessage;
    }
  },

  async mounted() {
    this.initializeThemeObserver();

    const authStore = useAuthStore();

    if (!authStore.isAuthenticated) {
      await this.$router.replace({
        path: '/login',
        query: {
          redirect: this.$route.fullPath
        }
      });
      return;
    }

    try {
      await this.loadStats();
    } finally {
      this.loading = false;
    }
  },

  beforeUnmount() {
    this.themeObserver?.disconnect();
  }
};
</script>

<style scoped>
.stats-match-view {
  --accent: #7357d5;
  --accent-strong: #6446c4;
  --accent-dark: #4d3196;
  --accent-light: #8b72e6;
  --accent-soft: rgba(115, 87, 213, 0.1);
  --accent-border: rgba(115, 87, 213, 0.28);
  --accent-glow: rgba(115, 87, 213, 0.18);
  --page-text: #292333;
  --muted-text: #746d7f;
  --card-bg: rgba(255, 255, 255, 0.95);
  --card-border: #e3deef;
  --card-shadow: 0 24px 60px rgba(77, 49, 150, 0.1);
  --surface-bg: #fdfcff;
  --surface-strong: #f7f3ff;
  --table-head: #eee9f8;
  --input-border: #d6d0e2;
  --focus-ring: rgba(115, 87, 213, 0.2);
  --success: #239466;
  --success-soft: rgba(35, 148, 102, 0.13);
  --warning: #b78310;
  --warning-soft: rgba(183, 131, 16, 0.15);
  --danger: #c34555;
  --danger-soft: rgba(195, 69, 85, 0.13);

  min-height: 100%;
  background:
    radial-gradient(
      circle at 10% 0%,
      rgba(115, 87, 213, 0.1),
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

.stats-match-view.theme-dark {
  --accent: #9278e7;
  --accent-strong: #7b5fd7;
  --accent-dark: #5d42b0;
  --accent-light: #c4b5ff;
  --accent-soft: rgba(146, 120, 231, 0.12);
  --accent-border: rgba(146, 120, 231, 0.28);
  --accent-glow: rgba(146, 120, 231, 0.2);
  --page-text: #f7f3ff;
  --muted-text: #cbc3d5;
  --card-bg: rgba(35, 30, 46, 0.96);
  --card-border: #484057;
  --card-shadow: 0 24px 60px rgba(0, 0, 0, 0.42);
  --surface-bg: #211d2a;
  --surface-strong: #2c2637;
  --table-head: #352f40;
  --input-border: #625970;
  --focus-ring: rgba(146, 120, 231, 0.24);
  --success: #68d7a5;
  --success-soft: rgba(104, 215, 165, 0.14);
  --warning: #efc864;
  --warning-soft: rgba(239, 200, 100, 0.14);
  --danger: #f18a98;
  --danger-soft: rgba(241, 138, 152, 0.14);

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

.stats-match-view,
.stats-match-view * {
  box-sizing: border-box;
}

.view-container {
  width: min(100%, 1240px);
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 2.25rem);
}

.list-card {
  overflow: hidden;
  border: 1px solid var(--card-border);
  border-radius: 24px;
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(12px);
}

.page-header {
  position: relative;
  padding: clamp(1.2rem, 3vw, 1.6rem);
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
  margin-bottom: 0.75rem;
  padding: 0.4rem 0.72rem;
  border: 1px solid rgba(255, 255, 255, 0.26);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 0.78rem;
  font-weight: 850;
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
  font-size: clamp(1.8rem, 4.5vw, 2.8rem);
  line-height: 1.12;
  text-wrap: balance;
}

.page-description {
  position: relative;
  z-index: 1;
  max-width: 700px;
  margin: 0.8rem auto 0;
  color: rgba(255, 255, 255, 0.9);
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
  margin-top: 1.2rem;
}

.stat-chip {
  display: inline-flex;
  gap: 0.38rem;
  align-items: center;
  padding: 0.45rem 0.78rem;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-size: 0.88rem;
}

.stat-chip strong {
  font-size: 1rem;
}

.content-section {
  padding: clamp(1rem, 3vw, 2rem);
}

.section-summary {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-summary h2 {
  margin: 0;
  color: var(--page-text);
  font-size: clamp(1.2rem, 2vw, 1.5rem);
}

.section-summary p {
  max-width: 680px;
  margin: 0.35rem 0 0;
  color: var(--muted-text);
  line-height: 1.5;
}

.summary-badge,
.detail-kicker {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.65rem;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 0.76rem;
  font-weight: 850;
  white-space: nowrap;
}

.theme-dark .summary-badge,
.theme-dark .detail-kicker {
  color: var(--accent-light);
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--card-border);
  border-radius: 16px;
  background: var(--surface-bg);
  scrollbar-width: thin;
  scrollbar-color: var(--accent-border) transparent;
}

.table-scroll:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}

.tournaments-table {
  width: 100%;
  min-width: 800px;
  border-collapse: separate;
  border-spacing: 0;
  background: var(--surface-bg);
  color: var(--page-text);
}

.tournaments-table th,
.tournaments-table td {
  padding: 0.9rem 0.75rem;
  border-bottom: 1px solid var(--card-border);
  color: var(--page-text);
  vertical-align: middle;
}

.tournaments-table th {
  background: var(--table-head);
  font-size: 0.76rem;
  font-weight: 850;
  letter-spacing: 0.045em;
  text-transform: uppercase;
  white-space: nowrap;
}

.tournaments-table tbody > tr:last-child td {
  border-bottom: 0;
}

.tournament-row {
  transition:
    background-color 160ms ease,
    transform 160ms ease;
}

.tournament-row:hover {
  background: var(--accent-soft);
}

.tournament-name {
  min-width: 190px;
  font-weight: 800;
}

.actions-column {
  width: 160px;
}

.text-center {
  text-align: center;
}

.metric-value {
  display: inline-grid;
  min-width: 2rem;
  min-height: 2rem;
  place-items: center;
  border-radius: 9px;
  font-weight: 850;
}

.metric-value--win {
  background: var(--success-soft);
  color: var(--success);
}

.metric-value--loss {
  background: var(--danger-soft);
  color: var(--danger);
}

.metric-value--tie {
  background: var(--warning-soft);
  color: var(--warning);
}

.details-button,
.download-button,
.button {
  display: inline-flex;
  min-height: 42px;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  padding: 0.65rem 1rem;
  border: 0;
  border-radius: 11px;
  background:
    linear-gradient(
      135deg,
      var(--accent-strong),
      var(--accent),
      var(--accent-light)
    );
  color: #ffffff;
  font: inherit;
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 1.2;
  cursor: pointer;
  box-shadow: 0 9px 20px var(--accent-glow);
  transition:
    transform 140ms ease,
    filter 140ms ease,
    box-shadow 140ms ease;
}

.details-button:hover,
.download-button:hover:not(:disabled),
.button:hover:not(:disabled) {
  filter: brightness(1.04);
  transform: translateY(-2px);
}

.details-button:focus-visible,
.download-button:focus-visible,
.button:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}

.download-button {
  margin-top: 0.85rem;
}

.download-button:disabled,
.button:disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.winrate {
  display: inline-flex;
  min-width: 68px;
  justify-content: center;
  padding: 0.35rem 0.58rem;
  border-radius: 999px;
  font-weight: 850;
}

.winrate--high {
  background: var(--success-soft);
  color: var(--success);
}

.winrate--medium {
  background: var(--warning-soft);
  color: var(--warning);
}

.winrate--low {
  background: var(--danger-soft);
  color: var(--danger);
}

.expanded-row {
  background: var(--surface-strong);
}

.details-cell {
  padding: 1rem !important;
}

.detail-box {
  padding: clamp(1rem, 2.5vw, 1.35rem);
  border: 1px solid var(--accent-border);
  border-radius: 16px;
  background:
    linear-gradient(135deg, var(--accent-soft), transparent 70%),
    var(--surface-bg);
}

.detail-header {
  display: flex;
  gap: 0.8rem;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.detail-header h3 {
  margin: 0.45rem 0 0;
  color: var(--page-text);
  font-size: 1.15rem;
  font-weight: 850;
}

.detail-header p {
  margin: 0.3rem 0 0;
  color: var(--muted-text);
  font-size: 0.88rem;
}

.matches-list {
  display: grid;
  gap: 0.85rem;
}

.match-card {
  position: relative;
  min-width: 0;
  padding: 0.95rem;
  overflow: hidden;
  border: 1px solid var(--card-border);
  border-radius: 14px;
  background: var(--card-bg);
  box-shadow: 0 10px 24px rgba(77, 49, 150, 0.06);
}

.match-card::before {
  position: absolute;
  top: 0.8rem;
  bottom: 0.8rem;
  left: 0;
  width: 4px;
  border-radius: 0 999px 999px 0;
  background: var(--accent);
  content: '';
}

.match-card--win::before {
  background: var(--success);
}

.match-card--loss::before {
  background: var(--danger);
}

.match-card--tie::before {
  background: var(--warning);
}

.match-top {
  display: grid;
  grid-template-columns:
    minmax(90px, 1fr)
    minmax(180px, 2fr)
    minmax(90px, 1fr);
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 0.75rem;
}

.badge-round,
.round-badge {
  justify-self: start;
  padding: 0.32rem 0.62rem;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 0.75rem;
  font-weight: 850;
  white-space: nowrap;
}

.theme-dark .badge-round,
.theme-dark .round-badge {
  color: var(--accent-light);
}

.opponent {
  justify-self: center;
  color: var(--page-text);
  font-size: 1rem;
  font-weight: 800;
  text-align: center;
  overflow-wrap: anywhere;
}

.result-badge,
.match-result {
  justify-self: end;
  padding: 0.35rem 0.7rem;
  border-radius: 999px;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 850;
  white-space: nowrap;
}

.result-badge.win,
.match-result.win {
  background: var(--success);
}

.result-badge.loss,
.match-result.loss {
  background: var(--danger);
}

.result-badge.tie,
.match-result.tie {
  background: var(--warning);
  color: #2f2600;
}

.pokemon-row {
  display: flex;
  min-height: 70px;
  flex-wrap: wrap;
  gap: 0.65rem;
  justify-content: center;
  margin-top: 0.45rem;
}

.poke-slot {
  display: grid;
  width: 68px;
  height: 68px;
  place-items: center;
  border: 1px solid var(--card-border);
  border-radius: 13px;
  background: var(--surface-strong);
}

.poke-slot img {
  width: 60px;
  height: 60px;
  object-fit: contain;
  filter: drop-shadow(0 4px 7px rgba(0, 0, 0, 0.15));
  transition: transform 160ms ease;
}

.poke-slot img:hover {
  transform: translateY(-2px) scale(1.05);
}

.state-panel,
.detail-loading {
  display: grid;
  min-height: 360px;
  place-items: center;
  align-content: center;
  gap: 0.9rem;
  padding: 2rem;
  color: var(--page-text);
  text-align: center;
}

.state-panel h2,
.state-panel p {
  margin: 0;
}

.state-panel p {
  max-width: 580px;
  color: var(--muted-text);
  line-height: 1.55;
}

.detail-loading {
  min-height: 130px;
  padding: 1rem;
}

.loading-image {
  display: block;
  /*max-width: min(100%, 220px);*/
  height: auto;
  object-fit: contain;
}

.detail-loading-image {
  display: block;
  /*max-width: min(100%, 100px);*/
  height: auto;
  object-fit: contain;
}

.loading-spinner,
.button-spinner {
  display: inline-block;
  border: 3px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.loading-spinner {
  width: 64px;
  height: 64px;
  color: var(--accent);
  filter: drop-shadow(0 0 10px var(--accent-glow));
}

.loading-spinner--small {
  width: 38px;
  height: 38px;
}

.button-spinner {
  width: 18px;
  height: 18px;
}

.state-icon {
  display: grid;
  width: 64px;
  height: 64px;
  place-items: center;
  border: 1px solid var(--accent-border);
  border-radius: 50%;
  background: var(--accent-soft);
  color: var(--accent-strong);
  font-size: 1.5rem;
  font-weight: 900;
}

.state-icon--empty {
  font-size: 1.65rem;
}

.error-message,
.empty-details {
  padding: 0.9rem 1rem;
  border-radius: 12px;
  text-align: center;
}

.error-message {
  border: 1px solid var(--accent-border);
  background: var(--accent-soft);
  color: var(--accent-dark);
  font-weight: 750;
}

.theme-dark .error-message {
  color: var(--accent-light);
}

.error-message--compact {
  padding: 0.75rem;
}

.empty-details {
  border: 1px dashed var(--card-border);
  background: var(--surface-strong);
  color: var(--muted-text);
}

.empty-state {
  min-height: 420px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.export-card {
  position: fixed;
  top: 0;
  left: -9999px;
  z-index: -1;
  display: flex;
  width: 850px;
  min-height: 520px;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  padding: 30px;
  border: 1px solid #e3deef;
  border-radius: 24px;
  color: #292333;
  background:
    radial-gradient(
      circle at 10% 0%,
      rgba(115, 87, 213, 0.1),
      transparent 24rem
    ),
    #ffffff;
  box-shadow: 0 20px 40px rgba(77, 49, 150, 0.18);
  font-family: 'Segoe UI', Arial, sans-serif;
  pointer-events: none;
}

.export-card.dark {
  border-color: #484057;
  color: #f7f3ff;
  background:
    radial-gradient(
      circle at 10% 0%,
      rgba(146, 120, 231, 0.12),
      transparent 24rem
    ),
    #191521;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.42);
}

.export-header {
  padding: 20px;
  border-radius: 18px;
  background:
    linear-gradient(135deg, #4d3196, #7357d5, #8b72e6);
  color: #ffffff;
  font-size: 38px;
  font-weight: 800;
  text-align: center;
}

.export-subtitle {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 18px;
  font-weight: 550;
}

.export-matches {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.export-match {
  padding: 12px;
  border: 2px solid transparent;
  border-radius: 14px;
}

.export-match.win {
  border-color: #239466;
  box-shadow: 0 0 12px rgba(35, 148, 102, 0.28);
}

.export-match.loss {
  border-color: #c34555;
  box-shadow: 0 0 12px rgba(195, 69, 85, 0.28);
}

.export-match.tie {
  border-color: #b78310;
  box-shadow: 0 0 12px rgba(183, 131, 16, 0.28);
}

.match-banner {
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border: 1px solid rgba(77, 49, 150, 0.12);
  border-radius: 14px;
  background: linear-gradient(145deg, #ffffff, #f7f3ff);
  box-shadow: 0 4px 12px rgba(77, 49, 150, 0.08);
}

.dark .match-banner {
  border-color: rgba(255, 255, 255, 0.08);
  background: linear-gradient(145deg, #2c2637, #211d2a);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
}

.match-center {
  flex: 1;
  text-align: center;
}

.match-opponent {
  margin-bottom: 6px;
  color: inherit;
  font-weight: 700;
}

.match-pokemons {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.match-pokemons img {
  width: 64px;
  height: 64px;
  object-fit: contain;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.28));
}

.export-footer {
  display: flex;
  align-items: center;
  justify-content: center;
}

.footer-brand {
  display: flex;
  gap: 10px;
  align-items: center;
  color: inherit;
  font-size: 14px;
  opacity: 0.7;
}

.export-logo {
  width: auto;
  height: 32px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 767.98px) {
  .view-container {
    padding: 0.8rem;
  }

  .list-card {
    border-radius: 18px;
  }

  .content-section {
    padding: 0.9rem;
  }

  .section-summary {
    flex-direction: column;
  }

  .summary-badge {
    align-self: flex-start;
  }

  .tournaments-table th,
  .tournaments-table td {
    padding: 0.75rem 0.62rem;
  }

  .details-cell {
    padding: 0.75rem !important;
  }

  .detail-box {
    padding: 0.85rem;
  }

  .match-top {
    grid-template-columns: 1fr auto;
  }

  .opponent {
    grid-column: 1 / -1;
    grid-row: 1;
    margin-bottom: 0.25rem;
    font-size: 0.95rem;
  }

  .badge-round {
    grid-column: 1;
    grid-row: 2;
  }

  .result-badge {
    grid-column: 2;
    grid-row: 2;
  }

  .pokemon-row {
    gap: 0.5rem;
  }

  .poke-slot {
    width: 58px;
    height: 58px;
  }

  .poke-slot img {
    width: 52px;
    height: 52px;
  }

  .download-button {
    width: 100%;
  }
}

@media (max-width: 479.98px) {
  .view-container {
    padding: 0.55rem;
  }

  .page-header {
    padding-right: 1rem;
    padding-left: 1rem;
  }

  .header-stats {
    gap: 0.45rem;
  }

  .stat-chip {
    font-size: 0.8rem;
  }

  .detail-header {
    flex-direction: column;
  }
}

@media (prefers-reduced-motion: reduce) {
  .tournament-row,
  .details-button,
  .download-button,
  .button,
  .poke-slot img {
    transition: none;
  }

  .details-button:hover,
  .download-button:hover:not(:disabled),
  .button:hover:not(:disabled),
  .poke-slot img:hover {
    transform: none;
  }

  .loading-spinner,
  .button-spinner {
    animation-duration: 1.4s;
  }
}
</style>
