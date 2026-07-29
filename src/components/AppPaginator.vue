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
import { computed, inject, ref, unref, watch } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 5,
    validator: (value) => Number.isInteger(value) && value > 0
  }
})

const emit = defineEmits(['page-changed'])

const injectedMode = inject('mode', ref('light'))
const currentPage = ref(1)

const mode = computed(() =>
  unref(injectedMode) === 'dark' ? 'dark' : 'light'
)

const totalPages = computed(() =>
  Math.ceil(props.items.length / props.itemsPerPage)
)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  return props.items.slice(start, start + props.itemsPerPage)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const siblingCount = 1

  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => ({
      key: `page-${index + 1}`,
      type: 'page',
      page: index + 1
    }))
  }

  const pages = new Set([1, total])

  for (
    let page = Math.max(2, current - siblingCount);
    page <= Math.min(total - 1, current + siblingCount);
    page += 1
  ) {
    pages.add(page)
  }

  if (current <= 3) {
    pages.add(2)
    pages.add(3)
    pages.add(4)
  }

  if (current >= total - 2) {
    pages.add(total - 1)
    pages.add(total - 2)
    pages.add(total - 3)
  }

  const sortedPages = [...pages]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)

  const result = []

  sortedPages.forEach((page, index) => {
    const previousPage = sortedPages[index - 1]

    if (previousPage && page - previousPage > 1) {
      result.push({
        key: `ellipsis-${previousPage}-${page}`,
        type: 'ellipsis'
      })
    }

    result.push({
      key: `page-${page}`,
      type: 'page',
      page
    })
  })

  return result
})

function changePage(page) {
  const normalizedPage = Number(page)

  if (
    !Number.isInteger(normalizedPage) ||
    normalizedPage < 1 ||
    normalizedPage > totalPages.value ||
    normalizedPage === currentPage.value
  ) {
    return
  }

  currentPage.value = normalizedPage
}

function clampCurrentPage() {
  if (totalPages.value === 0) {
    currentPage.value = 1
    return
  }

  currentPage.value = Math.min(currentPage.value, totalPages.value)
}

watch(
  () => props.items,
  () => {
    currentPage.value = 1
  }
)

watch(
  () => [props.items.length, props.itemsPerPage],
  clampCurrentPage
)

watch(
  paginatedItems,
  (items) => {
    emit('page-changed', items)
  },
  { immediate: true }
)

defineExpose({
  changePage,
  resetPage: () => {
    currentPage.value = 1
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
