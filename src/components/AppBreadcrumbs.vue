<template>
  <nav aria-label="breadcrumb" class="breadcrumb-container">
    <ol class="breadcrumb">
      <li
        class="breadcrumb-item"
        v-for="(crumb, index) in breadcrumbs"
        :key="index"
      >
        <!-- Breadcrumb normal -->
        <router-link
          v-if="crumb.link && crumb.link !== 'back'"
          :to="crumb.link"
        >
          {{ crumb.text }}
        </router-link>

        <!-- Breadcrumb volver atrás -->
        <a
          v-else-if="crumb.link === 'back'"
          href="#"
          @click.prevent="goBack"
        >
          {{ crumb.text }}
        </a>

        <!-- Breadcrumb solo texto -->
        <span v-else>
          {{ crumb.text }}
        </span>
      </li>
    </ol>
  </nav>
</template>


<script>
export default {
  name: 'AppBreadcrumbs',
  methods: {
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
      }
    }
  },
  computed: {
    breadcrumbs() {
      return this.$route.matched
        .filter(route => route.meta && route.meta.breadcrumb)
        .map(route => ({
          text: route.meta.breadcrumb.text,
          link: route.meta.breadcrumb.link
        }))
    }
  }
}
</script>


<style>
  .breadcrumb-container {
    max-width: 1200px; /* Ancho máximo para que no se extienda más allá del contenido */
    margin: 0 auto;    /* Centrado horizontal */
    padding: 1rem;     /* Espaciado alrededor */
  }

  .breadcrumb {
    background: none;
    padding: 0;
    margin-bottom: 1rem;
  }

  .breadcrumb-item + .breadcrumb-item::before {
    content: ">";
    padding: 0 5px;
  }
</style>
