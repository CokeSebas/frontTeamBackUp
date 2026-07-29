<template>
  <main
    class="guide-page"
    :class="{ 'guide-page--dark': isDarkMode }"
    :data-bs-theme="isDarkMode ? 'dark' : 'light'"
  >
    <div class="container guide-shell py-4 py-lg-5">
      <header class="guide-hero">
        <div class="guide-hero__content">
          <p class="guide-eyebrow">{{ $t('guideSeccion.hero.eyebrow') }}</p>
          <h1 class="guide-hero__title">{{ $t('guideSeccion.hero.title') }}</h1>
          <p class="guide-hero__subtitle">{{ $t('guideSeccion.hero.subtitle') }}</p>

          <nav
            class="guide-hero__actions"
            :aria-label="$t('guideSeccion.hero.quickAccessAria')"
          >
            <a class="btn-electric" href="#equipos">
              {{ $t('guideSeccion.hero.startGuide') }}
              <span aria-hidden="true">↓</span>
            </a>

            <a class="btn-electric-soft" href="#team-sheets">
              {{ $t('guideSeccion.hero.viewTeamSheets') }}
            </a>
          </nav>
        </div>

        <div class="guide-hero__visual" aria-hidden="true">
          <span class="hero-orb hero-orb--large" />
          <span class="hero-orb hero-orb--medium" />
          <span class="hero-orb hero-orb--small" />

          <div class="hero-logo-panel">
            <img :src="logo" class="hero-logo" alt="">
          </div>
        </div>
      </header>

      <section class="guide-section" aria-labelledby="guide-index-title">
        <div class="section-heading">
          <div>
            <p class="guide-eyebrow">{{ $t('guideSeccion.index.eyebrow') }}</p>
            <h2 id="guide-index-title" class="section-heading__title">
              {{ $t('guideSeccion.index.title') }}
            </h2>
            <p class="section-heading__description">
              {{ $t('guideSeccion.index.description') }}
            </p>
          </div>
        </div>

        <div class="quick-grid">
          <a
            v-for="item in quickLinks"
            :key="item.href"
            :href="item.href"
            class="quick-card"
          >
            <span class="quick-card__number">{{ item.number }}</span>
            <div>
              <h3 class="quick-card__title">{{ item.title }}</h3>
              <p class="quick-card__text">{{ item.description }}</p>
            </div>
            <span class="quick-card__arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <section
        id="inicio"
        class="guide-section guide-anchor"
        aria-labelledby="inicio-title"
      >
        <div class="content-card">
          <div class="content-card__header">
            <span class="step-badge">01</span>
            <div>
              <p class="guide-eyebrow">{{ $t('guideSeccion.home.eyebrow') }}</p>
              <h2 id="inicio-title" class="content-card__title">
                {{ $t('guideSeccion.home.title') }}
              </h2>
            </div>
          </div>

          <p class="content-card__lead">{{ $t('guideSeccion.home.lead') }}</p>

          <div class="feature-list">
            <div
              v-for="item in homeFeatures"
              :key="item"
              class="feature-item"
            >
              <span class="feature-check" aria-hidden="true">✓</span>
              <span>{{ item }}</span>
            </div>
          </div>
        </div>
      </section>

      <section
        id="equipos"
        class="guide-section guide-anchor"
        aria-labelledby="teams-guide-title"
      >
        <div class="content-card">
          <div class="content-card__header">
            <span class="step-badge">02</span>
            <div>
              <p class="guide-eyebrow">{{ $t('guideSeccion.teams.eyebrow') }}</p>
              <h2 id="teams-guide-title" class="content-card__title">
                {{ $t('guideSeccion.teams.title') }}
              </h2>
            </div>
          </div>

          <p class="content-card__lead">{{ $t('guideSeccion.teams.lead') }}</p>

          <div class="two-column-grid">
            <div>
              <h3 class="content-subtitle">{{ $t('guideSeccion.teams.subtitle') }}</h3>
              <ul class="guide-list">
                <li>{{ $t('guideSeccion.teams.actions.create') }}</li>
                <li>{{ $t('guideSeccion.teams.actions.name') }}</li>
                <li>{{ $t('guideSeccion.teams.actions.privacy') }}</li>
                <li>{{ $t('guideSeccion.teams.actions.rentalCode') }}</li>
                <li>{{ $t('guideSeccion.teams.actions.edit') }}</li>
              </ul>
            </div>

            <aside class="info-box">
              <span class="info-box__label">{{ $t('guideSeccion.teams.infoLabel') }}</span>
              <p>{{ $t('guideSeccion.teams.infoText') }}</p>
              <router-link class="inline-link" to="/vgc/teams">
                {{ $t('guideSeccion.teams.viewTeams') }}
                <span aria-hidden="true">→</span>
              </router-link>
            </aside>
          </div>
        </div>
      </section>

      <section
        id="pokemon"
        class="guide-section guide-anchor"
        aria-labelledby="pokemon-guide-title"
      >
        <div class="content-card">
          <div class="content-card__header">
            <span class="step-badge">03</span>
            <div>
              <p class="guide-eyebrow">{{ $t('guideSeccion.pokemon.eyebrow') }}</p>
              <h2 id="pokemon-guide-title" class="content-card__title">
                {{ $t('guideSeccion.pokemon.title') }}
              </h2>
            </div>
          </div>

          <p class="content-card__lead">{{ $t('guideSeccion.pokemon.lead') }}</p>

          <div class="data-grid">
            <div v-for="field in pokemonFields" :key="field" class="data-chip">
              <span class="data-chip__dot" aria-hidden="true" />
              {{ field }}
            </div>
          </div>

          <div class="callout">{{ $t('guideSeccion.pokemon.callout') }}</div>

          <router-link class="inline-link inline-link--spaced" to="/vgc/pokemons">
            {{ $t('guideSeccion.pokemon.explore') }}
            <span aria-hidden="true">→</span>
          </router-link>
        </div>
      </section>

      <section
        id="team-sheets"
        class="guide-section guide-anchor"
        aria-labelledby="team-sheet-guide-title"
      >
        <div class="content-card">
          <div class="content-card__header">
            <span class="step-badge">04</span>
            <div>
              <p class="guide-eyebrow">{{ $t('guideSeccion.teamSheets.eyebrow') }}</p>
              <h2 id="team-sheet-guide-title" class="content-card__title">
                {{ $t('guideSeccion.teamSheets.title') }}
              </h2>
            </div>
          </div>

          <p class="content-card__lead">{{ $t('guideSeccion.teamSheets.lead') }}</p>

          <div class="options-grid">
            <article
              v-for="option in teamSheetOptions"
              :key="option.number"
              class="option-card"
            >
              <span class="option-card__number">{{ option.number }}</span>
              <h3 class="option-card__title">{{ option.title }}</h3>
              <p class="option-card__text">{{ option.description }}</p>

              <ul v-if="option.items?.length" class="guide-list guide-list--compact">
                <li v-for="item in option.items" :key="item">{{ item }}</li>
              </ul>
            </article>
          </div>

          <div class="print-box">
            <div>
              <p class="guide-eyebrow">{{ $t('guideSeccion.teamSheets.print.eyebrow') }}</p>
              <h3 class="print-box__title">{{ $t('guideSeccion.teamSheets.print.title') }}</h3>
              <p>{{ $t('guideSeccion.teamSheets.print.description') }}</p>
            </div>

            <router-link class="btn-electric" to="/vgc/print-team-sheet">
              {{ $t('guideSeccion.teamSheets.print.button') }}
              <span aria-hidden="true">→</span>
            </router-link>
          </div>
        </div>
      </section>

      <section
        id="torneos"
        class="guide-section guide-anchor"
        aria-labelledby="tournaments-guide-title"
      >
        <div class="content-card">
          <div class="content-card__header">
            <span class="step-badge">05</span>
            <div>
              <p class="guide-eyebrow">{{ $t('guideSeccion.tournaments.eyebrow') }}</p>
              <h2 id="tournaments-guide-title" class="content-card__title">
                {{ $t('guideSeccion.tournaments.title') }}
              </h2>
            </div>
          </div>

          <p class="content-card__lead">{{ $t('guideSeccion.tournaments.lead') }}</p>

          <div class="data-grid data-grid--wide">
            <div v-for="field in tournamentFields" :key="field" class="data-chip">
              <span class="data-chip__dot" aria-hidden="true" />
              {{ field }}
            </div>
          </div>

          <p class="content-card__note">{{ $t('guideSeccion.tournaments.note') }}</p>

          <router-link class="inline-link" to="/tournament/ver-torneos">
            {{ $t('guideSeccion.tournaments.view') }}
            <span aria-hidden="true">→</span>
          </router-link>
        </div>
      </section>

      <section
        id="perfil"
        class="guide-section guide-anchor"
        aria-labelledby="profile-guide-title"
      >
        <div class="split-cards">
          <article class="content-card">
            <div class="content-card__header">
              <span class="step-badge">06</span>
              <div>
                <p class="guide-eyebrow">{{ $t('guideSeccion.publicTeams.eyebrow') }}</p>
                <h2 class="content-card__title">{{ $t('guideSeccion.publicTeams.title') }}</h2>
              </div>
            </div>

            <p class="content-card__lead">{{ $t('guideSeccion.publicTeams.lead') }}</p>

            <ul class="guide-list">
              <li>{{ $t('guideSeccion.publicTeams.items.sixPokemon') }}</li>
              <li>{{ $t('guideSeccion.publicTeams.items.teamData') }}</li>
            </ul>

            <router-link class="inline-link inline-link--spaced" to="/vgc/teams">
              {{ $t('guideSeccion.publicTeams.explore') }}
              <span aria-hidden="true">→</span>
            </router-link>
          </article>

          <article class="content-card">
            <div class="content-card__header">
              <span class="step-badge">07</span>
              <div>
                <p class="guide-eyebrow">{{ $t('guideSeccion.profile.eyebrow') }}</p>
                <h2 id="profile-guide-title" class="content-card__title">
                  {{ $t('guideSeccion.profile.title') }}
                </h2>
              </div>
            </div>

            <p class="content-card__lead">{{ $t('guideSeccion.profile.lead') }}</p>

            <ul class="guide-list">
              <li>{{ $t('guideSeccion.profile.items.teams') }}</li>
              <li>{{ $t('guideSeccion.profile.items.organization') }}</li>
            </ul>

            <router-link class="inline-link inline-link--spaced" to="/perfil">
              {{ $t('guideSeccion.profile.goToProfile') }}
              <span aria-hidden="true">→</span>
            </router-link>
          </article>
        </div>
      </section>

      <section
        id="usuarios"
        class="guide-section guide-anchor"
        aria-labelledby="audience-title"
      >
        <div class="section-heading">
          <div>
            <p class="guide-eyebrow">{{ $t('guideSeccion.audience.eyebrow') }}</p>
            <h2 id="audience-title" class="section-heading__title">
              {{ $t('guideSeccion.audience.title') }}
            </h2>
          </div>
        </div>

        <div class="audience-grid">
          <article class="audience-card">
            <span class="audience-card__type">{{ $t('guideSeccion.audience.players.label') }}</span>
            <h3>{{ $t('guideSeccion.audience.players.title') }}</h3>
            <ul class="guide-list">
              <li>{{ $t('guideSeccion.audience.players.items.teams') }}</li>
              <li>{{ $t('guideSeccion.audience.players.items.teamSheets') }}</li>
              <li>{{ $t('guideSeccion.audience.players.items.allInOne') }}</li>
            </ul>
          </article>

          <article class="audience-card">
            <span class="audience-card__type">{{ $t('guideSeccion.audience.organizers.label') }}</span>
            <h3>{{ $t('guideSeccion.audience.organizers.title') }}</h3>
            <ul class="guide-list">
              <li>{{ $t('guideSeccion.audience.organizers.items.publish') }}</li>
              <li>{{ $t('guideSeccion.audience.organizers.items.results') }}</li>
              <li>{{ $t('guideSeccion.audience.organizers.items.topCut') }}</li>
            </ul>
          </article>
        </div>
      </section>

      <section class="guide-section" aria-labelledby="summary-title">
        <div class="summary-card">
          <div class="summary-card__header">
            <div>
              <p class="guide-eyebrow">{{ $t('guideSeccion.summary.eyebrow') }}</p>
              <h2 id="summary-title" class="summary-card__title">
                {{ $t('guideSeccion.summary.title') }}
              </h2>
              <p class="summary-card__description">
                {{ $t('guideSeccion.summary.description') }}
              </p>
            </div>
          </div>

          <div class="summary-grid">
            <div v-for="item in summaryItems" :key="item" class="summary-item">
              <span class="summary-item__check" aria-hidden="true">✓</span>
              <span>{{ item }}</span>
            </div>
          </div>

          <div class="summary-actions">
            <router-link class="btn-electric" to="/vgc/create-team">
              {{ $t('guideSeccion.summary.createTeam') }}
            </router-link>

            <router-link class="btn-electric-soft" to="/vgc/create-pokemon">
              {{ $t('guideSeccion.summary.createPokemon') }}
            </router-link>
          </div>
        </div>
      </section>
    </div>
  </main>
