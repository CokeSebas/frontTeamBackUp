<template>
  <main
    class="home-page"
    :class="{ 'home-page--dark': isDarkMode }"
    :data-bs-theme="isDarkMode ? 'dark' : 'light'"
  >
    <div class="container home-shell py-4 py-lg-5">
      <header class="home-hero">
        <div class="home-hero__content">
          <p class="home-hero__eyebrow">VGC COMMUNITY</p>

          <h1 class="home-hero__title">
            {{ $t('home.title') }}
          </h1>

          <p class="home-hero__subtitle">
            {{ $t('home.subtitle') }}
          </p>

          <nav
            class="home-hero__actions"
            aria-label="Acciones principales"
          >
            <router-link
              class="btn-electric"
              to="/vgc/create-team"
            >
              <span aria-hidden="true">＋</span>
              {{ $t('buttons.createTeam') }}
            </router-link>

            <router-link
              class="btn-electric-soft"
              to="/vgc/create-pokemon"
            >
              <span aria-hidden="true">＋</span>
              {{ $t('buttons.createPokemon') }}
            </router-link>
          </nav>
        </div>

        <div class="home-hero__visual" aria-hidden="true">
          <span class="hero-orb hero-orb--large" />
          <span class="hero-orb hero-orb--medium" />
          <span class="hero-orb hero-orb--small" />

          <div class="hero-logo-panel">
            <img
              :src="logo"
              class="hero-logo"
              alt=""
            >
          </div>
        </div>
      </header>

      <section
        class="teams-section"
        aria-labelledby="teams-title"
      >
        <div class="section-heading">
          <div>
            <p class="section-heading__eyebrow">
              EQUIPOS RECIENTES
            </p>

            <h2
              id="teams-title"
              class="section-heading__title"
            >
              {{ $t('home.teamSeccion') }}
            </h2>

            <p class="section-heading__description">
              Revisa los últimos equipos compartidos por la comunidad.
            </p>
          </div>

          <span
            v-if="!loadingTeams && !teamsError"
            class="section-heading__counter"
            aria-live="polite"
          >
            {{ teams.length }}
            {{ teams.length === 1 ? 'equipo' : 'equipos' }}
          </span>
        </div>

        <div
          v-if="loadingTeams"
          class="state-card"
          role="status"
          aria-live="polite"
          aria-busy="true"
        >
          <img
            v-if="gifLoadingValue"
            class="state-card__loader-image"
            :src="gifLoadingValue"
            alt="Cargando equipos"
          >

          <span
            v-else
            class="loading-spinner"
            aria-hidden="true"
          />
        </div>

        <div
          v-else-if="teamsError"
          class="state-card state-card--error"
          role="alert"
        >
          <span class="state-card__icon" aria-hidden="true">!</span>

          <h3 class="state-card__title">
            No fue posible cargar los equipos
          </h3>

          <p class="state-card__text">
            {{ teamsError }}
          </p>

          <button
            type="button"
            class="btn-electric-soft"
            @click="loadTeams"
          >
            Reintentar
          </button>
        </div>

        <div
          v-else-if="teams.length === 0"
          class="state-card"
        >
          <span class="state-card__icon" aria-hidden="true">＋</span>

          <h3 class="state-card__title">
            Aún no hay equipos registrados
          </h3>

          <p class="state-card__text">
            Crea el primer equipo y compártelo con la comunidad.
          </p>

          <router-link
            class="btn-electric"
            to="/vgc/create-team"
          >
            {{ $t('buttons.createTeam') }}
          </router-link>
        </div>

        <div
          v-else
          class="teams-grid"
          aria-live="polite"
        >
          <article
            v-for="team in teams"
            :key="team._key"
            class="team-card"
          >
            <div class="team-card__content">
              <div class="team-card__heading">
                <h3
                  class="team-card__title"
                  :title="team.team_name"
                >
                  {{ team.team_name || 'Equipo sin nombre' }}
                </h3>

                <span
                  v-if="team.subFormatName"
                  class="team-card__format"
                  :title="team.subFormatName"
                >
                  {{ team.subFormatName }}
                </span>
              </div>

              <div
                v-if="team.pokemonImages.length"
                class="pokemon-list"
                :aria-label="`Pokémon del equipo ${team.team_name || ''}`"
              >
                <div
                  v-for="(pokemonImage, index) in team.pokemonImages"
                  :key="`${team._key}-pokemon-${index}`"
                  class="pokemon-slot"
                >
                  <img
                    class="pokemon-slot__image"
                    :src="pokemonImage"
                    :alt="`Pokémon ${index + 1} de ${team.team_name || 'este equipo'}`"
                    width="52"
                    height="52"
                    loading="lazy"
                    decoding="async"
                    @error="handleImageError"
                  >
                </div>
              </div>

              <div
                v-else
                class="pokemon-list pokemon-list--empty"
              >
                <span>Sin Pokémon informados</span>
              </div>

              <router-link
                v-if="team.id !== null && team.id !== undefined"
                class="team-card__link"
                :to="`/vgc/team/${team.id}`"
                :aria-label="`${$t('buttons.seeTeam')}: ${team.team_name || ''}`"
              >
                {{ $t('buttons.seeTeam') }}
                <span aria-hidden="true">→</span>
              </router-link>

              <span
                v-else
                class="team-card__link-disabled"
                aria-disabled="true"
              >
                Equipo sin identificador
              </span>
            </div>
          </article>
        </div>
      </section>
    </div>
  </main>
