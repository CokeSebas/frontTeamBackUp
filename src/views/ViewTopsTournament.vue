<template>
  <main :class="['tournament-top-page', { 'is-dark': isDarkMode }]">
    <section class="page-shell">
      <div class="top-actions">
        <div class="download-actions" aria-label="Opciones de descarga">
          <button
            type="button"
            class="action-button action-button--light"
            :disabled="!canDownload"
            @click="downloadImage('light')"
          >
            <img
              v-if="sunIcon"
              :src="sunIcon"
              width="20"
              height="20"
              alt=""
              aria-hidden="true"
            >
            <span>
              {{ isExporting && captureTheme === 'light'
                ? 'Generando imagen...'
                : $t('tournamentsSeccion.dowloadLight') }}
            </span>
          </button>

          <button
            type="button"
            class="action-button action-button--dark"
            :disabled="!canDownload"
            @click="downloadImage('dark')"
          >
            <img
              v-if="moonIcon"
              :src="moonIcon"
              width="20"
              height="20"
              alt=""
              aria-hidden="true"
            >
            <span>
              {{ isExporting && captureTheme === 'dark'
                ? 'Generando imagen...'
                : $t('tournamentsSeccion.dowloadDark') }}
            </span>
          </button>
        </div>

        <div v-if="currentUrl" class="share-box">
          <h3>{{ $t('share') }}</h3>
          <ShareButtons
            :share-url="currentUrl"
            :share-text="shareText"
          />
        </div>
      </div>

      <div
        v-if="loading"
        class="state-card state-card--loading"
        role="status"
        aria-live="polite"
      >
        <img
          v-if="gifLoading"
          class="loading-image"
          :src="gifLoading"
          alt="Cargando resultados del torneo"
        >
        <span v-else class="loading-spinner" aria-hidden="true"></span>
      </div>

      <div
        v-else-if="errorMessage"
        class="state-card state-card--error"
        role="alert"
      >
        <span class="state-icon" aria-hidden="true">!</span>
        <h2>No fue posible cargar el torneo</h2>
        <p>{{ errorMessage }}</p>
        <button type="button" class="retry-button" @click="loadTopPlayers">
          Reintentar
        </button>
      </div>

      <div
        v-else-if="topPlayers.length === 0"
        class="state-card state-card--empty"
      >
        <span class="state-icon" aria-hidden="true">🏆</span>
        <h2>No hay resultados disponibles</h2>
        <p>Aún no se han registrado jugadores en el top de este torneo.</p>
      </div>

      <article
        v-else
        ref="captureArea"
        :class="[
          'tournament-card',
          {
            'is-dark-card': effectiveDarkCard,
            'is-capturing': isExporting
          }
        ]"
      >
        <header class="tournament-header">
          <p class="eyebrow">Tournament Top</p>
          <h1 class="title">
            {{ $t('tournamentsSeccion.title') }}
            <span>{{ tournamentName }}</span>
          </h1>
        </header>

        <div class="players-list">
          <section
            v-for="player in topPlayers"
            :key="getPlayerKey(player)"
            :class="['player-card', getCardClass(player.position)]"
          >
            <div class="player-header">
              <span
                :class="['position', getPositionClass(player.position)]"
                :aria-label="`Posición ${player.position}`"
              >
                #{{ player.position }}
              </span>

              <div class="player-identity">
                <span class="player-name">{{ getPlayerName(player) }}</span>
                <span class="team-count">
                  {{ orderedPokemons(player.pokemons).length }} Pokémon
                </span>
              </div>
            </div>

            <div class="pokemon-row">
              <article
                v-for="poke in orderedPokemons(player.pokemons)"
                :key="getPokemonKey(player, poke)"
                class="pokemon-card"
              >
                <div class="pokemon-image-shell">
                  <span class="pokemon-placeholder" aria-hidden="true">?</span>
                  <img
                    v-if="getPokemonImage(poke)"
                    :src="getPokemonImage(poke)"
                    :alt="getPokemonName(poke)"
                    crossorigin="anonymous"
                    loading="eager"
                    decoding="async"
                    @error="hideBrokenImage"
                  >
                </div>
                <span class="pokemon-name">{{ getPokemonName(poke) }}</span>
              </article>
            </div>
          </section>
        </div>

        <footer class="tournament-footer">
          <span>{{ $t('tournamentsSeccion.tournamentImgFooter') }}</span>
          <a
            href="https://x.com/Pokecircuit"
            target="_blank"
            rel="noopener noreferrer"
          >
            @Pokecircuit
          </a>
        </footer>
      </article>
    </section>
  </main>
