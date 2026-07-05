<template>
  <div class="container" :class="{ 'theme-dark': mode === 'dark' }">
    <div class="list-card">

      <!-- 🔄 LOADING -->
      <div v-if="loading" class="loading">
        <img :src="gifLoading">
      </div>

      <template v-else>
        <h2 class="mb-3">{{ $t('matchRecordSection.myTournaments') }}</h2>

        <!-- 🖥️ TABLA -->
        <table class="table-dark-custom">
          <thead>
            <tr>
              <th class="text-center">{{ $t('matchRecordSection.tournament') }}</th>
              <th class="text-center">{{ $t('matchRecordSection.round') }}</th>
              <th class="text-center">{{ $t('matchRecordSection.victorys') }}</th>
              <th class="text-center">{{ $t('matchRecordSection.defeats') }}</th>
              <th class="text-center">{{ $t('matchRecordSection.draws') }}</th>
              <th class="text-center">{{ $t('matchRecordSection.winRate') }}</th>
              <th></th>
            </tr>
          </thead>

          <tbody>
            <template v-for="t in tournaments" :key="t.tournamentName">

              <!-- FILA PRINCIPAL -->
              <tr>
                <td class="text-center">{{ formatName(t.tournamentName) }}</td>
                <td class="text-center">{{ t.totalRounds }}</td>
                <td class="text-center">{{ t.wins }}</td>
                <td class="text-center">{{ t.losses }}</td>
                <td class="text-center">{{ t.ties }}</td>
                <td class="text-center">
                  <span :class="getWinrateClass(t.winRate)">
                    {{ t.winRate }}%
                  </span>
                </td>
                <td class="text-center">
                  <button
                    class="btn btn-sm btn-primary"
                    @click="viewDetailTournament(t.userId, t.tournamentName)"
                  >
                    {{ expandedTournament === t.tournamentName ? $t('matchRecordSection.ocultarDetails') : $t('matchRecordSection.seeDetails') }}
                  </button>
                </td>
              </tr>

              <!-- 🔥 FILA EXPANDIDA -->
              <tr v-if="expandedTournament === t.tournamentName">
                <td colspan="7">

                  <div 
                    class="detail-box"
                    :ref="`tournament-${t.tournamentName}`"
                  >

                    <div class="share-card">
                      <h3>{{ t.tournamentName }} - {{ t.winRate }}% WR</h3>
                      <!-- matches -->
                    </div>

                    <div
                      v-for="match in tournamentDetails[t.tournamentName]"
                      :key="match.round"
                      class="match-card"
                    >
                      <div class="match-top">
                        <span class="badge-round">{{ $t('matchRecordSection.round') }} {{ match.round }}</span>

                        <div class="opponent">
                          vs {{ match.opponentName }}
                        </div>

                        <div :class="['result-badge', match.result]">
                          {{ match.result.toUpperCase() }}
                        </div>
                      </div>

                      <div class="pokemon-row">
                        <div v-for="(poke, i) in match.pokemons" :key="i" class="poke-slot">
                          <img :src="poke.image" />
                        </div>
                      </div>
                    </div>

                  </div>

                  <button class="btn btn-download dark" @click="downloadShareCard(t)">
                    📸 {{ $t('matchRecordSection.shareCard') }}
                  </button>

                </td>
              </tr>

            </template>
          </tbody>

        </table>

        <!-- ❌ SIN DATOS -->
        <div v-if="!tournaments.length" class="text-center mt-3">
          {{ $t('matchRecordSection.noTournaments') }}
        </div>

      </template>
    </div>
    <div><br></div>
  </div>


  <div
    ref="exportCard"
    class="export-card"
    :class="{ dark: exportTheme === 'dark' }"
  >
    <div class="export-header">
      🏆 {{ exportData?.name }}
      <div style="font-size:18px; opacity:0.9;">
        {{ exportData?.winRate }}% Win Rate
      </div>
    </div>

    <div class="export-matches">
      <div
        v-for="match in exportData?.matches"
        :key="match.round"
        class="export-match"
        :class="match.result"
      >
        <div class="match-banner">

          <!-- IZQUIERDA -->
          <span class="round-badge">
            {{ $t('matchRecordSection.round') }} {{ match.round }}
          </span>

          <!-- CENTRO -->
          <div class="match-center">
            <div class="match-opponent">
              vs {{ match.opponentName }}
            </div>

            <div class="match-pokemons">
              <img
                v-for="(poke, i) in match.pokemons"
                :key="i"
                :src="poke.image"
              />
            </div>
          </div>

          <!-- DERECHA -->
          <span class="match-result" :class="match.result">
            {{ match.result.toUpperCase() }}
          </span>

        </div>
      </div>
    </div>

    <div class="export-footer">
      <div class="footer-brand">
        <img :src="logoSrc" class="export-logo" />
        <span>pokecircuit.com</span>
      </div>
    </div>
  </div>