</template>

<script>
import axios from 'axios';
import { unref } from 'vue';
import { useHead } from '@vueuse/head';
import logo from '@/assets/pokecircuit.png';

export default {
  name: 'HomeView',

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
      logo,
      teams: [],
      loadingTeams: true,
      teamsError: '',
      headEntry: null,
      requestController: null,
      themeObserver: null,
      detectedDarkTheme: false
    };
  },

  computed: {
    modeValue() {
      return String(unref(this.mode) || '')
        .trim()
        .toLowerCase();
    },

    gifLoadingValue() {
      return String(unref(this.gifLoading) || '').trim();
    },

    isDarkMode() {
      return (
        this.modeValue === 'dark' ||
        this.modeValue === 'oscuro' ||
        this.detectedDarkTheme
      );
    }
  },

  watch: {
    '$i18n.locale'() {
      this.updateHead();
    }
  },

  mounted() {
    this.detectGlobalTheme();
    this.observeTheme();
    this.loadTeams();
    this.setHead();
  },

  beforeUnmount() {
    this.requestController?.abort();
    this.themeObserver?.disconnect();
    this.headEntry?.dispose?.();
  },

  methods: {
    buildApiUrl(path) {
      const baseUrl = String(unref(this.apiUrl) || '')
        .replace(/\/+$/, '');
      const endpoint = String(path || '').replace(/^\/+/, '');

      return baseUrl
        ? `${baseUrl}/${endpoint}`
        : `/${endpoint}`;
    },

    normalizeTeam(team, index) {
      const pokemonImages = [
        team?.poke1,
        team?.poke2,
        team?.poke3,
        team?.poke4,
        team?.poke5,
        team?.poke6
      ]
        .map((image) => String(image || '').trim())
        .filter(Boolean);

      const teamName = String(team?.team_name || '').trim();
      const subFormatName = String(
        team?.subFormatName || ''
      ).trim();

      return {
        ...team,
        id: team?.id ?? null,
        _key:
          team?.id ??
          `${teamName || 'team'}-${index}`,
        team_name: teamName,
        subFormatName,
        pokemonImages
      };
    },

    async loadTeams() {
      this.requestController?.abort();
      this.requestController = new AbortController();

      const currentController = this.requestController;

      this.loadingTeams = true;
      this.teamsError = '';

      try {
        const response = await axios.get(
          this.buildApiUrl('teams/teams-home'),
          {
            signal: currentController.signal
          }
        );

        const responseTeams =
          response?.data?.data ?? response?.data;

        this.teams = Array.isArray(responseTeams)
          ? responseTeams.map(this.normalizeTeam)
          : [];
      } catch (error) {
        if (
          error?.name === 'CanceledError' ||
          error?.name === 'AbortError' ||
          axios.isCancel?.(error)
        ) {
          return;
        }

        console.error('Error al cargar los equipos:', error);
        this.teams = [];
        this.teamsError =
          error?.response?.data?.message ||
          'No fue posible cargar los equipos. Intenta nuevamente.';
      } finally {
        if (this.requestController === currentController) {
          this.loadingTeams = false;
        }
      }
    },

    handleImageError(event) {
      const image = event?.currentTarget;

      if (!image) {
        return;
      }

      image.style.display = 'none';
      image.parentElement?.classList.add(
        'pokemon-slot--error'
      );
    },

    detectGlobalTheme() {
      if (typeof document === 'undefined') {
        return;
      }

      const root = document.documentElement;
      const body = document.body;
      const classNames = [
        root?.className || '',
        body?.className || ''
      ].join(' ');

      const dataTheme =
        root?.dataset?.theme ||
        body?.dataset?.theme ||
        root?.dataset?.bsTheme ||
        body?.dataset?.bsTheme ||
        '';

      this.detectedDarkTheme =
        /(^|\s)(dark|dark-mode|theme-dark|is-dark)(\s|$)/i.test(
          classNames
        ) ||
        String(dataTheme).toLowerCase() === 'dark';
    },

    observeTheme() {
      if (
        typeof MutationObserver === 'undefined' ||
        typeof document === 'undefined'
      ) {
        return;
      }

      this.themeObserver = new MutationObserver(
        this.detectGlobalTheme
      );

      const options = {
        attributes: true,
        attributeFilter: [
          'class',
          'data-theme',
          'data-bs-theme'
        ]
      };

      this.themeObserver.observe(
        document.documentElement,
        options
      );

      if (document.body) {
        this.themeObserver.observe(document.body, options);
      }
    },

    buildHeadConfig() {
      const title = this.$t('lastTeamsAndLastPokemons');
      const description = this.$t('descripcionMetaTag');
      const origin =
        typeof window !== 'undefined'
          ? window.location.origin
          : '';
      const currentUrl =
        typeof window !== 'undefined'
          ? window.location.href
          : '';
      const socialImage = origin
        ? new URL(logo, origin).href
        : logo;

      return {
        title,
        link: currentUrl
          ? [
              {
                rel: 'canonical',
                href: currentUrl
                  .split('?')[0]
                  .split('#')[0]
              }
            ]
          : [],
        meta: [
          {
            name: 'description',
            content: description
          },
          {
            name: 'robots',
            content: 'index, follow'
          },
          {
            property: 'og:title',
            content: title
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
            content: currentUrl || origin
          },
          {
            property: 'og:image',
            content: socialImage
          },
          {
            name: 'twitter:card',
            content: 'summary_large_image'
          },
          {
            name: 'twitter:title',
            content: title
          },
          {
            name: 'twitter:description',
            content: description
          },
          {
            name: 'twitter:image',
            content: socialImage
          }
        ]
      };
    },

    setHead() {
      this.headEntry?.dispose?.();
      this.headEntry = useHead(this.buildHeadConfig());
    },

    updateHead() {
      const config = this.buildHeadConfig();

      if (this.headEntry?.patch) {
        this.headEntry.patch(config);
        return;
      }

      this.setHead();
    }
  }
};
</script>

