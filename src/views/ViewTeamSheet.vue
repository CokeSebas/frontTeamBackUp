<template>
  <div>
    <!-- TÍTULO -->

    <div class="paste-header text-center">
      <h4>{{ $t('teamsheetGenerator') }}</h4>
    </div>

    <div class="container">
      <div v-if="isLoading" style="align-items: center; display: flex; justify-content: center;">
        <img :src="gifLoading">
      </div>


      <div v-else class="row justify-content-center">

        <!-- LEFT -->
        <div class="col-md-6 d-flex align-items-stretch">
          <div :class="['form-card w-100', { 'dark-card': mode === 'dark' }]">

            <div class="paste-header text-center">
              <h4>{{ $t('teamSheetSection.pasteTeamSheet') }}</h4>
            </div>

            <textarea
              v-model="teamPaste"
              class="custom-textarea"
              placeholder="Showdown team paste here"
            ></textarea>

          </div>
        </div>

        <!-- RIGHT -->
        <div class="col-md-6 d-flex align-items-stretch">
          <div :class="['form-card w-100', { 'dark-card': mode === 'dark' }]">

            <!-- FORM -->
            <div class="row">
              <div
                class="form-group col-12 col-md-6"
                v-for="field in fields"
                :key="field.key"
              >
                <label>{{ $t(field.labelKey) }}</label>

                <input
                  :type="field.type"
                  class="form-control"
                  :class="{ 'dark-input': mode === 'dark' }"
                  v-model="form[field.key]"
                />
              </div>
            </div>

            <!-- CATEGORY -->
            <div class="row">
              <p class="col-12" align="center"><strong>{{ $t('teamSheetSection.selectAgeDivision') }}</strong> </p>
              <div
                class="col-12 col-md-3 mb-2"
                v-for="cat in categories"
                :key="cat.value"
              >
                <button
                  class="btn w-100"
                  :class="selectedCategory === cat.value ? 'btn-primary' : 'btn-secondary'"
                  @click="selectedCategory = cat.value"
                >
                  {{ cat.label }}
                </button>
              </div>
            </div>

            <!-- ACTIONS -->
            <div class="row">
              <p class="col-12" align="center"><strong>{{ $t('teamSheetSection.selectTypeSheet') }}</strong> </p>
              <div class="col-12 col-md-6 mb-2">
                <button
                  class="btn w-100"
                  :class="selectedAction === 'open' ? 'btn-primary' : 'btn-secondary'"
                  @click="selectedAction = 'open'"
                >
                  Open Team List
                </button>
              </div>

              <div class="col-12 col-md-6 mb-2">
                <button
                  class="btn w-100"
                  :class="selectedAction === 'staff' ? 'btn-primary' : 'btn-secondary'"
                  @click="selectedAction = 'staff'"
                >
                  Staff Team List
                </button>
              </div>
              <!--<button class="btn btn-secondary w-100">
                Multi Language List
              </button>-->
            </div>
            
            <!-- LANGUAGES -->
            <div class="form-group mt-3">
              <label>{{ $t('language') }}</label>

              <select
                v-model="selectedLanguage"
                class="form-control"
                :class="{ 'dark-input': mode === 'dark' }"
              >
                <option disabled value="">Select language</option>
                <option 
                  v-for="lang in languages" 
                  :key="lang.value" 
                  :value="lang.value"
                >
                  {{ lang.label }}
                </option>
              </select>
            </div>

            <!-- PRINT -->
            <div class="print-section">
              <button class="btn btn-success w-100" @click="printSelected">
                {{ $t('teamSheetSection.printTeamSheet') }}
              </button>
            </div>

            <!-- SAVE IN BROWSER -->
            <div class="form-group mt-3 text-center">
              <input
                type="checkbox"
                id="saveData"
                v-model="saveInBrowser"
              />
              <label for="saveData" class="ml-2">
                Guardar datos en este navegador
              </label>
            </div>

          </div>
        </div>

      </div>
    </div>

  </div>
  <br>
