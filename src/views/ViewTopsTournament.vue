<template>
  <div :class="['container', { 'dark-mode': mode === 'dark' }]">
    <div class="top-actions">
      <div class="download-actions">
        <button
          class="btn btn-download"
          @click="downloadImage('light')"
        >
          <img :src="sunIcon" width="20" height="20">
          {{ $t('tournamentsSeccion.dowloadLight') }}
        </button>

        <button
          class="btn btn-download dark"
          @click="downloadImage('dark')"
        >
          <img :src="moonIcon" width="20" height="20">
          {{ $t('tournamentsSeccion.dowloadDark') }}
        </button>
      </div>

      <div class="share-box">
        <h3>{{ $t('share') }}</h3>
        <ShareButtons
          :shareUrl="currentUrl"
          shareText="Check this Tournament Top"
        />
      </div>
    </div>


    <!-- LOADING -->
    <div v-if="loading" style="align-items: center; display: flex; justify-content: center;">
      <img :src="gifLoading">
    </div>

    
    <div v-else ref="captureArea" :class="['card', { 'dark-card': mode === 'dark' }]">

      <h2 class="title">
        {{ $t('tournamentsSeccion.title') }} {{ tournamentTop.nombre }}
      </h2>

      <div 
        v-for="player in topPlayers"
        :key="player.id"
        class="player-card"
      >
        <div class="player-header">
          <span class="position">
            #{{ player.position }}
          </span>

          <span class="player-name">
            {{ player.firstName }} {{ player.lastName }}
          </span>
        </div>

        <div class="pokemon-row">
          <div
            v-for="poke in orderedPokemons(player.pokemons)"
            :key="poke.id"
            class="pokemon-card"
          >
            <img
              :src="poke.pokemon.imageUrl"
              :alt="poke.pokemon.name"
              crossorigin="anonymous"
            />
            <span class="pokemon-name">
              {{ poke.pokemon.name }}
            </span>
          </div>
        </div>
      </div>

      <h6 align="center">{{ $t('tournamentsSeccion.tournamentImgFooter') }} <a :href="currentUrl" target="_blank">{{ currentUrl }}</a> </h6>

    </div>
  </div>
</template>

<script setup>
  import { ref, inject, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import axios from 'axios'
  import ShareButtons from "../components/ShareButtons.vue";


  import html2canvas from 'html2canvas'
  import Swal from 'sweetalert2';

  const mode = inject('mode')
  const apiUrl = inject('apiUrl')

  const route = useRoute()
  const idTorneo = route.params.id_torneo

  const captureArea = ref(null)

  const currentUrl = window.location.href;

  const loading = ref(true)
  
  const gifLoading = inject('gifLoading');
  const sunIcon = inject('sunIcon');
  const moonIcon = inject('moonIcon');

  // ===============================
  // State
  // ===============================
  const topPlayers = ref([])

  const tournamentTop = ref([])

  // ===============================
  // Load top players
  // ===============================
  const loadTopPlayers = async () => {
    try {
      loading.value = true
      const response = await axios.get(
        `${apiUrl}tournament-top-players/tops/${idTorneo}`
      )

      if(response.data.length === 0) {
        Swal.fire({
          icon: 'info',
          title: 'No hay datos',
          text: 'No se encontraron jugadores en el top de este torneo.',
        })
      }else{
        topPlayers.value = response.data;
        tournamentTop.value = response.data[0].tournament;
      }


    } catch (error) {
      console.error('Error cargando top del torneo', error)
    } finally {
      loading.value = false
    }
  }

  // ===============================
  // Helpers
  // ===============================
  const orderedPokemons = (pokemons) => {
    return [...pokemons].sort((a, b) => a.slot - b.slot)
  }

  const downloadImage = async (theme) => {
    if (!captureArea.value) return

    // Guardamos clases actuales
    const card = captureArea.value
    const hadDark = card.classList.contains('dark-card')

    // Forzar modo deseado SOLO para la captura
    if (theme === 'light') {
      card.classList.remove('dark-card')
    } else {
      card.classList.add('dark-card')
    }

    await new Promise(resolve => requestAnimationFrame(resolve))

    const canvas = await html2canvas(card, {
      backgroundColor: null,
      scale: 2,
      useCORS: true,
      allowTaint: false
    })

    // Restaurar estado original
    if (hadDark) {
      card.classList.add('dark-card')
    } else {
      card.classList.remove('dark-card')
    }

    const link = document.createElement('a')
    link.download = `top-torneo-${idTorneo}-${theme}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  // ===============================
  // Lifecycle
  // ===============================
  onMounted(loadTopPlayers)


</script>


<style scoped>
  .container {
    padding: 20px;
  }

  .card {
    background: #ffffff;
    border-radius: 14px;
    padding: 24px;
    color: #2c3e50;
  }

  .dark-mode {
    background: #121212;
  }

  .dark-card {
    background: #1e1e1e;
    color: #ecf0f1;
  }

  .title {
    text-align: center;
    margin-bottom: 24px;
  }

  /* ===============================
    Player card
  =============================== */
  .player-card {
    border: 1px solid #ddd;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .dark-card .player-card {
    border-color: #333;
  }

  .player-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .position {
    background: #3498db;
    color: white;
    padding: 6px 10px;
    border-radius: 8px;
    font-weight: bold;
  }

  .player-name {
    font-size: 1.1rem;
    font-weight: 600;
  }

  /* ===============================
    Pokémon row
  =============================== */
  .pokemon-row {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 12px;
  }

  .pokemon-card {
    text-align: center;
  }

  .pokemon-card img {
    width: 100px;
    height: 100px;
  }

  .pokemon-name {
    display: block;
    margin-top: 4px;
    font-size: 0.8rem;
    text-transform: capitalize;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .pokemon-row {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .btn-download {
    background: #9b59b6;
    color: white;
    padding: 10px 16px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    margin-bottom: 16px;
  }

  .btn-download:hover {
    opacity: 0.9;
  }

  .top-actions {
    display: flex;
    align-items: center;
    gap: 24px;
    margin-bottom: 20px;
  }

  /* Share block */
  .share-box h3 {
    margin: 0 0 6px 0;
    font-size: 1rem;
  }

  /* Responsive */
  @media (max-width: 768px) {
    .top-actions {
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    }
  }

  .download-group {
    display: flex;
    gap: 10px;
  }

  .btn-download {
    background: #9b59b6;
    color: white;
    padding: 10px 14px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
  }

  .btn-download.dark {
    background: #34495e;
  }

  .btn-download:hover {
    opacity: 0.9;
  }

  .top-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

/* Botones */
.download-actions {
  display: flex;
  gap: 12px;
}

.btn-download {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 0.9rem;
}

/* Share box */
.share-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dark-mode .btn-download {
  background: #2c2c2c;
  color: #ecf0f1;
}

.btn-download.dark {
  background: #34495e;
}


/* =====================
   📱 MOBILE
   ===================== */
@media (max-width: 768px) {
  .top-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .download-actions {
    flex-direction: column;
  }

  .btn-download {
    width: 100%;
    justify-content: center;
  }

  .share-box {
    margin-top: 12px;
    padding: 12px;
    border-radius: 10px;
    background: #f7f7f7;
    flex-direction: column;
  }

  .dark-mode .share-box {
    background: #1f1f1f;
  }
}




</style>