<style scoped>
.home-page {
  --page-bg: #f5f7f8;
  --surface: #ffffff;
  --surface-muted: #f3f6f5;
  --surface-hover: #eaf5ef;
  --text-primary: #1f2a25;
  --text-secondary: #647068;
  --border-color: #dce4df;
  --accent: #198754;
  --accent-strong: #146c43;
  --accent-bright: #37be78;
  --accent-soft: rgba(25, 135, 84, 0.12);
  --danger-soft: #fff4f4;
  --danger-border: #f2c3c3;
  --shadow: 0 16px 40px rgba(25, 50, 37, 0.08);
  --card-hover-shadow: 0 20px 45px rgba(25, 90, 55, 0.14);
  --focus-ring: 0 0 0 0.22rem rgba(25, 135, 84, 0.2);

  min-height: 100%;
  color: var(--text-primary);
  background:
    radial-gradient(
      circle at 12% 0%,
      rgba(25, 135, 84, 0.12),
      transparent 28rem
    ),
    radial-gradient(
      circle at 92% 18%,
      rgba(55, 190, 120, 0.08),
      transparent 24rem
    ),
    var(--page-bg);
}

.home-page--dark {
  --page-bg: #101412;
  --surface: #19201c;
  --surface-muted: #222b26;
  --surface-hover: #27352d;
  --text-primary: #eef5f1;
  --text-secondary: #aab8b0;
  --border-color: #334139;
  --accent: #37be78;
  --accent-strong: #2ba968;
  --accent-bright: #6dd99a;
  --accent-soft: rgba(55, 190, 120, 0.14);
  --danger-soft: #2a1a1a;
  --danger-border: #704141;
  --shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
  --card-hover-shadow: 0 22px 48px rgba(0, 0, 0, 0.38);
  --focus-ring: 0 0 0 0.22rem rgba(55, 190, 120, 0.26);

  background:
    radial-gradient(
      circle at 12% 0%,
      rgba(55, 190, 120, 0.16),
      transparent 30rem
    ),
    radial-gradient(
      circle at 94% 20%,
      rgba(55, 190, 120, 0.08),
      transparent 26rem
    ),
    var(--page-bg);
}

.home-page,
.home-page * {
  box-sizing: border-box;
}

.home-shell {
  width: min(100%, 1180px);
}