</template>


<script>
  import axios from 'axios';
  import Swal from 'sweetalert2';

  import { generateTeamPDF } from '../utils/imprimirTeamSheet'; // tu función

  export default {
    inject: ['apiUrl', 'gifLoading', 'mode'],
    name: 'TeamsheetGenerator',
    props: {
      id: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      }
    },

    data() {
      return {

        form: {
          playerName: '',
          trainerName: '',
          teamName: '',
          switchName: '',
          playerId: '',
          birth: '',
        },
        
        teamPaste: '',

        selectedLanguage: 'En',

        categories: [
          { label: 'Junior', value: 0 },
          { label: 'Senior', value: 1 },
          { label: 'Master', value: 2 }
        ],
        selectedCategory: 2,

        selectedAction: 'open',

        languages: [
          { label: 'Traditional Chinese', value: 'Cht' },
          { label: 'Simplified Chinese', value: 'Chs' },
          { label: 'English', value: 'En' },
          { label: 'Spanish', value: 'Es' },
          { label: 'French', value: 'Fre' },
          { label: 'German', value: 'Ger' },
          { label: 'Italian', value: 'Ita' },
          { label: 'Japanese', value: 'Jpn' },
          { label: 'Korean', value: 'Kor' }
        ],

        team: {},
        user: {},
        teamJson: '',

        isLoading: true, // Controla el estado de carga

        saveInBrowser: false,
      }
    },
    computed: {
      fields() {
        return [
          { labelKey: 'teamSheetSection.playerName', key: 'playerName', type: 'text' },
          { labelKey: 'teamSheetSection.trainerName', key: 'trainerName', type: 'text' },
          { labelKey: 'teamSheetSection.teamName', key: 'teamName', type: 'text' },
          { labelKey: 'teamSheetSection.switchName', key: 'switchName', type: 'text' },
          { labelKey: 'teamSheetSection.playerId', key: 'playerId', type: 'text' },
          { labelKey: 'teamSheetSection.birth', key: 'birth', type: 'date' },
        ]
      }
    },
    watch: {
      form: {
        handler(newVal) {
          if (this.saveInBrowser) {
            localStorage.setItem('teamsheetForm', JSON.stringify({
              playerName: newVal.playerName,
              trainerName: newVal.trainerName,
              switchName: newVal.switchName,
              playerId: newVal.playerId,
              birth: newVal.birth,
            }));
          }
        },
        deep: true
      },

      saveInBrowser(val) {
        if (!val) {
          localStorage.removeItem('teamsheetForm');
        } else {
          // guardar inmediatamente si se activa
          localStorage.setItem('teamsheetForm', JSON.stringify({
            playerName: this.form.playerName,
            trainerName: this.form.trainerName,
            switchName: this.form.switchName,
            playerId: this.form.playerId,
            birth: this.form.birth,
          }));
        }
      }
    },
    methods: {
      selectCategory(category) {
        this.selectedCategory = category;
      },

      selectAction(action) {
        this.selectedAction = action;
      },

      selectLanguage(lang) {
        this.selectedLanguage = lang;
      },

      formatTeamPaste(rawText) {
        rawText = JSON.parse(rawText); // 🔥 quita comillas automáticamente
        //try {
        //} catch (e) {}

        return rawText
          .replace(/\\r\\n/g, '\n')
          .replace(/\r\n/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      },

      async getTeamDetail(){
        try {
          let response;

          if(this.type == 'private'){
            response = await axios.get(this.apiUrl+'teams/teamsheet-user/'+this.id, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              }
            });
          }else{
            response = await axios.get(this.apiUrl+'teams/'+this.id); // Realiza la solicitud con Axios
          }

          if(response.data.status == "success"){
            this.team = response.data.data; // Almacenar los datos recibidos

            if(this.type == 'private'){
              this.user = response.data.dataUser;

              this.form.playerName = this.user.name;
              this.form.trainerName = this.user.nickName;
            }

            this.teamJson = JSON.stringify(response.data.teamJson); // Convertir a JSON con formato
            this.teamJson = this.formatTeamPaste(this.teamJson); // Formatear el texto del equipo

            this.teamPaste = this.teamJson; // Asignar el texto formateado a teamPaste
          }else{
            Swal.fire({
              icon: 'error',
              title: this.$t('responseApisSeccion.oops'),
            text: this.$t('responseApisSeccion.loadingDataError'),
            })
          }

        } catch (err) {
          this.error = this.$t('responseApisSeccion.loadingDataError')
        } finally {
          this.isLoading = false; // Finaliza la carga
        }

      },

      async printSelected() {
        if (!this.selectedLanguage) {
          Swal.fire({
            icon: 'warning',
            title: 'Idioma requerido',
            text: 'Debes seleccionar un idioma antes de imprimir'
          });
          return;
        }

        if(this.teamPaste.length != 0){
          await generateTeamPDF({
            playerName: this.form.playerName,
            trainerName: this.form.trainerName,
            teamName: this.form.teamName,
            switchName: this.form.switchName,
            playerId: this.form.playerId,
            birth: this.form.birth,
            ageDivision: this.selectedCategory,
            sheet: this.selectedAction,
            lang: this.selectedLanguage,
            paste: this.teamPaste
          })
        }else{
          Swal.fire({
            icon: 'warning',
            title: 'Equipo requerido',
            text: 'Debes pegar un paste antes de imprimir'
          })
        }

      },

      loadFromLocalStorage() {
        const saved = localStorage.getItem('teamsheetForm');

        if (saved) {
          const data = JSON.parse(saved);

          this.form.playerName = data.playerName || '';
          this.form.trainerName = data.trainerName || '';
          this.form.switchName = data.switchName || '';
          this.form.playerId = data.playerId || '';
          this.form.birth = data.birth || '';
          this.saveInBrowser = true; // marcar checkbox automáticamente
        }
      }
    },
    mounted() {
      this.loadFromLocalStorage();
      if(this.id){
        this.getTeamDetail();
      }else{
        this.isLoading = false;
      }
    },
  }
