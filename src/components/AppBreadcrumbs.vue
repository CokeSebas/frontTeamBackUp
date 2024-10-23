<template>
  <nav aria-label="breadcrumb" class="breadcrumb-container">
    <ol class="breadcrumb">
      <li class="breadcrumb-item" v-for="(crumb, index) in breadcrumbs" :key="index">
        <router-link v-if="crumb.link" :to="crumb.link">{{ crumb.text }}</router-link>
        <span v-else>{{ crumb.text }}</span>
      </li>
    </ol>
  </nav>
</template>

<script>
  export default {
    name: 'AppBreadcrumbs',
    computed: {
      breadcrumbs() {
        return this.$route.matched
          .filter(route => route.meta && route.meta.breadcrumb)
          .map(route => {
            const breadcrumb = route.meta.breadcrumb;
            return {
              text: breadcrumb.text,
              link: breadcrumb.link
            };
          });
      }
    }
  };
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