</template>


<script>
  import { inject } from 'vue'
  import axios from 'axios'
  import { useAuthStore } from '@/stores/authStore';
  import { jwtDecode } from 'jwt-decode';
  import html2canvas from 'html2canvas';
  import logo from '@/assets/pokecircuit.png'; // 👈 ajusta el path si es necesario


  export default {
    inject: ['apiUrl', 'gifLoading', 'mode'],
    name: 'ViewMyTournaments',

    data() {
      return {
        tournaments: [],
        loading: true,

        expandedTournament: null, // 🔥 cuál está abierto
        tournamentDetails: {}, // 🔥 cache de detalles

        sunIcon: inject('sunIcon'),
        moonIcon: inject('moonIcon'),
        logoSrc: logo,

        exportData: null,
        exportTheme: 'light',
      }
    },

    methods: {
      async loadStats() {
        
        const authStore = useAuthStore()
        const decodedToken = jwtDecode(authStore.token);
        const userId = decodedToken.userId;

        try {

          const response = await axios.get(
            `${this.apiUrl}matches/tournament-users/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${authStore.token}`
              }
            }
          )

          this.tournaments = response.data

        } catch (error) {
          console.error(error)
        }
      },

      formatName(name) {
        if (!name) return ''
        return name.charAt(0).toUpperCase() + name.slice(1)
      },

      getWinrateClass(rate) {
        if (rate >= 70) return 'text-success'
        if (rate >= 50) return 'text-warning'
        return 'text-danger'
      },

      async viewDetailTournament(userId, tournamentName) {
        // toggle (abrir/cerrar)
        if (this.expandedTournament === tournamentName) {
          this.expandedTournament = null
          return
        }

        this.expandedTournament = tournamentName

        // si ya lo cargaste antes, no pegues de nuevo a la API
        if (this.tournamentDetails[tournamentName]) return

        try {
          const response = await axios.post(
            `${this.apiUrl}matches/tournament-detail`,
            {
              userId,
              name: tournamentName
            },
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
              }
            }
          )

          this.tournamentDetails[tournamentName] = response.data

        } catch (e) {
          console.error(e)
        }
      },

      resultClass(result) {
        if (result === 'win') return 'text-win'
        if (result === 'loss') return 'text-loss'
        return 'text-tie'
      },

      async downloadShareCard(tournament) {
        const data = this.tournamentDetails[tournament.tournamentName]

        if (!data) return

        // 🔥 preparar data bonita
        this.exportData = {
          name: tournament.tournamentName,
          winRate: tournament.winRate,
          matches: data
        }

        this.exportTheme = 'dark' // o 'light'

        await this.$nextTick()
        await new Promise(r => setTimeout(r, 80))

        const element = this.$refs.exportCard

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: null
        })

        const link = document.createElement('a')
        link.download = `${tournament.tournamentName}-share.png`
        link.href = canvas.toDataURL()
        link.click()
      }
      
    },

    async mounted() {
      const authStore = useAuthStore()

      // 🔐 SI NO ESTÁ LOGUEADO → REDIRECT
      if (!authStore.isAuthenticated) {
        this.$router.push({
          path: '/login',
          query: { redirect: this.$route.fullPath }
        })
        return
      }

      this.loading = true

      try {
        await this.loadStats()
      } finally {
        this.loading = false
      }
    }
  }
</script>

