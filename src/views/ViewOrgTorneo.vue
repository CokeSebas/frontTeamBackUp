<template>
  <main
    v-if="isOrganizer"
    class="organizer-tournament-view"
    :class="{ 'theme-dark': mode === 'dark' }"
  >
    <div class="page-container">
      <section
        class="upload-card"
        aria-labelledby="upload-files-title"
        :aria-busy="isLoading"
      >
        <header class="card-header">
          <h1 id="upload-files-title" class="card-title">
            {{ $t('uploadFiles') }}
          </h1>
        </header>

        <div class="upload-list">
          <div class="file-row">
            <div class="file-field">
              <label class="file-label" for="round-file">
                {{ $t('tournamentsSeccion.loadRound') }}
              </label>

              <input
                id="round-file"
                ref="roundFileInput"
                class="file-input"
                type="file"
                accept=".html,.htm,text/html,application/xhtml+xml"
                :disabled="isLoading"
                @change="onFileChange($event, 'carga_ronda')"
              >

              <p
                v-if="files.carga_ronda"
                class="selected-file"
                :title="files.carga_ronda.name"
              >
                {{ files.carga_ronda.name }}
              </p>
            </div>

            <button
              type="button"
              class="nav-button"
              :disabled="isLoading"
              @click="goToRound"
            >
              {{ $t('buttons.goToRound') }}
            </button>
          </div>

          <div class="file-row">
            <div class="file-field">
              <label class="file-label" for="results-file">
                {{ $t('tournamentsSeccion.loadResults') }}
              </label>

              <input
                id="results-file"
                ref="resultsFileInput"
                class="file-input"
                type="file"
                accept=".html,.htm,text/html,application/xhtml+xml"
                :disabled="isLoading"
                @change="onFileChange($event, 'carga_resultado')"
              >

              <p
                v-if="files.carga_resultado"
                class="selected-file"
                :title="files.carga_resultado.name"
              >
                {{ files.carga_resultado.name }}
              </p>
            </div>

            <button
              type="button"
              class="nav-button"
              :disabled="isLoading"
              @click="goToResults"
            >
              {{ $t('buttons.goToResults') }}
            </button>
          </div>

          <div class="file-row">
            <div class="file-field">
              <label class="file-label" for="standing-file">
                {{ $t('tournamentsSeccion.loadStanding') }}
              </label>

              <input
                id="standing-file"
                ref="standingFileInput"
                class="file-input"
                type="file"
                accept=".html,.htm,text/html,application/xhtml+xml"
                :disabled="isLoading"
                @change="onFileChange($event, 'carga_standing')"
              >

              <p
                v-if="files.carga_standing"
                class="selected-file"
                :title="files.carga_standing.name"
              >
                {{ files.carga_standing.name }}
              </p>
            </div>

            <button
              type="button"
              class="nav-button"
              :disabled="isLoading"
              @click="goToStanding"
            >
              {{ $t('buttons.goToStanding') }}
            </button>
          </div>
        </div>

        <div
          v-if="isLoading"
          class="loading-state"
          role="status"
          aria-live="polite"
        >
          <span class="loading-spinner" aria-hidden="true" />
          <span>{{ $t('loading') }}</span>
        </div>

        <button
          type="button"
          class="submit-button"
          :disabled="isLoading || !hasAnyFile || !hasValidTournamentId"
          @click="uploadFiles"
        >
          <span
            v-if="isLoading"
            class="button-spinner"
            aria-hidden="true"
          />
          {{ $t('uploadFiles') }}
        </button>
      </section>
    </div>
  </main>
</template>

<script setup>
import { computed, inject, onMounted, ref, unref } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()

const apiUrl = inject('apiUrl', '')
const mode = inject('mode', 'light')

const isOrganizer = ref(false)
const isLoading = ref(false)

const roundFileInput = ref(null)
const resultsFileInput = ref(null)
const standingFileInput = ref(null)

const createEmptyFiles = () => ({
  carga_ronda: null,
  carga_resultado: null,
  carga_standing: null
})

const files = ref(createEmptyFiles())

const uploadConfigurations = [
  {
    key: 'carga_ronda',
    endpoint: 'tournament-rounds/upload-round',
    loadingTitleKey: 'tournamentsSeccion.uploadingRound',
    successTitleKey: 'tournamentsSeccion.roundUploaded'
  },
  {
    key: 'carga_resultado',
    endpoint: 'tournament-results/upload-results',
    loadingTitleKey: 'tournamentsSeccion.uploadingResults',
    successTitleKey: 'tournamentsSeccion.resultsUploaded'
  },
  {
    key: 'carga_standing',
    endpoint: 'tournament-standing/upload-standing',
    loadingTitleKey: 'tournamentsSeccion.uploadingStanding',
    successTitleKey: 'tournamentsSeccion.standingUploaded'
  }
]

const fileInputReferences = {
  carga_ronda: roundFileInput,
  carga_resultado: resultsFileInput,
  carga_standing: standingFileInput
}

