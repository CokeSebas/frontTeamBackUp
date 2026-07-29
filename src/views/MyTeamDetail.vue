<!-- Componente optimizado con estilo verde eléctrico de ViewTeamsPublic -->

<template>
  <main
    class="team-detail-page"
    :class="{ 'team-detail-page--dark': isDark }"
    aria-labelledby="team-detail-title"
  >
    <div class="container py-4 py-lg-5">
      <header class="detail-header">
        <span class="detail-header__eyebrow">
          {{ $t('teamsSeccion.detail') }}
        </span>

        <h1 id="team-detail-title" class="detail-header__title">
          {{ team?.team_name || $t('teamsSeccion.detail') }}
        </h1>

        <div v-if="team" class="detail-header__meta">
          <span v-if="team.subFormatName" class="meta-chip">
            {{ team.subFormatName }}
          </span>

          <span class="meta-chip">
            {{ pokemonList.length }} Pokémon
          </span>
        </div>
      </header>

      <section
        v-if="isLoading"
        class="state-card"
        aria-live="polite"
        aria-busy="true"
      >
        <img
          v-if="loadingImage"
          :src="loadingImage"
          class="state-card__loader-image"
          alt="Cargando detalle del equipo"
        >
        <span
          v-else
          class="loading-spinner"
          aria-hidden="true"
        ></span>
      </section>

      <section
        v-else-if="error"
        class="state-card state-card--error"
        role="alert"
      >
        <h2 class="state-card__title">
          No fue posible cargar el equipo
        </h2>

        <p class="state-card__text">
          {{ error }}
        </p>

        <button
          type="button"
          class="action-button action-button--primary"
          @click="getTeamDetail"
        >
          Reintentar
        </button>
      </section>

      <section
        v-else-if="team"
        class="detail-layout"
      >
        <div class="pokemon-column">
          <div
            v-if="pokemonList.length"
            class="pokemon-grid"
            aria-label="Pokémon del equipo"
          >
            <article
              v-for="(pokemon, index) in pokemonList"
              :key="`${pokemon.species || 'pokemon'}-${index}`"
              class="pokemon-card"
            >
              <div class="pokemon-card__image-wrap">
                <img
                  v-if="pokemon.pokeImg && !pokemon.imageError"
                  :src="pokemon.pokeImg"
                  :alt="pokemon.species ? `Imagen de ${pokemon.species}` : 'Imagen de Pokémon'"
                  class="pokemon-card__image"
                  width="112"
                  height="112"
                  loading="lazy"
                  decoding="async"
                  @error="handlePokemonImageError(pokemon)"
                >

                <span
                  v-else
                  class="pokemon-card__placeholder"
                  aria-hidden="true"
                >
                  {{ getPokemonInitial(pokemon) }}
                </span>
              </div>

              <div class="pokemon-card__body">
                <h2 class="pokemon-card__name">
                  {{ pokemon.species || 'Pokémon' }}
                  <span v-if="pokemon.item"> @ {{ pokemon.item }}</span>
                </h2>

                <dl class="pokemon-stats">
                  <div v-if="pokemon.ability">
                    <dt>{{ $t('teamsSeccion.ability') }}</dt>
                    <dd>{{ pokemon.ability }}</dd>
                  </div>

                  <div>
                    <dt>{{ $t('teamsSeccion.level') }}</dt>
                    <dd>{{ pokemon.level ?? 100 }}</dd>
                  </div>

                  <div v-if="showTeraType && pokemon.teraType">
                    <dt>{{ $t('teamsSeccion.teraType') }}</dt>
                    <dd>{{ pokemon.teraType }}</dd>
                  </div>

                  <div v-if="pokemon.evs">
                    <dt>EVs</dt>
                    <dd>{{ pokemon.evs }}</dd>
                  </div>

                  <div v-if="pokemon.nature">
                    <dt>Nature</dt>
                    <dd>{{ pokemon.nature }}</dd>
                  </div>

                  <div v-if="pokemon.ivs">
                    <dt>IVs</dt>
                    <dd>{{ pokemon.ivs }}</dd>
                  </div>
                </dl>

                <ul
                  v-if="Array.isArray(pokemon.moves) && pokemon.moves.length"
                  class="moves-list"
                  aria-label="Movimientos"
                >
                  <li
                    v-for="(move, moveIndex) in pokemon.moves"
                    :key="`${move}-${moveIndex}`"
                  >
                    {{ move }}
                  </li>
                </ul>
              </div>
            </article>
          </div>

          <div v-else class="empty-card">
            <h2>Equipo sin Pokémon</h2>
            <p>Este equipo no tiene Pokémon registrados.</p>
          </div>
        </div>

        <aside class="team-panel">
          <div class="panel-card">
            <div class="panel-card__heading">
              <h2>Información del equipo</h2>

              <span v-if="team.subFormatName" class="format-badge">
                {{ team.subFormatName }}
              </span>
            </div>

            <dl class="team-info-list">
              <div v-if="team.team_name" class="info-row">
                <dt>{{ $t('teamsSeccion.name') }}</dt>
                <dd>{{ team.team_name }}</dd>
              </div>

              <div v-if="team.url_paste" class="info-row">
                <dt>{{ $t('teamsSeccion.urlPaste') }}</dt>
                <dd>
                  <a
                    :href="team.url_paste"
                    class="breakable-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ team.url_paste }}
                  </a>

                  <button
                    type="button"
                    class="action-button action-button--soft copy-button"
                    @click="copyText"
                  >
                    {{ $t('buttons.copyPaste') }}
                  </button>

                  <span
                    v-if="copyFeedback"
                    :class="['copy-feedback', copyFeedbackType]"
                    aria-live="polite"
                  >
                    {{ copyFeedback }}
                  </span>
                </dd>
              </div>

              <div v-if="team.codeRental" class="info-row">
                <dt>{{ $t('teamsSeccion.codeRental') }}</dt>
                <dd>{{ team.codeRental }}</dd>
              </div>

              <div v-if="team.subFormatName" class="info-row">
                <dt>{{ $t('teamsSeccion.subFormat') }}</dt>
                <dd>{{ team.subFormatName }}</dd>
              </div>

              <div v-if="team.desc_uso" class="info-row">
                <dt>{{ $t('teamsSeccion.description') }}</dt>
                <dd class="pre-line">
                  <a
                    v-if="isLink(team.desc_uso)"
                    :href="team.desc_uso"
                    class="breakable-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {{ team.desc_uso }}
                  </a>
                  <template v-else>
                    {{ team.desc_uso }}
                  </template>
                </dd>
              </div>

              <div v-if="team.tournament_using" class="info-row">
                <dt>{{ $t('teamsSeccion.tournament') }}</dt>
                <dd>{{ team.tournament_using }}</dd>
              </div>

              <div v-if="team.mus_fav" class="info-row">
                <dt>{{ $t('teamsSeccion.musFav') }}</dt>
                <dd class="pre-line">{{ team.mus_fav }}</dd>
              </div>

              <div v-if="team.counters" class="info-row">
                <dt>{{ $t('teamsSeccion.teamsCounter') }}</dt>
                <dd class="pre-line">{{ team.counters }}</dd>
              </div>

              <div v-if="team.damage_calcs" class="info-row">
                <dt>{{ $t('teamsSeccion.damageCalcs') }}</dt>
                <dd class="pre-line">{{ team.damage_calcs }}</dd>
              </div>
            </dl>

            <div class="panel-actions">
              <button
                type="button"
                class="action-button action-button--primary"
                @click="goToTeamsheet"
              >
                {{ $t('buttons.goToTeamsheet') }}
              </button>
            </div>

            <div class="share-section">
              <h2 class="share-title">
                {{ $t('share') }}
              </h2>

              <ShareButtons
                :share-url="currentUrl"
                :share-text="shareText"
              />
            </div>
          </div>
        </aside>
      </section>

      <section v-else class="state-card">
        <h2 class="state-card__title">
          Equipo no encontrado
        </h2>
        <p class="state-card__text">
          No existe información disponible para este equipo.
        </p>
      </section>
    </div>
  </main>
