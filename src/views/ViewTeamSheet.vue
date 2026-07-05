<template>
  <div>
    <!-- TÍTULO -->

    <div class="paste-header text-center">
      <h4>{{ $t('teamsheetGenerator') }}</h4>
      <h5>{{ $t('teamSheetSection.subtittle') }}</h5>
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


            <!-- SWITCH -->
            <div class="mode-switch">
              <button
                :class="{ active: inputMode === 'paste' }"
                @click="inputMode = 'paste'"
              >Paste
              </button>
              <button
                :class="{ active: inputMode === 'manual' }"
                @click="inputMode = 'manual'"
              >
                Manual
              </button>
            </div>
            <!-- PASTE MODE -->
            <textarea
              v-if="inputMode === 'paste'"
              v-model="teamPaste"
              class="custom-textarea"
              placeholder="Showdown team paste here"
            ></textarea>

            <!-- MANUAL MODE -->
            <div 
              v-if="inputMode === 'manual'"
              class="pokemon-inputs"
            >
              <div
                v-for="(pokemon, index) in pokemonList"
                :key="index"
                class="pokemon-row autocomplete"
              >
                <input
                  v-model="pokemon.name"
                  class="pokemon-input"
                  :placeholder="`Pokemon ${index + 1}`"
                  @input="onPokemonInput(index)"
                  @focus="
                    activeAutocompleteId = index;
                    activeSuggestionIndex = -1
                  "
                  @keydown="
                    onKeyDown(
                      $event,
                      suggestions[index],
                      (selected) => selectPokemon(index, selected)
                    )
                  "
                />
                <!-- Suggestions -->
                <ul
                  v-if="
                    suggestions[index]?.length &&
                    activeAutocompleteId === index
                  "
                  class="suggestions"
                >
                  <li
                    v-for="(pokemonSuggestion, idx) in suggestions[index]"
                    :key="pokemonSuggestion.id"
                    class="suggestion-item"
                    :class="{ active: idx === activeSuggestionIndex }"
                    @mousedown.prevent="selectPokemon(index, pokemonSuggestion)"
                  >
                    <img
                      :src="pokemonSuggestion.imageUrl"
                      class="pokemon-thumb"
                    />
                    {{ pokemonSuggestion.name }}
                  </li>
                </ul>

                <!-- Botón desplegable -->
                <button
                  class="expand-button"
                  @click="pokemon.open = !pokemon.open"
                >
                  {{ pokemon.open ? '▲' : '▼' }}
                </button>
                <!-- Datos extra -->
                <div 
                  v-if="pokemon.open"
                  class="pokemon-details"
                >
                  <!-- Nature independiente -->
                  <div class="autocomplete">
                    <input
                      v-model="pokemon.nature"
                      placeholder="Nature"
                      class="pokemon-input nature-input"
                      @input="onNatureInput(index)"
                      @focus="activeNatureAutocomplete=index"
                    />
                    <ul
                      v-if="
                        natureSuggestions[index]?.length &&
                        activeNatureAutocomplete === index
                      "
                      class="suggestions"
                    >
                      <li
                        v-for="nature in natureSuggestions[index]"
                        :key="nature.id"
                        class="suggestion-item"
                        @mousedown.prevent="selectNature(index,nature)"
                      >
                      {{ nature.name }}
                      </li>
                    </ul>
                  </div>

                  <div class="pokemon-info-container">
                    <!-- Datos -->
                    <div class="pokemon-data">
                      
                      <!-- Ability con autocomplete -->
                      <div class="autocomplete">
                        <input
                          v-model="pokemon.ability"
                          placeholder="Ability"
                          class="pokemon-input ability-input"
                          @input="onAbilityInput(index)"
                          @focus="activeAbilityAutocomplete=index"
                        />
                        <ul
                          v-if="
                            abilitySuggestions[index]?.length &&
                            activeAbilityAutocomplete === index
                          "
                          class="suggestions"
                        >
                          <li
                            v-for="ability in abilitySuggestions[index]"
                            :key="ability.id"
                            class="suggestion-item"
                            @mousedown.prevent="selectAbility(index,ability)"
                          >
                          {{ ability.name }}
                          </li>
                        </ul>
                      </div>
                      
                      <!-- Item con autocomplete -->
                      <div class="autocomplete">
                        <input
                          v-model="pokemon.item"
                          placeholder="Item"
                          class="pokemon-input item-input"
                          @input="onItemInput(index)"
                          @focus="activeItemAutocomplete=index"
                        />
                        <ul
                          v-if="
                            itemSuggestions[index]?.length &&
                            activeItemAutocomplete === index
                          "
                          class="suggestions"
                        >
                          <li
                            v-for="item in itemSuggestions[index]"
                            :key="item.id"
                            class="suggestion-item"
                            @mousedown.prevent="selectItem(index,item)"
                          >
                          {{ item.name }}
                          </li>
                        </ul>
                      </div>


                      <div
                        v-for="move in 4"
                        :key="move"
                        class="autocomplete"
                      >
                        <input
                          v-model="pokemon.moves[move-1]"
                          :placeholder="`Move ${move}`"
                          class="pokemon-input"
                          @input="onMoveInput(index, move-1)"
                          @focus="
                            activeMoveAutocomplete={
                              pokemon:index,
                              move:move-1
                            }
                          "
                        />

                        <ul
                          v-if="
                          moveSuggestions[index] &&
                          moveSuggestions[index][move-1]?.length &&
                          activeMoveAutocomplete.pokemon === index &&
                          activeMoveAutocomplete.move === move-1
                          "
                          class="suggestions"
                        >
                          <li
                            v-for="suggestion in moveSuggestions[index][move-1]"
                            :key="suggestion.id"
                            class="suggestion-item"
                            @mousedown.prevent="
                            selectMove(index,move-1,suggestion)
                            "
                          >
                            {{ suggestion.name }}
                          </li>
                        </ul>
                      </div>

                    </div>
                    
                    <!-- IVs -->
                    <div class="ivs-container">
                      <div
                        v-for="stat in stats"
                        :key="stat.key"
                        class="stat-row"
                      >
                        <label>
                          {{ stat.name }}
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="400"
                          v-model.number="pokemon.ivs[stat.key]"
                          class="pokemon-input iv-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

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
            <div class="row">

              <div class="col-6">
                <button 
                  class="btn btn-success w-100"
                  @click="printSelected"
                  :disabled="loadingPrint"
                >
                  <span v-if="loadingPrint">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Generando...
                  </span>
                  <span v-else>
                    {{ $t('teamSheetSection.printTeamSheet') }}
                  </span>
                </button>
              </div>

              <div class="col-6">
                <button 
                  class="btn btn-info w-100"
                  @click="printSelectedST"
                  :disabled="loadingPrintST"
                >
                  <span v-if="loadingPrintST">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    Generando...
                  </span>
                  <span v-else>
                    {{ $t('teamSheetSection.printEmptyTeamSheet') }}
                  </span>
                </button>
              </div>

            </div>
          </div>

            <!-- SAVE IN BROWSER -->
            <div class="form-group mt-3 text-center">
              <input
                type="checkbox"
                id="saveData"
                v-model="saveInBrowser"
              />
              <label for="saveData" class="ml-2">
                {{ $t('saveInBrowser') }}
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
  import { useHead } from '@vueuse/head';

  import { generateTeamPDF } from '../utils/imprimirTeamSheet';
  import { createEvent } from "@/services/eventService";

  //Natures
  //import NaturesTranslator from '../utils/resources/Natures/TranslatorNatures';
  import NaturesEs from '../utils/resources/Natures/NaturesEs';
  import NaturesEn from '../utils/resources/Natures/NaturesEn';
  import NaturesFre from '../utils/resources/Natures/NaturesFre';
  import NaturesGer from '../utils/resources/Natures/NaturesGer';
  import NaturesIta from '../utils/resources/Natures/NaturesIta';

  //habilities
  import AbilitiesEs from '../utils/resources/Abilities/AbilitiesEs';
  import AbilitiesEn from '../utils/resources/Abilities/AbilitiesEn';
  import AbilitiesFre from '../utils/resources/Abilities/AbilitiesFre';
  import AbilitiesGer from '../utils/resources/Abilities/AbilitiesGer';
  import AbilitiesIta from '../utils/resources/Abilities/AbilitiesIta';

  //Items
  import ItemsEs from '../utils/resources/Items/ItemsEs';
  import ItemsEn from '../utils/resources/Items/ItemsEn';
  import ItemsFre from '../utils/resources/Items/ItemsFre';
  import ItemsGer from '../utils/resources/Items/ItemsGer';
  import ItemsIta from '../utils/resources/Items/ItemsIta';

  //movs
  import MovesEs from '../utils/resources/Moves/MovesEs';
  import MovesEn from '../utils/resources/Moves/MovesEn';
  import MovesFre from '../utils/resources/Moves/MovesFre';
  import MovesGer from '../utils/resources/Moves/MovesGer';
  import MovesIta from '../utils/resources/Moves/MovesIta';

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

        selectedLanguage: 'Es',

        categories: [
          { label: 'Junior', value: 0 },
          { label: 'Senior', value: 1 },
          { label: 'Master', value: 2 }
        ],
        selectedCategory: 2,

        selectedAction: 'open',

        languages: [
          //{ label: 'Traditional Chinese', value: 'Cht' },
          //{ label: 'Simplified Chinese', value: 'Chs' },
          { label: 'English', value: 'En' },
          { label: 'Spanish', value: 'Es' },
          { label: 'French', value: 'Fre' },
          { label: 'German', value: 'Ger' },
          { label: 'Italian', value: 'Ita' },
          //{ label: 'Japanese', value: 'Jpn' },
          //{ label: 'Korean', value: 'Kor' }
        ],

        natureLanguages: {
          Es: NaturesEs,
          En: NaturesEn,
          Fre: NaturesFre,
          Ger: NaturesGer,
          Ita: NaturesIta
        },

        natureSuggestions: [],
        activeNatureAutocomplete:null,

        abilityLanguages: {
          Es: AbilitiesEs,
          En: AbilitiesEn,
          Fre: AbilitiesFre,
          Ger: AbilitiesGer,
          Ita: AbilitiesIta
        },
        abilitySuggestions: [],
        activeAbilityAutocomplete:null,

        itemLanguages: {
          Es: ItemsEs,
          En: ItemsEn,
          Fre: ItemsFre,
          Ger: ItemsGer,
          Ita: ItemsIta
        },
        itemSuggestions: [],
        activeItemAutocomplete:null,

        moveLanguages:{
          Es: MovesEs,
          En: MovesEn,
          Fre: MovesFre,
          Ger: MovesGer,
          Ita: MovesIta
        },

        moveSuggestions: [],
        activeMoveAutocomplete:{
          pokemon:null,
          move:null
        },

        team: {},
        user: {},
        teamJson: '',

        isLoading: true, // Controla el estado de carga

        saveInBrowser: false,
        loadingPrint: false,
        loadingPrintST: false,

        inputMode: 'paste',

        stats:[
          {
            key:'hp',
            name:'HP'
          },
          {
            key:'atk',
            name:'Atk'
          },
          {
            key:'def',
            name:'Def'
          },
          {
            key:'spatk',
            name:'SpA'
          },
          {
            key:'spdef',
            name:'SpD'
          },
          {
            key:'speed',
            name:'Speed'
          }
        ],

        listPokemons: [],

        pokemonList: [
          {
            name:'',
            open:false,
            nature:'',
            ability:'',
            item:'',
            moves:['','','',''],
            ivs:{
              hp:0,
              atk:0,
              def:0,
              spatk:0,
              spdef:0,
              speed:0
            }
          },
          {
            name:'',
            open:false,
            nature:'',
            ability:'',
            item:'',
            moves:['','','',''],
            ivs:{
              hp:0,
              atk:0,
              def:0,
              spatk:0,
              spdef:0,
              speed:0
            }
          },
          {
            name:'',
            open:false,
            nature:'',
            ability:'',
            item:'',
            moves:['','','',''],
            ivs:{
              hp:0,
              atk:0,
              def:0,
              spatk:0,
              spdef:0,
              speed:0
            }
          },
          {
            name:'',
            open:false,
            nature:'',
            ability:'',
            item:'',
            moves:['','','',''],
            ivs:{
              hp:0,
              atk:0,
              def:0,
              spatk:0,
              spdef:0,
              speed:0
            }
          },
          {
            name:'',
            open:false,
            nature:'',
            ability:'',
            item:'',
            moves:['','','',''],
            ivs:{
              hp:0,
              atk:0,
              def:0,
              spatk:0,
              spdef:0,
              speed:0
            }
          },
          {
            name:'',
            open:false,
            nature:'',
            ability:'',
            item:'',
            moves:['','','',''],
            ivs:{
              hp:0,
              atk:0,
              def:0,
              spatk:0,
              spdef:0,
              speed:0
            }
          }
        ],

        // Autocomplete
        suggestions: [],
        activeAutocompleteId: null,
        activeSuggestionIndex: -1,
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
      },
      
      allNatureList() {
        const langFile = this.natureLanguages[this.selectedLanguage];
        if(!langFile)
          return [];
        return Object.entries(langFile).map(([id,name]) => ({
          id,
          name
        }));
      },

      allItemList(){
        const langFile = this.itemLanguages[this.selectedLanguage];
        if(!langFile)
          return [];
        return Object.entries(langFile).map(([id,name]) => ({
            id,
            name
          }));
      },

      allAbilityList(){
        const langFile = this.abilityLanguages[this.selectedLanguage];
        if(!langFile)
          return [];
        return Object.entries(langFile).map(([id,name]) => ({
            id,
            name
          }));
      },

      allMoveList(){
        const langFile =
          this.moveLanguages[this.selectedLanguage];

        if(!langFile)
          return [];

        return Object.entries(langFile)
          .map(([id,name])=>({
            id,
            name
          }));
      },
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
          
            useHead({
              title: 'Print Team Sheet, team: ' + this.team.team_name, // Usa el nombre del Equipo en el título
              meta: [
                { name: 'description', content: `Detalles sobre ${this.team.team_name}` },
                { name: 'keywords', content: `${this.team.team_name}, Team, Tournament, VGC, Print Team Sheet ` },
                { name: 'og:title', content: 'Print Team Sheet, team: ' + this.team.team_name },
                { name: 'og:description', content: `Detalles sobre ${this.team.team_name}` },
                { name: 'og:regulation', content: `Regulation ${this.team.subFormatName}` },
                { name: 'og:format', content: `format VGC` },
              ]
            });
          
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
        if (this.loadingPrint) return; // evita doble click
        this.loadingPrint = true;

        try {
          if (!this.selectedLanguage) {
            Swal.fire({
              icon: 'warning',
              title: 'Idioma requerido',
              text: 'Debes seleccionar un idioma antes de imprimir'
            });
            return;
          }

          await createEvent({
            userAgent: navigator.userAgent,
            date: new Date().toISOString(),
            type: "print_team_sheet",
            description: "Usuario: " + this.form.playerName + " imprimió team sheet, tipo: " + this.selectedAction + ", idioma: " + this.selectedLanguage,
          });

          if(this.inputMode == 'manual'){
            let pasteTeam = this.convertToShowdown(this.pokemonList);
            console.log(pasteTeam);
            console.log('inputMode', this.inputMode);
            this.teamPaste = pasteTeam;
          }


          
          if (this.teamPaste.length != 0) {
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
              paste: this.teamPaste,
              onlyPdf: false,
              inputMode: this.inputMode,
            });
          } else {
            Swal.fire({
              icon: 'warning',
              title: 'Equipo requerido',
              text: 'Debes pegar un paste antes de imprimir'
            });
          }

        } catch (error) {
          console.error(error);
        } finally {
          this.loadingPrint = false; // 🔥 SIEMPRE se apaga
        }
      },

      async printSelectedST() {
        if (this.loadingPrintST) return;
        this.loadingPrintST = true;

        try {
          await createEvent({
            userAgent: navigator.userAgent,
            date: new Date().toISOString(),
            type: "print_team_sheet_blank",
            description: "Usuario: " + this.form.playerName + " imprimió team sheet blanco, tipo: " + this.selectedAction+", idioma: " + this.selectedLanguage,
            teamName: this.form.teamName || null
          });

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
            paste: this.teamPaste,
            onlyPdf: true,
            inputMode: this.inputMode
          });

        } catch (error) {
          console.error(error);
        } finally {
          this.loadingPrintST = false;
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
      },
      async loadPokemons() {
        const res = await axios.get(
          this.apiUrl+'pokemon-seeder'
        );
        this.listPokemons = res.data;
      },

      // ===============================
      // AUTOCOMPLETE POKEMON
      // ===============================

      onPokemonInput(index) {
        const query = this.pokemonList[index].name;
        if (!query || query.length < 2) {
          this.suggestions[index] = [];
          return;
        }

        this.suggestions[index] = this.listPokemons
          .filter(p =>
            p.name
              .toLowerCase()
              .includes(query.toLowerCase())
          )
          .slice(0,8);
      },

      selectPokemon(index, pokemon) {
        this.pokemonList[index] = {
          ...this.pokemonList[index],
          name: pokemon.name,
          id: pokemon.id
        };

        this.suggestions[index] = [];
        this.activeAutocompleteId = null;
        this.activeSuggestionIndex = -1;
      },

      onKeyDown(event, suggestionList, callback) {
        if(!suggestionList?.length)
          return;
        switch(event.key){
          case 'ArrowDown':
            event.preventDefault();
            this.activeSuggestionIndex =
              (this.activeSuggestionIndex + 1)
              % suggestionList.length;
          break;
          case 'ArrowUp':
            event.preventDefault();
            this.activeSuggestionIndex =
              (this.activeSuggestionIndex - 1 + suggestionList.length)
              % suggestionList.length;
          break;
          case 'Enter':
            event.preventDefault();
            if(this.activeSuggestionIndex >= 0){
              callback(
                suggestionList[this.activeSuggestionIndex]
              );
            }
          break;
          case 'Escape':
            this.closeSuggestions();
          break;
        }
      },

      closeSuggestions(){
        this.activeSuggestionIndex = -1;
        this.activeAutocompleteId = null;
      },

      handleClickOutside(event){
        if(!event.target.closest('.autocomplete')){
          this.closeSuggestions();
        }
      },


      // Automplete Nature
      onNatureInput(index){
        const value = this.pokemonList[index].nature.toLowerCase();
        if(!value){
          this.natureSuggestions[index] = [];
          return;
        }
        this.natureSuggestions[index] =
          this.allNatureList
          .filter(n =>
            n.name
            .toLowerCase()
            .includes(value)
          )
          .slice(0,8);
      },

      selectNature(index,nature){
        this.pokemonList[index].nature = nature.name;
        this.natureSuggestions[index]=[];
        this.activeNatureAutocomplete=null;
      },

      //autocomplete Ability
      onAbilityInput(index){
        const value = this.pokemonList[index].ability.toLowerCase();
        if(!value){
          this.abilitySuggestions[index] = [];
          return;
        }
        this.abilitySuggestions[index] =
          this.allAbilityList
          .filter(a =>
            a.name
            .toLowerCase()
            .includes(value)
          )
          .slice(0,8);
      },

      selectAbility(index,ability){
        this.pokemonList[index].ability = ability.name;
        this.abilitySuggestions[index]=[];
        this.activeAbilityAutocomplete=null;
      },

      // Automplete Item
      onItemInput(index){
        const value = this.pokemonList[index].item.toLowerCase();
        if(!value){
          this.itemSuggestions[index] = [];
          return;
        }
        this.itemSuggestions[index] =
          this.allItemList
          .filter(i =>
            i.name
            .toLowerCase()
            .includes(value)
          )
          .slice(0,8);
      },

      selectItem(index,item){
        this.pokemonList[index].item = item.name;
        this.itemSuggestions[index]=[];
        this.activeItemAutocomplete=null;
      },

      // Automplete Move
      onMoveInput(pokemonIndex, moveIndex){
        const value =
        this.pokemonList[pokemonIndex]
        .moves[moveIndex]
        .toLowerCase();
        if(!value){
          if(!this.moveSuggestions[pokemonIndex])
            this.moveSuggestions[pokemonIndex]=[];

          this.moveSuggestions[pokemonIndex][moveIndex]=[];
          return;
        }

        if(!this.moveSuggestions[pokemonIndex]) {
          this.moveSuggestions[pokemonIndex]=[];
        }

        this.moveSuggestions[pokemonIndex][moveIndex] =
        this.allMoveList .filter(move =>
            move.name
            .toLowerCase()
            .includes(value)
          ).slice(0,8);
      },

      selectMove(pokemonIndex,moveIndex,move){
        this.pokemonList[pokemonIndex].moves[moveIndex]=move.name;

        this.moveSuggestions[pokemonIndex][moveIndex]=[];

        this.activeMoveAutocomplete={
          pokemon:null,
          move:null
        };
      },
      convertToShowdown(team) {
        return team.map(pokemon => {
          const evs = Object.entries(pokemon.ivs)
            .filter((entry) => entry[1] > 0)
            .map(([stat, value]) => {
              const stats = {
                hp: "HP",
                atk: "Atk",
                def: "Def",
                spatk: "SpA",
                spdef: "SpD",
                speed: "Spe"
              };

              return `${value} ${stats[stat]}`;
            })
            .join(" / ");

          return `${pokemon.name} (M) @ ${pokemon.item}
      Ability: ${pokemon.ability}
      Level: 50
      EVs: ${evs}
      ${pokemon.nature} Nature
      ${pokemon.moves.map(move => `- ${move}`).join("\n")}
      `;
        }).join("\n");
      }
    },
    mounted() {
      this.loadFromLocalStorage();
      this.loadPokemons();
      if(this.id){
        this.getTeamDetail();
      }else{
        this.isLoading = false;
        useHead({
          title: 'Print Team Sheet', // Usa el nombre del Equipo en el título
          meta: [
            { name: 'description', content: `Print Team Sheet for Tournaments` },
            { name: 'keywords', content: `Team, Tournament, VGC, Team Sheet ` },
            { name: 'og:title', content: 'Team Sheet' },
            { name: 'og:description', content: `Print Team Sheet for Tournaments` },
            { name: 'og:format', content: `VGC` },
          ]
        });
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

  .mode-switch {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 15px 0;
  }


  .mode-switch button {
    padding: 8px 25px;
    border-radius: 20px;
    border: 1px solid #777;
    background: transparent;
    color: white;
    cursor: pointer;
  }


  .mode-switch button.active {
    background: #ffffff;
    color: #333;
  }


  .pokemon-inputs {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 10px;
  }


  .pokemon-input {
    width: 100%;
    padding: 12px;

    background: #444;
    border: 1px solid #666;
    border-radius: 8px;

    color: white;
    font-size: 16px;
  }


  .pokemon-input::placeholder {
    color: #aaa;
  }

  .pokemon-row {
    display:flex;
    align-items:flex-start;
    gap:8px;
    flex-wrap:wrap;
  }


  .pokemon-input {
    flex:1;
    padding:12px;

    background:#444;
    border:1px solid #666;
    border-radius:8px;

    color:white;
  }


  .expand-button {

    width:42px;
    height:42px;

    border-radius:50%;
    border:1px solid #777;

    background:#333;
    color:white;

    cursor:pointer;
  }



  .pokemon-details {
    width:100%;
    padding-top:15px;
  }



  .nature-input {
    margin-bottom:15px;
  }



  .pokemon-info-container {
    display:flex;
    gap:15px;
  }



  /* IVs */
  .ivs-container {
    width:120px;
    display:flex;
    flex-direction:column;
    gap:10px;
  }


  .stat-row {
    display:flex;
    align-items:center;
    gap:8px;
  }


  .stat-row label {
    width:35px;
    font-size:12px;
    color:#ccc;
  }


  .iv-input {
    width:100%;
    padding:12px;
    background:#444;
    border:1px solid #666;
    border-radius:8px;
    color:white;
    font-size:16px;
    box-sizing:border-box;
  }

  /* Datos */
  .pokemon-data {
    flex:1;
    display:flex;
    flex-direction:column;
    gap:10px;
  }

  
  /* ===== Grid ===== */
  .pokemon-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }


  /* ===== Autocomplete ===== */
  .autocomplete {
    position: relative;
    width: 100%;
  }


  /* Input */
  .autocomplete .input,
  .autocomplete .pokemon-input {
    width: 100%;
    box-sizing: border-box;
  }


  /* ===== Suggestions ===== */
  .suggestions {

    position: absolute;

    top: calc(100% + 4px);
    left: 0;

    width: 100%;

    max-height: 220px;
    overflow-y: auto;


    background: #2c2c2c;

    border: 1px solid #444;

    border-radius: 8px;


    list-style: none;

    padding: 4px 0;

    margin: 0;


    z-index: 999;


    box-sizing: border-box;

  }


  /* Items */
  .suggestion-item {

    display: flex;

    align-items: center;

    gap: 8px;


    padding: 8px 10px;


    cursor: pointer;


    box-sizing: border-box;

  }


  .suggestion-item:hover,
  .suggestion-item.active {

    background: rgba(52,152,219,.25);

  }


  /* Imagen */
  .pokemon-thumb {

    width: 32px;

    height: 32px;

    object-fit: contain;

  }

</style>