<template>
  <nav
    v-if="totalPages > 1"
    :class="['app-paginator', { 'app-paginator--dark': mode === 'dark' }]"
    aria-label="Paginación"
  >
    <button
      type="button"
      class="pagination-control"
      :disabled="currentPage === 1"
      aria-label="Ir a la página anterior"
      @click="changePage(currentPage - 1)"
    >
      <span aria-hidden="true">&laquo;</span>
      <span class="control-label">Anterior</span>
    </button>

    <ul :class="['pagination-list', { 'pagination-list--dark': mode === 'dark' }]">
      <li v-for="item in visiblePages" :key="item.key">
        <span
          v-if="item.type === 'ellipsis'"
          class="pagination-ellipsis"
          aria-hidden="true"
        >
          …
        </span>

        <button
          v-else
          type="button"
          class="page-button"
          :class="{ 'page-button--active': currentPage === item.page }"
          :aria-label="`Ir a la página ${item.page}`"
          :aria-current="currentPage === item.page ? 'page' : undefined"
          @click="changePage(item.page)"
        >
          {{ item.page }}
        </button>
      </li>
    </ul>

    <span class="mobile-page-status" aria-live="polite">
      {{ currentPage }} / {{ totalPages }}
    </span>

    <button
      type="button"
      class="pagination-control"
      :disabled="currentPage === totalPages"
      aria-label="Ir a la página siguiente"
      @click="changePage(currentPage + 1)"
    >
      <span class="control-label">Siguiente</span>
      <span aria-hidden="true">&raquo;</span>
    </button>
  </nav>
</template>

<script setup>
/* global defineProps, defineEmits, defineExpose */
import {
  computed,
  inject,
  onMounted,
  ref,
  unref,
  watch
} from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 5,
    validator: (value) => Number.isInteger(value) && value > 0
  },

  /*
   * Nombre del parámetro que se guardará en la URL.
   *
   * Ejemplo:
   * /partidas?page=5
   */
  queryKey: {
    type: String,
    default: 'page'
  },

  /*
   * Mantiene la página en la URL para que el historial
   * del navegador pueda restaurarla.
   */
  syncWithRoute: {
    type: Boolean,
    default: true
  },

  /*
   * Guarda la última página en sessionStorage.
   *
   * Esto permite restaurarla incluso cuando un breadcrumb
   * vuelve al listado sin incluir ?page=5.
   */
  rememberPage: {
    type: Boolean,
    default: true
  },

  /*
   * Permite definir una clave propia cuando existen varios
   * paginadores dentro de una misma ruta.
   */
  storageKey: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'page-changed',
  'current-page-changed'
])

const route = useRoute()
const router = useRouter()

const injectedMode = inject('mode', ref('light'))

const mode = computed(() =>
  unref(injectedMode) === 'dark' ? 'dark' : 'light'
)

const totalPages = computed(() =>
  Math.ceil(props.items.length / props.itemsPerPage)
)

const pageStorageKey = computed(() => {
  if (props.storageKey.trim()) {
    return props.storageKey.trim()
  }

  const routeIdentifier = String(
    route.name || route.path || 'default'
  )

  return `app-paginator:${routeIdentifier}:${props.queryKey}`
})

function parsePage(value) {
  const rawValue = Array.isArray(value) ? value[0] : value
  const parsedValue = Number.parseInt(String(rawValue ?? ''), 10)

  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    return null
  }

  return parsedValue
}

function normalizePage(page) {
  const parsedPage = parsePage(page) ?? 1

  /*
   * Mientras los elementos todavía no han cargado,
   * conservamos la página solicitada sin limitarla.
   */
  if (totalPages.value < 1) {
    return parsedPage
  }

  return Math.min(parsedPage, totalPages.value)
}

function readStoredPage() {
  if (
    !props.rememberPage ||
    typeof window === 'undefined'
  ) {
    return null
  }

  try {
    return parsePage(
      window.sessionStorage.getItem(pageStorageKey.value)
    )
  } catch (error) {
    console.warn(
      '[AppPaginator] No fue posible leer sessionStorage:',
      error
    )

    return null
  }
}

