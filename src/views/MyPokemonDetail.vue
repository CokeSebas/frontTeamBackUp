<template>
  <main
    class="pokemon-detail-page"
    :class="{ 'pokemon-detail-page--dark': isDark }"
  >
    <div class="detail-shell">
      <header class="detail-header">
        <span class="detail-header__eyebrow">
          {{ pokemon?.subFormatName || 'Mi Pokémon' }}
        </span>

        <h1 class="detail-header__title">
          {{ $t('pokemonsSeccion.detailMyPokemon') }}
        </h1>

        <p class="detail-header__subtitle">
          {{
            pokemon
              ? `Revisa y administra la configuración de ${pokemonDisplayName}.`
              : 'Consulta y edita la información de tu Pokémon.'
          }}
        </p>
      </header>

      <section
        v-if="isLoading"
        class="state-card"
        aria-live="polite"
        aria-busy="true"
      >
        <img
          v-if="gifLoading"
          :src="gifLoading"
          class="state-loader-image"
          alt="Cargando Pokémon"
        >

        <span
          v-else
          class="state-spinner"
          aria-hidden="true"
        ></span>

      </section>

      <section
        v-else-if="errorMessage"
        class="state-card state-card--error"
        role="alert"
      >
        <h2 class="state-card__title">
          {{ $t('responseApisSeccion.oops') }}
        </h2>

        <p class="state-card__text">
          {{ errorMessage }}
        </p>

        <button
          type="button"
          class="detail-button detail-button--outline"
          @click="getPokeDetail(false)"
        >
          Reintentar
        </button>
      </section>

      <section
        v-else-if="pokemon"
        class="detail-grid"
      >
        <article class="content-card pokemon-card">
          <template v-if="!isEditing">
            <div class="pokemon-hero">
              <div class="pokemon-image-stage">
                <img
                  v-if="pokemon.urlImage && !imageError"
                  :src="pokemon.urlImage"
                  :alt="`Imagen de ${pokemonDisplayName}`"
                  class="pokemon-image"
                  width="180"
                  height="180"
                  decoding="async"
                  @error="imageError = true"
                >

                <div
                  v-else
                  class="pokemon-image-placeholder"
                  role="img"
                  :aria-label="`${pokemonDisplayName} sin imagen disponible`"
                >
                  Sin imagen
                </div>
              </div>

              <div class="pokemon-info">
                <div class="pokemon-info__heading">
                  <h2>{{ pokemonDisplayName }}</h2>

                  <span
                    v-if="pokemon.item"
                    class="pokemon-item-badge"
                    :title="pokemon.item"
                  >
                    @ {{ pokemon.item }}
                  </span>
                </div>

                <dl class="pokemon-stats">
                  <div
                    v-if="pokemon.ability"
                    class="stat-row"
                  >
                    <dt>{{ $t('pokemonsSeccion.ability') }}</dt>
                    <dd>{{ pokemon.ability }}</dd>
                  </div>

                  <div
                    v-if="shouldShowTeraType && pokemon.teraType"
                    class="stat-row"
                  >
                    <dt>{{ $t('pokemonsSeccion.teraType') }}</dt>
                    <dd>{{ pokemon.teraType }}</dd>
                  </div>

                  <div
                    v-if="pokemon.evs"
                    class="stat-row"
                  >
                    <dt>EVs</dt>
                    <dd>{{ pokemon.evs }}</dd>
                  </div>

                  <div
                    v-if="pokemon.nature"
                    class="stat-row"
                  >
                    <dt>Nature</dt>
                    <dd>{{ pokemon.nature }}</dd>
                  </div>

                  <div
                    v-if="pokemon.ivs"
                    class="stat-row"
                  >
                    <dt>IVs</dt>
                    <dd>{{ pokemon.ivs }}</dd>
                  </div>
                </dl>
              </div>
            </div>

            <div
              v-if="pokemonMoves.length"
              class="moves-section"
            >
              <h3 class="section-title">
                Moves
              </h3>

              <ul class="moves-list">
                <li
                  v-for="(move, index) in pokemonMoves"
                  :key="`${move}-${index}`"
                >
                  {{ move }}
                </li>
              </ul>
            </div>
          </template>

          <div
            v-else
            class="edit-section"
          >
            <div class="form-group">
              <label for="pokemon-paste">
                {{ $t('pokemonsSeccion.dataPokemon') }}
              </label>

              <textarea
                id="pokemon-paste"
                v-model.trim="pokemon.pasteSd"
                class="paste-textarea"
                rows="14"
                spellcheck="false"
                placeholder="Pokémon @ Item