</template>

<script>
import { unref } from 'vue';
import { useHead } from '@vueuse/head';
import logo from '@/assets/pokecircuit.png';

export default {
  name: 'ViewGuide',

  inject: {
    mode: {
      default: 'light'
    }
  },

  data() {
    return {
      logo,
      headEntry: null,
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

    isDarkMode() {
      return (
        this.modeValue === 'dark' ||
        this.modeValue === 'oscuro' ||
        this.detectedDarkTheme
      );
    },

    quickLinks() {
      return [
        {
          number: '01',
          title: this.$t('guideSeccion.index.items.home.title'),
          description: this.$t('guideSeccion.index.items.home.description'),
          href: '#inicio'
        },
        {
          number: '02',
          title: this.$t('guideSeccion.index.items.teams.title'),
          description: this.$t('guideSeccion.index.items.teams.description'),
          href: '#equipos'
        },
        {
          number: '03',
          title: this.$t('guideSeccion.index.items.pokemon.title'),
          description: this.$t('guideSeccion.index.items.pokemon.description'),
          href: '#pokemon'
        },
        {
          number: '04',
          title: this.$t('guideSeccion.index.items.teamSheets.title'),
          description: this.$t('guideSeccion.index.items.teamSheets.description'),
          href: '#team-sheets'
        },
        {
          number: '05',
          title: this.$t('guideSeccion.index.items.tournaments.title'),
          description: this.$t('guideSeccion.index.items.tournaments.description'),
          href: '#torneos'
        },
        {
          number: '06',
          title: this.$t('guideSeccion.index.items.profile.title'),
          description: this.$t('guideSeccion.index.items.profile.description'),
          href: '#perfil'
        }
      ];
    },

    homeFeatures() {
      return [
        this.$t('guideSeccion.home.features.teams'),
        this.$t('guideSeccion.home.features.pokemon'),
        this.$t('guideSeccion.home.features.tournaments'),
        this.$t('guideSeccion.home.features.teamSheets'),
        this.$t('guideSeccion.home.features.profile')
      ];
    },

    pokemonFields() {
      return [
        this.$t('guideSeccion.pokemon.fields.species'),
        this.$t('guideSeccion.pokemon.fields.nickname'),
        this.$t('guideSeccion.pokemon.fields.ability'),
        this.$t('guideSeccion.pokemon.fields.item'),
        this.$t('guideSeccion.pokemon.fields.nature'),
        this.$t('guideSeccion.pokemon.fields.teraType'),
        this.$t('guideSeccion.pokemon.fields.sps'),
        this.$t('guideSeccion.pokemon.fields.ivs'),
        this.$t('guideSeccion.pokemon.fields.moves')
      ];
    },

    teamSheetOptions() {
      return [
        {
          number: '01',
          title: this.$t('guideSeccion.teamSheets.options.registered.title'),
          description: this.$t('guideSeccion.teamSheets.options.registered.description'),
          items: []
        },
        {
          number: '02',
          title: this.$t('guideSeccion.teamSheets.options.manual.title'),
          description: this.$t('guideSeccion.teamSheets.options.manual.description'),
          items: []
        },
        {
          number: '03',
          title: this.$t('guideSeccion.teamSheets.options.images.title'),
          description: this.$t('guideSeccion.teamSheets.options.images.description'),
          items: [
            this.$t('guideSeccion.teamSheets.options.images.pokemonImage'),
            this.$t('guideSeccion.teamSheets.options.images.statsImage')
          ]
        }
      ];
    },

    tournamentFields() {
      return [
        this.$t('guideSeccion.tournaments.fields.name'),
        this.$t('guideSeccion.tournaments.fields.date'),
        this.$t('guideSeccion.tournaments.fields.format'),
        this.$t('guideSeccion.tournaments.fields.rounds'),
        this.$t('guideSeccion.tournaments.fields.results'),
        this.$t('guideSeccion.tournaments.fields.standings'),
        this.$t('guideSeccion.tournaments.fields.topCut')
      ];
    },

    summaryItems() {
      return [
        this.$t('guideSeccion.summary.items.teams'),
        this.$t('guideSeccion.summary.items.pokemon'),
        this.$t('guideSeccion.summary.items.teamSheets'),
        this.$t('guideSeccion.summary.items.imageTeamSheets'),
        this.$t('guideSeccion.summary.items.print'),
        this.$t('guideSeccion.summary.items.tournaments'),
        this.$t('guideSeccion.summary.items.results'),
        this.$t('guideSeccion.summary.items.organization')
      ];
    }
  },

  watch: {
    '$i18n.locale'() {
      this.setHead();
    }
  },

  mounted() {
    this.detectGlobalTheme();
    this.observeTheme();
    this.setHead();
  },

  beforeUnmount() {
    this.themeObserver?.disconnect();
    this.headEntry?.dispose?.();
  },

  methods: {
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
        /(^|\\s)(dark|dark-mode|theme-dark|is-dark)(\\s|$)/i.test(classNames) ||
        String(dataTheme).toLowerCase() === 'dark';
    },

    observeTheme() {
      if (
        typeof MutationObserver === 'undefined' ||
        typeof document === 'undefined'
      ) {
        return;
      }

      this.themeObserver = new MutationObserver(this.detectGlobalTheme);

      const options = {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'data-bs-theme']
      };

      this.themeObserver.observe(document.documentElement, options);

      if (document.body) {
        this.themeObserver.observe(document.body, options);
      }
    },

    setHead() {
      this.headEntry?.dispose?.();

      this.headEntry = useHead({
        title: this.$t('guideSeccion.metaTitle'),
        meta: [
          {
            name: 'description',
            content: this.$t('guideSeccion.metaDescription')
          }
        ]
      });
    }
  }
};
</script>

