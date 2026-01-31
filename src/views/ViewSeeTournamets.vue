<template>
  <div :class="['container', mode === 'dark' ? 'dark-mode' : '']">
      <div :class="['list-card', mode === 'dark' ? 'dark-card' : '']">

        <!-- 🔄 LOADING -->
        <div v-if="loading" style="align-items: center; display: flex; justify-content: center;">
          <img :src="gifLoading">
        </div>

        <template v-else>
          <h2 class="mb-3">{{ $t('tournamentsSeccion.title') }}</h2>
  
          <table class="table table-sm d-none d-md-table">
            <thead>
              <tr>
                <th class="text-center">{{ $t('tournamentsSeccion.name') }}</th>
                <th class="text-center">{{ $t('tournamentsSeccion.type') }}</th>
                <th class="text-center">{{ $t('tournamentsSeccion.date') }}</th>
                <th class="text-center">{{ $t('tournamentsSeccion.round') }}</th>
                <th class="text-center">{{ $t('tournamentsSeccion.standing') }}</th>
                <th class="text-center">{{ $t('tournamentsSeccion.results') }}</th>
                <th class="text-center">{{ $t('tournamentsSeccion.imgTop') }}</th>
              </tr>
            </thead>
  
            <tbody>
              <tr v-for="tournament in tournaments" :key="tournament.id">
                <td class="text-center">{{ tournament.nombre }}</td>
                <td class="text-center">{{ tournament.tipo_torneo === "1" ? 'Challenge' : 'Cup' }}</td>
                <td class="text-center">{{ moment(tournament.fecha_torneo).format('DD/MM/YYYY') }}</td>
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
  
          <div class="d-md-none">
            <div
              v-for="tournament in tournaments"
              :key="tournament.id"
              class="tournament-card mb-3"
            >
              <h5 class="mb-2">{{ tournament.nombre }}</h5>
  
              <div class="info-row">
                <span>{{ $t('tournamentsSeccion.type') }}:</span>
                <strong>{{ tournament.tipo_torneo === "1" ? 'Challenge' : 'Cup' }}</strong>
              </div>
  
              <div class="info-row">
                <span>{{ $t('tournamentsSeccion.date') }}:</span>
                <strong>{{ moment(tournament.fecha_torneo).format('DD/MM/YYYY') }}</strong>
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
        
        </template>

      </div>
    <br>
  </div>
</template>


<script setup>
  import { ref, inject, onMounted } from 'vue'
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  import moment from "moment";

  const mode = inject('mode')
  const router = useRouter();

  const apiUrl = inject('apiUrl'); // Ahora tienes acceso a apiUrl
  const tournaments = ref([])

  const loading = ref(true);
  const gifLoading = inject('gifLoading');


  // Obtener torneos del usuario
  const loadTournaments = async () => {
    try {

      const response = await axios.get(`${apiUrl}tournaments`)
      tournaments.value = response.data;

    } catch (error) {
      console.error(error)
    }
  }

  const goToRound = (idTorneo) => {
    router.push({
      name: 'ViewGoToRound',
      params: { id_torneo: idTorneo }
    })
  }


  const goToStanding = (idTorneo) => router.push('/tournament/goToStanding/' + idTorneo);
  const goToResults = (idTorneo) => router.push('/tournament/goToResults/' + idTorneo);
  const goToTops = (idTorneo) => router.push('/tournament/goToTops/' + idTorneo);


  onMounted(async () => {
    loading.value = true
    try {
      await Promise.all([
        loadTournaments()
      ])
    } finally {
      loading.value = false
    }
  });

</script>


<style scoped>
  header {
    background: linear-gradient(135deg, #134e5e, #71b280);
    color: white;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
  }

  .dark-header {
    background: linear-gradient(135deg, #1a1a1a, #333);
  }

  .form-card,
  .list-card {
    background: white;
    padding: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  }

  .dark-card {
    background-color: #333;
    color: #e0e0e0;
    box-shadow: 0 4px 10px rgba(255,255,255,0.08);
  }

  .form-group {
    margin-bottom: 15px;
  }

  .dark-card .form-control,
  .dark-card table {
    background-color: #444;
    color: #fff;
  }

  .dark-card thead {
    background-color: #555;
  }

  .dark-mode {
    background-color: #2c2c2c;
    color: #e0e0e0;
  }


  .tournament-card {
    padding: 12px;
    border-radius: 10px;
    background-color: #fff;
    border: 1px solid #ddd;
  }

  .dark-mode .tournament-card {
    background-color: #2b2b2b;
    border-color: #444;
    color: #e0e0e0;
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

</style>