Ability: Ability
Tera Type: Normal
EVs: 100 HP / 100 Atk / 100 Def / 100 SpA / 100 SpD / 100 Spe
Timid Nature
IVs: 0 Atk
- Mov1
- Mov2
- Mov3
- Mov4"
              ></textarea>
            </div>
          </div>
        </article>

        <aside class="content-card detail-card">
          <template v-if="isEditing">
            <div class="form-group">
              <label for="spread-use">
                {{ $t('pokemonsSeccion.useSpread') }}
              </label>

              <textarea
                id="spread-use"
                v-model.trim="pokemon.spreadUse"
                rows="4"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="team-mates">
                {{ $t('pokemonsSeccion.teamMates') }}
              </label>

              <textarea
                id="team-mates"
                v-model.trim="pokemon.teamMates"
                rows="4"
              ></textarea>
            </div>

            <div class="form-group">
              <label for="main-calculations">
                {{ $t('pokemonsSeccion.calculations') }}
              </label>

              <textarea
                id="main-calculations"
                v-model.trim="pokemon.calculosPrincipales"
                rows="5"
              ></textarea>
            </div>

            <label
              class="checkbox-row"
              for="is-public"
            >
              <input
                id="is-public"
                v-model="pokemon.isPublic"
                type="checkbox"
              >
              <span>{{ $t('pokemonsSeccion.isPublic') }}</span>
            </label>
          </template>

          <template v-else>
            <div class="action-row">
              <button
                type="button"
                class="detail-button detail-button--primary"
                :disabled="!pokemon.pasteSd"
                @click="copyText"
              >
                {{ $t('buttons.copyPaste') }}
              </button>

              <span
                v-if="copySuccess"
                class="copy-message"
                role="status"
                aria-live="polite"
              >
                {{ copySuccess }}
              </span>
            </div>

            <dl class="extra-info">
              <div
                v-if="pokemon.subFormatName"
                class="info-row"
              >
                <dt>{{ $t('teamsSeccion.subFormat') }}</dt>
                <dd>{{ pokemon.subFormatName }}</dd>
              </div>

              <div
                v-if="pokemon.spreadUse"
                class="info-row"
              >
                <dt>{{ $t('pokemonsSeccion.useSpread') }}</dt>
                <dd>{{ pokemon.spreadUse }}</dd>
              </div>

              <div
                v-if="pokemon.teamMates"
                class="info-row"
              >
                <dt>{{ $t('pokemonsSeccion.teamMates') }}</dt>
                <dd>{{ pokemon.teamMates }}</dd>
              </div>

              <div
                v-if="pokemon.calculosPrincipales"
                class="info-row"
              >
                <dt>{{ $t('pokemonsSeccion.calculations') }}</dt>
                <dd>{{ pokemon.calculosPrincipales }}</dd>
              </div>
            </dl>
          </template>

          <div class="form-actions">
            <button
              v-if="!isEditing"
              type="button"
              class="detail-button detail-button--outline"
              @click="startEditing"
            >
              {{ $t('buttons.editPokemon') }}
            </button>

            <template v-else>
              <button
                type="button"
                class="detail-button detail-button--primary"
                :disabled="isSaving || !canSave"
                :aria-busy="isSaving"
                @click="saveChanges"
              >
                <span
                  v-if="isSaving"
                  class="button-spinner"
                  aria-hidden="true"
                ></span>

                {{
                  isSaving
                    ? 'Guardando...'
                    : $t('buttons.saveChanges')
                }}
              </button>

              <button
                type="button"
                class="detail-button detail-button--secondary"
                :disabled="isSaving"
                @click="cancelEdit"
              >
                {{ $t('buttons.cancel') }}
              </button>
            </template>
          </div>
        </aside>
      </section>

      <section
        v-else
        class="state-card"
      >
        <p class="state-card__text">
          {{ $t('responseApisSeccion.loadingDataError') }}
        </p>
      </section>
    </div>
  </main>