</template>

<script setup>
import { computed, inject, nextTick, onMounted, ref, unref } from 'vue'
import { useRoute } from 'vue-router'
import axios from 'axios'
import html2canvas from 'html2canvas'
import Swal from 'sweetalert2'

import ShareButtons from '../components/ShareButtons.vue'
import { createEvent } from '@/services/eventService'

const mode = inject('mode', ref('light'))
const apiUrl = inject('apiUrl', '')
const gifLoading = inject('gifLoading', '')
const sunIcon = inject('sunIcon', '')
const moonIcon = inject('moonIcon', '')

const route = useRoute()
const idTorneo = computed(() => String(route.params.id_torneo ?? '').trim())

const captureArea = ref(null)
const loading = ref(true)
const isExporting = ref(false)
const captureTheme = ref(null)
const errorMessage = ref('')
const topPlayers = ref([])
const tournamentTop = ref(null)

const currentUrl = ref(
  typeof window !== 'undefined' ? window.location.href : ''
)

const isDarkMode = computed(() => unref(mode) === 'dark')

const effectiveDarkCard = computed(() => {
  if (captureTheme.value) return captureTheme.value === 'dark'
  return isDarkMode.value
})

const tournamentName = computed(() => {
  const tournament = tournamentTop.value ?? {}
  return tournament.nombre || tournament.name || `#${idTorneo.value}`
})

const shareText = computed(() => (
  `Revisa el top del torneo ${tournamentName.value}`
))

const canDownload = computed(() => (
  !loading.value &&
  !isExporting.value &&
  !errorMessage.value &&
  topPlayers.value.length > 0
))

const buildApiUrl = (path) => {
  const baseUrl = String(unref(apiUrl) ?? '').replace(/\/+$/, '')
  const normalizedPath = String(path).replace(/^\/+/, '')
  return `${baseUrl}/${normalizedPath}`
}

const registerAnalyticsEvent = async (description) => {
  try {
    await createEvent({
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      date: new Date().toISOString(),
      type: `top_tournament, id_tournament: ${idTorneo.value}`,
      description
    })
  } catch (error) {
    // La analítica no debe interrumpir la experiencia principal.
    console.warn('No se pudo registrar el evento del top del torneo', error)
  }
}

const loadTopPlayers = async () => {
  loading.value = true
  errorMessage.value = ''
  topPlayers.value = []
  tournamentTop.value = null

  if (!idTorneo.value) {
    errorMessage.value = 'El identificador del torneo no es válido.'
    loading.value = false
    return
  }

  try {
    const response = await axios.get(
      buildApiUrl(`tournament-top-players/tops/${encodeURIComponent(idTorneo.value)}`)
    )

    const players = Array.isArray(response.data) ? response.data : []
    topPlayers.value = players
    tournamentTop.value = players[0]?.tournament ?? null

    if (players.length > 0) {
      void registerAnalyticsEvent(
        `Visualización de la imagen del top del torneo ${tournamentName.value}`
      )
    }
  } catch (error) {
    console.error('Error cargando el top del torneo', error)
    errorMessage.value =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      'Ocurrió un problema al consultar los resultados. Inténtalo nuevamente.'
  } finally {
    loading.value = false
  }
}

const orderedPokemons = (pokemons) => {
  if (!Array.isArray(pokemons)) return []

  return [...pokemons]
    .filter(Boolean)
    .sort((pokemonA, pokemonB) => {
      const slotA = Number(pokemonA?.slot ?? Number.MAX_SAFE_INTEGER)
      const slotB = Number(pokemonB?.slot ?? Number.MAX_SAFE_INTEGER)
      return slotA - slotB
    })
}

