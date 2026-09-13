<template>
  <section
    class="tournaments-page"
    :class="{ 'theme-dark': mode === 'dark' }"
    :data-bs-theme="mode === 'dark' ? 'dark' : 'light'"
  >
    <div class="tournaments-shell">
      <header class="hero-card">
        <div class="hero-copy">
          <h1 class="hero-title">{{ $t('tournamentsSeccion.title') }}</h1>
          <p class="hero-description">
            {{ $t('tournamentsSeccion.subTittle') }}
          </p>
        </div>

        <div class="hero-counter" aria-live="polite">
          <strong>{{ filteredTournaments.length }}</strong>
          <span>
            {{ filteredTournaments.length === 1 ? 'torneo visible' : 'torneos visibles' }}
          </span>
        </div>
      </header>

      <main class="content-card">
        <div v-if="loading" class="state-panel loading-state" role="status" aria-live="polite">
          <img
            v-if="gifLoading"
            :src="gifLoading"
            class="loading-image"
            alt="Cargando torneos"
          >
          <span v-else class="loading-spinner" aria-hidden="true"></span>
        </div>

        <div v-else-if="errorMessage" class="state-panel error-state" role="alert">
          <div>
            <h2>No pudimos cargar los torneos</h2>
            <p>{{ errorMessage }}</p>
          </div>

          <button
            type="button"
            class="btn-electric"
            :disabled="loading"
            @click="retryLoad"
          >
            Reintentar
          </button>
        </div>

        <template v-else>
          <section class="filters-card" aria-labelledby="filters-title">
            <div class="filters-heading">
              <div>
                <span class="section-kicker">BÚSQUEDA</span>
                <h2 id="filters-title">Filtrar torneos</h2>
              </div>

              <button
                v-if="hasActiveFilters"
                type="button"
                class="clear-filters-button"
                @click="clearFilters"
              >
                Limpiar filtros
              </button>
            </div>

            <div class="filters-grid">
              <div class="filter-field">
                <label for="tournament-type" class="form-label">
                  {{ $t('tournamentsSeccion.type') }}
                </label>
                <select
                  id="tournament-type"
                  v-model="filterType"
                  class="form-select"
                >
                  <option value="">Todos los tipos</option>
                  <option value="challenge">Challenge</option>
                  <option value="cup">Cup</option>
                  <option value="liga">Liga Casual</option>
                  <option value="vg_online">VG Online</option>
                </select>
              </div>

              <div class="filter-field">
                <label for="tournament-format" class="form-label">
                  {{ $t('teamsSeccion.format') }}
                </label>
                <select
                  id="tournament-format"
                  v-model="filterFormat"
                  class="form-select"
                >
                  <option value="">Todos los formatos</option>
                  <option value="vgc">VGC</option>
                  <option value="tcg">TCG</option>
                </select>
              </div>
            </div>

            <p class="results-summary" aria-live="polite">
              Mostrando
              <strong>{{ filteredTournaments.length }}</strong>
              de
              <strong>{{ tournaments.length }}</strong>
              torneos.
            </p>
          </section>

          <section class="results-card" aria-labelledby="results-title">
            <div class="results-heading">
              <div>
                <span class="section-kicker">LISTADO</span>
                <h2 id="results-title">Torneos disponibles</h2>
              </div>
            </div>

            <div
              v-if="currentItems.length === 0"
              class="state-panel empty-state"
              role="status"
            >
              <div class="empty-icon" aria-hidden="true">⌕</div>
              <h3>No encontramos torneos</h3>
              <p>
                No hay resultados que coincidan con los filtros seleccionados.
              </p>
              <button
                v-if="hasActiveFilters"
                type="button"
                class="btn-electric-soft"
                @click="clearFilters"
              >
                Mostrar todos
              </button>
            </div>

            <template v-else>
              <div class="table-wrapper d-none d-lg-block">
                <table class="tournaments-table">
                  <thead>
                    <tr>
                      <th scope="col">{{ $t('tournamentsSeccion.name') }}</th>
                      <th scope="col">{{ $t('tournamentsSeccion.type') }}</th>
                      <th scope="col">{{ $t('teamsSeccion.format') }}</th>
                      <th scope="col">{{ $t('tournamentsSeccion.date') }}</th>
                      <th scope="col" class="actions-column">Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr v-for="tournament in currentItems" :key="tournament.id">
                      <td>
                        <div class="tournament-identity">
                          <span class="tournament-marker" aria-hidden="true"></span>
                          <div>
                            <strong>{{ tournament.nombre || 'Torneo sin nombre' }}</strong>
                            <small>#{{ tournament.id }}</small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span class="info-badge">
                          {{ getTournamentType(tournament.tipo_torneo) }}
                        </span>
                      </td>

                      <td>
                        <span class="format-badge">
                          {{ getTournamentFormat(tournament.formato_torneo) }}
                        </span>
                      </td>

                      <td class="date-cell">
                        {{ formatDate(tournament.fecha_torneo) }}
                      </td>

                      <td>
                        <div class="desktop-actions">
                          <button
                            type="button"
                            class="action-button"
                            :disabled="!tournament.hasRound"
                            :aria-label="`${$t('tournamentsSeccion.goToRound')}: ${tournament.nombre || 'torneo'}`"
                            @click="goToRound(tournament.id)"
                          >
                            {{ $t('tournamentsSeccion.round') }}
                          </button>

                          <button
                            type="button"
                            class="action-button"
                            :disabled="!tournament.hasStanding"
                            :aria-label="`${$t('tournamentsSeccion.goToStanding')}: ${tournament.nombre || 'torneo'}`"
                            @click="goToStanding(tournament.id)"
                          >
                            {{ $t('tournamentsSeccion.standing') }}
                          </button>

                          <button
                            type="button"
                            class="action-button"
                            :disabled="!tournament.hasResults"
                            :aria-label="`${$t('tournamentsSeccion.goToResults')}: ${tournament.nombre || 'torneo'}`"
                            @click="goToResults(tournament.id)"
                          >
                            {{ $t('tournamentsSeccion.results') }}
                          </button>

                          <button
                            type="button"
                            class="action-button action-button-primary"
                            :aria-label="`${$t('tournamentsSeccion.seeImgTop')}: ${tournament.nombre || 'torneo'}`"
                            @click="goToTops(tournament.id)"
                          >
                            {{ $t('tournamentsSeccion.imgTop') }}
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mobile-grid d-lg-none">
                <article
                  v-for="tournament in currentItems"
                  :key="tournament.id"
                  class="tournament-card"
                >
                  <div class="card-topline">
                    <span class="info-badge">
                      {{ getTournamentType(tournament.tipo_torneo) }}
                    </span>
                    <span class="format-badge">
                      {{ getTournamentFormat(tournament.formato_torneo) }}
                    </span>
                  </div>

                  <div class="card-header">
                    <div class="tournament-marker" aria-hidden="true"></div>
                    <div>
                      <h3>{{ tournament.nombre || 'Torneo sin nombre' }}</h3>
                      <span>Torneo #{{ tournament.id }}</span>
                    </div>
                  </div>

                  <dl class="tournament-details">
                    <div>
                      <dt>{{ $t('tournamentsSeccion.date') }}</dt>
                      <dd>{{ formatDate(tournament.fecha_torneo) }}</dd>
                    </div>
                  </dl>

                  <div class="mobile-actions">
                    <button
                      type="button"
                      class="action-button"
                      :disabled="!tournament.hasRound"
                      @click="goToRound(tournament.id)"
                    >
                      {{ $t('tournamentsSeccion.round') }}
                    </button>

                    <button
                      type="button"
                      class="action-button"
                      :disabled="!tournament.hasStanding"
                      @click="goToStanding(tournament.id)"
                    >
                      {{ $t('tournamentsSeccion.standing') }}
                    </button>

                    <button
                      type="button"
                      class="action-button"
                      :disabled="!tournament.hasResults"
                      @click="goToResults(tournament.id)"
                    >
                      {{ $t('tournamentsSeccion.results') }}
                    </button>

                    <button
                      type="button"
                      class="action-button action-button-primary"
                      @click="goToTops(tournament.id)"
                    >
                      {{ $t('tournamentsSeccion.imgTop') }}
                    </button>
                  </div>
                </article>
              </div>
            </template>

            <div
              v-if="filteredTournaments.length > itemsPerPage"
              class="paginator-wrapper"
            >
              <Paginator
                :key="paginatorKey"
                :items="filteredTournaments"
                :items-per-page="itemsPerPage"
                @page-changed="handlePageChanged"
              />
            </div>
          </section>
        </template>
      </main>
    </div>
  </section>