</template>

<script>
import axios from 'axios';
import Swal from 'sweetalert2';
import { unref } from 'vue';
import { useHead } from '@vueuse/head';

import { createEvent } from '@/services/eventService';

export default {
  name: 'MyPokemonDetail',

  inject: {
    apiUrl: {
      default: ''
    },
    gifLoading: {
      default: null
    },
    mode: {
      default: 'light'
    }
  },

  props: {
    id: {
      type: [Number, String],
      required: true
    }
  },

  data() {
    return {
      pokemon: null,
      originalPokemon: null,
      isLoading: true,
      isSaving: false,
      isEditing: false,
      copySuccess: '',
      errorMessage: '',
      copyMessageTimer: null,
      requestController: null,
      imageError: false
    };
  },

  computed: {
    isDark() {
      return String(unref(this.mode) || '')
        .trim()
        .toLocaleLowerCase() === 'dark';
    },

    pokemonDisplayName() {
      return this.pokemon?.namePoke ||
        this.pokemon?.name ||
        'Pokémon';
    },

    pokemonMoves() {
      if (Array.isArray(this.pokemon?.moves)) {
        return this.pokemon.moves
          .map((move) => String(move || '').trim())
          .filter(Boolean);
      }

      if (typeof this.pokemon?.moves === 'string') {
        return this.pokemon.moves
          .split(/\r?\n|,/)
          .map((move) =>
            move.replace(/^\s*-\s*/, '').trim()
          )
          .filter(Boolean);
      }

      return [];
    },

    shouldShowTeraType() {
      const subFormatId = Number(
        this.pokemon?.subFormatId
      );

      return Number.isFinite(subFormatId) &&
        subFormatId < 6;
    },

    canSave() {
      return Boolean(
        String(this.pokemon?.pasteSd || '').trim()
      );
    }
  },

  watch: {
    id(newId, oldId) {
      if (newId !== oldId) {
        void this.getPokeDetail();
      }
    }
  },

  methods: {
    buildApiUrl(path) {
      const baseUrl = String(unref(this.apiUrl) || '')
        .trim()
        .replace(/\/+$/, '');

      const cleanPath = String(path || '')
        .trim()
        .replace(/^\/+/, '');

      return baseUrl
        ? `${baseUrl}/${cleanPath}`
        : `/${cleanPath}`;
    },

    getAuthToken() {
      return localStorage.getItem('token') || '';
    },

    getAuthHeaders() {
      const token = this.getAuthToken();

      return token
        ? { Authorization: `Bearer ${token}` }
        : {};
    },

    normalizePokemon(data) {
      if (!data || typeof data !== 'object') {
        return null;
      }

      return {
        ...data,
        subFormatId:
          data.subFormatId != null
            ? Number(data.subFormatId)
            : data.subFormatId,
        isPublic:
          data.isPublic === true ||
          data.isPublic === 1 ||
          data.isPublic === '1' ||
          data.isPublic === 'true'
      };
    },

    getErrorMessage(error) {
      if (error?.response?.status === 401) {
        return 'Tu sesión expiró. Inicia sesión nuevamente.';
      }

      return error?.response?.data?.message ||
        error?.response?.data?.error ||
        this.$t('responseApisSeccion.loadingDataError') ||
        'No se pudo cargar el Pokémon.';
    },

    isCanceledRequest(error) {
      return error?.name === 'CanceledError' ||
        error?.code === 'ERR_CANCELED';
    },

    async getPokeDetail(trackEvent = true) {
      const pokemonId = String(this.id ?? '').trim();
      const token = this.getAuthToken();

      if (!pokemonId) {
        this.pokemon = null;
        this.isLoading = false;
        this.errorMessage =
          'El identificador del Pokémon no es válido.';
        return;
      }

      if (!token) {
        this.pokemon = null;
        this.isLoading = false;
        this.errorMessage =
          'Tu sesión no es válida. Inicia sesión nuevamente.';
        return;
      }

      this.requestController?.abort();

      const controller = new AbortController();
      this.requestController = controller;

      this.isLoading = true;
      this.errorMessage = '';
      this.imageError = false;

      try {
        const response = await axios.get(
          this.buildApiUrl(
            `pokemon/poke-user/${encodeURIComponent(pokemonId)}`
          ),
          {
            headers: {
              Authorization: `Bearer ${token}`
            },
            signal: controller.signal
          }
        );

        if (this.requestController !== controller) {
          return;
        }

        const responseData = response?.data;
        const rawPokemon =
          responseData?.status === 'success'
            ? responseData?.data?.[0] ||
              responseData?.data ||
              null
            : Array.isArray(responseData)
              ? responseData[0]
              : responseData?.data?.[0] ||
                responseData?.data ||
                null;

        const normalizedPokemon =
          this.normalizePokemon(rawPokemon);

        if (!normalizedPokemon) {
          throw new Error('INVALID_POKEMON_RESPONSE');
        }

        this.pokemon = normalizedPokemon;
        this.originalPokemon = null;
        this.isEditing = false;
        this.updatePageHead();

        if (trackEvent) {
          void this.registerViewEvent();
        }
      } catch (error) {
        if (this.isCanceledRequest(error)) {
          return;
        }

        console.error(
          'Error al cargar el Pokémon:',
          error
        );

        this.pokemon = null;
        this.errorMessage = this.getErrorMessage(error);
      } finally {
        if (this.requestController === controller) {
          this.isLoading = false;
          this.requestController = null;
        }
      }
    },

    updatePageHead() {
      const name = this.pokemonDisplayName;
      const description = `Detalles sobre ${name}`;

      useHead({
        title: `Pokémon ${name}`,
        meta: [
          {
            name: 'description',
            content: description
          },
          {
            name: 'keywords',
            content: `${name}, Pokémon, SpreadUse, VGC`
          },
          {
            property: 'og:title',
            content: `Pokémon ${name}`
          },
          {
            property: 'og:description',
            content: description
          },
          {
            property: 'og:image',
            content: this.pokemon?.urlImage || ''
          },
          {
            property: 'og:type',
            content: 'website'
          }
        ]
      });
    },

    async registerViewEvent() {
      try {
        await createEvent({
          userAgent: navigator.userAgent,
          date: new Date().toISOString(),
          type: 'pokemon_detail_user',
          description:
            `userName: ${localStorage.getItem('userName') || ''} ` +
            `detalle del pokemon ${this.pokemonDisplayName}, ` +
            `pokeId: ${this.id}`
        });
      } catch (error) {
        console.warn(
          'No se pudo registrar el evento de visualización:',
          error
        );
      }
    },

    async copyText() {
      const text = String(
        this.pokemon?.pasteSd || ''
      ).trim();

      if (!text) {
        return;
      }

      try {
        if (
          navigator.clipboard &&
          window.isSecureContext
        ) {
          await navigator.clipboard.writeText(text);
        } else {
          this.copyTextFallback(text);
        }

        this.showCopyMessage(
          this.$t('responseApisSeccion.copySuccess')
        );
      } catch (error) {
        console.error(
          this.$t('responseApisSeccion.copyError'),
          error
        );

        this.showCopyMessage(
          this.$t('responseApisSeccion.copyError')
        );
      }
    },

    copyTextFallback(text) {
      const textarea =
        document.createElement('textarea');

      try {
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.opacity = '0';

        document.body.appendChild(textarea);
        textarea.select();

        const copied =
          document.execCommand('copy');

        if (!copied) {
          throw new Error('COPY_FAILED');
        }
      } finally {
        textarea.remove();
      }
    },

    showCopyMessage(message) {
      this.copySuccess = message;
      window.clearTimeout(this.copyMessageTimer);

      this.copyMessageTimer =
        window.setTimeout(() => {
          this.copySuccess = '';
        }, 3000);
    },

    startEditing() {
      if (!this.pokemon) {
        return;
      }

      this.originalPokemon =
        JSON.parse(JSON.stringify(this.pokemon));

      this.isEditing = true;
    },

    cancelEdit() {
      if (this.originalPokemon) {
        this.pokemon = this.normalizePokemon(
          JSON.parse(
            JSON.stringify(this.originalPokemon)
          )
        );
      }

      this.originalPokemon = null;
      this.isEditing = false;
    },

    async saveChanges() {
      if (!this.canSave || this.isSaving) {
        return;
      }

      const token = this.getAuthToken();

      if (!token) {
        await Swal.fire(
          this.$t('responseApisSeccion.error'),
          'Tu sesión expiró. Inicia sesión nuevamente.',
          'error'
        );
        return;
      }

      this.isSaving = true;

      const payload = {
        pasteSd: this.pokemon.pasteSd.trim(),
        spreadUse:
          this.pokemon.spreadUse?.trim() || '',
        teamMates:
          this.pokemon.teamMates?.trim() || '',
        calculosPrincipales:
          this.pokemon.calculosPrincipales?.trim() || '',
        isPublic: Boolean(this.pokemon.isPublic)
      };

      try {
        const response = await axios.post(
          this.buildApiUrl(
            `pokemon/edit/${encodeURIComponent(this.id)}`
          ),
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (response?.data?.status !== 'success') {
          throw new Error('UPDATE_FAILED');
        }

        await this.getPokeDetail(false);

        await Swal.fire(
          this.$t('responseApisSeccion.exito'),
          this.$t(
            'responseApisSeccion.updatePokemonSuccess'
          ),
          'success'
        );
      } catch (error) {
        console.error(
          'Error al actualizar el Pokémon:',
          error
        );

        await Swal.fire(
          this.$t('responseApisSeccion.error'),
          error?.response?.data?.message ||
            this.$t(
              'responseApisSeccion.errorUpdatePokemon'
            ),
          'error'
        );
      } finally {
        this.isSaving = false;
      }
    }
  },

  mounted() {
    void this.getPokeDetail();
  },

  beforeUnmount() {
    this.requestController?.abort();
    window.clearTimeout(this.copyMessageTimer);
  }
};
</script>

<style scoped>
.pokemon-detail-page {
  --page-bg: #f3f6f5;
  --surface: #ffffff;
  --surface-muted: #f3f6f5;
  --text-primary: #1f2a25;
  --text-secondary: #647068;
  --border-color: #dce4df;
  --accent: #198754;
  --accent-strong: #12693f;
  --accent-soft: rgba(25, 135, 84, 0.12);
  --accent-border: rgba(25, 135, 84, 0.42);
  --danger-soft: #fff4f4;
  --danger-border: #f2c3c3;
  --input-bg: #f7faf8;
  --shadow: 0 16px 40px rgba(25, 50, 37, 0.08);
  --focus-ring: rgba(25, 135, 84, 0.22);

  min-height: 100dvh;
  background:
    radial-gradient(
      circle at top center,
      rgba(25, 135, 84, 0.09),
      transparent 30rem
    ),
    var(--page-bg);
  color: var(--text-primary);
}

.pokemon-detail-page--dark {
  --page-bg: #101412;
  --surface: #19201c;
  --surface-muted: #222b26;
  --text-primary: #eef5f1;
  --text-secondary: #aab8b0;
  --border-color: #334139;
  --accent: #37be78;
  --accent-strong: #69dda0;
  --accent-soft: rgba(55, 190, 120, 0.14);
  --accent-border: rgba(55, 190, 120, 0.48);
  --danger-soft: #2a1a1a;
  --danger-border: #704141;
  --input-bg: #222b26;
  --shadow: 0 18px 42px rgba(0, 0, 0, 0.28);
  --focus-ring: rgba(55, 190, 120, 0.28);
}

.pokemon-detail-page,
.pokemon-detail-page * {
  box-sizing: border-box;
}

.detail-shell {
  width: min(100%, 1180px);
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 2.5rem);
}

