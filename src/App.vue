<!-- src/App.vue -->
<template>
  <div id="app">
    <AppNavbar />
    <MyAppBreadcrumbs /> <!-- Cambiado aquí -->
    <router-view />
    <Footer /> 
  </div>
</template>

<script>
import AppNavbar from './components/AppNavbar.vue';
import MyAppBreadcrumbs from './components/AppBreadcrumbs.vue'; // Cambiado aquí
import Footer from './components/AppFooter.vue'; // Ajusta la ruta si es necesario

import { API_URL, GIF_LOAD } from '@/config/config';


export default {
  name: 'App',
  components: {
    AppNavbar,
    MyAppBreadcrumbs,
    Footer
  },
  provide: {
    apiUrl: API_URL,
    gifLoading: GIF_LOAD,
  }
};
</script>

<style>
/* Estilos adicionales si los necesitas */
</style>