</script>

<style scoped>

  .form-card {
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }

  /* modo claro */
  .form-card {
    background-color: #ffffff;
  }

  /* modo oscuro */
  .dark-card {
    background-color: #333;
    color: #ffffff;
  }

  select.form-control {
    cursor: pointer;
  }

  .dark-card {
    background-color: #333;
    box-shadow: 0 4px 10px rgba(255, 255, 255, 0.1);
  }

  .dark-card label,
  .dark-card p,
  .dark-card h4 {
    color: #ffffff;
  }

  /* HEADER */
  .paste-header {
    margin-bottom: 15px;
  }

  .icon {
    width: 60px;
    margin-bottom: 10px;
  }

  /* TEXTAREA */
  .custom-textarea {
    width: 100%;
    height: 450px;
    border-radius: 10px;
    padding: 15px;
    border: 1px solid #ccc;
  }

  .dark-input,
  .dark-card .custom-textarea {
    background-color: #444;
    color: #fff;
    border: 1px solid #555;
  }

  /* FORM */
  .form-group {
    margin-bottom: 1rem;
  }

  label {
    font-weight: bold;
    margin-bottom: 5px;
  }

  .form-control {
    border-radius: 5px;
    padding: 10px;
  }

  /* BUTTONS */
  .category-buttons,
  .action-buttons {
    margin-top: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  /* LANGUAGES */
  .language-section {
    margin-top: 25px;
  }

  .language-item {
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 6px;
    text-align: center;
    cursor: pointer;
    background: #e4e6eb;
  }

  .dark-item {
    background: #555;
    color: white;
  }

  .language-item.selected {
    background: linear-gradient(90deg, #7b2ff7, #00c6ff);
    color: white;
  }

  /* PRINT */
  .print-section {
    margin-top: 25px;
  }

  .dark-input[type="date"] {
    color-scheme: dark;
  }

</style>