</template>

<script>
import axios from 'axios';
import Paginator from '@/components/AppPaginator.vue';

export default {
  name: 'ViewSeeTournaments',

  components: {
    Paginator
  },

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
      filterType: '',
      filterFormat: '',
      currentItems: [],
      itemsPerPage: 10,
      requestId: 0,

      tipoTorneoLabel: {
        liga: 'Liga Casual',
        challenge: 'Challenge',
        cup: 'Cup',
        vg_online: 'VG Online'
      },

      formatoTorneoLabel: {
        vgc: 'VGC',
        tcg: 'TCG'
      }
    };
  },

  computed: {
    filteredTournaments() {
      return this.tournaments.filter((tournament) => {
        const tournamentType = String(tournament?.tipo_torneo || '').toLowerCase();
        const tournamentFormat = String(tournament?.formato_torneo || '').toLowerCase();

        const matchesType = !this.filterType || tournamentType === this.filterType;
        const matchesFormat = !this.filterFormat || tournamentFormat === this.filterFormat;

        return matchesType && matchesFormat;
      });
    },

    hasActiveFilters() {
      return Boolean(this.filterType || this.filterFormat);
    },

    paginatorKey() {
      return [
        this.filterType || 'all-types',
        this.filterFormat || 'all-formats',
        this.filteredTournaments.length
      ].join('-');
    }
  },

  watch: {
    filteredTournaments: {
      handler(newList) {
        this.currentItems = Array.isArray(newList)
          ? newList.slice(0, this.itemsPerPage)
          : [];
      },
      immediate: true
    }
  },

  mounted() {
    this.loadTournaments();
  },

  methods: {
    buildApiUrl(path = '') {
      const baseUrl = String(this.apiUrl || '').replace(/\/+$/, '');
      const cleanPath = String(path || '').replace(/^\/+/, '');

      return baseUrl
        ? `${baseUrl}/${cleanPath}`
        : `/${cleanPath}`;
    },

    handlePageChanged(paginatedItems) {
      this.currentItems = Array.isArray(paginatedItems)
        ? paginatedItems
        : [];
    },

    clearFilters() {
      this.filterType = '';
      this.filterFormat = '';
    },

    async loadTournaments() {
      const currentRequestId = ++this.requestId;

      this.loading = true;
      this.errorMessage = '';

      try {
        const response = await axios.get(this.buildApiUrl('tournaments'));

        if (currentRequestId !== this.requestId) {
          return;
        }

        const responseData = response?.data;
        const tournamentList = Array.isArray(responseData)
          ? responseData
          : Array.isArray(responseData?.data)
            ? responseData.data
            : [];

        this.tournaments = tournamentList.filter((tournament) => tournament && tournament.id);
      } catch (error) {
        if (currentRequestId !== this.requestId) {
          return;
        }

        console.error('Error al cargar torneos:', error);
        this.tournaments = [];

        const backendMessage =
          error?.response?.data?.message
          || error?.response?.data?.error;

        this.errorMessage =
          backendMessage
          || 'No fue posible cargar los torneos. Intenta nuevamente.';
      } finally {
        if (currentRequestId === this.requestId) {
          this.loading = false;
        }
      }
    },

    retryLoad() {
      this.loadTournaments();
    },

    getTournamentType(type) {
      const normalizedType = String(type || '').toLowerCase();
      return this.tipoTorneoLabel[normalizedType] || type || 'Sin tipo';
    },

    getTournamentFormat(format) {
      const normalizedFormat = String(format || '').toLowerCase();
      return this.formatoTorneoLabel[normalizedFormat]
        || normalizedFormat.toUpperCase()
        || 'Sin formato';
    },

    goToRound(idTorneo) {
      if (!idTorneo) return;

      this.$router.push({
        name: 'ViewGoToRound',
        params: {
          id_torneo: idTorneo
        }
      });
    },

    goToStanding(idTorneo) {
      if (!idTorneo) return;
      this.$router.push(`/tournament/goToStanding/${idTorneo}`);
    },

    goToResults(idTorneo) {
      if (!idTorneo) return;
      this.$router.push(`/tournament/goToResults/${idTorneo}`);
    },

    goToTops(idTorneo) {
      if (!idTorneo) return;
      this.$router.push(`/tournament/goToTops/${idTorneo}`);
    },

    formatDate(date) {
      if (!date) return 'Sin fecha';

      const isoDateMatch = String(date).match(/^(\d{4})-(\d{2})-(\d{2})/);

      if (isoDateMatch) {
        const [, year, month, day] = isoDateMatch;
        return `${day}/${month}/${year}`;
      }

      const parsedDate = new Date(date);

      if (Number.isNaN(parsedDate.getTime())) {
        return 'Sin fecha';
      }

      return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(parsedDate);
    }
  }
};
</script>