.home-hero,
.teams-section,
.team-card,
.state-card {
  border: 1px solid var(--border-color);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.home-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(240px, 0.65fr);
  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: center;
  padding: clamp(1.5rem, 4vw, 3rem);
  overflow: hidden;
  border-radius: 1.4rem;
}

.home-hero__content {
  position: relative;
  z-index: 2;
  min-width: 0;
}

.home-hero__eyebrow,
.section-heading__eyebrow {
  margin: 0;
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.home-hero__title {
  max-width: 760px;
  margin: 0.45rem 0 0.8rem;
  color: var(--text-primary);
  font-size: clamp(2rem, 5.5vw, 3.8rem);
  font-weight: 850;
  letter-spacing: -0.045em;
  line-height: 1.04;
  text-wrap: balance;
}

.home-hero__subtitle {
  max-width: 680px;
  margin: 0;
  color: var(--text-secondary);
  font-size: clamp(1rem, 1.8vw, 1.15rem);
  line-height: 1.7;
  text-wrap: balance;
}

.home-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  margin-top: 1.6rem;
}

.home-hero__visual {
  position: relative;
  display: grid;
  min-height: 270px;
  place-items: center;
}

.hero-logo-panel {
  position: relative;
  z-index: 2;
  display: grid;
  width: min(100%, 220px);
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid rgba(25, 135, 84, 0.22);
  border-radius: 50%;
  background:
    linear-gradient(
      145deg,
      var(--accent-soft),
      rgba(255, 255, 255, 0.5)
    );
  box-shadow:
    inset 0 0 0 12px rgba(255, 255, 255, 0.22),
    0 22px 44px rgba(25, 135, 84, 0.16);
}

.home-page--dark .hero-logo-panel {
  background:
    linear-gradient(
      145deg,
      var(--accent-soft),
      rgba(255, 255, 255, 0.03)
    );
  box-shadow:
    inset 0 0 0 12px rgba(255, 255, 255, 0.03),
    0 22px 44px rgba(0, 0, 0, 0.28);
}

.hero-logo {
  width: 72%;
  height: 72%;
  object-fit: contain;
  filter: drop-shadow(0 12px 18px rgba(25, 90, 55, 0.2));
}

.hero-orb {
  position: absolute;
  border-radius: 50%;
  background: var(--accent-soft);
  pointer-events: none;
}

.hero-orb--large {
  width: 260px;
  height: 260px;
}

.hero-orb--medium {
  top: 12px;
  right: 10px;
  width: 88px;
  height: 88px;
  opacity: 0.75;
}

.hero-orb--small {
  bottom: 14px;
  left: 12px;
  width: 54px;
  height: 54px;
  opacity: 0.55;
}

.btn-electric,
.btn-electric-soft {
  display: inline-flex;
  min-height: 46px;
  gap: 0.45rem;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.15rem;
  border-radius: 0.75rem;
  font: inherit;
  font-weight: 800;
  line-height: 1.15;
  text-decoration: none;
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
  border: 1px solid var(--accent);
  color: #ffffff;
  background:
    linear-gradient(
      135deg,
      var(--accent-strong),
      var(--accent),
      var(--accent-bright)
    );
  box-shadow: 0 10px 22px rgba(25, 135, 84, 0.22);
}

.btn-electric-soft {
  border: 1px solid rgba(25, 135, 84, 0.28);
  color: var(--accent);
  background: var(--accent-soft);
}

.btn-electric:hover,
.btn-electric-soft:hover {
  transform: translateY(-2px);
}

.btn-electric:hover {
  color: #ffffff;
  filter: brightness(1.04);
  box-shadow: 0 13px 28px rgba(25, 135, 84, 0.28);
}

.btn-electric-soft:hover {
  border-color: var(--accent);
  color: #ffffff;
  background: var(--accent);
}

.btn-electric:focus-visible,
.btn-electric-soft:focus-visible,
.team-card__link:focus-visible {
  outline: 3px solid rgba(25, 135, 84, 0.25);
  outline-offset: 3px;
}

.teams-section {
  margin-top: clamp(1.5rem, 4vw, 2.5rem);
  padding: clamp(1rem, 3vw, 1.7rem);
  border-radius: 1.2rem;
}

.section-heading {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1.4rem;
}

.section-heading__title {
  margin: 0.3rem 0 0.35rem;
  color: var(--text-primary);
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: 850;
}

.section-heading__description {
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.55;
}

.section-heading__counter,
.team-card__format {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  border: 1px solid rgba(25, 135, 84, 0.22);
  border-radius: 999px;
  color: var(--accent);
  background: var(--accent-soft);
  font-weight: 800;
}

