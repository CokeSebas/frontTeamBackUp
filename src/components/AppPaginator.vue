<template>
  <nav aria-label="Page navigation" v-if="totalPages > 1" class="d-none d-md-block">
    <ul :class="['pagination justify-content-center', { 'pagination-dark': mode === 'dark' }]">
      <!-- Botón "Anterior" -->
      <li :class="['page-item', { disabled: currentPage === 1 }]">
        <button class="page-link" @click="changePage(currentPage - 1)" :disabled="currentPage === 1">
          &laquo;
        </button>
      </li>

      <!-- Números de página -->
      <li
        v-for="page in visiblePages"
        :key="page"
        :class="['page-item', { active: currentPage === page }]"
      >
        <button class="page-link" @click="changePage(page)">
          {{ page }}
        </button>
      </li>

      <!-- Botón "Siguiente" -->
      <li :class="['page-item', { disabled: currentPage === totalPages }]">
        <button class="page-link" @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages">
          &raquo;
        </button>
      </li>
    </ul>
  </nav>

  <!-- PAGINADOR MOBILE -->
  <nav
    class="d-md-none mobile-paginator"
    aria-label="Page navigation"
    v-if="totalPages > 1"
  >
    <button
      class="btn btn-success"
      :disabled="currentPage === 1"
      @click="changePage(currentPage - 1)"
    >
      &laquo;
    </button>

    <ul :class="['pagination mb-0', { 'pagination-dark': mode === 'dark' }]">
      <li
        v-for="page in mobilePages"
        :key="page"
        :class="['page-item', { active: currentPage === page }]"
      >
        <button class="page-link" @click="changePage(page)">
          {{ page }}
        </button>
      </li>
    </ul>

    <button
      class="btn btn-success"
      :disabled="currentPage === totalPages"
      @click="changePage(currentPage + 1)"
    >
      &raquo;
    </button>
  </nav>


</template>

<script>
export default {
  inject: ['mode'],
  props: {
    items: {
      type: Array,
      required: true
    },
    itemsPerPage: {
      type: Number,
      default: 5
    },
  },
  data() {
    return {
      currentPage: 1
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.items.length / this.itemsPerPage);
    },
    paginatedItems() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.items.slice(start, start + this.itemsPerPage);
    },
    darkMode() {
      return this.mode;
    },
    visiblePages() {
      const maxVisible = 30;
      const half = Math.floor(maxVisible / 2);

      let start = this.currentPage - half;
      let end = this.currentPage + half - 1;

      if (start < 1) {
        start = 1;
        end = Math.min(this.totalPages, maxVisible);
      }

      if (end > this.totalPages) {
        end = this.totalPages;
        start = Math.max(1, end - maxVisible + 1);
      }

      return Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
      );
    },
    mobilePages() {
      const maxVisible = 5;
      const half = Math.floor(maxVisible / 2);

      let start = this.currentPage - half;
      let end = this.currentPage + half;

      if (start < 1) {
        start = 1;
        end = Math.min(this.totalPages, maxVisible);
      }

      if (end > this.totalPages) {
        end = this.totalPages;
        start = Math.max(1, end - maxVisible + 1);
      }

      return Array.from(
        { length: end - start + 1 },
        (_, i) => start + i
      );
    }

  },
  watch: {
    paginatedItems(newItems) {
      this.$emit('page-changed', newItems);
    }
  },
  methods: {
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
      }
    }
  }
};
</script>

<style scoped>
  .pagination-dark .page-item .page-link {
    background-color: #333; /* Fondo oscuro */
    color: #e0e0e0; /* Color claro del texto */
    border-color: #444; /* Color del borde */
  }
  .pagination-dark .page-item.active .page-link {
    background-color: #555; /* Fondo para el activo en modo oscuro */
    color: white; /* Color de texto blanco para el activo */
    border-color: #555; /* Color del borde */
  }
  .pagination-dark .page-item.disabled .page-link {
    color: #777; /* Color gris para los deshabilitados */
    background-color: #333;
    border-color: #444;
  }
  .page-link {
    cursor: pointer;
  }

  .mobile-paginator {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .mobile-paginator .pagination {
    display: flex;
    gap: 4px;
  }

  .mobile-paginator .page-link {
    padding: 6px 10px;
    font-size: 14px;
  }

  /* Dark mode */
  .pagination-dark .page-item .page-link {
    background-color: #333;
    color: #e0e0e0;
  }


</style>