<style scoped>
.tournaments-page {
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

.tournaments-page.theme-dark {
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

.tournaments-shell {
  width: min(100%, 1440px);
  margin: 0 auto;
}

.hero-card,
.content-card,
.filters-card,
.results-card {
  border: 1px solid var(--border-color);
  background: var(--surface);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 32px;
  padding: clamp(24px, 4vw, 44px);
  overflow: hidden;
  border-radius: 24px;
  box-shadow: var(--shadow-soft);
  position: relative;
}

.hero-card::after {
  content: '';
  position: absolute;
  right: -70px;
  bottom: -100px;
  width: 260px;
  height: 260px;
  pointer-events: none;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    rgba(0, 166, 255, 0.25) 0%,
    rgba(0, 102, 255, 0.05) 48%,
    transparent 70%
  );
}

.hero-copy {
  max-width: 780px;
  position: relative;
  z-index: 1;
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
}

.hero-description {
  max-width: 700px;
  margin: 0;
  color: var(--text-secondary);
  font-size: clamp(0.98rem, 1.7vw, 1.12rem);
  line-height: 1.7;
}

.hero-counter {
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
  position: relative;
  z-index: 1;
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

.content-card {
  margin-top: 22px;
  padding: clamp(16px, 2.5vw, 26px);
  border-radius: 22px;
  box-shadow: var(--shadow-card);
}

.filters-card,
.results-card {
  padding: clamp(18px, 2.5vw, 28px);
  border-radius: 18px;
}

.results-card {
  margin-top: 20px;
}

.filters-heading,
.results-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}

.filters-heading h2,
.results-heading h2 {
  margin: 4px 0 0;
  color: var(--text-primary);
  font-size: clamp(1.25rem, 2vw, 1.55rem);
  font-weight: 800;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 320px));
  gap: 18px;
}