.section-heading__counter {
  min-height: 32px;
  padding: 0.38rem 0.7rem;
  font-size: 0.8rem;
  white-space: nowrap;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.15rem;
}

.team-card {
  min-width: 0;
  overflow: hidden;
  border-radius: 1rem;
  transition:
    transform 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.team-card:hover {
  border-color: rgba(25, 135, 84, 0.45);
  transform: translateY(-3px);
  box-shadow: var(--card-hover-shadow);
}

.team-card__content {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: 1.2rem;
}

.team-card__heading {
  display: flex;
  min-width: 0;
  gap: 0.75rem;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.team-card__title {
  min-width: 0;
  margin: 0;
  color: var(--text-primary);
  font-size: 1.08rem;
  font-weight: 850;
  overflow-wrap: anywhere;
}

.team-card__format {
  max-width: 48%;
  padding: 0.3rem 0.55rem;
  overflow: hidden;
  font-size: 0.72rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pokemon-list {
  min-height: 4.5rem;
  margin-bottom: 1.15rem;
  padding: 0.65rem;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.42rem;
  border-radius: 0.85rem;
  background: var(--surface-muted);
}

.pokemon-list--empty {
  place-items: center;
  color: var(--text-secondary);
  font-size: 0.88rem;
}

.pokemon-slot {
  position: relative;
  display: grid;
  min-width: 0;
  aspect-ratio: 1;
  place-items: center;
  border: 1px solid var(--border-color);
  border-radius: 0.68rem;
  background: var(--surface);
}

.pokemon-slot--error::after {
  color: var(--text-secondary);
  font-weight: 850;
  content: '?';
}

.pokemon-slot__image {
  width: 100%;
  max-width: 3.25rem;
  height: auto;
  aspect-ratio: 1;
  object-fit: contain;
}

.team-card__link {
  display: inline-flex;
  align-self: flex-start;
  gap: 0.4rem;
  align-items: center;
  margin-top: auto;
  color: var(--accent);
  font-weight: 800;
  text-decoration: none;
}

.team-card__link:hover {
  color: var(--accent-strong);
}

.team-card__link-disabled {
  align-self: flex-start;
  margin-top: auto;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.state-card {
  display: flex;
  min-height: 15rem;
  flex-direction: column;
  gap: 0.7rem;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
}

.state-card--error {
  border-color: var(--danger-border);
  background: var(--danger-soft);
}

.state-card__loader-image {
  /*max-width: 5rem;
  max-height: 5rem;*/
  object-fit: contain;
}

.state-card__icon {
  display: grid;
  width: 3.2rem;
  height: 3.2rem;
  place-items: center;
  border-radius: 50%;
  color: var(--accent);
  background: var(--accent-soft);
  font-size: 1.35rem;
  font-weight: 900;
}

.state-card__title {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.2rem;
  font-weight: 850;
}

.state-card__text {
  max-width: 34rem;
  margin: 0;
  color: var(--text-secondary);
  line-height: 1.55;
}

.loading-spinner {
  width: 3.4rem;
  height: 3.4rem;
  border: 4px solid var(--accent-soft);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 899.98px) {
  .home-hero {
    grid-template-columns: 1fr;
  }

  .home-hero__visual {
    min-height: 220px;
  }

  .hero-logo-panel {
    max-width: 190px;
  }
}

@media (max-width: 767.98px) {
  .teams-grid {
    grid-template-columns: 1fr;
  }

  .section-heading {
    flex-direction: column;
  }

  .team-card__heading {
    flex-direction: column;
  }

  .team-card__format {
    max-width: 100%;
  }

  .pokemon-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 479.98px) {
  .home-shell {
    padding-inline: 0.75rem;
  }

  .home-hero {
    padding: 1.2rem;
    border-radius: 1rem;
  }

  .home-hero__visual {
    min-height: 180px;
  }

  .hero-logo-panel {
    max-width: 150px;
  }

  .home-hero__actions {
    align-items: stretch;
  }

  .home-hero__actions .btn-electric,
  .home-hero__actions .btn-electric-soft {
    width: 100%;
  }

  .teams-section {
    padding: 0.85rem;
  }

  .team-card__content {
    padding: 1rem;
  }

  .state-card {
    padding: 1.5rem 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .team-card,
  .btn-electric,
  .btn-electric-soft {
    transition: none;
  }

  .team-card:hover,
  .btn-electric:hover,
  .btn-electric-soft:hover {
    transform: none;
  }

  .loading-spinner {
    animation-duration: 1.4s;
  }
}
</style>
