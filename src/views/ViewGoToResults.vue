<template>
  <div :class="['container', mode === 'dark' ? 'dark-mode' : '']">
    <br />

    <header :class="mode === 'dark' ? 'dark-header' : ''">
      <h1>{{ $t('tournamentsSeccion.resultRound') }} {{ round }}</h1>

    </header>

    <div class="category">
      {{ category }}
    </div>

    <div class="results">
      <div
        v-for="player in results"
        :key="player.name"
        :class="[
          'player-card',
          player.result,
          mode === 'dark' ? 'dark-card' : ''
        ]"
      >
        <div class="player-name">
          {{ player.name }}
        </div>

        <div class="stats">
          <div>{{ $t('tournamentsSeccion.resultVictorias') }}: <span>{{ player.wins }}</span></div>
          <div>{{ $t('tournamentsSeccion.resultDerrotas') }}: <span>{{ player.losses }}</span></div>
          <div>{{ $t('tournamentsSeccion.resultEmpates') }}: <span>{{ player.draws }}</span></div>
        </div>
      </div>
    </div>

    <footer :class="mode === 'dark' ? 'dark-footer' : ''">
      <div><strong>{{ tournamentName }}</strong></div>
      <div>{{ date }}</div>
    </footer>
    <br>
  </div>
</template>


<script setup>
  import { ref, inject, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import axios from 'axios'

  const mode = inject('mode')
  const route = useRoute()

  const apiUrl = inject('apiUrl'); // Ahora tienes acceso a apiUrl
  const tournamentId = route.params.id_torneo

  const round = ref(null)
  const category = ref('')
  const date = ref('')

  const results = ref([])

  const getResultStatus = (player) => {
    if (player.wins > 0) return 'win'
    if (player.losses > 0) return 'loss'
    return 'draw'
  }

  const fetchResults = async () => {
    try {
      const { data } = await axios.get(`${apiUrl}tournament-results/latest-round/results/${tournamentId}`)

      // RONDA
      round.value = data.round.roundNumber
      category.value = data.round.category
      date.value = new Date(data.round.generatedAt).toLocaleString()

      // RESULTADOS
      results.value = data.results.map(player => ({
        name: player.playerName,
        wins: player.wins,
        losses: player.losses,
        draws: player.draws,
        result: getResultStatus(player)
      }))

    } catch (error) {
      console.error('Error cargando resultados', error)
    }
  }

  onMounted(fetchResults)
</script>

<style scoped>

  .container {
    max-width: 900px;
    margin: auto;
  }

  /* HEADER */
  header {
    background: linear-gradient(135deg, #134e5e, #71b280);
    color: white;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 25px;
  }

  .dark-header {
    background: linear-gradient(135deg, #1a1a1a, #2e2e2e);
  }

  /* CATEGORY */
  .category {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 15px;
  }

  /* RESULTS GRID */
  .results {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 15px;
  }

  /* PLAYER CARD */
  .player-card {
    background: white;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    border-left: 6px solid #ccc;
  }

  /* ESTADOS */
  .win {
    background: #e6f7ee;
    border-left-color: #2ecc71;
  }

  .loss {
    background: #fdeaea;
    border-left-color: #e74c3c;
  }

  .draw {
    background: #f5f5f5;
    border-left-color: #bdbdbd;
  }

  /* TEXTO */
  .player-name {
    font-size: 16px;
    font-weight: bold;
    margin-bottom: 8px;
  }

  .stats {
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
  }

  .stats span {
    font-weight: bold;
  }

  /* FOOTER */
  footer {
    margin-top: 30px;
    font-size: 13px;
    color: #666;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  /* =========================
    MODO OSCURO
  ========================= */

  .dark-mode {
    background-color: #2c2c2c;
    color: #e0e0e0;
  }

  .dark-card {
    background-color: #1e1e1e;
    box-shadow: 0 4px 10px rgba(255,255,255,0.05);
  }

  /* Estados en oscuro */
  .dark-card.win {
    background-color: #1f3d2b;
  }

  .dark-card.loss {
    background-color: #3a1f1f;
  }

  .dark-card.draw {
    background-color: #2a2a2a;
  }

  .dark-footer {
    color: #bbb;
  }


</style>