<style scoped>
.guide-page {
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

.guide-page--dark {
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

.guide-page,
.guide-page * {
  box-sizing: border-box;
}

.guide-page {
  scroll-behavior: smooth;
}

.guide-shell {
  width: min(100%, 1180px);
}

.guide-hero,
.guide-section,
.content-card,
.audience-card,
.summary-card {
  border: 1px solid var(--border-color);
  background: var(--surface);
  box-shadow: var(--shadow);
}

.guide-hero {
  position: relative;

  display: grid;
  grid-template-columns:
    minmax(0, 1.35fr)
    minmax(240px, 0.65fr);

  gap: clamp(1.5rem, 4vw, 3rem);
  align-items: center;

  padding: clamp(1.5rem, 4vw, 3rem);

  overflow: hidden;

  border-radius: 1.4rem;
}

.guide-hero__content {
  position: relative;
  z-index: 2;
  min-width: 0;
}

.guide-eyebrow {
  margin: 0;

  color: var(--accent);

  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.guide-hero__title {
  max-width: 760px;

  margin: 0.45rem 0 0.8rem;

  color: var(--text-primary);

  font-size: clamp(2rem, 5.5vw, 3.8rem);
  font-weight: 850;
  letter-spacing: -0.045em;
  line-height: 1.04;

  text-wrap: balance;
}

.guide-hero__subtitle {
  max-width: 720px;

  margin: 0;

  color: var(--text-secondary);

  font-size: clamp(1rem, 1.8vw, 1.15rem);
  line-height: 1.7;

  text-wrap: balance;
}

.guide-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;

  margin-top: 1.6rem;
}

.guide-hero__visual {
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

.guide-page--dark .hero-logo-panel {
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

  filter:
    drop-shadow(
      0 12px 18px rgba(25, 90, 55, 0.2)
    );
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

  box-shadow:
    0 10px 22px rgba(25, 135, 84, 0.22);
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

  box-shadow:
    0 13px 28px rgba(25, 135, 84, 0.28);
}

.btn-electric-soft:hover {
  border-color: var(--accent);

  color: #ffffff;

  background: var(--accent);
}

.guide-section {
  margin-top: clamp(1.5rem, 4vw, 2.5rem);
  padding: clamp(1rem, 3vw, 1.7rem);

  border-radius: 1.2rem;
}

.guide-anchor {
  scroll-margin-top: 6rem;
}

.section-heading {
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

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  gap: 1rem;
}

.quick-card {
  position: relative;

  display: grid;
  grid-template-columns: auto 1fr auto;

  min-width: 0;

  gap: 0.8rem;
  align-items: center;

  padding: 1rem;

  border: 1px solid var(--border-color);
  border-radius: 1rem;

  color: inherit;
  background: var(--surface-muted);

  text-decoration: none;

  transition:
    transform 160ms ease,
    border-color 160ms ease,
    background-color 160ms ease,
    box-shadow 160ms ease;
}

.quick-card:hover {
  border-color: rgba(25, 135, 84, 0.45);

  color: inherit;
  background: var(--surface-hover);

  transform: translateY(-2px);

  box-shadow: var(--card-hover-shadow);
}

.quick-card__number,
.step-badge,
.option-card__number {
  display: inline-grid;

  width: 2.7rem;
  height: 2.7rem;

  flex: 0 0 auto;

  place-items: center;

  border: 1px solid rgba(25, 135, 84, 0.22);
  border-radius: 0.8rem;

  color: var(--accent);
  background: var(--accent-soft);

  font-size: 0.78rem;
  font-weight: 900;
}

.quick-card__title {
  margin: 0;

  color: var(--text-primary);

  font-size: 0.95rem;
  font-weight: 850;
}

.quick-card__text {
  margin: 0.25rem 0 0;

  color: var(--text-secondary);

  font-size: 0.78rem;
  line-height: 1.45;
}

.quick-card__arrow {
  color: var(--accent);

  font-size: 1.2rem;
  font-weight: 800;
}

.content-card,
.audience-card,
.summary-card {
  padding: clamp(1.2rem, 3vw, 2rem);

  border-radius: 1rem;
}

.guide-section > .content-card,
.guide-section > .split-cards,
.guide-section > .audience-grid,
.guide-section > .summary-card {
  box-shadow: none;
}

.content-card__header {
  display: flex;

  gap: 1rem;
  align-items: flex-start;

  margin-bottom: 1.25rem;
}

.content-card__title {
  margin: 0.25rem 0 0;

  color: var(--text-primary);

  font-size: clamp(1.4rem, 3vw, 2rem);
  font-weight: 850;
}

.content-card__lead {
  max-width: 850px;

  margin: 0 0 1.4rem;

  color: var(--text-secondary);

  font-size: 1rem;
  line-height: 1.7;
}

.content-card__lead strong {
  color: var(--text-primary);
}

.content-subtitle {
  margin: 0 0 0.8rem;

  color: var(--text-primary);

  font-size: 1rem;
  font-weight: 850;
}

.two-column-grid {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(260px, 0.7fr);

  gap: 1.5rem;
}

.guide-list {
  margin: 0;
  padding-left: 1.25rem;

  color: var(--text-secondary);

  line-height: 1.75;
}

.guide-list li::marker {
  color: var(--accent);
}

.guide-list--compact {
  margin-top: 1rem;

  font-size: 0.88rem;
}

.info-box,
.callout,
.print-box {
  border: 1px solid rgba(25, 135, 84, 0.2);
  border-radius: 1rem;

  background: var(--accent-soft);
}

.info-box {
  padding: 1.2rem;
}

.info-box__label {
  color: var(--accent);

  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.info-box p {
  margin: 0.6rem 0 1rem;

  color: var(--text-secondary);

  line-height: 1.6;
}

.inline-link {
  display: inline-flex;

  gap: 0.35rem;
  align-items: center;

  color: var(--accent);

  font-weight: 850;

  text-decoration: none;
}

.inline-link:hover {
  color: var(--accent-strong);
}

.inline-link--spaced {
  margin-top: 1.25rem;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));

  gap: 0.8rem;
}

.feature-item {
  display: flex;

  min-width: 0;

  gap: 0.55rem;
  align-items: center;

  padding: 0.9rem;

  border: 1px solid var(--border-color);
  border-radius: 0.85rem;

  background: var(--surface-muted);

  color: var(--text-primary);

  font-size: 0.88rem;
  font-weight: 750;
}

.feature-check,
.summary-item__check {
  display: inline-grid;

  width: 1.65rem;
  height: 1.65rem;

  flex: 0 0 auto;

  place-items: center;

  border-radius: 50%;

  color: var(--accent);
  background: var(--accent-soft);

  font-size: 0.8rem;
  font-weight: 900;
}

.data-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  gap: 0.7rem;
}

.data-grid--wide {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.data-chip {
  display: flex;

  gap: 0.55rem;
  align-items: center;

  padding: 0.85rem 0.95rem;

  border: 1px solid var(--border-color);
  border-radius: 0.8rem;

  background: var(--surface-muted);

  color: var(--text-primary);

  font-size: 0.88rem;
  font-weight: 750;
}

.data-chip__dot {
  width: 0.5rem;
  height: 0.5rem;

  flex: 0 0 auto;

  border-radius: 50%;

  background: var(--accent);
}

.callout {
  margin-top: 1rem;
  padding: 1rem 1.1rem;

  color: var(--text-secondary);

  line-height: 1.6;
}

.options-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));

  gap: 1rem;
}