const tournamentId = computed(() => Number(route.params.id_torneo))

const hasValidTournamentId = computed(() => (
  Number.isInteger(tournamentId.value) && tournamentId.value > 0
))

const hasAnyFile = computed(() => (
  Object.values(files.value).some(Boolean)
))

onMounted(async () => {
  const hasOrganizerPermission = (
    sessionStorage.getItem('isOrganizer') === 'true'
  )

  if (!hasOrganizerPermission) {
    await Swal.fire({
      icon: 'error',
      title: 'No autorizado',
      text: 'No tienes permisos para ver esta página.',
      confirmButtonText: 'Volver al inicio'
    })

    await router.replace('/')
    return
  }

  if (!hasValidTournamentId.value) {
    await Swal.fire({
      icon: 'error',
      title: 'Torneo no válido',
      text: 'No fue posible identificar el torneo solicitado.',
      confirmButtonText: 'Volver al inicio'
    })

    await router.replace('/')
    return
  }

  isOrganizer.value = true
})

const isHtmlFile = (file) => {
  if (!file) return false

  const validMimeTypes = [
    '',
    'text/html',
    'application/xhtml+xml'
  ]
  const hasValidMimeType = validMimeTypes.includes(file.type)
  const hasValidExtension = /\.html?$/i.test(file.name)

  return hasValidMimeType && hasValidExtension
}

const clearFile = (key) => {
  if (!(key in files.value)) return

  files.value[key] = null

  const inputElement = fileInputReferences[key]?.value
  if (inputElement) {
    inputElement.value = ''
  }
}

const onFileChange = async (event, key) => {
  const selectedFile = event.target.files?.[0] ?? null

  if (!selectedFile) {
    clearFile(key)
    return
  }

  if (!isHtmlFile(selectedFile)) {
    clearFile(key)

    await Swal.fire({
      icon: 'warning',
      title: 'Archivo no válido',
      text: 'Selecciona un archivo HTML con extensión .html o .htm.'
    })
    return
  }

  files.value[key] = selectedFile
}

const buildApiUrl = (endpoint) => {
  const normalizedBaseUrl = String(unref(apiUrl) ?? '').replace(/\/+$/, '')
  const normalizedEndpoint = String(endpoint).replace(/^\/+/, '')

  return `${normalizedBaseUrl}/${normalizedEndpoint}/${tournamentId.value}`
}

const getErrorMessage = (error) => {
  const apiMessage = error?.response?.data?.message

  if (typeof apiMessage === 'string' && apiMessage.trim()) {
    return apiMessage
  }

  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message
  }

  return 'Error al subir el archivo.'
}

const uploadFileWithFormData = async (file, endpoint) => {
  const formData = new FormData()
  formData.append('file', file)

  // Axios agrega automáticamente el boundary correcto de multipart/form-data.
  await axios.post(buildApiUrl(endpoint), formData)
}

const uploadFiles = async () => {
  if (isLoading.value || !hasAnyFile.value) return

  if (!hasValidTournamentId.value) {
    await Swal.fire({
      icon: 'error',
      title: 'Torneo no válido',
      text: 'No fue posible identificar el torneo solicitado.'
    })
    return
  }

  const pendingUploads = uploadConfigurations.filter(
    ({ key }) => Boolean(files.value[key])
  )

  isLoading.value = true

  Swal.fire({
    title: t(pendingUploads[0].loadingTitleKey),
    text: 'Por favor espera.',
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    didOpen: () => Swal.showLoading()
  })

  try {
    for (const configuration of pendingUploads) {
      const file = files.value[configuration.key]
      if (!file) continue

      Swal.update({
        title: t(configuration.loadingTitleKey),
        text: file.name
      })

      await uploadFileWithFormData(file, configuration.endpoint)
      clearFile(configuration.key)
    }

    Swal.close()

    const successTitle = pendingUploads.length === 1
      ? t(pendingUploads[0].successTitleKey)
      : t('uploadFiles')

    await Swal.fire({
      icon: 'success',
      title: successTitle,
      text: t('tournamentsSeccion.uploadSuccessfully')
    })
  } catch (error) {
    Swal.close()

    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: getErrorMessage(error)
    })
  } finally {
    isLoading.value = false
  }
}

const goToRound = () => {
  if (!hasValidTournamentId.value || isLoading.value) return

  router.push({
    name: 'ViewGoToRound',
    params: { id_torneo: tournamentId.value }
  })
}

const goToStanding = () => {
  if (!hasValidTournamentId.value || isLoading.value) return
  router.push(`/tournament/goToStanding/${tournamentId.value}`)
}

const goToResults = () => {
  if (!hasValidTournamentId.value || isLoading.value) return
  router.push(`/tournament/goToResults/${tournamentId.value}`)
}
</script>