.detail-header {
  max-width: 52rem;
  margin: 0 auto 2rem;
  text-align: center;
}

.detail-header__eyebrow {
  display: inline-flex;
  align-items: center;
  min-height: 2rem;
  margin-bottom: 0.7rem;
  padding: 0.32rem 0.7rem;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.76rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.detail-header__title {
  margin: 0;
  color: var(--text-primary);
  font-size: clamp(1.8rem, 4vw, 2.65rem);
  font-weight: 800;
  line-height: 1.15;
  text-wrap: balance;
}

.detail-header__subtitle {
  max-width: 44rem;
  margin: 0.75rem auto 0;
  color: var(--text-secondary);
  line-height: 1.6;
  text-wrap: balance;
}

.detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.25fr) minmax(19rem, 0.75fr);
  gap: 1.25rem;
  align-items: start;
}

.content-card,
.state-card {
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  background: var(--surface);
  box-shadow: var(--shadow);
}

.content-card {
  min-width: 0;
  padding: clamp(1rem, 3vw, 1.6rem);
}

.pokemon-card {
  min-height: 100%;
}

.pokemon-hero {
  display: grid;
  grid-template-columns: minmax(9rem, 12rem) minmax(0, 1fr);
  gap: clamp(1rem, 3vw, 1.6rem);
  align-items: center;
}