.option-card {
  min-width: 0;

  padding: 1.2rem;

  border: 1px solid var(--border-color);
  border-radius: 1rem;

  background: var(--surface-muted);
}

.option-card__title {
  margin: 1rem 0 0.55rem;

  color: var(--text-primary);

  font-size: 1rem;
  font-weight: 850;
}

.option-card__text {
  margin: 0;

  color: var(--text-secondary);

  font-size: 0.88rem;
  line-height: 1.6;
}

.print-box {
  display: flex;

  gap: 1.5rem;
  align-items: center;
  justify-content: space-between;

  margin-top: 1.2rem;
  padding: 1.2rem;
}

.print-box__title {
  margin: 0.25rem 0 0.35rem;

  color: var(--text-primary);

  font-size: 1.1rem;
  font-weight: 850;
}

.print-box p:last-child {
  margin: 0;

  color: var(--text-secondary);
}

.content-card__note {
  margin: 1.1rem 0;

  color: var(--text-secondary);

  line-height: 1.6;
}

.split-cards,
.audience-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  gap: 1rem;
}

.audience-card__type {
  display: inline-flex;

  margin-bottom: 0.8rem;
  padding: 0.35rem 0.7rem;

  border: 1px solid rgba(25, 135, 84, 0.2);
  border-radius: 999px;

  color: var(--accent);
  background: var(--accent-soft);

  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.12em;
}

