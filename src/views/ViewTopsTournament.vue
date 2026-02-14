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
        :class="getCardClass(player.position)"
      >
        <div class="player-header">
          <span 
            class="position"
            :class="getPositionClass(player.position)"
          >
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

      <h6 align="center">{{ $t('tournamentsSeccion.tournamentImgFooter') }} <a href="https://x.com/Pokecircuit" target="_blank">@Pokecircuit</a> </h6>

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

  const getPositionClass = (position) => {
    if (position === 1) return 'gold'
    if (position === 2) return 'silver'
    if (position === 3) return 'bronze'
    return 'default'
  }

  const getCardClass = (position) => {
    if (position === 1) return 'card-gold'
    if (position === 2) return 'card-silver'
    if (position === 3) return 'card-bronze'
    return ''
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
    transition: all 0.3s ease;
  }

  /* =====================
    🥇 GOLD
    ===================== */
  .player-card.card-gold {
    border: 2px solid #d4af37;
    background: linear-gradient(
      135deg,
      rgba(212, 175, 55, 0.08),
      rgba(212, 175, 55, 0.02)
    );
    box-shadow: 0 0 18px rgba(212, 175, 55, 0.4);
  }

  /* =====================
    🥈 SILVER
    ===================== */
  .player-card.card-silver {
    border: 2px solid #c0c0c0;
    background: linear-gradient(
      135deg,
      rgba(192, 192, 192, 0.08),
      rgba(192, 192, 192, 0.02)
    );
    box-shadow: 0 0 14px rgba(192, 192, 192, 0.3);
  }

  /* =====================
    🥉 BRONZE
    ===================== */
  .player-card.card-bronze {
    border: 2px solid #cd7f32;
    background: linear-gradient(
      135deg,
      rgba(205, 127, 50, 0.08),
      rgba(205, 127, 50, 0.02)
    );
    box-shadow: 0 0 12px rgba(205, 127, 50, 0.3);
  }


  .dark-card .player-card {
    border-color: #333;
  }

  .dark-card .player-card.card-gold {
    background: linear-gradient(
      135deg,
      rgba(212, 175, 55, 0.15),
      rgba(212, 175, 55, 0.05)
    );
  }

  .dark-card .player-card.card-silver {
    background: linear-gradient(
      135deg,
      rgba(192, 192, 192, 0.15),
      rgba(192, 192, 192, 0.05)
    );
  }

  .dark-card .player-card.card-bronze {
    background: linear-gradient(
      135deg,
      rgba(205, 127, 50, 0.15),
      rgba(205, 127, 50, 0.05)
    );
  }


  .player-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }

  .position {
    padding: 6px 10px;
    border-radius: 8px;
    font-weight: bold;
    color: white;
  }

  /* 🥇 Oro */
  .position.gold {
    background: linear-gradient(135deg, #f7d046, #d4af37);
    box-shadow: 0 0 8px rgba(212, 175, 55, 0.6);
  }

  /* 🥈 Plata */
  .position.silver {
    background: linear-gradient(135deg, #e0e0e0, #b0b0b0);
    box-shadow: 0 0 6px rgba(192, 192, 192, 0.5);
  }

  /* 🥉 Bronce */
  .position.bronze {
    background: linear-gradient(135deg, #cd7f32, #a97142);
    box-shadow: 0 0 6px rgba(205, 127, 50, 0.5);
  }

  /* Otros */
  .position.default {
    background: #3498db;
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