function saveStoredPage(page) {
  if (
    !props.rememberPage ||
    typeof window === 'undefined'
  ) {
    return
  }

  try {
    window.sessionStorage.setItem(
      pageStorageKey.value,
      String(page)
    )
  } catch (error) {
    console.warn(
      '[AppPaginator] No fue posible guardar sessionStorage:',
      error
    )
  }
}

function getInitialPage() {
  const routePage = parsePage(route.query[props.queryKey])

  if (routePage !== null) {
    return normalizePage(routePage)
  }

  const storedPage = readStoredPage()

  if (storedPage !== null) {
    return normalizePage(storedPage)
  }

  return 1
}

const currentPage = ref(getInitialPage())

const paginatedItems = computed(() => {
  const start =
    (currentPage.value - 1) * props.itemsPerPage

  return props.items.slice(
    start,
    start + props.itemsPerPage
  )
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value

  /*
   * Cantidad de páginas consecutivas visibles.
   *
   * Inicio: 1 2 3 4 5 6 7 … 157
   * Centro: 1 … 75 76 77 78 79 80 81 … 157
   * Final:  1 … 151 152 153 154 155 156 157
   */
  const visiblePageCount = 7
  const halfWindow = Math.floor(visiblePageCount / 2)

  if (total <= visiblePageCount) {
    return Array.from(
      { length: total },
      (_, index) => ({
        key: `page-${index + 1}`,
        type: 'page',
        page: index + 1
      })
    )
  }

  let startPage = current - halfWindow
  let endPage = current + halfWindow

  if (startPage < 1) {
    startPage = 1
    endPage = visiblePageCount
  }

  if (endPage > total) {
    endPage = total
    startPage = total - visiblePageCount + 1
  }

  const pages = []

  if (startPage > 1) {
    pages.push({
      key: 'page-1',
      type: 'page',
      page: 1
    })

    if (startPage > 2) {
      pages.push({
        key: `ellipsis-1-${startPage}`,
        type: 'ellipsis'
      })
    }
  }

  for (
    let page = startPage;
    page <= endPage;
    page += 1
  ) {
    pages.push({
      key: `page-${page}`,
      type: 'page',
      page
    })
  }

  if (endPage < total) {
    if (endPage < total - 1) {
      pages.push({
        key: `ellipsis-${endPage}-${total}`,
        type: 'ellipsis'
      })
    }

    pages.push({
      key: `page-${total}`,
      type: 'page',
      page: total
    })
  }

  return pages
})

async function syncPageWithRoute(page) {
  if (!props.syncWithRoute) {
    return
  }

  const nextQuery = {
    ...route.query
  }

  /*
   * Dejamos la URL limpia en la página 1.
   *
   * Página 1:
   * /partidas
   *
   * Página 5:
   * /partidas?page=5
   */
  if (page <= 1) {
    delete nextQuery[props.queryKey]
  } else {
    nextQuery[props.queryKey] = String(page)
  }

  const currentRoutePage =
    parsePage(route.query[props.queryKey]) ?? 1

  if (currentRoutePage === page) {
    return
  }

  try {
    /*
     * replace evita crear una entrada del historial por cada
     * clic del paginador, pero conserva la última página cuando
     * después se navega al detalle de un registro.
     */
    await router.replace({
      query: nextQuery
    })
  } catch (error) {
    console.warn(
      '[AppPaginator] No fue posible actualizar la URL:',
      error
    )
  }
}

async function setCurrentPage(
  page,
  {
    updateRoute = true,
    force = false
  } = {}
) {
  const normalizedPage = normalizePage(page)

  if (
    totalPages.value > 0 &&
    (
      normalizedPage < 1 ||
      normalizedPage > totalPages.value
    )
  ) {
    return
  }

  if (
    !force &&
    normalizedPage === currentPage.value
  ) {
    return
  }

  currentPage.value = normalizedPage
  saveStoredPage(normalizedPage)

  emit('current-page-changed', normalizedPage)

  if (updateRoute) {
    await syncPageWithRoute(normalizedPage)
  }
}