const getPlayerName = (player) => {
  const fullName = [player?.firstName, player?.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  return fullName || player?.name || 'Jugador sin nombre'
}

const getPlayerKey = (player) => (
  player?.id ||
  `${player?.position ?? 'position'}-${getPlayerName(player)}`
)

const getPokemonName = (poke) => (
  poke?.pokemon?.name || poke?.name || 'Pokémon'
)

const getPokemonImage = (poke) => (
  poke?.pokemon?.imageUrl || poke?.imageUrl || ''
)

const getPokemonKey = (player, poke) => (
  poke?.id ||
  `${getPlayerKey(player)}-${poke?.slot ?? 'slot'}-${getPokemonName(poke)}`
)

const hideBrokenImage = (event) => {
  event.currentTarget.style.display = 'none'
}

const waitForImages = async (container) => {
  const images = Array.from(container.querySelectorAll('img'))

  await Promise.all(
    images.map((image) => {
      if (image.complete) return Promise.resolve()

      return new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true })
        image.addEventListener('error', resolve, { once: true })
      })
    })
  )
}

const waitForRendering = async () => {
  await nextTick()

  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready
  }

  await new Promise((resolve) => requestAnimationFrame(() => resolve()))
  await new Promise((resolve) => requestAnimationFrame(() => resolve()))
}

const sanitizeFileName = (value) => (
  String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
)

const downloadImage = async (theme) => {
  if (!captureArea.value || !canDownload.value) return

  const selectedTheme = theme === 'dark' ? 'dark' : 'light'
  isExporting.value = true
  captureTheme.value = selectedTheme

  try {
    await waitForRendering()
    await waitForImages(captureArea.value)

    const canvas = await html2canvas(captureArea.value, {
      backgroundColor: selectedTheme === 'dark' ? '#111827' : '#ffffff',
      scale: Math.min(window.devicePixelRatio || 2, 3),
      useCORS: true,
      allowTaint: false,
      logging: false,
      imageTimeout: 15000
    })

    const tournamentSlug = sanitizeFileName(tournamentName.value) || idTorneo.value
    const link = document.createElement('a')
    link.download = `top-torneo-${tournamentSlug}-${selectedTheme}.png`
    link.href = canvas.toDataURL('image/png')
    document.body.appendChild(link)
    link.click()
    link.remove()

    void registerAnalyticsEvent(
      `Descarga de imagen ${selectedTheme} del torneo ${idTorneo.value}`
    )
  } catch (error) {
    console.error('Error generando la imagen del torneo', error)
    await Swal.fire({
      icon: 'error',
      title: 'No se pudo generar la imagen',
      text: 'Verifica que las imágenes estén disponibles e inténtalo nuevamente.'
    })
  } finally {
    captureTheme.value = null
    isExporting.value = false
  }
}

const getPositionClass = (position) => {
  const normalizedPosition = Number(position)
  if (normalizedPosition === 1) return 'position--gold'
  if (normalizedPosition === 2) return 'position--silver'
  if (normalizedPosition === 3) return 'position--bronze'
  return 'position--default'
}

const getCardClass = (position) => {
  const normalizedPosition = Number(position)
  if (normalizedPosition === 1) return 'player-card--gold'
  if (normalizedPosition === 2) return 'player-card--silver'
  if (normalizedPosition === 3) return 'player-card--bronze'
  return ''
}

onMounted(loadTopPlayers)
</script>

<style scoped>
.tournament-top-page {
  --page-background: #f3f6fb;
  --surface: #ffffff;
  --surface-muted: #f8fafc;
  --text-primary: #172033;
  --text-secondary: #667085;
  --border-color: #e4e7ec;
  --focus-color: rgba(124, 58, 237, 0.3);

  min-height: 100%;
  padding: clamp(16px, 3vw, 32px);
  background:
    radial-gradient(circle at top left, rgba(124, 58, 237, 0.08), transparent 32rem),
    var(--page-background);
  color: var(--text-primary);
}

.tournament-top-page.is-dark {
  --page-background: #0b1020;
  --surface: #151b2d;
  --surface-muted: #1b2338;
  --text-primary: #f4f7fb;
  --text-secondary: #aeb8ca;
  --border-color: #2a344b;

  background:
    radial-gradient(circle at top left, rgba(139, 92, 246, 0.15), transparent 32rem),
    var(--page-background);
}

