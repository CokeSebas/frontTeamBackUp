<template>
  <main
    class="teamsheet-page"
    :class="{ 'theme-dark': mode === 'dark' }"
  >
    <!-- TÍTULO -->

    <header class="teamsheet-page-header">
      <h1>{{ $t('teamsheetGenerator') }}</h1>
      <p>{{ $t('teamSheetSection.subtittle') }}</p>
    </header>

    <div class="teamsheet-container">
      <section
        v-if="isLoading"
        class="teamsheet-state-card"
        aria-label="Cargando team sheet"
        aria-live="polite"
        aria-busy="true"
      >
        <img
          v-if="gifLoading"
          :src="gifLoading"
          class="teamsheet-loading-image"
          alt="Cargando team sheet"
        >
        <span
          v-else
          class="teamsheet-loading-spinner"
          aria-hidden="true"
        ></span>
      </section>

      <section
        v-else-if="error"
        class="teamsheet-state-card"
        role="alert"
      >
        <h2>{{ $t('responseApisSeccion.oops') }}</h2>
        <p>{{ error }}</p>

        <button
          type="button"
          class="btn btn-primary"
          @click="getTeamDetail"
        >
          Reintentar
        </button>
      </section>

      <div v-else class="teamsheet-layout">

        <!-- LEFT -->
        <div class="col-md-6 d-flex align-items-stretch">
          <div :class="['form-card w-100', { 'dark-card': mode === 'dark' }]">

            <div class="paste-header text-center">
              <h4>{{ $t('teamSheetSection.pasteTeamSheet') }}</h4>
            </div>


            <!-- SWITCH -->
            <div class="mode-switch" role="tablist" aria-label="Método de ingreso">
              <button
                type="button"
                role="tab"
                :class="{ active: inputMode === 'paste' }"
                :aria-pressed="inputMode === 'paste'"
                @click="inputMode = 'paste'"
              >
                Paste
              </button>

              <button
                type="button"
                role="tab"
                :class="{ active: inputMode === 'manual' }"
                :aria-pressed="inputMode === 'manual'"
                @click="inputMode = 'manual'"
              >
                Manual
              </button>

              <button
                type="button"
                role="tab"
                :class="{ active: inputMode === 'images' }"
                :aria-pressed="inputMode === 'images'"
                @click="inputMode = 'images'"
              >
                Images
              </button>
            </div>
            <!-- PASTE MODE -->
            <textarea
              v-if="inputMode === 'paste'"
              v-model="teamPaste"
              class="custom-textarea"
              placeholder="Showdown team paste here"
              aria-label="Showdown team paste"
              spellcheck="false"
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
                  :aria-label="`Pokemon ${index + 1}`"
                  autocomplete="off"
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
                      :alt="pokemonSuggestion.name"
                      loading="lazy"
                    >
                    {{ pokemonSuggestion.name }}
                  </li>
                </ul>

                <!-- Botón desplegable -->
                <button
                  type="button"
                  class="expand-button"
                  :aria-expanded="pokemon.open"
                  :aria-label="
                    (pokemon.open
                      ? 'Ocultar detalles de '
                      : 'Mostrar detalles de ') +
                    (pokemon.name || `Pokemon ${index + 1}`)
                  "
                  @click="pokemon.open = !pokemon.open"
                >
                  <span aria-hidden="true">
                    {{ pokemon.open ? '▲' : '▼' }}
                  </span>
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
                      aria-label="Nature"
                      autocomplete="off"
                      @input="onNatureInput(index)"
                      @focus="
                        activeNatureAutocomplete = index;
                        activeSuggestionIndex = -1
                      "
                      @keydown="
                        onKeyDown(
                          $event,
                          natureSuggestions[index],
                          (selected) => selectNature(index, selected)
                        )
                      "
                    >
                    <ul
                      v-if="
                        natureSuggestions[index]?.length &&
                        activeNatureAutocomplete === index
                      "
                      class="suggestions"
                    >
                      <li
                        v-for="(nature, idx) in natureSuggestions[index]"
                        :key="nature.id"
                        class="suggestion-item"
                        :class="{ active: idx === activeSuggestionIndex }"
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
                          aria-label="Ability"
                          autocomplete="off"
                          @input="onAbilityInput(index)"
                          @focus="
                            activeAbilityAutocomplete = index;
                            activeSuggestionIndex = -1
                          "
                          @keydown="
                            onKeyDown(
                              $event,
                              abilitySuggestions[index],
                              (selected) => selectAbility(index, selected)
                            )
                          "
                        >
                        <ul
                          v-if="
                            abilitySuggestions[index]?.length &&
                            activeAbilityAutocomplete === index
                          "
                          class="suggestions"
                        >
                          <li
                            v-for="(ability, idx) in abilitySuggestions[index]"
                            :key="ability.id"
                            class="suggestion-item"
                            :class="{ active: idx === activeSuggestionIndex }"
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
                          aria-label="Item"
                          autocomplete="off"
                          @input="onItemInput(index)"
                          @focus="
                            activeItemAutocomplete = index;
                            activeSuggestionIndex = -1
                          "
                          @keydown="
                            onKeyDown(
                              $event,
                              itemSuggestions[index],
                              (selected) => selectItem(index, selected)
                            )
                          "
                        >
                        <ul
                          v-if="
                            itemSuggestions[index]?.length &&
                            activeItemAutocomplete === index
                          "
                          class="suggestions"
                        >
                          <li
                            v-for="(item, idx) in itemSuggestions[index]"
                            :key="item.id"
                            class="suggestion-item"
                            :class="{ active: idx === activeSuggestionIndex }"
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
                          :aria-label="`Move ${move}`"
                          autocomplete="off"
                          @input="onMoveInput(index, move - 1)"
                          @focus="
                            activeMoveAutocomplete = {
                              pokemon: index,
                              move: move - 1
                            };
                            activeSuggestionIndex = -1
                          "
                          @keydown="
                            onKeyDown(
                              $event,
                              moveSuggestions[index]?.[move - 1],
                              (selected) => selectMove(index, move - 1, selected)
                            )
                          "
                        >

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
                            v-for="(suggestion, idx) in moveSuggestions[index][move - 1]"
                            :key="suggestion.id"
                            class="suggestion-item"
                            :class="{ active: idx === activeSuggestionIndex }"
                            @mousedown.prevent="
                              selectMove(index, move - 1, suggestion)
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
                          :aria-label="
                            `${stat.name} de ` +
                            (pokemon.name || `Pokemon ${index + 1}`)
                          "
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- IMAGES MODE -->
            <div
              v-if="inputMode === 'images'"
              class="image-upload-container"
            >

              <!-- Datos varios -->
              <div class="upload-card">

                <h5>1. {{ $t('teamSheetSection.datosImg1') }}</h5>

                <div class="preview-toolbar">
                  <button
                    type="button"
                    class="preview-tab"
                    :class="{ active: imagePreviewMode.info === 'example' }"
                    :aria-pressed="imagePreviewMode.info === 'example'"
                    @click="imagePreviewMode.info = 'example'"
                  >
                    {{ $t('teamSheetSection.textExample') }}
                  </button>

                  <button
                    type="button"
                    class="preview-tab"
                    :class="{ active: imagePreviewMode.info === 'selected' }"
                    :aria-pressed="imagePreviewMode.info === 'selected'"
                    :disabled="!teamImagePreviews.info"
                    @click="imagePreviewMode.info = 'selected'"
                  >
                    {{ $t('teamSheetSection.textYourTeam') }}
                  </button>
                </div>

                <div class="upload-preview-frame">
                  <span class="preview-badge">
                    {{
                      imagePreviewMode.info === 'selected' &&
                      teamImagePreviews.info
                        ? 'Selected image'
                        : 'Example'
                    }}
                  </span>

                  <img
                    v-if="
                      imagePreviewMode.info === 'selected' &&
                      teamImagePreviews.info
                    "
                    :src="teamImagePreviews.info"
                    class="upload-example"
                    alt="Selected Team Information"
                  >

                  <img
                    v-else
                    src="@/assets/examples/team-info-example.jpg"
                    class="upload-example"
                    alt="Example Team Information"
                  >
                </div>

                <div
                  v-if="teamImageDetails.info"
                  class="selected-image-info"
                >
                  <div class="selected-image-copy">
                    <strong>{{ teamImageDetails.info.name }}</strong>
                    <span>
                      {{ teamImageDetails.info.width }} ×
                      {{ teamImageDetails.info.height }} px ·
                      {{ formatFileSize(teamImageDetails.info.size) }}
                    </span>
                  </div>

                  <button
                    type="button"
                    class="remove-image-button"
                    @click="removeSelectedImage('info')"
                  >
                    Remove
                  </button>
                </div>

                <p class="upload-description">
                  {{ $t('teamSheetSection.imgTeam1') }}
                </p>

                <input
                  ref="infoImageInput"
                  type="file"
                  accept=".jpg,.jpeg,.jfif,.png,.webp,image/jpeg,image/png,image/webp"
                  class="form-control mt-3"
                  aria-label="Seleccionar imagen de datos varios"
                  @change="onImageSelected($event, 'info')"
                >

              </div>

              <!-- Características -->
              <div class="upload-card">

                <h5>2. {{ $t('teamSheetSection.datosImg2') }}</h5>

                <div class="preview-toolbar">
                  <button
                    type="button"
                    class="preview-tab"
                    :class="{ active: imagePreviewMode.stats === 'example' }"
                    :aria-pressed="imagePreviewMode.stats === 'example'"
                    @click="imagePreviewMode.stats = 'example'"
                  >
                    Example
                  </button>

                  <button
                    type="button"
                    class="preview-tab"
                    :class="{ active: imagePreviewMode.stats === 'selected' }"
                    :aria-pressed="imagePreviewMode.stats === 'selected'"
                    :disabled="!teamImagePreviews.stats"
                    @click="imagePreviewMode.stats = 'selected'"
                  >
                    Your image
                  </button>
                </div>

                <div class="upload-preview-frame">
                  <span class="preview-badge">
                    {{
                      imagePreviewMode.stats === 'selected' &&
                      teamImagePreviews.stats
                        ? 'Selected image'
                        : 'Example'
                    }}
                  </span>

                  <img
                    v-if="
                      imagePreviewMode.stats === 'selected' &&
                      teamImagePreviews.stats
                    "
                    :src="teamImagePreviews.stats"
                    class="upload-example"
                    alt="Selected Team Stats"
                  >

                  <img
                    v-else
                    src="@/assets/examples/team-stats-example.jpg"
                    class="upload-example"
                    alt="Example Team Stats"
                  >
                </div>

                <div
                  v-if="teamImageDetails.stats"
                  class="selected-image-info"
                >
                  <div class="selected-image-copy">
                    <strong>{{ teamImageDetails.stats.name }}</strong>
                    <span>
                      {{ teamImageDetails.stats.width }} ×
                      {{ teamImageDetails.stats.height }} px ·
                      {{ formatFileSize(teamImageDetails.stats.size) }}
                    </span>
                  </div>

                  <button
                    type="button"
                    class="remove-image-button"
                    @click="removeSelectedImage('stats')"
                  >
                    Remove
                  </button>
                </div>

                <p class="upload-description">
                  {{ $t('teamSheetSection.imgTeam2') }}
                </p>

                <input
                  ref="statsImageInput"
                  type="file"
                  accept=".jpg,.jpeg,.jfif,.png,.webp,image/jpeg,image/png,image/webp"
                  class="form-control mt-3"
                  aria-label="Seleccionar imagen de características"
                  @change="onImageSelected($event, 'stats')"
                >

              </div>

              <button
                type="button"
                class="btn btn-success upload-process-button"
                :disabled="
                  !teamImages.info ||
                  !teamImages.stats ||
                  processingImages
                "
                @click="uploadImages"
              >
                <span v-if="processingImages">
                  <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                  {{ $t('teamSheetSection.loadingProccess') }}
                </span>
                <span v-else>
                  {{ $t('teamSheetSection.buttonProccess') }}
                </span>
              </button>

            </div>

          </div>
        </div>

        <!-- RIGHT -->
        <div class="col-md-6 d-flex align-items-stretch">
          <div :class="['form-card w-100', { 'dark-card': mode === 'dark' }]">

            <!-- FORM -->
            <div class="row">
              <div
                v-for="field in fields"
                :key="field.key"
                class="form-group col-12 col-md-6"
              >
                <div class="field-label-container">
                  <label :for="`teamsheet-${field.key}`">
                    {{ field.label || $t(field.labelKey) }}
                  </label>

                  <span
                    v-if="field.tooltip"
                    class="field-tooltip"
                  >
                    <button
                      type="button"
                      class="field-tooltip__button"
                      :aria-label="`Información sobre ${field.label || $t(field.labelKey)}`"
                      :aria-describedby="`tooltip-${field.key}`"
                    >
                      ?
                    </button>

                    <span
                      :id="`tooltip-${field.key}`"
                      class="field-tooltip__content"
                      role="tooltip"
                    >
                      {{ field.tooltip }}
                    </span>
                  </span>
                </div>

                <input
                  :id="`teamsheet-${field.key}`"
                  v-model="form[field.key]"
                  :type="field.type"
                  :name="field.key"
                  :min="field.min"
                  :max="field.max"
                  :step="field.step"
                  :placeholder="field.placeholder"
                  class="form-control"
                  :class="{ 'dark-input': mode === 'dark' }"
                />
              </div>
            </div>

            <!-- CATEGORY -->
            <fieldset class="option-group">
              <legend>
                {{ $t('teamSheetSection.selectAgeDivision') }}
              </legend>

              <div class="choice-grid choice-grid--three">
                <button
                  v-for="cat in categories"
                  :key="cat.value"
                  type="button"
                  class="btn"
                  :class="
                    selectedCategory === cat.value
                      ? 'btn-primary'
                      : 'btn-secondary'
                  "
                  :aria-pressed="selectedCategory === cat.value"
                  @click="selectCategory(cat.value)"
                >
                  {{ cat.label }}
                </button>
              </div>
            </fieldset>

            <!-- ACTIONS -->
            <fieldset class="option-group">
              <legend>
                {{ $t('teamSheetSection.selectTypeSheet') }}
              </legend>

              <div class="choice-grid choice-grid--two">
                <button
                  type="button"
                  class="btn"
                  :class="
                    selectedAction === 'open'
                      ? 'btn-primary'
                      : 'btn-secondary'
                  "
                  :aria-pressed="selectedAction === 'open'"
                  @click="selectAction('open')"
                >
                  Open Team List
                </button>

                <button
                  type="button"
                  class="btn"
                  :class="
                    selectedAction === 'staff'
                      ? 'btn-primary'
                      : 'btn-secondary'
                  "
                  :aria-pressed="selectedAction === 'staff'"
                  @click="selectAction('staff')"
                >
                  Staff Team List
                </button>
              </div>
            </fieldset>
            
            <!-- LANGUAGES -->
            <div class="form-group mt-3">
              <label for="teamsheet-language">{{ $t('language') }}</label>

              <select
                id="teamsheet-language"
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
            <div class="print-actions">

              <div>
                <button type="button" 
                  class="btn btn-success w-100"
                  @click="printSelected"
                  :disabled="isPrinting"
                >
                  <span v-if="loadingPrint">
                    <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                    Generando...
                  </span>
                  <span v-else>
                    {{ $t('teamSheetSection.printTeamSheet') }}
                  </span>
                </button>
              </div>

              <div>
                <button type="button" 
                  class="btn btn-info w-100"
                  @click="printSelectedST"
                  :disabled="isPrinting"
                >
                  <span v-if="loadingPrintST">
                    <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
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
            <div class="save-browser-option">
              <input
                id="teamsheet-save-data"
                v-model="saveInBrowser"
                type="checkbox"
              >
              <label for="teamsheet-save-data">
                {{ $t('saveInBrowser') }}
              </label>
            </div>

          </div>
        </div>

      </div>
    </div>

  </main>
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

  const createEmptyPokemon = () => ({
    name: '',
    open: false,
    nature: '',
    ability: '',
    item: '',
    moves: ['', '', '', ''],
    ivs: {
      hp: 0,
      atk: 0,
      def: 0,
      spatk: 0,
      spdef: 0,
      speed: 0
    }
  });

  export default {
    inject: {
      apiUrl: {
        from: 'apiUrl',
        default: ''
      },
      gifLoading: {
        from: 'gifLoading',
        default: ''
      },
      mode: {
        from: 'mode',
        default: 'light'
      }
    },
    name: 'ViewTeamSheet',
    props: {
      id: {
        type: String,
        default: ''
      },
      type: {
        type: String,
        default: 'public',
        validator: value => ['public', 'private'].includes(value)
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
          supportId: '',
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

        isLoading: true,
        error: '',

        saveInBrowser: false,
        loadingPrint: false,
        loadingPrintST: false,

        inputMode: 'paste',

        teamImages: {
          info: null,
          stats: null
        },

        teamImagePreviews: {
          info: null,
          stats: null
        },

        teamImageDetails: {
          info: null,
          stats: null
        },

        imagePreviewMode: {
          info: 'example',
          stats: 'example'
        },

        processingImages: false,

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

        pokemonList: Array.from(
          { length: 6 },
          () => createEmptyPokemon()
        ),

        // Autocomplete
        suggestions: [],
        activeAutocompleteId: null,
        activeSuggestionIndex: -1,
      }
    },
    computed: {
      fields() {
        return [
          {
            labelKey: 'teamSheetSection.playerName',
            key: 'playerName',
            type: 'text',
          },
          {
            labelKey: 'teamSheetSection.trainerName',
            key: 'trainerName',
            type: 'text',
            tooltip: this.$t('teamSheetSection.tipNickTrainer')
          },
          {
            labelKey: 'teamSheetSection.teamName',
            key: 'teamName',
            type: 'text',
            tooltip: this.$t('teamSheetSection.tipNameTeam')
          },
          {
            labelKey: 'teamSheetSection.switchName',
            key: 'switchName',
            type: 'text',
            tooltip: this.$t('teamSheetSection.tipNameSwitch')
          },
          {
            labelKey: 'teamSheetSection.playerId',
            key: 'playerId',
            type: 'text',
            tooltip: this.$t('teamSheetSection.tipIdPlayer')
          },
          {
            labelKey: 'teamSheetSection.birth',
            key: 'birth',
            type: 'number',
            min: 1900,
            max: new Date().getFullYear(),
            step: 1,
          },
          {
            label: 'Support ID',
            key: 'supportId',
            type: 'text',
            tooltip: this.$t('teamSheetSection.tipSupportId')
          }
        ];
      },

      isPrinting() {
        return this.loadingPrint || this.loadingPrintST;
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
          if (!this.saveInBrowser) {
            return;
          }

          this.persistForm(newVal);
        },
        deep: true
      },

      saveInBrowser(value) {
        if (value) {
          this.persistForm(this.form);
          return;
        }

        try {
          localStorage.removeItem('teamsheetForm');
        } catch (error) {
          console.warn('No se pudo eliminar el formulario guardado:', error);
        }
      },

      id(newId, previousId) {
        if (newId === previousId) {
          return;
        }

        if (newId) {
          this.getTeamDetail();
          return;
        }

        this.team = {};
        this.teamJson = '';
        this.teamPaste = '';
        this.error = '';
        this.isLoading = false;
      },

      selectedLanguage() {
        this.clearAllSuggestions();
      }
    },
    methods: {
      buildApiUrl(path = '') {
        const baseUrl = String(this.apiUrl || '').replace(/\/+$/, '');
        const normalizedPath = String(path || '').replace(/^\/+/, '');

        return normalizedPath
          ? `${baseUrl}/${normalizedPath}`
          : baseUrl;
      },

      getStoredToken() {
        try {
          return localStorage.getItem('token') || '';
        } catch (error) {
          console.warn('No se pudo leer el token de sesión:', error);
          return '';
        }
      },

      persistForm(formData) {
        try {
          localStorage.setItem(
            'teamsheetForm',
            JSON.stringify({
              playerName: String(formData.playerName || ''),
              trainerName: String(formData.trainerName || ''),
              teamName: String(formData.teamName || ''),
              switchName: String(formData.switchName || ''),
              playerId: String(formData.playerId || ''),
              birth: String(formData.birth || ''),
              supportId: String(formData.supportId || '')
            })
          );
        } catch (error) {
          console.warn('No se pudo guardar el formulario:', error);
        }
      },

      async trackEventSafely(eventData) {
        try {
          await createEvent(eventData);
        } catch (error) {
          console.warn('No se pudo registrar el evento analítico:', error);
        }
      },

      selectCategory(category) {
        this.selectedCategory = category;
      },

      selectAction(action) {
        this.selectedAction = action;
      },

      formatTeamPaste(rawText) {
        let parsedText = rawText;

        if (typeof rawText === 'string') {
          try {
            parsedText = JSON.parse(rawText);
          } catch (error) {
            parsedText = rawText;
          }
        }

        if (
          parsedText &&
          typeof parsedText === 'object'
        ) {
          parsedText = JSON.stringify(
            parsedText,
            null,
            2
          );
        }

        return String(parsedText || '')
          .replace(/\\r\\n/g, '\n')
          .replace(/\\n/g, '\n')
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      },

      async getTeamDetail() {
        this.isLoading = true;
        this.error = '';

        try {
          const rawId = String(this.id || '').trim();

          if (!rawId) {
            throw new Error('TEAM_ID_REQUIRED');
          }

          const cleanId = encodeURIComponent(rawId);

          let response;

          if (this.type === 'private') {
            const token = this.getStoredToken();

            if (!token) {
              throw new Error('AUTH_REQUIRED');
            }

            response = await axios.get(
              this.buildApiUrl(`teams/teamsheet-user/${cleanId}`),
              {
                headers: {
                  Authorization: `Bearer ${token}`
                }
              }
            );
          } else {
            response = await axios.get(
              this.buildApiUrl(`teams/${cleanId}`)
            );
          }

          if (
            response?.data?.status !== 'success' ||
            !response?.data?.data
          ) {
            throw new Error('INVALID_TEAM_RESPONSE');
          }

          this.team = response.data.data;

          if (this.type === 'private') {
            this.user =
              response.data.dataUser || {};

            this.form.playerName =
              this.user.name || '';
            this.form.trainerName =
              this.user.nickName || '';
          }

          this.teamJson = this.formatTeamPaste(
            response.data.teamJson
          );
          this.teamPaste = this.teamJson;

          const teamName =
            this.team.team_name ||
            this.team.teamName ||
            'Team';

          if (!this.form.teamName && teamName !== 'Team') {
            this.form.teamName = String(teamName);
          }

          useHead({
            title: `Print Team Sheet, team: ${teamName}`,
            meta: [
              {
                name: 'description',
                content: `Detalles sobre ${teamName}`
              },
              {
                name: 'keywords',
                content:
                  `${teamName}, Team, Tournament, VGC, Print Team Sheet`
              },
              {
                property: 'og:title',
                content:
                  `Print Team Sheet, team: ${teamName}`
              },
              {
                property: 'og:description',
                content: `Detalles sobre ${teamName}`
              }
            ]
          });
        } catch (error) {
          console.error(
            'Error al cargar el team sheet:',
            error
          );

          if (error?.message === 'AUTH_REQUIRED') {
            this.error =
              'Debes iniciar sesión para acceder a este equipo privado.';
          } else if (error?.message === 'TEAM_ID_REQUIRED') {
            this.error = 'No se recibió un identificador de equipo válido.';
          } else {
            this.error =
              error?.response?.data?.message ||
              this.$t(
                'responseApisSeccion.loadingDataError'
              );
          }
        } finally {
          this.isLoading = false;
        }
      },

      async confirmPrintReview(isBlankSheet = false) {
        const message = isBlankSheet
          ? this.$t('teamSheetSection.textConfirm1')
          : this.$t('teamSheetSection.textConfirm2');

        const result = await Swal.fire({
          icon: 'warning',
          title: this.$t('teamSheetSection.textWarning1'),
          html: `
            <div style="text-align: left;">
              <p>${message}</p>
              <p style="margin-bottom: 0; font-weight: 600;">
                ${this.$t('teamSheetSection.textWarning2')}
              </p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: this.$t('teamSheetSection.buttonPrint1'),
          cancelButtonText: this.$t('teamSheetSection.buttonPrint2'),
          reverseButtons: true,
          allowOutsideClick: false,
          allowEscapeKey: false,
          focusCancel: true,
        });

        return result.isConfirmed;
      },

      async printSelected() {
        if (this.isPrinting) {
          return;
        }

        this.loadingPrint = true;

        try {
          if (!this.selectedLanguage) {
            await Swal.fire({
              icon: 'warning',
              title: 'Idioma requerido',
              text: 'Debes seleccionar un idioma antes de imprimir.'
            });
            return;
          }

          if (this.inputMode === 'images') {
            await Swal.fire({
              icon: 'warning',
              title: 'Procesa las imágenes',
              text:
                'Debes seleccionar y procesar ambas imágenes antes de imprimir.'
            });
            return;
          }

          const paste = this.inputMode === 'manual'
            ? this.convertToShowdown(this.pokemonList)
            : String(this.teamPaste || '').trim();

          if (!paste) {
            await Swal.fire({
              icon: 'warning',
              title: 'Equipo requerido',
              text:
                this.inputMode === 'manual'
                  ? 'Debes completar al menos un Pokémon antes de imprimir.'
                  : 'Debes ingresar o procesar un equipo antes de imprimir.'
            });
            return;
          }

          const confirmed = await this.confirmPrintReview(false);

          if (!confirmed) {
            return;
          }

          this.teamPaste = paste;

          void this.trackEventSafely({
            userAgent: navigator.userAgent,
            date: new Date().toISOString(),
            type: 'print_team_sheet',
            description:
              `Usuario: ${this.form.playerName || 'sin nombre'} ` +
              `imprimió team sheet, tipo: ${this.selectedAction}, ` +
              `idioma: ${this.selectedLanguage}`,
            teamName: this.form.teamName || null
          });

          await generateTeamPDF({
            playerName: this.form.playerName,
            trainerName: this.form.trainerName,
            teamName: this.form.teamName,
            switchName: this.form.switchName,
            playerId: this.form.playerId,
            birth: this.form.birth,
            supportId: this.form.supportId,
            ageDivision: this.selectedCategory,
            sheet: this.selectedAction,
            lang: this.selectedLanguage,
            paste,
            onlyPdf: false,
            inputMode: this.inputMode
          });
        } catch (error) {
          console.error('Error al generar el team sheet:', error);

          await Swal.fire({
            icon: 'error',
            title: 'No fue posible generar el documento',
            text:
              error?.message ||
              'Ocurrió un error al preparar el team sheet. Intenta nuevamente.'
          });
        } finally {
          this.loadingPrint = false;
        }
      },

      async printSelectedST() {
        if (this.isPrinting) {
          return;
        }

        this.loadingPrintST = true;

        try {
          if (!this.selectedLanguage) {
            await Swal.fire({
              icon: 'warning',
              title: 'Idioma requerido',
              text: 'Debes seleccionar un idioma antes de imprimir.'
            });
            return;
          }

          const confirmed = await this.confirmPrintReview(true);

          if (!confirmed) {
            return;
          }

          void this.trackEventSafely({
            userAgent: navigator.userAgent,
            date: new Date().toISOString(),
            type: 'print_team_sheet_blank',
            description:
              `Usuario: ${this.form.playerName || 'sin nombre'} ` +
              `imprimió team sheet blanco, tipo: ${this.selectedAction}, ` +
              `idioma: ${this.selectedLanguage}`,
            teamName: this.form.teamName || null
          });

          await generateTeamPDF({
            playerName: this.form.playerName,
            trainerName: this.form.trainerName,
            teamName: this.form.teamName,
            switchName: this.form.switchName,
            playerId: this.form.playerId,
            birth: this.form.birth,
            supportId: this.form.supportId,
            ageDivision: this.selectedCategory,
            sheet: this.selectedAction,
            lang: this.selectedLanguage,
            paste: String(this.teamPaste || '').trim(),
            onlyPdf: true,
            inputMode: this.inputMode
          });
        } catch (error) {
          console.error('Error al generar el team sheet vacío:', error);

          await Swal.fire({
            icon: 'error',
            title: 'No fue posible generar el documento',
            text:
              error?.message ||
              'Ocurrió un error al preparar el team sheet. Intenta nuevamente.'
          });
        } finally {
          this.loadingPrintST = false;
        }
      },

      loadFromLocalStorage() {
        try {
          const saved = localStorage.getItem('teamsheetForm');

          if (!saved) {
            return;
          }

          const data = JSON.parse(saved);

          this.form.playerName = String(data.playerName || '');
          this.form.trainerName = String(data.trainerName || '');
          this.form.teamName = String(data.teamName || '');
          this.form.switchName = String(data.switchName || '');
          this.form.playerId = String(data.playerId || '');
          this.form.birth = String(data.birth || '');
          this.form.supportId = String(data.supportId || '');
          this.saveInBrowser = true;
        } catch (error) {
          console.warn('No se pudo restaurar el formulario:', error);

          try {
            localStorage.removeItem('teamsheetForm');
          } catch (storageError) {
            console.warn(
              'No se pudo limpiar el formulario guardado:',
              storageError
            );
          }
        }
      },
      async loadPokemons() {
        try {
          const response = await axios.get(
            this.buildApiUrl('pokemon-seeder')
          );

          this.listPokemons = Array.isArray(
            response?.data
          )
            ? response.data
            : Array.isArray(response?.data?.data)
              ? response.data.data
              : [];
        } catch (error) {
          console.error(
            'Error al cargar Pokémon:',
            error
          );
          this.listPokemons = [];
        }
      },

      // ===============================
      // AUTOCOMPLETE POKEMON
      // ===============================

      onPokemonInput(index) {
        this.activeSuggestionIndex = -1;
        const query = String(this.pokemonList[index]?.name || '').trim();
        if (query.length < 2) {
          this.suggestions[index] = [];
          return;
        }

        this.suggestions[index] = this.listPokemons
          .filter(p =>
            String(p?.name || '')
              .toLocaleLowerCase()
              .includes(query.toLocaleLowerCase())
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

      clearAllSuggestions() {
        this.suggestions = [];
        this.natureSuggestions = [];
        this.abilitySuggestions = [];
        this.itemSuggestions = [];
        this.moveSuggestions = [];
        this.activeSuggestionIndex = -1;
        this.activeAutocompleteId = null;
        this.activeNatureAutocomplete = null;
        this.activeAbilityAutocomplete = null;
        this.activeItemAutocomplete = null;
        this.activeMoveAutocomplete = {
          pokemon: null,
          move: null
        };
      },

      closeSuggestions() {
        this.activeSuggestionIndex = -1;
        this.activeAutocompleteId = null;
        this.activeNatureAutocomplete = null;
        this.activeAbilityAutocomplete = null;
        this.activeItemAutocomplete = null;
        this.activeMoveAutocomplete = {
          pokemon: null,
          move: null
        };
      },

      handleClickOutside(event) {
        const target = event.target;

        if (!(target instanceof Element) || !target.closest('.autocomplete')) {
          this.closeSuggestions();
        }
      },


      // Automplete Nature
      onNatureInput(index){
        this.activeSuggestionIndex = -1;
        const value = String(this.pokemonList[index]?.nature || '').toLocaleLowerCase();
        if(!value){
          this.natureSuggestions[index] = [];
          return;
        }
        this.natureSuggestions[index] =
          this.allNatureList
          .filter(n =>
            String(n?.name || '')
            .toLowerCase()
            .includes(value)
          )
          .slice(0,8);
      },

      selectNature(index,nature){
        this.pokemonList[index].nature = nature.name;
        this.natureSuggestions[index] = [];
        this.activeNatureAutocomplete = null;
        this.activeSuggestionIndex = -1;
      },

      //autocomplete Ability
      onAbilityInput(index){
        this.activeSuggestionIndex = -1;
        const value = String(this.pokemonList[index]?.ability || '').toLocaleLowerCase();
        if(!value){
          this.abilitySuggestions[index] = [];
          return;
        }
        this.abilitySuggestions[index] =
          this.allAbilityList
          .filter(a =>
            String(a?.name || '')
            .toLowerCase()
            .includes(value)
          )
          .slice(0,8);
      },

      selectAbility(index,ability){
        this.pokemonList[index].ability = ability.name;
        this.abilitySuggestions[index] = [];
        this.activeAbilityAutocomplete = null;
        this.activeSuggestionIndex = -1;
      },

      // Automplete Item
      onItemInput(index){
        this.activeSuggestionIndex = -1;
        const value = String(this.pokemonList[index]?.item || '').toLocaleLowerCase();
        if(!value){
          this.itemSuggestions[index] = [];
          return;
        }
        this.itemSuggestions[index] =
          this.allItemList
          .filter(i =>
            String(i?.name || '')
            .toLowerCase()
            .includes(value)
          )
          .slice(0,8);
      },

      selectItem(index,item){
        this.pokemonList[index].item = item.name;
        this.itemSuggestions[index] = [];
        this.activeItemAutocomplete = null;
        this.activeSuggestionIndex = -1;
      },

      // Automplete Move
      onMoveInput(pokemonIndex, moveIndex){
        this.activeSuggestionIndex = -1;
        const value = String(
          this.pokemonList[pokemonIndex]?.moves?.[moveIndex] || ''
        ).toLocaleLowerCase();
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
        this.allMoveList.filter(move =>
            String(move?.name || '')
            .toLowerCase()
            .includes(value)
          ).slice(0,8);
      },

      selectMove(pokemonIndex,moveIndex,move){
        this.pokemonList[pokemonIndex].moves[moveIndex]=move.name;

        this.moveSuggestions[pokemonIndex][moveIndex]=[];

        this.activeMoveAutocomplete = {
          pokemon: null,
          move: null
        };
        this.activeSuggestionIndex = -1;
      },
      createEmptyPokemon() {
        return createEmptyPokemon();
      },

      normalizeOcrText(value) {
        if (value === null || value === undefined) {
          return '';
        }

        let text = String(value).trim();

        // El backend puede devolver el showdown como un string JSON escapado.
        if (
          (text.startsWith('"') && text.endsWith('"')) ||
          (text.startsWith("'") && text.endsWith("'"))
        ) {
          try {
            text = JSON.parse(text);
          } catch (error) {
            // Si no es JSON válido, se procesa como texto normal.
          }
        }

        return String(text)
          .replace(/\\r\\n/g, '\n')
          .replace(/\\n/g, '\n')
          .replace(/\r\n/g, '\n')
          .replace(/\r/g, '\n')
          .replace(/S…pA/gi, 'SpA')
          .replace(/S…pD/gi, 'SpD')
          .replace(/\n{3,}/g, '\n\n')
          .trim();
      },

      cleanOcrField(value) {
        const textWithoutControlCharacters = Array.from(String(value || ''))
          .map((character) => {
            const characterCode = character.charCodeAt(0);

            return characterCode <= 31 || characterCode === 127
              ? ' '
              : character;
          })
          .join('');

        return textWithoutControlCharacters
          .replace(/^[\s\u0590-\u05FF●✔✓•◦▪■◆◇○◉☑☐]+/gu, '')
          .replace(/\s+/g, ' ')
          .trim();
      },

      cleanOcrMove(value) {
        return this.cleanOcrField(value)
          // Errores aislados frecuentes del OCR delante del nombre del movimiento.
          .replace(/^(?:M|O)\s+(?=\p{L})/u, '')
          .trim();
      },

      parseStatsLine(line) {
        const result = {
          hp: 0,
          atk: 0,
          def: 0,
          spatk: 0,
          spdef: 0,
          speed: 0
        };

        const statMap = {
          HP: 'hp',
          Atk: 'atk',
          Def: 'def',
          SpA: 'spatk',
          SpD: 'spdef',
          Spe: 'speed'
        };

        const normalized = String(line || '')
          .replace(/S…pA/gi, 'SpA')
          .replace(/S…pD/gi, 'SpD');

        const regex = /(\d+)\s*(HP|Atk|Def|SpA|SpD|Spe)\b/gi;
        let match;

        while ((match = regex.exec(normalized)) !== null) {
          const label = Object.keys(statMap).find(
            key => key.toLowerCase() === match[2].toLowerCase()
          );

          if (label) {
            result[statMap[label]] = Number(match[1]) || 0;
          }
        }

        return result;
      },

      parseShowdownTeam(rawShowdown) {
        const normalized = this.normalizeOcrText(rawShowdown);

        if (!normalized) {
          return [];
        }

        const blocks = normalized
          .split(/\n\s*\n/g)
          .map(block => block.trim())
          .filter(Boolean);

        return blocks.slice(0, 6).map(block => {
          const pokemon = this.createEmptyPokemon();
          const lines = block
            .split('\n')
            .map(line => line.trim())
            .filter(Boolean);

          const header = lines.shift() || '';
          const headerMatch = header.match(
            /^(.+?)(?:\s+\(([MF])\))?\s*@\s*(.+)$/i
          );

          if (headerMatch) {
            pokemon.name = this.cleanOcrField(headerMatch[1]);
            pokemon.item = this.cleanOcrField(headerMatch[3]);
          } else {
            pokemon.name = this.cleanOcrField(
              header.replace(/\s+\(([MF])\)\s*$/i, '')
            );
          }

          for (const line of lines) {
            if (/^Ability\s*:/i.test(line)) {
              pokemon.ability = this.cleanOcrField(
                line.replace(/^Ability\s*:/i, '')
              );
              continue;
            }

            if (/^(EVs|Stats)\s*:/i.test(line)) {
              pokemon.ivs = this.parseStatsLine(
                line.replace(/^(EVs|Stats)\s*:/i, '')
              );
              continue;
            }

            if (/\s+Nature$/i.test(line)) {
              pokemon.nature = this.cleanOcrField(
                line.replace(/\s+Nature$/i, '')
              );
              continue;
            }

            if (/^[-–—]/.test(line)) {
              const move = this.cleanOcrMove(
                line.replace(/^[-–—]\s*/, '')
              );

              if (move && pokemon.moves.filter(Boolean).length < 4) {
                const emptyIndex = pokemon.moves.findIndex(value => !value);

                if (emptyIndex >= 0) {
                  pokemon.moves[emptyIndex] = move;
                }
              }
            }
          }

          pokemon.open = true;
          return pokemon;
        });
      },

      mapApiPokemonToManual(apiPokemon) {
        const pokemon = this.createEmptyPokemon();
        const sourceStats = apiPokemon?.stats || apiPokemon?.evs || {};

        pokemon.name = this.cleanOcrField(
          apiPokemon?.species || apiPokemon?.name || ''
        );
        pokemon.ability = this.cleanOcrField(apiPokemon?.ability || '');
        pokemon.item = this.cleanOcrField(apiPokemon?.item || '');
        pokemon.nature = this.cleanOcrField(apiPokemon?.nature || '');
        pokemon.moves = [0, 1, 2, 3].map(index =>
          this.cleanOcrMove(apiPokemon?.moves?.[index] || '')
        );
        pokemon.ivs = {
          hp: Number(sourceStats.hp) || 0,
          atk: Number(sourceStats.atk) || 0,
          def: Number(sourceStats.def) || 0,
          spatk: Number(sourceStats.spa ?? sourceStats.spatk) || 0,
          spdef: Number(sourceStats.spd ?? sourceStats.spdef) || 0,
          speed: Number(sourceStats.spe ?? sourceStats.speed) || 0
        };
        pokemon.open = true;

        return pokemon;
      },

      fillManualTeam(pokemonTeam) {
        const manualTeam = Array.from(
          { length: 6 },
          () => this.createEmptyPokemon()
        );

        pokemonTeam.slice(0, 6).forEach((pokemon, index) => {
          manualTeam[index] = {
            ...this.createEmptyPokemon(),
            ...pokemon,
            moves: [0, 1, 2, 3].map(
              moveIndex => pokemon?.moves?.[moveIndex] || ''
            ),
            ivs: {
              ...this.createEmptyPokemon().ivs,
              ...(pokemon?.ivs || {})
            },
            open: true
          };
        });

        this.pokemonList = manualTeam;
        this.inputMode = 'manual';

        this.suggestions = [];
        this.natureSuggestions = [];
        this.abilitySuggestions = [];
        this.itemSuggestions = [];
        this.moveSuggestions = [];
      },

      applyImageTeamResponse(responseData) {
        const payload = responseData?.data ?? responseData;
        const structuredPokemon =
          payload?.pokemon ||
          payload?.data?.pokemon ||
          null;

        let manualTeam = [];

        if (Array.isArray(structuredPokemon) && structuredPokemon.length) {
          manualTeam = structuredPokemon.map(
            pokemon => this.mapApiPokemonToManual(pokemon)
          );
        } else {
          const showdown =
            payload?.showdown ||
            payload?.data?.showdown ||
            (typeof payload === 'string' ? payload : '');

          manualTeam = this.parseShowdownTeam(showdown);
        }

        if (!manualTeam.length) {
          throw new Error(
            'El servicio no devolvió información válida del equipo.'
          );
        }

        this.fillManualTeam(manualTeam);

        const showdown =
          payload?.showdown ||
          payload?.data?.showdown ||
          '';

        if (showdown) {
          this.teamPaste = this.normalizeOcrText(showdown);
        } else {
          this.teamPaste = this.convertToShowdown(this.pokemonList);
        }
      },

      convertToShowdown(team) {
        const statLabels = {
          hp: 'HP',
          atk: 'Atk',
          def: 'Def',
          spatk: 'SpA',
          spdef: 'SpD',
          speed: 'Spe'
        };

        return team
          .filter(pokemon => String(pokemon.name || '').trim())
          .map(pokemon => {
            const statsLine = Object.entries(pokemon.ivs || {})
              .filter(([, value]) => Number(value) > 0)
              .map(([stat, value]) => `${Number(value)} ${statLabels[stat]}`)
              .join(' / ');

            const lines = [];
            const name = String(pokemon.name || '').trim();
            const item = String(pokemon.item || '').trim();

            lines.push(item ? `${name} @ ${item}` : name);

            if (pokemon.ability) {
              lines.push(`Ability: ${String(pokemon.ability).trim()}`);
            }

            lines.push('Level: 50');

            if (statsLine) {
              // Se mantiene EVs por compatibilidad con el parser de impresión,
              // aunque los valores corresponden a los stats reales de la imagen.
              lines.push(`EVs: ${statsLine}`);
            }

            if (pokemon.nature) {
              lines.push(`${String(pokemon.nature).trim()} Nature`);
            }

            (pokemon.moves || [])
              .map(move => String(move || '').trim())
              .filter(Boolean)
              .forEach(move => lines.push(`- ${move}`));

            return lines.join('\n');
          })
          .join('\n\n');
      },

      async onImageSelected(event, type) {
        const file = event.target.files?.[0];

        if (!file) {
          return;
        }

        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/webp'
        ];
        const hasAllowedExtension =
          /\.(jpe?g|jfif|png|webp)$/i.test(file.name);
        const isImage =
          allowedMimeTypes.includes(file.type) ||
          hasAllowedExtension;

        if (!isImage) {
          event.target.value = '';

          await Swal.fire({
            icon: 'warning',
            title: 'Invalid file',
            text: 'Select a JPG, JPEG, JFIF, PNG or WEBP image.'
          });

          return;
        }

        const maxFileSize = 10 * 1024 * 1024;

        if (file.size > maxFileSize) {
          event.target.value = '';

          await Swal.fire({
            icon: 'warning',
            title: 'Image is too large',
            text: 'The maximum allowed size is 10 MB.'
          });

          return;
        }

        this.revokeImagePreview(type);

        const previewUrl = URL.createObjectURL(file);

        try {
          const dimensions = await this.getImageDimensions(previewUrl);

          this.teamImages[type] = file;
          this.teamImagePreviews[type] = previewUrl;
          this.teamImageDetails[type] = {
            name: file.name,
            size: file.size,
            width: dimensions.width,
            height: dimensions.height
          };
          this.imagePreviewMode[type] = 'selected';
        } catch (error) {
          URL.revokeObjectURL(previewUrl);
          event.target.value = '';

          await Swal.fire({
            icon: 'warning',
            title: 'Invalid image',
            text: 'The selected image could not be displayed.'
          });
        }
      },

      getImageDimensions(imageUrl) {
        return new Promise((resolve, reject) => {
          const image = new Image();

          image.onload = () => {
            resolve({
              width: image.naturalWidth,
              height: image.naturalHeight
            });
          };

          image.onerror = () => {
            reject(
              new Error('The selected image preview could not be loaded.')
            );
          };

          image.src = imageUrl;
        });
      },

      formatFileSize(bytes) {
        const size = Number(bytes) || 0;

        if (size < 1024) {
          return `${size} B`;
        }

        if (size < 1024 * 1024) {
          return `${(size / 1024).toFixed(1)} KB`;
        }

        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
      },

      revokeImagePreview(type) {
        const previewUrl = this.teamImagePreviews[type];

        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }

        this.teamImagePreviews[type] = null;
      },

      removeSelectedImage(type, clearInput = true) {
        this.revokeImagePreview(type);

        this.teamImages[type] = null;
        this.teamImageDetails[type] = null;
        this.imagePreviewMode[type] = 'example';

        if (clearInput) {
          const refName =
            type === 'info'
              ? 'infoImageInput'
              : 'statsImageInput';

          const input = this.$refs[refName];

          if (input) {
            input.value = '';
          }
        }
      },

      getImageValidationError(error) {
        const responseData = error?.response?.data || {};
        const code =
          responseData?.code ||
          responseData?.errorCode ||
          responseData?.error?.code ||
          'IMAGE_PROCESSING_ERROR';

        const backendMessage = Array.isArray(responseData?.message)
          ? responseData.message.join(' ')
          : responseData?.message;

        const messages = {
          IMAGES_REVERSED: {
            title: this.$t('teamSheetSection.titleImagesReversed'),
            text: this.$t('teamSheetSection.textImagesReversed')
          },

          INVALID_IMAGE_PAIR: {
            title: this.$t('teamSheetSection.titleInvalidImagePair'),
            text: this.$t('teamSheetSection.textInvalidImagePair')
          },

          INVALID_INFO_IMAGE: {
            title: this.$t('teamSheetSection.titleInvalidInfoImage'),
            text: this.$t('teamSheetSection.textInvalidInfoImage')
          },

          INVALID_STATS_IMAGE: {
            title: this.$t('teamSheetSection.titleInvalidStatsImage'),
            text: this.$t('teamSheetSection.textInvalidStatsImage')
          },

          INSUFFICIENT_TEAM_DATA: {
            title: this.$t('teamSheetSection.titleInsufficientTeamData'),
            text: this.$t('teamSheetSection.textInsufficientTeamData')
          },

          IMAGE_PROCESSING_ERROR: {
            title: this.$t('teamSheetSection.titleImageProcessingError'),
            text: this.$t('teamSheetSection.textImageProcessingError')
          }
        };

        const fallback = messages.IMAGE_PROCESSING_ERROR;
        const selected = messages[code] || fallback;

        return {
          code,
          title: selected.title,
          text:
            backendMessage ||
            error?.message ||
            selected.text
        };
      },

      getImageResponseWarnings(responseData) {
        const payload = responseData?.data ?? responseData;
        const warnings =
          payload?.warnings ||
          payload?.validation?.warnings ||
          [];

        return Array.isArray(warnings)
          ? warnings.filter(Boolean)
          : [];
      },

      async uploadImages() {
        if (
          !this.teamImages.info ||
          !this.teamImages.stats ||
          this.processingImages
        ) {
          return;
        }

        this.processingImages = true;

        try {
          const formData = new FormData();
          formData.append('infoImage', this.teamImages.info);
          formData.append('statsImage', this.teamImages.stats);

          const response = await axios.post(
            this.buildApiUrl('teams/read-images'),
            formData
          );

          this.applyImageTeamResponse(response.data);

          const warnings = this.getImageResponseWarnings(response.data);

          if (warnings.length) {
            await Swal.fire({
              icon: 'warning',
              title: this.$t('teamSheetSection.warning'),
              text:
                warnings.join('\n') +
                '\n\n' +
                this.$t('teamSheetSection.warningText')
            });
          } else {
            await Swal.fire({
              icon: 'success',
              title: this.$t('teamSheetSection.success'),
              text: this.$t('teamSheetSection.successText')
            });
          }
        } catch (error) {
          console.error(error);

          const modal = this.getImageValidationError(error);

          await Swal.fire({
            icon: 'error',
            title: modal.title,
            text: modal.text,
            confirmButtonText: this.$t('teamSheetSection.buttonEntendido')
          });
        } finally {
          this.processingImages = false;
        }
      }
    },
    beforeUnmount() {
      document.removeEventListener('click', this.handleClickOutside);
      this.revokeImagePreview('info');
      this.revokeImagePreview('stats');
    },
    mounted() {
      document.addEventListener('click', this.handleClickOutside);
      this.loadFromLocalStorage();
      this.loadPokemons();

      if (this.id) {
        this.getTeamDetail();
      } else {
        this.isLoading = false;

        useHead({
          title: 'Print Team Sheet',
          meta: [
            {
              name: 'description',
              content: 'Print Team Sheet for Tournaments'
            },
            {
              name: 'keywords',
              content: 'Team, Tournament, VGC, Team Sheet'
            },
            {
              property: 'og:title',
              content: 'Team Sheet'
            },
            {
              property: 'og:description',
              content: 'Print Team Sheet for Tournaments'
            },
            {
              property: 'og:type',
              content: 'website'
            }
          ]
        });
      }
    }
  }
</script>

<style scoped>
  .teamsheet-page {
    --page-bg: #f4f7fb;
    --page-accent-bg: #eaf1fa;
    --page-text: #1d2733;
    --state-bg: #ffffff;
    --state-border: #dbe4ee;
    --state-shadow:
      0 18px 48px rgba(31, 45, 61, 0.1);

    min-height: 100dvh;
    padding: clamp(1.25rem, 3vw, 2.75rem) 0;
    background:
      radial-gradient(
        circle at top left,
        var(--page-accent-bg),
        transparent 38rem
      ),
      var(--page-bg);
    color: var(--page-text);
  }

  .teamsheet-page.theme-dark {
    --page-bg: #0e1117;
    --page-accent-bg: #172234;
    --page-text: #f3f6fa;
    --state-bg: #171c24;
    --state-border: #303b49;
    --state-shadow:
      0 18px 48px rgba(0, 0, 0, 0.38);
  }

  .teamsheet-page,
  .teamsheet-page * {
    box-sizing: border-box;
  }

  .teamsheet-container {
    width: min(94%, 1480px);
    margin: 0 auto;
  }

  .teamsheet-page-header {
    width: min(92%, 900px);
    margin: 0 auto clamp(1.25rem, 3vw, 2rem);
    text-align: center;
  }

  .teamsheet-page-header h1,
  .teamsheet-page-header p {
    margin: 0;
  }

  .teamsheet-page-header h1 {
    overflow-wrap: anywhere;
    font-size: clamp(1.8rem, 4vw, 2.65rem);
    font-weight: 800;
    letter-spacing: -0.035em;
    line-height: 1.12;
  }

  .teamsheet-page-header p {
    margin-top: 0.5rem;
    opacity: 0.78;
    line-height: 1.5;
  }

  .teamsheet-layout {
    display: grid;
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: clamp(1rem, 2.4vw, 2rem);
    align-items: start;
  }

  .teamsheet-layout > .col-md-6 {
    width: 100%;
    max-width: none;
    padding: 0;
  }

  .teamsheet-state-card {
    display: grid;
    min-height: 360px;
    place-items: center;
    align-content: center;
    gap: 1rem;
    padding: 2rem;
    border: 1px solid var(--state-border);
    border-radius: 16px;
    background: var(--state-bg);
    box-shadow: var(--state-shadow);
    text-align: center;
  }

  .teamsheet-state-card h2,
  .teamsheet-state-card p {
    margin: 0;
  }

  .teamsheet-loading-image {
    display: block;
    /*width: 190px;*/
    max-width: 100%;
    height: auto;
    object-fit: contain;
  }

  .teamsheet-loading-spinner {
    display: inline-block;
    width: 64px;
    height: 64px;
    border: 4px solid #3498db;
    border-top-color: transparent;
    border-radius: 50%;
    animation: teamsheet-spin 0.8s linear infinite;
  }

  .form-card button,
  .form-card input,
  .form-card select,
  .form-card textarea {
    font: inherit;
  }

  .form-card button:focus-visible,
  .form-card input:focus-visible,
  .form-card select:focus-visible,
  .form-card textarea:focus-visible {
    outline: 3px solid rgba(52, 152, 219, 0.3);
    outline-offset: 3px;
  }

  .field-label-container {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 5px;
}

.field-label-container label {
  margin-bottom: 0;
}

.field-tooltip {
  position: relative;
  display: inline-flex;
  align-items: center;
}

.field-tooltip__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 19px;
  height: 19px;
  padding: 0;

  border: 1px solid #6c757d;
  border-radius: 50%;
  background: transparent;
  color: #6c757d;

  font-size: 12px;
  font-weight: 700;
  line-height: 1;

  cursor: help;
}

.field-tooltip__button:hover,
.field-tooltip__button:focus-visible {
  border-color: #0d6efd;
  color: #0d6efd;
  outline: none;
}

.field-tooltip__content {
  position: absolute;
  right: 0;
  bottom: calc(100% + 9px);
  z-index: 1000;

  width: max-content;
  max-width: 260px;
  padding: 8px 11px;

  border-radius: 6px;
  background: #212529;
  color: #ffffff;

  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  text-align: left;
  white-space: normal;

  opacity: 0;
  visibility: hidden;
  pointer-events: none;

  transform: translateY(4px);
  transition:
    opacity 0.15s ease,
    transform 0.15s ease,
    visibility 0.15s ease;
}

.field-tooltip__content::after {
  content: '';
  position: absolute;
  top: 100%;
  right: 4px;

  border-width: 5px;
  border-style: solid;
  border-color: #212529 transparent transparent transparent;
}

.field-tooltip:hover .field-tooltip__content,
.field-tooltip:focus-within .field-tooltip__content {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

  @keyframes teamsheet-spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 991.98px) {
    .teamsheet-layout {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 767.98px) {
    .teamsheet-page {
      padding: 1rem 0;
    }

    .teamsheet-container,
    .teamsheet-page-header {
      width: min(94%, 100%);
    }

    .teamsheet-state-card {
      padding: 1.25rem;
      border-radius: 12px;
    }

    .teamsheet-loading-image {
      width: 160px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .teamsheet-loading-spinner {
      animation-duration: 1.4s;
    }
  }

  /*
   * El tema se controla desde .form-card.
   * En modo claro usa los valores base.
   * En modo oscuro, .dark-card reemplaza las variables.
   */
  .form-card {
    --card-bg: rgba(255, 255, 255, 0.96);
    --card-text: #1f2933;
    --muted-text: #65717e;

    --surface-bg: #f5f7fa;
    --surface-border: #dce4ec;

    --input-bg: #ffffff;
    --input-text: #212529;
    --input-border: #ced4da;
    --input-placeholder: #6c757d;

    --switch-bg: transparent;
    --switch-text: #343a40;
    --switch-border: #777777;
    --switch-active-bg: #343a40;
    --switch-active-text: #ffffff;
    --switch-active-border: #343a40;

    --dropdown-bg: #ffffff;
    --dropdown-border: #ced4da;
    --dropdown-hover: rgba(13, 110, 253, 0.12);

    min-width: 0;
    padding: clamp(1rem, 2.4vw, 2rem);
    border: 1px solid var(--surface-border);
    border-radius: 18px;
    background-color: var(--card-bg);
    color: var(--card-text);
    box-shadow: 0 18px 45px rgba(31, 45, 61, 0.1);
    backdrop-filter: blur(10px);
    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;
  }

  @media (hover: hover) {
    .form-card:hover {
      transform: translateY(-2px);
    }
  }

  .form-card.dark-card {
    --card-bg: rgba(24, 30, 39, 0.96);
    --card-text: #f5f7fa;
    --muted-text: #aeb9c5;

    --surface-bg: #202834;
    --surface-border: #354150;

    --input-bg: #141a22;
    --input-text: #f5f7fa;
    --input-border: #425063;
    --input-placeholder: #8996a5;

    --switch-bg: transparent;
    --switch-text: #ffffff;
    --switch-border: #777777;
    --switch-active-bg: #ffffff;
    --switch-active-text: #333333;
    --switch-active-border: #ffffff;

    --dropdown-bg: #171d26;
    --dropdown-border: #3b4858;
    --dropdown-hover: rgba(74, 144, 226, 0.24);

    box-shadow: 0 18px 45px rgba(0, 0, 0, 0.32);
  }

  .form-card h4,
  .form-card h5,
  .form-card p,
  .form-card label,
  .form-card strong {
    color: inherit;
  }

  /* HEADER */
  .paste-header {
    margin-bottom: 15px;
  }

  /* TEXTAREA */
  .custom-textarea {
    width: 100%;
    min-height: 450px;
    padding: 1rem;
    border: 1px solid var(--input-border);
    border-radius: 12px;
    background-color: var(--input-bg);
    color: var(--input-text);
    box-sizing: border-box;
    line-height: 1.55;
    resize: vertical;
  }

  .custom-textarea::placeholder {
    color: var(--input-placeholder);
  }

  /* FORM */
  .form-group {
    margin-bottom: 1rem;
  }

  label {
    font-weight: bold;
    margin-bottom: 5px;
  }

  .form-card .form-control {
    min-height: 44px;
    padding: 10px 12px;
    border: 1px solid var(--input-border);
    border-radius: 9px;
    background-color: var(--input-bg);
    color: var(--input-text);
  }

  .form-card .form-control::placeholder {
    color: var(--input-placeholder);
  }

  .form-card select.form-control {
    cursor: pointer;
  }

  .form-card select.form-control option {
    background-color: var(--input-bg);
    color: var(--input-text);
  }

  .form-card button:disabled {
    cursor: not-allowed;
    opacity: 0.62;
  }

  .form-card input[type="file"].form-control::file-selector-button {
    border: 0;
    border-right: 1px solid var(--input-border);
    background-color: var(--surface-bg);
    color: var(--card-text);
    padding: 10px 14px;
    margin: -10px 12px -10px -10px;
    cursor: pointer;
  }

  .dark-card input[type="date"] {
    color-scheme: dark;
  }

  /* SWITCH */
  .mode-switch {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    padding: 5px;
    margin: 15px 0 1.25rem;
    border: 1px solid var(--surface-border);
    border-radius: 14px;
    background-color: var(--surface-bg);
  }

  .mode-switch button {
    min-width: 0;
    padding: 9px 12px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: var(--switch-bg);
    color: var(--switch-text);
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      color 0.2s ease,
      border-color 0.2s ease;
  }

  .mode-switch button:hover {
    background-color: var(--surface-bg);
  }

  .mode-switch button.active {
    border-color: var(--switch-active-border);
    background-color: var(--switch-active-bg);
    color: var(--switch-active-text);
  }

  /* MANUAL MODE */
  .pokemon-inputs {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pokemon-row {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    background-color: var(--surface-bg);
  }

  .pokemon-input {
    flex: 1;
    width: 100%;
    padding: 12px;
    border: 1px solid var(--input-border);
    border-radius: 8px;
    background-color: var(--input-bg);
    color: var(--input-text);
    font-size: 16px;
    box-sizing: border-box;
  }

  .pokemon-input::placeholder {
    color: var(--input-placeholder);
  }

  .expand-button {
    display: grid;
    width: 44px;
    height: 44px;
    flex: 0 0 44px;
    place-items: center;
    border: 1px solid var(--switch-border);
    border-radius: 50%;
    background-color: var(--surface-bg);
    color: var(--card-text);
    cursor: pointer;
    transition:
      background-color 0.2s ease,
      transform 0.2s ease;
  }

  .expand-button:hover {
    transform: translateY(-1px);
  }

  .pokemon-details {
    width: 100%;
    padding-top: 15px;
  }

  .nature-input {
    margin-bottom: 15px;
  }

  .pokemon-info-container {
    display: flex;
    gap: 15px;
  }

  .pokemon-data {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 10px;
  }

  /* STATS */
  .ivs-container {
    display: flex;
    width: 120px;
    flex-direction: column;
    gap: 10px;
  }

  .stat-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stat-row label {
    width: 35px;
    color: var(--muted-text);
    font-size: 12px;
  }

  .iv-input {
    width: 100%;
  }

  /* AUTOCOMPLETE */
  .autocomplete {
    position: relative;
    width: 100%;
  }

  .autocomplete .input,
  .autocomplete .pokemon-input {
    width: 100%;
    box-sizing: border-box;
  }

  .suggestions {
    position: absolute;
    z-index: 999;
    top: calc(100% + 4px);
    left: 0;
    width: 100%;
    max-height: 220px;
    overflow-y: auto;
    padding: 4px 0;
    margin: 0;
    border: 1px solid var(--dropdown-border);
    border-radius: 8px;
    background-color: var(--dropdown-bg);
    color: var(--card-text);
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.16);
    list-style: none;
    box-sizing: border-box;
  }

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
    background-color: var(--dropdown-hover);
  }

  .pokemon-thumb {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }

  /* IMAGES MODE */
  .image-upload-container {
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 20px 0;
  }

  .upload-process-button {
    width: 100%;
    min-height: 46px;
    margin-top: 0.25rem;
  }

  .upload-card {
    padding: 18px;
    margin-bottom: 20px;
    border: 1px solid var(--surface-border);
    border-radius: 12px;
    background-color: var(--surface-bg);
    color: var(--card-text);
  }

  .upload-card h5 {
    margin-bottom: 15px;
    color: inherit;
    text-align: center;
  }

  .upload-description {
    margin-top: 8px;
    color: var(--card-text);
  }

  .upload-example {
    display: block;
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: 8px;
    object-fit: contain;
  }

  .preview-toolbar {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 12px;
  }

  .preview-tab {
    padding: 6px 14px;
    border: 1px solid var(--switch-border);
    border-radius: 999px;
    background-color: transparent;
    color: var(--card-text);
    cursor: pointer;
    font-size: 13px;
  }

  .preview-tab.active {
    border-color: var(--switch-active-border);
    background-color: var(--switch-active-bg);
    color: var(--switch-active-text);
  }

  .preview-tab:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  .upload-preview-frame {
    position: relative;
    display: flex;
    width: 100%;
    aspect-ratio: 16 / 9;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    padding: 3px;
    border: 2px solid var(--surface-border);
    border-radius: 10px;
    background-color: var(--card-bg);
  }

  .preview-badge {
    position: absolute;
    z-index: 2;
    top: 10px;
    left: 10px;
    padding: 4px 9px;
    border-radius: 999px;
    background-color: rgba(0, 0, 0, 0.72);
    color: #ffffff;
    font-size: 11px;
    font-weight: 700;
    pointer-events: none;
  }

  .selected-image-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 10px 12px;
    margin-top: 10px;
    border: 1px solid var(--surface-border);
    border-radius: 8px;
    background-color: var(--card-bg);
  }

  .selected-image-copy {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 2px;
  }

  .selected-image-copy strong {
    overflow: hidden;
    color: var(--card-text);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .selected-image-copy span {
    color: var(--muted-text);
    font-size: 12px;
  }

  .remove-image-button {
    flex: 0 0 auto;
    padding: 6px 10px;
    border: 1px solid #dc3545;
    border-radius: 6px;
    background-color: transparent;
    color: #dc3545;
    cursor: pointer;
    font-size: 13px;
  }

  .remove-image-button:hover {
    background-color: #dc3545;
    color: #ffffff;
  }

  .option-group {
    padding: 0;
    margin: 1.25rem 0 0;
    border: 0;
  }

  .option-group legend {
    width: 100%;
    margin-bottom: 0.65rem;
    color: var(--card-text);
    font-size: 0.95rem;
    font-weight: 700;
    text-align: center;
  }

  .choice-grid {
    display: grid;
    gap: 0.65rem;
  }

  .choice-grid--three {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .choice-grid--two {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .choice-grid .btn {
    min-height: 44px;
    white-space: normal;
  }

  /* PRINT */
  .print-section {
    margin-top: 1.5rem;
  }

  .print-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
  }

  .print-actions .btn {
    min-height: 48px;
    white-space: normal;
  }

  .save-browser-option {
    display: flex;
    align-items: flex-start;
    justify-content: center;
    gap: 0.6rem;
    padding: 0.9rem 1rem;
    margin-top: 1rem;
    border: 1px solid var(--surface-border);
    border-radius: 10px;
    background-color: var(--surface-bg);
  }

  .save-browser-option input {
    width: 18px;
    height: 18px;
    flex: 0 0 auto;
    margin-top: 0.1rem;
    accent-color: #0d6efd;
  }

  .save-browser-option label {
    margin: 0;
    line-height: 1.35;
  }

  @media (max-width: 575.98px) {
    .form-card {
      padding: 1rem;
      border-radius: 14px;
    }

    .custom-textarea {
      min-height: 320px;
    }

    .mode-switch {
      grid-template-columns: 1fr;
    }

    .choice-grid--three,
    .choice-grid--two,
    .print-actions {
      grid-template-columns: 1fr;
    }

    .pokemon-info-container {
      flex-direction: column;
    }

    .ivs-container {
      width: 100%;
    }

    .stat-row label {
      width: 50px;
    }

    .selected-image-info {
      align-items: stretch;
      flex-direction: column;
    }

    .remove-image-button {
      width: 100%;
    }
  }
</style>