.pokemon-image-stage {
  display: grid;
  width: 100%;
  aspect-ratio: 1;
  place-items: center;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 1rem;
  background:
    radial-gradient(
      circle at center,
      var(--accent-soft),
      transparent 72%
    ),
    var(--surface-muted);
}

.pokemon-image {
  display: block;
  width: 82%;
  height: 82%;
  object-fit: contain;
}

.pokemon-image-placeholder {
  display: grid;
  width: 100%;
  height: 100%;
  place-items: center;
  padding: 1rem;
  color: var(--text-secondary);
  font-weight: 800;
  text-align: center;
}

.pokemon-info {
  min-width: 0;
}

.pokemon-info__heading {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
  margin-bottom: 1rem;
}

.pokemon-info__heading h2 {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--text-primary);
  font-size: clamp(1.35rem, 3vw, 1.9rem);
  line-height: 1.2;
}

.pokemon-item-badge,
.pokemon-format-badge {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  padding: 0.32rem 0.65rem;
  overflow: hidden;
  border: 1px solid var(--accent-border);
  border-radius: 999px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pokemon-stats,
.extra-info {
  margin: 0;
}

.stat-row,
.info-row {
  display: grid;
  grid-template-columns: minmax(7rem, auto) minmax(0, 1fr);
  gap: 0.75rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--border-color);
}