</template>

<script>
import axios from 'axios';
import { unref } from 'vue';
import { useHead } from '@vueuse/head';
import ShareButtons from '../components/ShareButtons.vue';
import { createEvent } from '@/services/eventService';

export default {
  name: 'MyTeamDetail',

  components: {
    ShareButtons
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

  props: {
    id: {
      type: [String, Number],
      required: true
    }
  },

  data() {
    return {
      team: null,
      isLoading: false,
      error: '',
      copyFeedback: '',
      copyFeedbackType: 'success',
      copyFeedbackTimer: null,
      currentUrl: '',
      subFormat: Number.NaN,
      requestController: null
    };
  },

  computed: {
    isDark() {
      return unref(this.mode) === 'dark';
    },

    loadingImage() {
      return String(unref(this.gifLoading) || '').trim();
    },

    pokemonList() {
      return Array.isArray(this.team?.pokemons)
        ? this.team.pokemons
        : [];
    },

    showTeraType() {
      const value = Number(this.subFormat);
      return Number.isNaN(value) || value < 6;
    },

    shareText() {
      return this.team?.team_name
        ? `Revisa el equipo ${this.team.team_name}`
        : 'Revisa este equipo';
    }
  },

  watch: {
    id(newId, previousId) {
      if (String(newId) !== String(previousId)) {
        this.getTeamDetail();
      }
    }
  },

  methods: {
    buildApiUrl(path) {
      const base = String(unref(this.apiUrl) || '')
        .replace(/\/+$/, '');
      const normalizedPath = String(path || '')
        .replace(/^\/+/, '');

      return `${base}/${normalizedPath}`;
    },

    isCanceledRequest(error) {
      return (
        error?.name === 'CanceledError' ||
        error?.code === 'ERR_CANCELED'
      );
    },

    normalizeTeam(payload) {
      if (!payload || typeof payload !== 'object') {
        return null;
      }

      const pokemons = Array.isArray(payload.pokemons)
        ? payload.pokemons.map((pokemon) => ({
            ...pokemon,
            imageError: false
          }))
        : [];

      return {
        ...payload,
        pokemons
      };
    },

    async getTeamDetail() {
      const teamId = String(this.id ?? '').trim();

      if (!teamId) {
        this.team = null;
        this.error = 'El identificador del equipo no es válido.';
        this.isLoading = false;
        return;
      }

      this.requestController?.abort();

      const controller = new AbortController();
      this.requestController = controller;
      this.isLoading = true;
      this.error = '';

      try {
        const response = await axios.get(
          this.buildApiUrl(
            `teams/${encodeURIComponent(teamId)}`
          ),
          {
            signal: controller.signal
          }
        );

        const responseData = response?.data;
        const payload =
          responseData?.data ??
          responseData?.salida?.[0]?.data ??
          null;

        if (
          !payload ||
          (
            responseData?.status &&
            responseData.status !== 'success'
          )
        ) {
          throw new Error('Invalid team response');
        }

        const normalizedTeam = this.normalizeTeam(
          Array.isArray(payload) ? payload[0] : payload
        );

        if (!normalizedTeam) {
          throw new Error('Invalid team payload');
        }

        this.team = normalizedTeam;
        this.subFormat = Number(this.team.subFormatId);

        this.updateHead();
        void this.trackView();
      } catch (error) {
        if (this.isCanceledRequest(error)) {
          return;
        }

        console.error('Error al cargar el equipo:', error);

        this.team = null;
        this.error =
          error?.response?.data?.message ||
          this.$t('responseApisSeccion.loadingDataError') ||
          'No fue posible cargar el equipo.';
      } finally {
        if (this.requestController === controller) {
          this.isLoading = false;
          this.requestController = null;
        }
      }
    },

    updateHead() {
      const teamName = this.team?.team_name || 'Equipo';
      const description = `Detalles sobre ${teamName}`;

      useHead({
        title: `Equipo ${teamName}`,
        meta: [
          {
            name: 'description',
            content: description
          },
          {
            name: 'keywords',
            content: `${teamName}, Team, Tournament, VGC`
          },
          {
            property: 'og:title',
            content: `Team ${teamName}`
          },
          {
            property: 'og:description',
            content: description
          },
          {
            property: 'og:type',
            content: 'website'
          },
          {
            property: 'og:url',
            content: this.currentUrl
          }
        ]
      });
    },

    async trackView() {
      try {
        await createEvent({
          userAgent: navigator.userAgent,
          date: new Date().toISOString(),
          type: 'team_detail',
          description:
            `detalle del team ${this.team?.team_name || ''}, teamId: ${this.id}`
        });
      } catch (error) {
        console.warn(
          'No fue posible registrar la visualización:',
          error
        );
      }
    },

    handlePokemonImageError(pokemon) {
      if (pokemon && typeof pokemon === 'object') {
        pokemon.imageError = true;
      }
    },

    getPokemonInitial(pokemon) {
      const name = String(pokemon?.species || '?').trim();
      return name.charAt(0).toLocaleUpperCase() || '?';
    },

    async copyText() {
      const text = String(this.team?.url_paste || '').trim();

      if (!text) {
        return;
      }

      try {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(text);
        } else {
          this.copyWithFallback(text);
        }

        this.setCopyFeedback(
          this.$t('responseApisSeccion.copySuccess'),
          'success'
        );
      } catch (error) {
        console.error('Error al copiar el texto:', error);

        this.setCopyFeedback(
          this.$t('responseApisSeccion.copyError'),
          'error'
        );
      }
    },

    copyWithFallback(text) {
      const textarea = document.createElement('textarea');

      try {
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';

        document.body.appendChild(textarea);
        textarea.select();

        if (!document.execCommand('copy')) {
          throw new Error('Fallback copy failed');
        }
      } finally {
        textarea.remove();
      }
    },

    setCopyFeedback(message, type) {
      window.clearTimeout(this.copyFeedbackTimer);

      this.copyFeedback = message;
      this.copyFeedbackType = type;

      this.copyFeedbackTimer = window.setTimeout(() => {
        this.copyFeedback = '';
      }, 2500);
    },

    goToTeamsheet() {
      this.$router.push({
        name: 'ViewTeamSheetPublic',
        params: {
          id_team: this.id,
          type: 'public'
        }
      });
    },

    isLink(text) {
      return (
        typeof text === 'string' &&
        /^(https?:\/\/[^\s]+)$/i.test(text.trim())
      );
    }
  },

  mounted() {
    this.currentUrl = window.location.href;
    this.getTeamDetail();
  },

  beforeUnmount() {
    this.requestController?.abort();
    window.clearTimeout(this.copyFeedbackTimer);
  }
};
</script>