.audience-card h3 {
  margin: 0 0 1rem;

  color: var(--text-primary);

  font-size: 1.15rem;
  font-weight: 850;
}

.summary-card {
  overflow: hidden;

  background:
    linear-gradient(
      145deg,
      var(--surface),
      var(--surface-muted)
    );
}

.summary-card__title {
  max-width: 780px;

  margin: 0.35rem 0 0.5rem;

  color: var(--text-primary);

  font-size: clamp(1.5rem, 3.5vw, 2.4rem);
  font-weight: 850;
}

.summary-card__description {
  margin: 0 0 1.5rem;

  color: var(--text-secondary);

  line-height: 1.6;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));

  gap: 0.75rem;
}

.summary-item {
  display: flex;

  gap: 0.65rem;
  align-items: center;

  color: var(--text-secondary);
}

.summary-actions {
  display: flex;
  flex-wrap: wrap;

  gap: 0.8rem;

  margin-top: 1.7rem;
}

.btn-electric:focus-visible,
.btn-electric-soft:focus-visible,
.quick-card:focus-visible,
.inline-link:focus-visible {
  outline: 3px solid rgba(25, 135, 84, 0.25);
  outline-offset: 3px;
}

@media (max-width: 991.98px) {
  .quick-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .feature-list {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .data-grid--wide {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .options-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 899.98px) {
  .guide-hero {
    grid-template-columns: 1fr;
  }

  .guide-hero__visual {
    min-height: 220px;
  }

  .hero-logo-panel {
    max-width: 190px;
  }

  .two-column-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767.98px) {
  .quick-grid,
  .split-cards,
  .audience-grid,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .feature-list,
  .data-grid,
  .data-grid--wide {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .print-box {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 479.98px) {
  .guide-shell {
    padding-inline: 0.75rem;
  }

  .guide-hero {
    padding: 1.2rem;

    border-radius: 1rem;
  }

  .guide-hero__visual {
    min-height: 180px;
  }

  .hero-logo-panel {
    max-width: 150px;
  }

  .guide-hero__actions {
    align-items: stretch;
  }

  .guide-hero__actions .btn-electric,
  .guide-hero__actions .btn-electric-soft,
  .summary-actions .btn-electric,
  .summary-actions .btn-electric-soft {
    width: 100%;
  }

  .guide-section {
    padding: 0.85rem;
  }

  .content-card,
  .audience-card,
  .summary-card {
    padding: 1rem;
  }

  .feature-list,
  .data-grid,
  .data-grid--wide {
    grid-template-columns: 1fr;
  }

  .quick-card {
    grid-template-columns: auto 1fr;
  }

  .quick-card__arrow {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .btn-electric,
  .btn-electric-soft,
  .quick-card {
    transition: none;
  }

  .btn-electric:hover,
  .btn-electric-soft:hover,
  .quick-card:hover {
    transform: none;
  }
}
</style>