.filter-field {
  min-width: 0;
}

.form-label {
  margin-bottom: 7px;
  color: var(--text-primary);
  font-size: 0.88rem;
  font-weight: 700;
}

.form-select {
  min-height: 46px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-primary);
  background-color: var(--surface-secondary);
}

.form-select:focus {
  border-color: var(--electric-blue);
  box-shadow: var(--focus-ring);
  color: var(--text-primary);
  background-color: var(--surface);
}

.form-select option {
  color: var(--text-primary);
  background: var(--surface);
}

.clear-filters-button {
  padding: 7px 0;
  border: 0;
  color: var(--electric-blue);
  background: transparent;
  font-size: 0.88rem;
  font-weight: 800;
}

.clear-filters-button:hover {
  color: var(--electric-blue-strong);
  text-decoration: underline;
}

.results-summary {
  margin: 18px 0 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.results-summary strong {
  color: var(--text-primary);
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--border-color);
  border-radius: 16px;
}

.tournaments-table {
  width: 100%;
  min-width: 1120px;
  border-collapse: collapse;
  color: var(--text-primary);
}

.tournaments-table th,
.tournaments-table td {
  padding: 15px 16px;
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
  min-width: 430px;
}

.tournament-identity {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 260px;
}

.tournament-marker {
  flex: 0 0 12px;
  width: 12px;
  height: 42px;
  border-radius: 999px;
  background: linear-gradient(180deg, var(--electric-cyan), var(--electric-blue));
  box-shadow: 0 0 18px rgba(0, 102, 255, 0.34);
}

.tournament-identity strong {
  display: block;
  color: var(--text-primary);
  font-size: 0.96rem;
}

.tournament-identity small {
  color: var(--text-secondary);
}

