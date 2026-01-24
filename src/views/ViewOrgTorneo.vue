<template>
  <div class="page-container">
    <div :class="['form-container', { 'dark-mode': mode === 'dark' }]">
      <div :class="['form-card full-width', { 'dark-card': mode === 'dark' }]">
        <h2 :class="['form-title', { 'dark-text': mode === 'dark' }]">
          {{ $t('uploadFiles') }}
        </h2>

        <!-- FILA RONDA -->
        <div class="file-row">
          <label class="file-label">
            {{ $t('tournamentsSeccion.loadRound') }} 
            <input
              type="file"
              accept=".html,text/html"
              @change="onFileChange($event, 'carga_ronda')"
            />
          </label>

          <button class="nav-btn" @click="goToRound(idTorneo)">
            {{ $t('buttons.goToRound') }}
          </button>
        </div>

        <!-- FILA RESULTADOS -->
        <div class="file-row">
          <label class="file-label">
            {{ $t('tournamentsSeccion.loadResults') }}
            <input
              type="file"
              accept=".html,text/html"
              @change="onFileChange($event, 'carga_resultado')"
            />
          </label>

          <button class="nav-btn" @click="goToResults">
            {{ $t('buttons.goToResults') }}
          </button>
        </div>

        <!-- FILA STANDING -->
        <div class="file-row">
          <label class="file-label">
            {{ $t('tournamentsSeccion.loadStanding') }}
            <input
              type="file"
              accept=".html,text/html"
              @change="onFileChange($event, 'carga_standing')"
            />
          </label>

          <button class="nav-btn" @click="goToStanding">
            {{ $t('buttons.goToStanding') }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="isLoading" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden">{{ $t('loading') }}</span>
          </div>
        </div>

        <!-- Botón subir -->
        <button
          class="submit-btn"
          :disabled="isLoading || !hasAnyFile"
          @click="uploadFiles"
        >
          {{ $t('uploadFiles') }}
        </button>
      </div>
    </div>
  </div>
</template>




<script setup>
  import { inject, ref, computed } from 'vue'; //reactive, 
  import axios from 'axios';
  import { useRouter, useRoute } from 'vue-router';
  import Swal from 'sweetalert2';
  //import { jwtDecode } from 'jwt-decode';
  //import { useHead } from '@vueuse/head';
  
  // Importar el store de autenticación de Pinia
  //import { useAuthStore } from '@/stores/authStore';
  import { useI18n } from 'vue-i18n'; // Importa useI18n

  const router = useRouter();
  const route = useRoute();
  const isLoading = ref(false);
  //const authStore = useAuthStore(); // Instancia del store

  const apiUrl = inject('apiUrl'); // Ahora tienes acceso a apiUrl
  const idTorneo = Number(route.params.id_torneo);

  const mode = inject('mode');
  

  const files = ref({
    carga_ronda: null,
    carga_resultado: null,
    carga_standing: null
  })

  const { t } = useI18n(); // Usa `useI18n` para obtener `t`



  // Computed
  const hasAnyFile = computed(() =>
    Object.values(files.value).some(file => file !== null)
  )
  
  // Métodos
  const onFileChange = (event, apiKey) => {
    files.value[apiKey] = event.target.files[0]
  }
  

  const uploadFiles = async () => {
    try {
      if (files.value.carga_ronda) {
        await uploadFileWithFormData({
          file: files.value.carga_ronda,
          url: `${apiUrl}tournament-rounds/upload-round/${idTorneo}`,
          loadingTitle: t('tournamentsSeccion.uploadingRound'),
          successTitle: t('tournamentsSeccion.roundUploaded'),
          successText: t('tournamentsSeccion.uploadSuccessfully')
        })
      }

      if (files.value.carga_resultado) {
        await uploadFileWithFormData({
          file: files.value.carga_resultado,
          url: `${apiUrl}tournament-results/upload-results/${idTorneo}`,
          loadingTitle: t('tournamentsSeccion.uploadingResults'),
          successTitle: t('tournamentsSeccion.resultsUploaded'),
          successText: t('tournamentsSeccion.uploadSuccessfully')
        })
      }

      if (files.value.carga_standing) {
        await uploadFileWithFormData({
          file: files.value.carga_standing,
          url: `${apiUrl}tournament-standing/upload-standing/${idTorneo}`,
          loadingTitle: t('tournamentsSeccion.uploadingStanding'),
          successTitle: t('tournamentsSeccion.standingUploaded'),
          successText: t('tournamentsSeccion.uploadSuccessfully')
        })
      }

      // limpiar archivos
      files.value = {
        carga_ronda: null,
        carga_resultado: null,
        carga_standing: null
      }

    } catch (e) {
      // error ya manejado en Swal
    }
  }


  const uploadFileWithFormData = async ({
    file,
    url,
    loadingTitle,
    successTitle,
    successText
  }) => {
    if (!file) return

    isLoading.value = true

    Swal.fire({
      title: loadingTitle,
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading()
      }
    })

    try {
      const formData = new FormData()
      formData.append('file', file)

      await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      Swal.fire({
        icon: 'success',
        title: successTitle,
        text: successText
      })

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          error.response?.data?.message ??
          'Error al subir el archivo'
      })
      throw error
    } finally {
      isLoading.value = false
    }
  }




  const goToRound = (idTorneo) => {
    router.push({
      name: 'ViewGoToRound',
      params: { id_torneo: idTorneo }
    })
  }


  const goToStanding = () => router.push('/goToStanding/' + idTorneo);
  const goToResults = () => router.push('/goToResults/' + idTorneo);

</script>

<style scoped>
  .form-container {
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #f0f2f5;
  }

  .form-card {
    background-color: #ffffff;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    width: 100%;
    max-width: 100%;
  }

  h2 {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  label {
    font-weight: bold;
    display: block;
    margin-bottom: 0.5rem;
  }

  input[type="file"] {
    width: 100%;
    padding: 0.6rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    background-color: #fff;
  }

  .submit-btn {
    background-color: #4CAF50;
    color: white;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    width: 100%;
    margin-top: 1rem;
  }

  .submit-btn:hover {
    background-color: #45a049;
  }

  /* Modo oscuro */
  .dark-mode {
    background-color: #121212;
  }

  .dark-card {
    background-color: #333;
    box-shadow: 0 4px 10px rgba(255, 255, 255, 0.1);
  }

  .dark-text {
    color: #ffffff;
  }

  .dark-card input[type="file"] {
    background-color: #444;
    color: #fff;
    border: 1px solid #555;
  }


  .content-wrapper {
    display: flex;
    gap: 2rem;
  }

  .left-panel {
    flex: 2;
  }

  .right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 1rem;
  }

  .nav-btn {
    background-color: #2196F3;
    color: white;
    padding: 0.75rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
  }

  .nav-btn:hover {
    background-color: #1976d2;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .content-wrapper {
      flex-direction: column;
    }
  }

  .page-container {
    max-width: 1200px;      /* ancho controlado */
    margin: 0 auto;         /* centrado horizontal */
    padding: 1.5rem;       /* espacio lateral */
    width: 100%;
  }

  .file-label {
    display: block;
    margin-bottom: 12px;
    font-weight: 600;
  }

  .full-width {
    width: 100%;
  }

  .file-row {
    display: flex;
    gap: 1rem;
    align-items: flex-end;
    margin-bottom: 1rem;
  }

  .file-row .file-label {
    flex: 1;
  }

  .file-row .nav-btn {
    white-space: nowrap;
    height: fit-content;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .file-row {
      flex-direction: column;
      align-items: stretch;
    }
  }



</style>