<style scoped>
.team-detail-page {
  --page-bg: #f5f7f8;
  --surface: #ffffff;
  --surface-muted: #f3f6f5;
  --text-primary: #1f2a25;
  --text-secondary: #647068;
  --border-color: #dce4df;
  --accent: #198754;
  --accent-strong: #11683e;
  --accent-soft: rgba(25, 135, 84, 0.12);
  --accent-border: rgba(25, 135, 84, 0.34);
  --focus-ring: rgba(25, 135, 84, 0.23);
  --danger-soft: #fff4f4;
  --danger-border: #f2c3c3;
  --danger-text: #b4232f;
  --shadow: 0 16px 40px rgba(25, 50, 37, 0.08);

  min-height: 100dvh;
  background:
    radial-gradient(
      circle at top center,
      rgba(25, 135, 84, 0.09),
      transparent 29rem
    ),
    var(--page-bg);
  color: var(--text-primary);
}

.team-detail-page--dark {
  --page-bg: #101412;
  --surface: #19201c;
  --surface-muted: #222b26;
  --text-primary: #eef5f1;
  --text-secondary: #aab8b0;
  --border-color: #334139;
  --accent: #37be78;
  --accent-strong: #69db9c;
  --accent-soft: rgba(55, 190, 120, 0.14);
  --accent-border: rgba(105, 219, 156, 0.36);
  --focus-ring: rgba(105, 219, 156, 0.27);
  --danger-soft: #2a1a1a;
  --danger-border: #704141;
  --danger-text: #ff9ca5;
  --shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
}

