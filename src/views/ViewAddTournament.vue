<template>
  <div :class="['container mt-4', mode === 'dark' ? 'dark-mode' : '']">
    <br>
    <div class="row">

      <!-- COLUMNA IZQUIERDA: CREAR TORNEO -->
      <div class="col-6">
        <header :class="mode === 'dark' ? 'dark-header' : ''">
          <h1>{{ $t('tournamentsSeccion.addTournamet') }}</h1>
          <p>{{ $t('tournamentsSeccion.subAddTournament') }}</p>
        </header>

        <div :class="['form-card', mode === 'dark' ? 'dark-card' : '']">
          <form @submit.prevent="createTournament">

            <div class="form-group">
              <label>{{ $t('tournamentsSeccion.tournamentName') }}</label>
              <input
                v-model="form.name"
                type="text"
                class="form-control"
                required
              />
            </div>

            <div class="form-group">
              <label>{{ $t('tournamentsSeccion.selectType') }}</label>
              <select
                v-model="form.type"
                class="form-control"
                required
              >
                <option disabled value="">{{ $t('tournamentsSeccion.selectType') }}</option>
                <option value="challenge">Challenge</option>
                <option value="cup">Cup</option>
              </select>
            </div>

            <div class="form-group">
              <label>{{ $t('tournamentsSeccion.typeTournament') }}</label>
              <select
                v-model="form.format"
                class="form-control"
                required
              >
                <option disabled value="">{{ $t('tournamentsSeccion.typeTournament') }}</option>
                <option value="tcg">Trading Card Game</option>
                <option value="vg">VideoGame</option>
              </select>
            </div>

            <div class="form-group">
              <label>{{ $t('tournamentsSeccion.dateTournament') }}</label>
              <input
                v-model="form.date"
                type="date"
                class="form-control"
                required
              />
            </div>

            <button
              class="btn btn-success btn-block mt-3"
              type="submit"
              :disabled="loading"
            >
              {{ $t('tournamentsSeccion.addTournamet') }}
            </button>
          </form>
        </div>
      </div>
      <div class="col-6">
        <div :class="['list-card', mode === 'dark' ? 'dark-card' : '']">
          <h2 class="mb-3">{{ $t('tournamentsSeccion.myTournaments') }}</h2>

          <table class="table table-sm">
            <thead>
              <tr>
                <th>{{ $t('tournamentsSeccion.name') }}</th>
                <th>{{ $t('tournamentsSeccion.type') }}</th>
                <th>{{ $t('teamsSeccion.format') }}</th>
                <th>{{ $t('tournamentsSeccion.date') }}</th>
                <th class="text-center"></th>
                <th class="text-center"></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tournament in tournaments.datos" :key="tournament.id">
                <td>{{ tournament.nombre }}</td>
                <td>{{ tournament.tipo_torneo === "challenge" ? 'Challenge' : 'Cup' }}</td>
                <td>{{ tournament.formato_torneo === "tcg" ? 'Trading Card Game' : 'VideoGame' }}</td>
                <td>{{ moment(tournament.fecha_torneo).format('DD/MM/YYYY') }}</td>
                <td class="text-center">
                  <button class="btn btn-primary btn-sm" @click="ViewOrgTorneo(tournament.id)">
                    {{ $t('tournamentsSeccion.viewTournament') }}
                  </button>
                </td>
                <td class="text-center">
                  <button class="btn btn-primary btn-sm" @click="uploadTeams(tournament.id)">
                    {{ $t('buttons.addTeam') }}
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
      </div>

    </div>
    <br>
  </div>
</template>


<script setup>
  import { ref, inject, onMounted } from 'vue'
  import axios from 'axios'
  import Swal from 'sweetalert2'
  import { jwtDecode } from 'jwt-decode'
  import moment from "moment";
  import { useRouter } from 'vue-router';


  const mode = inject('mode')
  const apiUrl = inject('apiUrl')

  const loading = ref(false);

  const router = useRouter();

  const token = localStorage.getItem('token')
  const userId = jwtDecode(token).userId;

  const form = ref({
    nombre: '',
    tipo_torneo: '',
    formato_torneo: '',
    fecha: ''
  })

  const tournaments = ref([])

  const loadTournaments = async () => {
    try {

      const response = await axios.get(`${apiUrl}tournaments/torneos-user/${userId}`)
      tournaments.value = response.data;
    } catch (error) {
      console.error(error)
    }
  }

  const createTournament = async () => {
    loading.value = true

    let params = { 
      nombre: form.value.name, tipo_torneo: form.value.type, formato_torneo: form.value.format, fecha_torneo: form.value.date, userId: userId };

    try {
      await axios.post(`${apiUrl}tournaments`, params)

      Swal.fire({
        icon: 'success',
        title: 'Torneo creado',
        showConfirmButton: false,
        timer: 1500
      })

      form.value = { nombre: '', tipo_torneo: '', formato_torneo: '', fecha: '' }
      loadTournaments();
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el torneo'
      })
    } finally {
      loading.value = false
    }
  }

  const ViewOrgTorneo = (tournamentId) => {
    router.push({
      name: 'ViewOrgTorneo',
      params: { id_torneo: tournamentId }
    })
  }

  const uploadTeams = (tournamentId) => {
    console.log("Subir equipos para el torneo ID:", tournamentId);
    router.push({
      name: 'ViewAddStanding',
      params: { id_torneo: tournamentId }
    })
  }

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