.page-shell {
  width: min(1180px, 100%);
  margin: 0 auto;
}

.top-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 20px;
}

.download-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.action-button,
.retry-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 10px 15px;
  border: 1px solid transparent;
  border-radius: 10px;
  font: inherit;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    opacity 160ms ease;
}

.action-button:hover:not(:disabled),
.retry-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(16, 24, 40, 0.14);
}

.action-button:focus-visible,
.retry-button:focus-visible,
.tournament-footer a:focus-visible {
  outline: 3px solid var(--focus-color);
  outline-offset: 2px;
}

.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.action-button--light {
  background: #ffffff;
  border-color: #d0d5dd;
  color: #344054;
}

.action-button--dark {
  background: #253047;
  border-color: #34415d;
  color: #ffffff;
}

.is-dark .action-button--light {
  background: #f8fafc;
  color: #1f2937;
}

.share-box {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 12px;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--surface);
}

.share-box h3 {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.state-card {
  display: flex;
  min-height: 320px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 32px;
  border: 1px solid var(--border-color);
  border-radius: 18px;
  background: var(--surface);
  text-align: center;
  box-shadow: 0 18px 45px rgba(16, 24, 40, 0.08);
}

.state-card h2,
.state-card p {
  margin: 0;
}

.state-card p {
  max-width: 520px;
  color: var(--text-secondary);
}

.state-icon {
  display: grid;
  width: 54px;
  height: 54px;
  place-items: center;
  border-radius: 50%;
  background: var(--surface-muted);
  font-size: 1.5rem;
  font-weight: 800;
}

.state-card--error .state-icon {
  background: #fee4e2;
  color: #b42318;
}

.loading-image {
  /*width: min(110px, 32vw);*/
  height: auto;
}

.loading-spinner {
  width: 42px;
  height: 42px;
  border: 4px solid var(--border-color);
  border-top-color: #7c3aed;
  border-radius: 50%;
  animation: spin 800ms linear infinite;
}

.retry-button {
  margin-top: 8px;
  background: #7c3aed;
  color: #ffffff;
}

.tournament-card {
  width: 100%;
  padding: clamp(20px, 4vw, 44px);
  overflow: hidden;
  border: 1px solid #e4e7ec;
  border-radius: 22px;
  background:
    radial-gradient(circle at 100% 0, rgba(124, 58, 237, 0.09), transparent 23rem),
    #ffffff;
  color: #172033;
  box-shadow: 0 22px 60px rgba(16, 24, 40, 0.12);
}

.tournament-card.is-dark-card {
  border-color: #2a344b;
  background:
    radial-gradient(circle at 100% 0, rgba(139, 92, 246, 0.2), transparent 23rem),
    #111827;
  color: #f7f9fc;
}

.tournament-card.is-capturing {
  box-shadow: none;
}

.tournament-header {
  margin-bottom: 28px;
  text-align: center;
}

.eyebrow {
  margin: 0 0 8px;
  color: #7c3aed;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.14em;
}

.is-dark-card .eyebrow {
  color: #c4b5fd;
}

.title {
  margin: 0;
  font-size: clamp(1.55rem, 4vw, 2.45rem);
  line-height: 1.15;
}

.title span {
  display: block;
  margin-top: 5px;
  color: #7c3aed;
}

.is-dark-card .title span {
  color: #c4b5fd;
}

.players-list {
  display: grid;
  gap: 18px;
}

.player-card {
  position: relative;
  padding: clamp(16px, 2.5vw, 24px);
  border: 1px solid #e4e7ec;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.78);
}

.is-dark-card .player-card {
  border-color: #303b52;
  background: rgba(25, 34, 52, 0.82);
}

.player-card--gold {
  border: 2px solid #d4af37;
  background: linear-gradient(135deg, rgba(247, 208, 70, 0.15), rgba(255, 255, 255, 0.8));
  box-shadow: 0 10px 30px rgba(212, 175, 55, 0.17);
}

.player-card--silver {
  border: 2px solid #b8bec9;
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.16), rgba(255, 255, 255, 0.8));
}