.stat-row:last-child,
.info-row:last-child {
  border-bottom: 0;
}

.stat-row dt,
.info-row dt {
  color: var(--text-secondary);
  font-weight: 800;
}

.stat-row dd,
.info-row dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--text-primary);
  white-space: pre-wrap;
}

.moves-section {
  margin-top: 1.4rem;
  padding-top: 1.2rem;
  border-top: 1px solid var(--border-color);
}

.section-title {
  margin: 0 0 0.8rem;
  color: var(--text-primary);
  font-size: 1.02rem;
  font-weight: 800;
}

.moves-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.moves-list li {
  min-width: 0;
  padding: 0.7rem 0.8rem;
  overflow-wrap: anywhere;
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  background: var(--surface-muted);
  color: var(--text-primary);
  font-weight: 700;
}

.detail-card {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.action-row,
.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem;
  align-items: center;
}

.copy-message {
  color: var(--accent);
  font-size: 0.9rem;
  font-weight: 800;
}

.share-section,
.form-actions {
  padding-top: 1.1rem;
  border-top: 1px solid var(--border-color);
}

.share-section h3 {
  margin: 0 0 0.85rem;
  color: var(--text-primary);
  font-size: 1rem;
  font-weight: 800;
}

.detail-button {
  display: inline-flex;
  min-height: 2.75rem;
  gap: 0.45rem;
  align-items: center;
  justify-content: center;
  padding: 0.68rem 1rem;
  border: 1px solid transparent;
  border-radius: 0.75rem;
  font: inherit;
  font-weight: 800;
  line-height: 1.2;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 150ms ease,
    filter 150ms ease,
    box-shadow 150ms ease;
}