function changePage(page) {
  void setCurrentPage(page)
}

function clampCurrentPage() {
  if (totalPages.value === 0) {
    return
  }

  const validPage = Math.min(
    Math.max(currentPage.value, 1),
    totalPages.value
  )

  if (validPage !== currentPage.value) {
    void setCurrentPage(validPage, {
      force: true
    })
  }
}

/*
 * Restaura la página cuando cambia la URL mediante:
 * - botón atrás/adelante del navegador;
 * - navegación programática;
 * - un enlace que incluya ?page=N.
 */
watch(
  () => route.query[props.queryKey],
  (routePageValue) => {
    const routePage = parsePage(routePageValue)

    if (routePage !== null) {
      void setCurrentPage(routePage, {
        updateRoute: false,
        force: true
      })

      return
    }

    /*
     * Si el breadcrumb vuelve al listado sin query,
     * recuperamos la última página guardada.
     */
    const storedPage = readStoredPage()

    void setCurrentPage(storedPage ?? 1, {
      updateRoute: false,
      force: true
    })
  }
)

/*
 * Ya no reiniciamos automáticamente a página 1 cuando cambia
 * la referencia del arreglo. Solo validamos que la página siga
 * existiendo.
 */
watch(
  () => [
    props.items.length,
    props.itemsPerPage
  ],
  clampCurrentPage
)

watch(
  paginatedItems,
  (items) => {
    emit(
      'page-changed',
      items,
      currentPage.value
    )
  },
  {
    immediate: true
  }
)

onMounted(() => {
  saveStoredPage(currentPage.value)

  /*
   * Si la página fue recuperada desde sessionStorage,
   * la reflejamos también en la URL.
   */
  void syncPageWithRoute(currentPage.value)
})

defineExpose({
  changePage,
  currentPage,
  resetPage: () => {
    void setCurrentPage(1, {
      force: true
    })
  }
})
</script>

<style scoped>
.app-paginator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
  width: 100%;
  margin: 1.25rem 0;
}

.pagination-list {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0;
  margin: 0;
  list-style: none;
}

.pagination-control,
.page-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  min-height: 40px;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  background: #fff;
  color: #0d6efd;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    transform 0.16s ease;
}

.pagination-control {
  gap: 0.4rem;
  padding: 0.5rem 0.75rem;
}

.pagination-control:hover:not(:disabled),
.page-button:hover:not(.page-button--active) {
  border-color: #86b7fe;
  background: #e9f2ff;
}

.pagination-control:active:not(:disabled),
.page-button:active {
  transform: translateY(1px);
}

.page-button--active {
  border-color: #0d6efd;
  background: #0d6efd;
  color: #fff;
  cursor: default;
}

.pagination-control:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pagination-control:focus-visible,
.page-button:focus-visible {
  outline: 3px solid rgba(13, 110, 253, 0.3);
  outline-offset: 2px;
}

.pagination-ellipsis {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  min-height: 40px;
  color: var(--bs-secondary-color, #6c757d);
  user-select: none;
}

.app-paginator--dark .page-button,
.app-paginator--dark .pagination-control {
  border-color: #495057;
  background: #2b3035;
  color: #dee2e6;
}

.app-paginator--dark .page-button:hover:not(.page-button--active),
.app-paginator--dark .pagination-control:hover:not(:disabled) {
  border-color: #6c757d;
  background: #3a4148;
}

.pagination-list--dark .page-button--active {
  border-color: #6ea8fe;
  background: #0d6efd;
  color: #fff;
}

.mobile-page-status {
  display: none;
  min-width: 64px;
  color: var(--bs-body-color, #212529);
  font-weight: 700;
  text-align: center;
}

@media (max-width: 575.98px) {
  .app-paginator {
    gap: 0.45rem;
  }

  .pagination-list {
    display: none;
  }

  .mobile-page-status {
    display: inline-block;
  }

  .pagination-control {
    min-width: 44px;
    padding: 0.5rem 0.7rem;
  }

  .control-label {
    display: none;
  }
}
</style>