.team-detail-page,
.team-detail-page * {
  box-sizing: border-box;
}

.detail-header {
  max-width: 54rem;
  margin: 0 auto 2rem;
  text-align: center;
}

.detail-header__eyebrow,
.meta-chip,
.format-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 800;
}

.detail-header__eyebrow {
  margin-bottom: 0.8rem;
  padding: 0.38rem 0.72rem;
  border: 1px solid var(--accent-border);
  font-size: 0.76rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.detail-header__title {
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(1.85rem, 4vw, 2.7rem);
  font-weight: 850;
  line-height: 1.13;
  overflow-wrap: anywhere;
  text-wrap: balance;
}

.detail-header__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  justify-content: center;
  margin-top: 1rem;
}

.meta-chip {
  min-height: 2rem;
  padding: 0.35rem 0.7rem;
  font-size: 0.8rem;
}

.detail-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(19rem, 0.9fr);
  gap: 1.4rem;
  align-items: start;
}

.pokemon-column,
.team-panel {
  min-width: 0;
}

.pokemon-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.pokemon-card,
.panel-card,
.empty-card,
.state-card {
  border: 1px solid var(--border-color);
  background: var(--surface);
  box-shadow: var(--shadow);
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

.pokemon-card__image-wrap {
  min-height: 9.2rem;
  display: grid;
  place-items: center;
  padding: 1rem;
  background:
    radial-gradient(
      circle at center,
      var(--accent-soft),
      transparent 65%
    ),
    var(--surface-muted);
}

.pokemon-card__image {
  display: block;
  width: 7rem;
  height: 7rem;
  object-fit: contain;
  filter: drop-shadow(0 10px 14px rgba(25, 50, 37, 0.14));
}

.pokemon-card__placeholder {
  display: grid;
  width: 5.5rem;
  height: 5.5rem;
  place-items: center;
  border: 1px solid var(--accent-border);
  border-radius: 50%;
  background: var(--surface);
  color: var(--accent);
  font-size: 2rem;
  font-weight: 900;
}

.pokemon-card__body {
  min-width: 0;
  padding: 1rem;
}

.pokemon-card__name {
  margin: 0 0 0.9rem;
  color: var(--text-primary);
  font-size: 1.03rem;
  font-weight: 850;
  line-height: 1.35;
  overflow-wrap: anywhere;
  text-align: center;
}

.pokemon-stats {
  display: grid;
  gap: 0;
  margin: 0;
}

.pokemon-stats > div {
  display: grid;
  grid-template-columns: minmax(4.6rem, auto) minmax(0, 1fr);
  gap: 0.55rem;
  padding: 0.42rem 0;
  border-bottom: 1px solid var(--border-color);
}

.pokemon-stats > div:last-child {
  border-bottom: 0;
}

.pokemon-stats dt,
.pokemon-stats dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.pokemon-stats dt {
  color: var(--text-primary);
  font-size: 0.82rem;
  font-weight: 800;
}

.pokemon-stats dd {
  color: var(--text-secondary);
  font-size: 0.82rem;
  text-align: right;
}

.moves-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.45rem;
  margin: 0.95rem 0 0;
  padding: 0.85rem 0 0;
  border-top: 1px solid var(--border-color);
  list-style: none;
}