.detail-button:hover:not(:disabled) {
  filter: brightness(1.03);
  transform: translateY(-1px);
}

.detail-button:focus-visible,
textarea:focus-visible,
input:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}

.detail-button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.detail-button--primary {
  border-color: var(--accent);
  background: var(--accent);
  color: #ffffff;
  box-shadow: 0 9px 20px var(--accent-soft);
}

.detail-button--outline {
  border-color: var(--accent-border);
  background: transparent;
  color: var(--accent);
}

.detail-button--secondary {
  border-color: var(--border-color);
  background: var(--surface-muted);
  color: var(--text-primary);
}

.button-spinner,
.state-spinner {
  display: inline-block;
  border: 3px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.button-spinner {
  width: 1rem;
  height: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.45rem;
  color: var(--text-primary);
  font-weight: 800;
}

textarea {
  display: block;
  width: 100%;
  min-height: 7rem;
  padding: 0.8rem 0.9rem;
  resize: vertical;
  border: 1px solid var(--border-color);
  border-radius: 0.75rem;
  outline: none;
  background: var(--input-bg);
  color: var(--text-primary);
  font: inherit;
  line-height: 1.5;
}

textarea::placeholder {
  color: var(--text-secondary);
  opacity: 0.8;
}

textarea:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 0.22rem var(--accent-soft);
}

.paste-textarea {
  min-height: 22rem;
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
}

.checkbox-row {
  display: inline-flex;
  gap: 0.65rem;
  align-items: center;
  color: var(--text-primary);
  font-weight: 800;
  cursor: pointer;
}

.checkbox-row input {
  width: 1.15rem;
  height: 1.15rem;
  margin: 0;
  accent-color: var(--accent);
}

.state-card {
  display: grid;
  min-height: 22rem;
  place-items: center;
  align-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.state-card--error {
  border-color: var(--danger-border);
  background: var(--danger-soft);
}

.state-card__title,
.state-card__text {
  margin: 0;
}

.state-card__title {
  color: var(--text-primary);
}

.state-card__text {
  max-width: 38rem;
  color: var(--text-secondary);
  line-height: 1.55;
}

.state-loader-image {
  display: block;
  /*max-width: min(100%, 15rem);*/
  height: auto;
  object-fit: contain;
}

.state-spinner {
  width: 3.8rem;
  height: 3.8rem;
  color: var(--accent);
  filter: drop-shadow(0 0 10px var(--accent-soft));
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 899.98px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 575.98px) {
  .detail-shell {
    padding: 0.8rem;
  }

  .detail-header {
    margin-bottom: 1.25rem;
  }

  .content-card,
  .state-card {
    border-radius: 0.85rem;
  }

  .pokemon-hero {
    grid-template-columns: 1fr;
  }

  .pokemon-image-stage {
    width: min(100%, 12rem);
    margin: 0 auto;
  }

  .pokemon-info__heading {
    justify-content: center;
    text-align: center;
  }

  .stat-row,
  .info-row {
    grid-template-columns: 1fr;
    gap: 0.2rem;
  }

  .moves-list {
    grid-template-columns: 1fr;
  }

  .action-row,
  .form-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .action-row .detail-button,
  .form-actions .detail-button {
    width: 100%;
  }

  .copy-message {
    text-align: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .detail-button {
    transition: none;
  }

  .detail-button:hover:not(:disabled) {
    transform: none;
  }

  .button-spinner,
  .state-spinner {
    animation-duration: 1.4s;
  }
}
</style>
