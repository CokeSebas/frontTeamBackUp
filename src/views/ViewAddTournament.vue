<template>
  <div :class="['container mt-4', mode === 'dark' ? 'dark-mode' : '']">
    <div v-if="isOrganizer" class="row g-4">

      <!-- COLUMNA IZQUIERDA: CREAR TORNEO -->
      <div class="col-12 col-lg-6">
        <header
          :class="['mb-3', mode === 'dark' ? 'dark-header' : '']"
          class="text-center text-lg-start"
        >
          <h1>{{ $t('tournamentsSeccion.addTournamet') }}</h1>
          <p class="mb-0">{{ $t('tournamentsSeccion.subAddTournament') }}</p>
        </header>

        <div :class="['form-card', mode === 'dark' ? 'dark-card' : '']">
          <form @submit.prevent="createTournament">

            <div class="form-group mb-3">
              <label>{{ $t('tournamentsSeccion.tournamentName') }}</label>
              <input
                v-model="form.name"
                type="text"
                class="form-control"
                required
              />
            </div>

            <div class="form-group mb-3">
              <label>{{ $t('tournamentsSeccion.selectType') }}</label>
              <select v-model="form.type" class="form-control" required>
                <option disabled value="">
                  {{ $t('tournamentsSeccion.selectType') }}
                </option>
                <option value="challenge">Challenge</option>
                <option value="cup">Cup</option>
              </select>
            </div>

            <div class="form-group mb-3">
              <label>{{ $t('tournamentsSeccion.typeTournament') }}</label>
              <select v-model="form.format" class="form-control" required>
                <option disabled value="">
                  {{ $t('tournamentsSeccion.typeTournament') }}
                </option>
                <option value="tcg">Trading Card Game</option>
                <option value="vg">VideoGame</option>
              </select>
            </div>

            <div class="form-group mb-3">
              <label>{{ $t('tournamentsSeccion.dateTournament') }}</label>
              <input
                v-model="form.date"
                type="date"
                class="form-control"
                required
              />
            </div>

            <button
              class="btn btn-success w-100 mt-2"
              type="submit"
              :disabled="loading"
            >
              {{ $t('tournamentsSeccion.addTournamet') }}
            </button>
          </form>
        </div>
      </div>

      <!-- COLUMNA DERECHA: LISTADO -->
      <div class="col-12 col-lg-6">
        <div :class="['list-card', mode === 'dark' ? 'dark-card' : '']">
          <h2 class="mb-3 text-center text-lg-start">
            {{ $t('tournamentsSeccion.myTournaments') }}
          </h2>

          <!-- 🖥️ TABLA (DESKTOP) -->
          <div class="d-none d-lg-block table-responsive">
            <table class="table table-sm align-middle">
              <thead>
                <tr>
                  <th>{{ $t('tournamentsSeccion.name') }}</th>
                  <th>{{ $t('tournamentsSeccion.type') }}</th>
                  <th>{{ $t('teamsSeccion.format') }}</th>
                  <th>{{ $t('tournamentsSeccion.date') }}</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="tournament in tournaments.datos"
                  :key="tournament.id"
                >
                  <td>{{ tournament.nombre }}</td>
                  <td>{{ tournament.tipo_torneo === 'challenge' ? 'Challenge' : 'Cup' }}</td>
                  <td>{{ tournament.formato_torneo === 'tcg' ? 'Trading Card Game' : 'VideoGame' }}</td>
                  <td>{{ moment(tournament.fecha_torneo).format('DD/MM/YYYY') }}</td>
                  <td>
                    <button class="btn btn-primary btn-sm" @click="ViewOrgTorneo(tournament.id)">
                      {{ $t('tournamentsSeccion.viewTournament') }}
                    </button>
                  </td>
                  <td>
                    <button class="btn btn-primary btn-sm" @click="uploadTeams(tournament.id)">
                      {{ $t('buttons.addTeam') }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- 📱 CARDS (MOBILE) -->
          <div class="d-block d-lg-none">
            <div
              v-for="tournament in tournaments.datos"
              :key="tournament.id"
              :class="['tournament-card mb-3', mode === 'dark' ? 'dark-card-soft' : '']"
            >
              <h5 class="mb-2">{{ tournament.nombre }}</h5>

              <p class="mb-1">
                <strong>{{ $t('tournamentsSeccion.type') }}:</strong>
                {{ tournament.tipo_torneo === 'challenge' ? 'Challenge' : 'Cup' }}
              </p>

              <p class="mb-1">
                <strong>{{ $t('teamsSeccion.format') }}:</strong>
                {{ tournament.formato_torneo === 'tcg' ? 'Trading Card Game' : 'VideoGame' }}
              </p>

              <p class="mb-3">
                <strong>{{ $t('tournamentsSeccion.date') }}:</strong>
                {{ moment(tournament.fecha_torneo).format('DD/MM/YYYY') }}
              </p>

              <div class="d-grid gap-2">
                <button
                  class="btn btn-primary btn-sm"
                  @click="ViewOrgTorneo(tournament.id)"
                >
                  {{ $t('tournamentsSeccion.viewTournament') }}
                </button>

                <button
                  class="btn btn-outline-primary btn-sm"
                  @click="uploadTeams(tournament.id)"
                >
                  {{ $t('buttons.addTeam') }}
                </button>
              </div>
            </div>

            <p
              v-if="(tournaments?.datos?.length ?? 0) === 0"
              class="text-center mt-3"
            >
              {{ $t('tournamentsSeccion.noTournaments') }}
            </p>
          </div>

        </div>
      </div>      

    </div>
  </div>
</template>


<script setup>
  import { ref, inject, onMounted, computed } from 'vue'
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

  const isOrganizer = computed(() => {
    return sessionStorage.getItem('isOrganizer') === 'true';
  })

  const loadTournaments = async () => {
    try {

      if (!isOrganizer.value) {
        Swal.fire({
          icon: 'error',
          title: 'No autorizado',
          text: 'No tienes permisos para ver esta página.',
        })
      }

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

  /* Cards mobile */
  .tournament-card {
    border-radius: 12px;
    padding: 16px;
    background: #ffffff;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.06);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .tournament-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 24px rgba(0, 0, 0, 0.1);
  }

  /* 🌙 Dark mode tweaks */
  .dark-mode .dark-card,
  .dark-mode .dark-card-soft {
    background: #1e1e1e;
    color: #f1f1f1;
  }

  .dark-mode .tournament-card {
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.6);
  }

  .dark-mode table {
    color: #f1f1f1;
  }

  .dark-mode thead {
    background-color: #2a2a2a;
  }

  .dark-mode .table td,
  .dark-mode .table th {
    border-color: #333;
  }

  /* Botones */
  .dark-mode .btn-outline-primary {
    border-color: #5dade2;
    color: #5dade2;
  }

  .dark-mode .btn-outline-primary:hover {
    background-color: #5dade2;
    color: #000;
  }

</style>