.player-card--bronze {
  border: 2px solid #c47a35;
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.14), rgba(255, 255, 255, 0.8));
}

.is-dark-card .player-card--gold {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.2), rgba(25, 34, 52, 0.9));
}

.is-dark-card .player-card--silver {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.17), rgba(25, 34, 52, 0.9));
}

.is-dark-card .player-card--bronze {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.18), rgba(25, 34, 52, 0.9));
}

.player-header {
  display: flex;
  align-items: center;
  gap: 13px;
  margin-bottom: 18px;
}

.position {
  display: inline-grid;
  min-width: 48px;
  min-height: 40px;
  place-items: center;
  padding: 6px 10px;
  border-radius: 10px;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 900;
}

.position--gold {
  background: linear-gradient(135deg, #f5d45b, #b88b12);
  color: #3d2c00;
  box-shadow: 0 6px 14px rgba(212, 175, 55, 0.32);
}

.position--silver {
  background: linear-gradient(135deg, #edf0f5, #9ea6b3);
  color: #27303f;
  box-shadow: 0 6px 14px rgba(145, 151, 162, 0.26);
}

.position--bronze {
  background: linear-gradient(135deg, #d99759, #9b5720);
  box-shadow: 0 6px 14px rgba(155, 87, 32, 0.28);
}

.position--default {
  background: linear-gradient(135deg, #667eea, #4f46e5);
}

.player-identity {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 2px;
}

.player-name {
  overflow: hidden;
  font-size: clamp(1rem, 2.4vw, 1.2rem);
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.team-count {
  color: #667085;
  font-size: 0.78rem;
}

.is-dark-card .team-count {
  color: #aeb8ca;
}

.pokemon-row {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: clamp(8px, 1.5vw, 14px);
}

.pokemon-card {
  min-width: 0;
  padding: 10px 6px;
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.85);
  text-align: center;
}

.is-dark-card .pokemon-card {
  background: rgba(11, 16, 32, 0.46);
}

.pokemon-image-shell {
  position: relative;
  display: grid;
  width: min(100%, 108px);
  aspect-ratio: 1;
  margin: 0 auto;
  place-items: center;
}

.pokemon-image-shell img {
  position: relative;
  z-index: 1;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 7px 7px rgba(16, 24, 40, 0.15));
}

.pokemon-placeholder {
  position: absolute;
  display: grid;
  width: 62%;
  aspect-ratio: 1;
  place-items: center;
  border-radius: 50%;
  background: #e4e7ec;
  color: #98a2b3;
  font-size: 1.4rem;
  font-weight: 900;
}

.is-dark-card .pokemon-placeholder {
  background: #303b52;
  color: #98a2b3;
}

.pokemon-name {
  display: block;
  overflow: hidden;
  margin-top: 7px;
  font-size: clamp(0.68rem, 1.6vw, 0.82rem);
  font-weight: 700;
  text-overflow: ellipsis;
  text-transform: capitalize;
  white-space: nowrap;
}

.tournament-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  margin-top: 26px;
  color: #667085;
  font-size: 0.8rem;
  text-align: center;
}

.is-dark-card .tournament-footer {
  color: #aeb8ca;
}

.tournament-footer a {
  color: #7c3aed;
  font-weight: 800;
  text-decoration: none;
}

.is-dark-card .tournament-footer a {
  color: #c4b5fd;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .tournament-top-page {
    padding: 14px;
  }

  .top-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .download-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .share-box {
    justify-content: space-between;
  }

  .pokemon-row {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 480px) {
  .download-actions {
    grid-template-columns: 1fr;
  }

  .share-box {
    flex-direction: column;
    align-items: flex-start;
  }

  .tournament-card {
    padding: 18px 13px;
    border-radius: 16px;
  }

  .player-card {
    padding: 14px 10px;
  }

  .pokemon-row {
    gap: 6px;
  }

  .pokemon-card {
    padding: 7px 3px;
  }

  .tournament-footer {
    flex-wrap: wrap;
  }
}

@media (prefers-reduced-motion: reduce) {
  .action-button,
  .retry-button,
  .loading-spinner {
    transition: none;
    animation-duration: 1ms;
  }
}
</style>
