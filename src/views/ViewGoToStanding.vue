<template>
  <div :class="['container', mode === 'dark' ? 'dark-mode' : '']">
    <br>

    <!-- 🔄 LOADING -->
    <div v-if="loading" style="align-items: center; display: flex; justify-content: center;">
      <img :src="gifLoading">
    </div>

    <template v-else>
      <header>
        <h1>
          {{ $t('tournamentsSeccion.standingRound') }}
          {{ currentRound }}/{{ totalRounds }}
        </h1>
      </header>
  
      <h2>{{ category }}</h2>
  
      <!-- =======================
           🖥️ DESKTOP TABLE
           ======================= -->
      <table class="standing-table" :class="mode === 'dark' ? 'dark-table' : ''">
        <thead>
          <tr>
            <th>#</th>
            <th>{{ $t('tournamentsSeccion.name') }}</th>
            <th>{{ $t('tournamentsSeccion.standingSeccion') }}</th>
            <th>{{ $t('tournamentsSeccion.standingRoundDrop') }}</th>
            <th>{{ $t('tournamentsSeccion.standingHistorial') }}</th>
            <th>{{ $t('tournamentsSeccion.standingPuntos') }}</th>
            <th>{{ $t('tournamentsSeccion.standingVictory1') }}</th>
            <th>{{ $t('tournamentsSeccion.standingVictory2') }}</th>
          </tr>
        </thead>
  
        <tbody>
          <tr
            v-for="player in standings"
            :key="player.rank"
            :class="{ 'top-cut': player.isTopCut }"
          >
            <td class="rank">{{ player.rank }}</td>
            <td>
              {{ player.name }}
              <span v-if="player.isTopCut" class="top-badge">
                TOP {{ top }}
              </span>
            </td>
            <td>{{ player.section }}</td>
            <td>{{ player.withdrawRound || '-' }}</td>
            <td>{{ player.record }}</td>
            <td>{{ player.points }}</td>
            <td>{{ player.opponentWinRate }}</td>
            <td>{{ player.opponentOpponentWinRate }}</td>
          </tr>
        </tbody>
      </table>
  
      <!-- =======================
           📱 MOBILE CARDS
           ======================= -->
      <div class="standing-cards">
        <div
          v-for="player in standings"
          :key="player.rank"
          :class="['standing-card', { 'top-cut': player.isTopCut }]"
        >
          <div class="card-header">
            <strong>#{{ player.rank }} – {{ player.name }}</strong>
            <span v-if="player.isTopCut" class="top-badge">
              TOP {{ top }}
            </span>
          </div>
  
          <div class="card-row">
            <span>{{ $t('tournamentsSeccion.standingSeccion') }}</span>
            <span>{{ player.section }}</span>
          </div>
  
          <div class="card-row">
            <span>{{ $t('tournamentsSeccion.standingHistorial') }}</span>
            <span>{{ player.record }}</span>
          </div>
  
          <div class="card-row">
            <span>{{ $t('tournamentsSeccion.standingPuntos') }}</span>
            <span>{{ player.points }}</span>
          </div>
  
          <div class="card-row">
            <span>{{ $t('tournamentsSeccion.standingVictory1') }}</span>
            <span>{{ player.opponentWinRate }}</span>
          </div>
  
          <div class="card-row">
            <span>{{ $t('tournamentsSeccion.standingVictory2') }}</span>
            <span>{{ player.opponentOpponentWinRate }}</span>
          </div>
  
          <div class="card-row">
            <span>{{ $t('tournamentsSeccion.standingRoundDrop') }}</span>
            <span>{{ player.withdrawRound || '-' }}</span>
          </div>
        </div>
      </div>
  
      <footer>
        <div>{{ lastUpdate }}</div>
      </footer>
    </template>


    <br>
  </div>
</template>