.info-badge,
.format-badge {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
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

.desktop-actions,
.mobile-actions {
  display: grid;
  gap: 8px;
}

.desktop-actions {
  grid-template-columns: repeat(4, minmax(86px, 1fr));
}

.action-button,
.btn-electric,
.btn-electric-soft {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 38px;
  border-radius: 10px;
  font-weight: 800;
  line-height: 1.1;
  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease,
    color 160ms ease,
    box-shadow 160ms ease;
}

.action-button {
  padding: 8px 10px;
  border: 1px solid rgba(0, 102, 255, 0.28);
  color: var(--electric-blue);
  background: var(--electric-blue-soft);
  font-size: 0.78rem;
}

.action-button:hover,
.action-button:focus-visible {
  border-color: var(--electric-blue);
  color: #ffffff;
  background: var(--electric-blue);
  transform: translateY(-1px);
}

.action-button-primary,
.btn-electric {
  border: 1px solid var(--electric-blue);
  color: #ffffff;
  background: linear-gradient(
    135deg,
    var(--electric-blue),
    var(--electric-cyan)
  );
  box-shadow: 0 8px 18px rgba(0, 102, 255, 0.22);
}

.action-button-primary:hover,
.action-button-primary:focus-visible,
.btn-electric:hover,
.btn-electric:focus-visible {
  border-color: var(--electric-blue-strong);
  color: #ffffff;
  background: linear-gradient(
    135deg,
    var(--electric-blue-strong),
    var(--electric-blue)
  );
  box-shadow: 0 10px 22px rgba(0, 102, 255, 0.3);
}

.btn-electric,
.btn-electric-soft {
  padding: 10px 18px;
  border-style: solid;
  border-width: 1px;
}

.btn-electric-soft {
  border-color: rgba(0, 102, 255, 0.28);
  color: var(--electric-blue);
  background: var(--electric-blue-soft);
}

.btn-electric-soft:hover,
.btn-electric-soft:focus-visible {
  color: #ffffff;
  background: var(--electric-blue);
}

.action-button:focus-visible,
.btn-electric:focus-visible,
.btn-electric-soft:focus-visible,
.clear-filters-button:focus-visible,
.form-select:focus-visible {
  outline: none;
  box-shadow: var(--focus-ring);
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.mobile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.tournament-card {
  padding: 18px;
  border: 1px solid var(--border-color);
  border-radius: 17px;
  background: var(--surface);
  box-shadow: var(--shadow-card);
}

.card-topline {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 16px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.05rem;
  font-weight: 850;
}

.card-header span {
  color: var(--text-secondary);
  font-size: 0.82rem;
}

.tournament-details {
  margin: 18px 0;
}

.tournament-details > div {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 11px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.tournament-details dt {
  color: var(--text-secondary);
  font-weight: 600;
}

.tournament-details dd {
  margin: 0;
  color: var(--text-primary);
  font-weight: 800;
}

.mobile-actions {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.state-panel {
  display: grid;
  justify-items: center;
  align-content: center;
  min-height: 260px;
  padding: 30px 20px;
  border: 1px dashed var(--border-color);
  border-radius: 18px;
  color: var(--text-secondary);
  background: var(--surface-secondary);
  text-align: center;
}

.state-panel h2,
.state-panel h3 {
  margin: 0 0 8px;
  color: var(--text-primary);
  font-weight: 850;
}

.state-panel p {
  max-width: 520px;
  margin: 0 0 20px;
  line-height: 1.6;
}

.loading-state p {
  margin: 14px 0 0;
  font-weight: 700;
}

.loading-image {
  display: block;
  /*width: min(220px, 75vw);
  max-height: 180px;*/
  object-fit: contain;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(0, 102, 255, 0.18);
  border-top-color: var(--electric-blue);
  border-radius: 50%;
  animation: spin 850ms linear infinite;
}

.error-state {
  gap: 8px;
}

.empty-icon {
  display: grid;
  width: 58px;
  height: 58px;
  margin-bottom: 14px;
  place-items: center;
  border: 1px solid rgba(0, 102, 255, 0.24);
  border-radius: 50%;
  color: var(--electric-blue);
  background: var(--electric-blue-soft);
  font-size: 1.8rem;
  font-weight: 900;
}

.paginator-wrapper {
  margin-top: 22px;
}

:deep(.pagination) {
  justify-content: center;
  gap: 5px;
  margin: 0;
}

:deep(.page-link) {
  min-width: 38px;
  border-color: var(--border-color);
  border-radius: 9px !important;
  color: var(--text-primary);
  background: var(--surface);
  text-align: center;
}

:deep(.page-link:hover) {
  border-color: var(--electric-blue);
  color: var(--electric-blue);
  background: var(--electric-blue-soft);
}

:deep(.page-item.active .page-link) {
  border-color: var(--electric-blue);
  color: #ffffff;
  background: var(--electric-blue);
  box-shadow: 0 6px 14px rgba(0, 102, 255, 0.24);
}

:deep(.page-item.disabled .page-link) {
  border-color: var(--border-color);
  color: var(--text-secondary);
  background: var(--surface-secondary);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 991.98px) {
  .hero-card {
    align-items: stretch;
  }

  .hero-counter {
    flex-basis: 150px;
  }
}

@media (max-width: 767.98px) {
  .tournaments-page {
    padding: 16px 10px 28px;
  }

  .hero-card {
    flex-direction: column;
    gap: 22px;
    border-radius: 18px;
  }

  .hero-counter {
    width: 100%;
    min-height: 104px;
  }

  .content-card {
    padding: 12px;
    border-radius: 18px;
  }

  .filters-card,
  .results-card {
    padding: 16px;
    border-radius: 15px;
  }

  .filters-heading {
    align-items: center;
  }

  .filters-grid,
  .mobile-grid {
    grid-template-columns: 1fr;
  }

  .mobile-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 420px) {
  .filters-heading {
    align-items: flex-start;
    flex-direction: column;
  }

  .mobile-actions {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
</style>
