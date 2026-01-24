<template>
  <div :class="['container', mode === 'dark' ? 'dark-mode' : '']">
      <div :class="['list-card', mode === 'dark' ? 'dark-card' : '']">
        <h2 class="mb-3">{{ $t('tournamentsSeccion.title') }}</h2>

        <table class="table table-sm">
          <thead>
            <tr>
              <th>{{ $t('tournamentsSeccion.name') }}</th>
              <th>{{ $t('tournamentsSeccion.type') }}</th>
              <th>{{ $t('tournamentsSeccion.date') }}</th>
              <th class="text-center">{{ $t('tournamentsSeccion.round') }}</th>
              <th class="text-center">{{ $t('tournamentsSeccion.standing') }}</th>
              <th class="text-center">{{ $t('tournamentsSeccion.results') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tournament in tournaments" :key="tournament.id">
              <td>{{ tournament.nombre }}</td>
              <td>{{ tournament.tipo_torneo === "1" ? 'Challenge' : 'Cup' }}</td>
              <td>{{ moment(tournament.fecha_torneo).format('DD/MM/YYYY') }}</td>
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
            </tr>

            <tr v-if="tournaments.length === 0">
              <td colspan="6" class="text-center">
                {{ $t('tournamentsSeccion.noTournaments') }}
              </td>
            </tr>
          </tbody>
        </table>

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


  const goToStanding = (idTorneo) => router.push('/goToStanding/' + idTorneo);
  const goToResults = (idTorneo) => router.push('/goToResults/' + idTorneo);


  onMounted(loadTournaments)

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
</style>

