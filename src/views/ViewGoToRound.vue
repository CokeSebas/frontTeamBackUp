<template>
  <div :class="['container', mode === 'dark' ? 'dark-mode' : '']">
    <br>
    <header :class="mode === 'dark' ? 'dark-header' : ''">
      <h1>{{ $t('tournamentsSeccion.matchRound') }} {{ round }}</h1>
    </header>

    <div class="pairings">
      <div
        v-for="match in matches"
        :key="match.table"
        :class="['match', mode === 'dark' ? 'dark-match' : '']"
      >
        <div class="table-number">
          {{ $t('tournamentsSeccion.mesa') }} {{ match.table }}
        </div>

        <div class="players">
          <div class="player">
            <strong>{{ match.player1.name }}</strong>
            <div class="stats">
              ({{ match.player1.stats }})
            </div>
          </div>

          <div class="vs">VS</div>

          <div class="player">
            <strong>{{ match.player2.name }}</strong>
            <div class="stats">
              ({{ match.player2.stats }})
            </div>
          </div>
        </div>
      </div>
    </div>

    <footer :class="mode === 'dark' ? 'dark-footer' : ''">
      <div>{{ date }}</div>
    </footer>
    <br>
  </div>
</template>


<script setup>
  import { ref, inject, onMounted } from 'vue'
  import axios from 'axios'
  import Swal from 'sweetalert2';
  import { useRoute } from 'vue-router';

  //const router = useRouter();
  const route = useRoute();
  //const isLoading = ref(false);

  const apiUrl = inject('apiUrl'); // Ahora tienes acceso a apiUrl
  const idTorneo = Number(route.params.id_torneo);

  const mode = inject('mode')

  // ---- estado ----
  const round = ref(null)
  const tournamentName = ref('')
  const category = ref('')
  const organizer = ref('')
  const date = ref('')

  const matches = ref([])


  // ---- lifecycle ----
  onMounted(() => {
    loadLatestRound()
  })

  // ---- api ----
  async function loadLatestRound() {
    try {
      const { data } = await axios.get(
        `${apiUrl}tournament-rounds/latest-round/${idTorneo}`
      )

      round.value = data.roundNumber
      category.value = data.category
      tournamentName.value = data.tournament?.name ?? 'Torneo'
      organizer.value = data.tournament?.organizer ?? ''
      date.value = formatDate(data.generatedAt)

      matches.value = data.pairings.map(p => ({
        table: p.tableNumber,
        player1: {
          name: p.playerName,
          stats: p.playerRecord ?? '-'
        },
        player2: {
          name: p.opponentName,
          stats: p.opponentRecord ?? '-'
        }
      }))
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text:
          error.response?.data?.message ??
          'No se pudo cargar la ronda',
      })
    }
  }

  // ---- helpers ----
  function formatDate(dateStr) {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleString('es-CL')
  }
</script>

<style scoped>
  .container {
    max-width: 900px;
    margin: auto;
  }

  /* HEADER */
  header {
    background: linear-gradient(135deg, #1e3c72, #2a5298);
    color: white;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 25px;
  }

  .dark-header {
    background: linear-gradient(135deg, #1a1a1a, #333);
  }

  /* CATEGORY */
  .category {
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 15px;
  }

  /* PAIRINGS */
  .pairings {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 15px;
  }

  .match {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
    padding: 15px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .dark-match {
    background-color: #333;
    box-shadow: 0 4px 10px rgba(255,255,255,0.08);
    color: #e0e0e0;
  }

  /* TABLE */
  .table-number {
    font-size: 14px;
    font-weight: bold;
    color: #2a5298;
  }

  .dark-mode .table-number {
    color: #90caf9;
  }

  /* PLAYERS */
  .players {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
  }

  .player {
    width: 45%;
    text-align: center;
  }

  .player strong {
    display: block;
    font-size: 15px;
  }

  .stats {
    font-size: 12px;
    color: #777;
  }

  .dark-mode .stats {
    color: #bbb;
  }

  .vs {
    font-weight: bold;
    color: #999;
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

  .dark-footer {
    color: #ccc;
  }

  /* CONTENEDOR MODO OSCURO */
  .dark-mode {
    background-color: #2c2c2c;
    color: #e0e0e0;
  }
</style>
