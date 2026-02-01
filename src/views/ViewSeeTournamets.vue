<template>
  <div class="container" :class="{ 'theme-dark': mode === 'dark' }">
    <div class="list-card">

      <!-- 🔄 LOADING -->
      <div v-if="loading" class="loading">
        <img :src="gifLoading">
      </div>

      <template v-else>
        <h2 class="mb-3">{{ $t('tournamentsSeccion.title') }}</h2>

        <div class="row mb-3">
        <div class="col-md-3">
          <label class="form-label">{{ $t('tournamentsSeccion.type') }}</label>
          <select v-model="filterType" class="form-select">
            <option value="">Todos</option>
            <option value="challenge">Challenge</option>
            <option value="cup">Cup</option>
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">{{ $t('teamsSeccion.format') }}</label>
          <select v-model="filterFormat" class="form-select">
            <option value="">Todos</option>
            <option value="vgc">VGC</option>
            <option value="tgc">TGC</option>
          </select>
        </div>
      </div>


        <!-- 🖥️ TABLA DESKTOP -->
        <table class="table table-sm table-hover d-none d-md-table">
          <thead>
            <tr>
              <th class="text-center">{{ $t('tournamentsSeccion.name') }}</th>
              <th class="text-center">{{ $t('tournamentsSeccion.type') }}</th>
              <th class="text-center">{{ $t('teamsSeccion.format') }}</th>
              <th class="text-center">{{ $t('tournamentsSeccion.date') }}</th>
              <th class="text-center">{{ $t('tournamentsSeccion.round') }}</th>
              <th class="text-center">{{ $t('tournamentsSeccion.standing') }}</th>
              <th class="text-center">{{ $t('tournamentsSeccion.results') }}</th>
              <th class="text-center">{{ $t('tournamentsSeccion.imgTop') }}</th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="tournament in currentItems" :key="tournament.id">
              <td class="text-center">{{ tournament.nombre }}</td>
              <td class="text-center">{{ tournament.tipo_torneo === "challenge" ? 'Challenge' : 'Cup' }}</td>
              <td class="text-center">{{ tournament.formatoTorneo === "vgc" ? 'VGC' : 'TGC' }}</td>
              <td class="text-center">{{ formatDate(tournament.fecha_torneo) }}</td>

              <td class="text-center">
                <button class="btn btn-success btn-sm" @click="goToRound(tournament.id)">
                  {{ $t('tournamentsSeccion.goToRound') }}
                </button>
              </td>

              <td class="text-center">
                <button class="btn btn-success btn-sm" @click="goToStanding(tournament.id)">
                  {{ $t('tournamentsSeccion.goToStanding') }}
                </button>
              </td>

              <td class="text-center">
                <button class="btn btn-success btn-sm" @click="goToResults(tournament.id)">
                  {{ $t('tournamentsSeccion.goToResults') }}
                </button>
              </td>

              <td class="text-center">
                <button class="btn btn-success btn-sm" @click="goToTops(tournament.id)">
                  {{ $t('tournamentsSeccion.seeImgTop') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 📱 MOBILE -->
        <div class="d-md-none">
          <div
            v-for="tournament in currentItems"
            :key="tournament.id"
            class="tournament-card mb-3"
          >
            <h5>{{ tournament.nombre }}</h5>

            <div class="info-row">
              <span>{{ $t('tournamentsSeccion.type') }}</span>
              <strong>{{ tournament.tipo_torneo === "challenge" ? 'Challenge' : 'Cup' }}</strong>
            </div>

            <div class="info-row">
              <span>{{ $t('teamsSeccion.format') }}</span>
              <strong>{{ tournament.formatoTorneo === "vgc" ? 'VGC' : 'TGC' }}</strong>
            </div>

            <div class="info-row">
              <span>{{ $t('tournamentsSeccion.date') }}</span>
              <strong>{{ formatDate(tournament.fecha_torneo) }}</strong>
            </div>

            <div class="actions mt-2">
              <button class="btn btn-success btn-sm" @click="goToRound(tournament.id)">
                {{ $t('tournamentsSeccion.round') }}
              </button>
              <button class="btn btn-success btn-sm" @click="goToStanding(tournament.id)">
                {{ $t('tournamentsSeccion.standing') }}
              </button>
              <button class="btn btn-success btn-sm" @click="goToResults(tournament.id)">
                {{ $t('tournamentsSeccion.results') }}
              </button>
              <button class="btn btn-success btn-sm" @click="goToTops(tournament.id)">
                {{ $t('tournamentsSeccion.imgTop') }}
              </button>
            </div>
          </div>
        </div>


        <Paginator
          :items="filteredTournaments"
          :itemsPerPage="10"
          @page-changed="handlePageChanged"
        />

      </template>
    </div>
  </div>
  <br>
</template>


<script>
  import axios from 'axios';
  import moment from 'moment';
  import Paginator from '@/components/AppPaginator.vue';


  export default {
    inject: ['apiUrl', 'gifLoading', 'mode'],
    name: 'ViewTournaments',
    components: {
      Paginator
    },
    data() {
      return {
        tournaments: [],
        loading: true,

        // filtros
        filterType: '',
        filterFormat: '',

        // paginador
        currentItems: []
      }
    },

    computed: {
      filteredTournaments() {
        return this.tournaments.filter(tournament => {
          const matchType = this.filterType
            ? tournament.tipo_torneo === this.filterType
            : true

          const matchFormat = this.filterFormat
            ? tournament.formatoTorneo === this.filterFormat
            : true

          return matchType && matchFormat
        })
      }
    },

    methods: {
      handlePageChanged(paginatedItems) {
        this.currentItems = paginatedItems
      },
      
      async loadTournaments() {
        try {
          const response = await axios.get(`${this.apiUrl}tournaments`)
          this.tournaments = response.data
        } catch (error) {
          console.error(error)
        }
      },

      goToRound(idTorneo) {
        this.$router.push({
          name: 'ViewGoToRound',
          params: { id_torneo: idTorneo }
        })
      },

      goToStanding(idTorneo) {
        this.$router.push('/tournament/goToStanding/' + idTorneo)
      },

      goToResults(idTorneo) {
        this.$router.push('/tournament/goToResults/' + idTorneo)
      },

      goToTops(idTorneo) {
        this.$router.push('/tournament/goToTops/' + idTorneo)
      },

      formatDate(date) {
        return moment(date).format('DD/MM/YYYY')
      }
    },

    watch: {
      filteredTournaments(newList) {
        this.currentItems = newList.slice(0, 10)
      }
    },

    async mounted() {
      this.loading = true
      try {
        await this.loadTournaments()
        this.currentItems = this.filteredTournaments.slice(0, 10)
      } finally {
        this.loading = false
      }
    }
  }
  </script>



<style scoped>
  /* ======================
    VARIABLES DE TEMA
  ====================== */
  .container {
    --bg-main: #f8f9fa;
    --bg-card: #ffffff;
    --bg-table-head: #f1f1f1;
    --bg-table-row: #ffffff;
    --border-color: #dee2e6;
    --text-color: #212529;
  }

  .container.theme-dark {
    --bg-main: #2c2c2c;
    --bg-card: #333;
    --bg-table-head: #444;
    --bg-table-row: #2f2f2f;
    --border-color: #555;
    --text-color: #e0e0e0;
  }

  /* ======================
    BASE
  ====================== */
  /* CONTAINER SOLO PARA ESPACIADO */
  .container {
    background: transparent;
    color: var(--text-color);
  }


  .list-card {
    background-color: var(--bg-card);
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  }

  /* ======================
    TABLE
  ====================== */
  table {
    color: var(--text-color);
  }

  thead {
    background-color: var(--bg-table-head);
  }

  tbody tr {
    background-color: var(--bg-table-row);
  }

  .table td,
  .table th {
    border-color: var(--border-color);
  }

  /* Hover */
  .table-hover tbody tr:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }

  .container.theme-dark .table-hover tbody tr:hover {
    background-color: rgba(255, 255, 255, 0.05);
  }

  /* ======================
    MOBILE CARD
  ====================== */
  .tournament-card {
    background-color: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 12px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
  }

  .actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px;
  }

  /* ======================
    LOADING
  ====================== */
  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
  }


</style>