<style>
  /* ===============================
    VARIABLES TEMA
  ================================= */
  .container.theme-dark {
    --bg-card: #2a2a2a;
    --bg-row: #2a2a2a;
    --bg-head: #3a3a3a;
    --border-color: #444;
    --text-color: #e6e6e6;
  }

  .container,
  .container * {
    color: var(--text-color);
  }

  /* ===============================
    CARD GENERAL
  ================================= */
  .list-card {
    background: var(--bg-card);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0,0,0,.08);
  }

  /* ===============================
    TABLA
  ================================= */
  .table-dark-custom {
    width: 100%;
    border-collapse: collapse;
    background: var(--bg-row);
  }

  .table-dark-custom thead {
    background: var(--bg-head);
  }

  .table-dark-custom th,
  .table-dark-custom td {
    border: 1px solid var(--border-color);
    padding: 8px;
  }

  .table-dark-custom tbody tr:hover {
    background: rgba(0,0,0,.05);
  }

  .container.theme-dark .table-dark-custom tbody tr:hover {
    background: rgba(255,255,255,.05);
  }

  /* ===============================
    UTILIDADES
  ================================= */
  .loading {
    display: flex;
    justify-content: center;
  }

  .detail-box {
    margin-top: 10px;
    padding: 12px;
    border-radius: 10px;
    background: var(--bg-row);
    border: 1px solid var(--border-color);
  }

  /* ===============================
    MATCH CARD
  ================================= */
  .match-card {
    background: var(--bg-row);
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 12px;
    margin-bottom: 12px;
    box-shadow: 0 2px 6px rgba(0,0,0,.15);
  }

  .container.theme-dark .match-card {
    box-shadow: 0 2px 10px rgba(0,0,0,.6);
  }

  .match-top {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    margin-bottom: 10px;
  }

  /* badges */
  .badge-round {
    justify-self: start;
    background: #3498db;
    color: #fff;
    padding: 4px 10px;
    border-radius: 8px;
    font-size: 12px;
  }

  .opponent {
    justify-self: center;
    text-align: center;
    font-size: 20px;
    font-weight: 600;
  }

  .result-badge {
    justify-self: end;
    padding: 6px 12px;
    border-radius: 8px;
    font-weight: bold;
  }

  .result-badge.win { background: #2ecc71; color: #000; }
  .result-badge.loss { background: #e74c3c; }
  .result-badge.tie { background: #f1c40f; color: #000; }

  /* ===============================
    POKEMONS
  ================================= */
  .pokemon-row {
    display: flex;
    justify-content: center;
    gap: 24px;
    flex-wrap: wrap;
    margin-top: 10px;
  }

  .poke-slot img {
    width: 70px;
    transition: transform .2s ease;
  }

  .poke-slot img:hover {
    transform: scale(1.12);
  }

  /* ===============================
    BOTÓN
  ================================= */
  .btn-download {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
    cursor: pointer;
    font-weight: 500;
    transition: .2s ease;
  }

  .btn-download:hover {
    transform: translateY(-1px);
  }

  .btn-download.dark {
    background: #34495e;
    color: #fff;
  }

  .container.theme-dark .btn-download.dark {
    background: #1f2a38;
  }

  /* ===============================
    EXPORT CARD
  ================================= */
  .export-card {
    position: fixed;
    left: -9999px;
    top: 0;

    width: 850px;
    padding: 30px;
    border-radius: 24px;

    display: flex;
    flex-direction: column;
    justify-content: space-between;

    background: #1f1f1f;
    color: #fff;
    font-family: 'Segoe UI', sans-serif;
    box-shadow: 0 20px 40px rgba(0,0,0,.4);
  }

  .export-header {
    text-align: center;
    font-size: 38px;
    font-weight: 700;
  }

  .export-matches {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* ===============================
    EXPORT MATCH
  ================================= */
  .export-match {
    margin-bottom: 12px;
    padding: 14px;
    border-radius: 14px;
    border: 2px solid transparent;
  }

  /* estado */
  .export-match.win {
    border-color: #2ecc71;
    box-shadow: 0 0 12px rgba(46,204,113,.4);
  }

  .export-match.loss {
    border-color: #e74c3c;
    box-shadow: 0 0 12px rgba(231,76,60,.4);
  }

  .export-match.tie {
    border-color: #f1c40f;
    box-shadow: 0 0 12px rgba(241,196,15,.4);
  }

  /* banner */
  .match-banner {
    display: flex;
    align-items: center;
    justify-content: space-between;

    background: linear-gradient(145deg, #2a2a2a, #1f1f1f);
    border-radius: 14px;
    padding: 14px 18px;

    border: 1px solid rgba(255,255,255,.08);
    box-shadow: 0 4px 12px rgba(0,0,0,.4);
    backdrop-filter: blur(6px);
    transition: transform .2s ease;
  }

  .match-banner:hover {
    transform: translateY(-2px);
  }

  /* contenido */
  .round-badge {
    background: #3498db;
    color: #fff;
    font-size: 12px;
    padding: 6px 10px;
    border-radius: 8px;
    white-space: nowrap;
  }

  .match-center {
    flex: 1;
    text-align: center;
  }

  .match-opponent {
    font-weight: 600;
    margin-bottom: 6px;
  }

  .match-pokemons {
    display: flex;
    justify-content: center;
    gap: 18px;
  }

  .match-pokemons img {
    width: 64px;
    filter: drop-shadow(0 3px 6px rgba(0,0,0,.5));
  }

  .match-result {
    font-weight: bold;
    padding: 8px 14px;
    border-radius: 10px;
    font-size: 14px;
    white-space: nowrap;
  }

  .match-result.win { background: #2ecc71; color: #000; }
  .match-result.loss { background: #e74c3c; }
  .match-result.tie { background: #f1c40f; color: #000; }

  /* ===============================
    FOOTER
  ================================= */
  .export-footer {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .footer-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    opacity: 0.6;
  }

  .export-logo {
    height: 32px;
  }
</style>