.moves-list li {
  min-width: 0;
  padding: 0.42rem 0.5rem;
  border-radius: 0.6rem;
  background: var(--surface-muted);
  color: var(--text-secondary);
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
  text-align: center;
}

.panel-card {
  position: sticky;
  top: 1rem;
  min-width: 0;
  padding: 1.25rem;
  border-radius: 1rem;
}

.panel-card__heading {
  display: flex;
  min-width: 0;
  gap: 0.7rem;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.panel-card__heading h2 {
  min-width: 0;
  margin: 0;
  color: var(--text-primary);
  font-size: 1.15rem;
  font-weight: 850;
  line-height: 1.3;
}

.format-badge {
  flex: 0 0 auto;
  max-width: 48%;
  padding: 0.28rem 0.55rem;
  overflow: hidden;
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-info-list {
  margin: 0;
}

.info-row {
  padding: 0.82rem 0;
  border-bottom: 1px solid var(--border-color);
}

.info-row:last-child {
  border-bottom: 0;
}

.info-row dt,
.info-row dd {
  overflow-wrap: anywhere;
}

.info-row dt {
  margin-bottom: 0.25rem;
  color: var(--text-primary);
  font-size: 0.82rem;
  font-weight: 850;
}

.info-row dd {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.5;
}

.breakable-link {
  color: var(--accent);
  font-weight: 700;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.breakable-link:hover {
  color: var(--accent-strong);
}

.copy-button {
  width: 100%;
  margin-top: 0.7rem;
}

.copy-feedback {
  display: block;
  margin-top: 0.45rem;
  font-size: 0.82rem;
  font-weight: 800;
}

.copy-feedback.success {
  color: var(--accent);
}

.copy-feedback.error {
  color: var(--danger-text);
}

.pre-line {
  white-space: pre-line;
}

.panel-actions {
  display: grid;
  margin-top: 1rem;
}

.action-button {
  display: inline-flex;
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  padding: 0.68rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.72rem;
  font: inherit;
  font-weight: 800;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 150ms ease,
    filter 150ms ease,
    border-color 150ms ease,
    background-color 150ms ease;
}

.action-button:hover:not(:disabled) {
  filter: brightness(0.96);
  transform: translateY(-1px);
}

.action-button:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}

.action-button--primary {
  background: var(--accent);
  color: #ffffff;
  box-shadow: 0 10px 22px var(--accent-soft);
}

.action-button--soft {
  border-color: var(--accent-border);
  background: var(--accent-soft);
  color: var(--accent);
}

.share-section {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
}

.share-title {
  margin: 0 0 0.75rem;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 850;
}

.empty-card,
.state-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-card {
  min-height: 15rem;
  padding: 2rem;
  border-radius: 1rem;
}

.empty-card h2,
.empty-card p,
.state-card h2,
.state-card p {
  margin: 0;
}

.empty-card p {
  margin-top: 0.45rem;
  color: var(--text-secondary);
}

.state-card {
  max-width: 42rem;
  min-height: 18rem;
  gap: 0.8rem;
  margin: 0 auto;
  padding: 2rem;
  border-radius: 1rem;
}

.state-card--error {
  border-color: var(--danger-border);
  background: var(--danger-soft);
}

.state-card__loader-image {
  display: block;
  /*max-width: min(100%, 15rem);*/
  height: auto;
  object-fit: contain;
}

.state-card__title {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
  font-weight: 850;
}

.state-card__text {
  margin: 0 0 0.4rem;
  color: var(--text-secondary);
  line-height: 1.55;
}

.loading-spinner {
  display: inline-block;
  width: 4rem;
  height: 4rem;
  border: 4px solid var(--accent);
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  filter: drop-shadow(0 0 9px var(--accent-soft));
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1199.98px) {
  .pokemon-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 899.98px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }

  .team-panel {
    order: -1;
  }

  .panel-card {
    position: static;
  }
}

@media (max-width: 575.98px) {
  .container {
    padding-inline: 0.75rem;
  }

  .pokemon-grid {
    grid-template-columns: 1fr;
  }

  .pokemon-card__body,
  .panel-card {
    padding: 1rem;
  }

  .moves-list {
    grid-template-columns: 1fr;
  }

  .panel-card__heading {
    flex-direction: column;
  }

  .format-badge {
    max-width: 100%;
  }

  .state-card {
    padding: 1.5rem 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pokemon-card,
  .action-button {
    transition: none;
  }

  .pokemon-card:hover,
  .action-button:hover:not(:disabled) {
    transform: none;
  }

  .loading-spinner {
    animation-duration: 1.4s;
  }
}
</style>