<script>
  import { inject } from 'vue'
  import axios from 'axios'
  import { useRoute } from 'vue-router'

  export default {
    name: 'ClasificacionRonda',

    loading: true,

    setup() {
      const mode = inject('mode')
      const route = useRoute()
      return { mode, route }
    },

    data() {
      return {
        tournamentName: '',
        category: '',
        organizer: '',
        currentRound: 0,
        totalRounds: 0,
        lastUpdate: '',
        top: '',
        standings: [],
        loading: false,
        gifLoading: inject('gifLoading')
      }
    },

    async mounted() {
      
      this.loading = true
      try {
        await Promise.all([
          this.loadStandings()
        ])
      } finally {
        this.loading = false
      }
    },

    methods: {
      async loadStandings() {
        const apiUrl = inject('apiUrl'); // Ahora tienes acceso a apiUrl
        
        try {
          const tournamentId = this.route.params.id_torneo

          const { data } = await axios.get(
            `${apiUrl}tournament-standing/${tournamentId}`
          )

          if (!data.length) return

          /* ======= Datos generales desde el primer registro ======= */
          const first = data[0]

          this.category = first.category
          this.lastUpdate = new Date(first.createdAt).toLocaleString('es-CL')

          // Ej: "Clasificación - Ronda 1/4 (6)"
          const match = first.roundLabel.match(/Ronda (\d+)\/(\d+)/)
          if (match) {
            this.currentRound = Number(match[1])
            this.totalRounds = Number(match[2])
          }

          let totalJugadores = data.length;
          console.log("Total jugadores:", totalJugadores);
          switch (true) {
            case totalJugadores <= 7:
              this.top = 2;
              break;

            case totalJugadores >= 8 && totalJugadores <= 16:
              this.top = 4;
              break;

            case totalJugadores > 16:
              this.top = 8;
              break;

            default:
              this.top = 0;
          }

          /* ======= Adaptar jugadores ======= */
          this.standings = data.map(player => ({
            rank: player.position,
            name: player.playerName,
            section: player.section,
            withdrawRound: player.withdrawalRound,
            record: `${player.wins}/${player.losses}/${player.draws} (${player.points})`,
            points: player.points,
            opponentWinRate: `${player.opponentWinPercentage}%`,
            opponentOpponentWinRate: `${player.opponentOpponentWinPercentage}%`,
            isTopCut: player.position <= Number(this.top)
          }))

          

        } catch (error) {
          console.error('Error cargando standings', error)
        }
      }
    }
  }
</script>




<style scoped>
  .container {
    max-width: 1100px;
    margin: auto;
  }

  header {
    background: linear-gradient(135deg, #0f2027, #203a43, #2c5364);
    color: white;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 25px;
  }

  header h1 {
    margin: 0;
    font-size: 26px;
  }

  header p {
    margin: 5px 0 0;
    opacity: 0.9;
  }

  h2 {
    margin: 20px 0 10px;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  }

  thead {
    background: #e9eef3;
  }

  th,
  td {
    padding: 10px;
    text-align: center;
    font-size: 14px;
  }

  th {
    font-weight: bold;
  }

  tbody tr {
    border-bottom: 1px solid #eee;
  }

  tbody tr:last-child {
    border-bottom: none;
  }

  .top-cut {
    background: #e6f7ee;
    border-left: 6px solid #2ecc71;
  }

  .rank {
    font-weight: bold;
  }

  .top-badge {
    background: #2ecc71;
    color: white;
    font-size: 11px;
    padding: 3px 8px;
    border-radius: 12px;
    margin-left: 6px;
    white-space: nowrap;
  }

  footer {
    margin-top: 30px;
    font-size: 13px;
    color: #666;
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 10px;
  }

  @media (max-width: 900px) {
    th,
    td {
      font-size: 12px;
      padding: 8px;
    }
  }

  /* =========================
    MODO OSCURO
  ========================= */

  .dark-mode {
    background-color: #2c2c2c;
    color: #e0e0e0;
  }

  .dark-table {
    background-color: #1e1e1e;
    color: #e0e0e0;
    box-shadow: 0 4px 10px rgba(255, 255, 255, 0.05);
  }

  .dark-table thead {
    background-color: #2a2a2a;
  }

  .dark-table th {
    color: #e0e0e0;
  }

  .dark-table td {
    color: #d0d0d0;
  }

  .dark-table tbody tr {
    border-bottom: 1px solid #333;
  }

  /* TOP CUT en oscuro */
  .dark-table .top-cut {
    background-color: #1f3d2b;
    border-left: 6px solid #2ecc71;
  }

  /* Badge TOP 8 */
  .dark-table .top-badge {
    background-color: #2ecc71;
    color: #0b2a1a;
  }

  /* Footer oscuro */
  .dark-mode footer {
    color: #bbb;
  }


  /* =======================
   DESKTOP / MOBILE TOGGLE
   ======================= */
  .standing-cards {
    display: none;
  }

  /* =======================
    MOBILE VIEW
    ======================= */
  @media (max-width: 768px) {
    .standing-table {
      display: none;
    }

    .standing-cards {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .standing-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 14px;
      border: 1px solid #ddd;
    }

    .dark-mode .standing-card {
      background: #1e1e1e;
      border-color: #333;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      font-size: 0.95rem;
    }

    .card-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      padding: 4px 0;
    }

    .card-row span:first-child {
      opacity: 0.7;
    }
  }

  /* =======================
    TOP CUT
    ======================= */
  .top-cut {
    background: rgba(46, 204, 113, 0.08);
  }

  .top-badge {
    background: #2ecc71;
    color: white;
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 6px;
    margin-left: 6px;
  }


</style>