<style scoped>
.organizer-tournament-view {
  --page-background: #f4f6f9;
  --card-background: #ffffff;
  --primary-text: #182230;
  --secondary-text: #5f6b7a;
  --border-color: #d8dee8;
  --input-background: #ffffff;
  --row-background: #f8fafc;
  --input-hover-border: #9ca8b8;
  --primary-color: #2563eb;
  --primary-hover: #1d4ed8;
  --success-color: #16a34a;
  --success-hover: #15803d;
  --focus-ring: rgba(37, 99, 235, 0.24);
  --shadow: 0 16px 40px rgba(15, 23, 42, 0.08);

  min-height: 100%;
  background: var(--page-background);
  color: var(--primary-text);
  transition: background-color 0.2s ease, color 0.2s ease;
}

.organizer-tournament-view.theme-dark {
  --page-background: #111827;
  --card-background: #1f2937;
  --primary-text: #f8fafc;
  --secondary-text: #cbd5e1;
  --border-color: #475569;
  --input-background: #111827;
  --row-background: #182231;
  --input-hover-border: #94a3b8;
  --primary-color: #3b82f6;
  --primary-hover: #2563eb;
  --success-color: #22c55e;
  --success-hover: #16a34a;
  --focus-ring: rgba(96, 165, 250, 0.28);
  --shadow: 0 18px 45px rgba(0, 0, 0, 0.3);
}

.page-container {
  width: min(100%, 1120px);
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 2rem);
}

.upload-card {
  width: 100%;
  padding: clamp(1.25rem, 3vw, 2rem);
  overflow: hidden;
  background: var(--card-background);
  border: 1px solid var(--border-color);
  border-radius: 18px;
  box-shadow: var(--shadow);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.card-header {
  padding-bottom: 1.25rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid var(--border-color);
}

.card-title {
  margin: 0;
  font-size: clamp(1.35rem, 3vw, 1.8rem);
  font-weight: 750;
  line-height: 1.25;
  text-align: center;
  color: var(--primary-text);
}

.upload-list {
  display: grid;
  gap: 1rem;
}

.file-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: end;
  padding: 1rem;
  background: var(--row-background);
  border: 1px solid var(--border-color);
  border-radius: 14px;
}

.file-field {
  min-width: 0;
}

.file-label {
  display: block;
  margin-bottom: 0.55rem;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary-text);
}

.file-input {
  width: 100%;
  min-width: 0;
  padding: 0.45rem;
  font: inherit;
  color: var(--secondary-text);
  background: var(--input-background);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background-color 0.2s ease;
}

.file-input:hover:not(:disabled) {
  border-color: var(--input-hover-border);
}

.file-input:focus-visible {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 4px var(--focus-ring);
}

.file-input::file-selector-button {
  padding: 0.55rem 0.8rem;
  margin-right: 0.75rem;
  font: inherit;
  font-weight: 650;
  color: #ffffff;
  background: var(--primary-color);
  border: 0;
  border-radius: 7px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.file-input:hover:not(:disabled)::file-selector-button {
  background: var(--primary-hover);
}

.selected-file {
  max-width: 100%;
  margin: 0.5rem 0 0;
  overflow: hidden;
  font-size: 0.82rem;
  color: var(--secondary-text);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.nav-button,
.submit-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.7rem 1rem;
  font: inherit;
  font-weight: 700;
  color: #ffffff;
  border: 0;
  border-radius: 10px;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.2s ease;
}

.nav-button {
  min-width: 160px;
  background: var(--primary-color);
}

.nav-button:hover:not(:disabled) {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.submit-button {
  width: 100%;
  margin-top: 1.5rem;
  padding: 0.85rem 1.25rem;
  background: var(--success-color);
}

.submit-button:hover:not(:disabled) {
  background: var(--success-hover);
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(22, 163, 74, 0.2);
}

.nav-button:focus-visible,
.submit-button:focus-visible {
  outline: none;
  box-shadow: 0 0 0 4px var(--focus-ring);
}

.nav-button:disabled,
.submit-button:disabled,
.file-input:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  min-height: 40px;
  margin-top: 1.25rem;
  font-size: 0.9rem;
  font-weight: 650;
  color: var(--secondary-text);
}

.loading-spinner,
.button-spinner {
  display: inline-block;
  flex: 0 0 auto;
  border-style: solid;
  border-color: currentColor transparent currentColor currentColor;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

.loading-spinner {
  width: 22px;
  height: 22px;
  border-width: 3px;
}

.button-spinner {
  width: 17px;
  height: 17px;
  border-width: 2px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 720px) {
  .page-container {
    padding: 0.75rem;
  }

  .upload-card {
    padding: 1rem;
    border-radius: 14px;
  }

  .file-row {
    grid-template-columns: 1fr;
    align-items: stretch;
    padding: 0.85rem;
  }

  .nav-button {
    width: 100%;
    min-width: 0;
  }

  .file-input::file-selector-button {
    display: block;
    width: 100%;
    margin: 0 0 0.45rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .organizer-tournament-view,
  .upload-card,
  .file-input,
  .file-input::file-selector-button,
  .nav-button,
  .submit-button {
    transition: none;
  }

  .loading-spinner,
  .button-spinner {
    animation-duration: 1.5s;
  }
}

</style>
