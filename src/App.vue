<!-- src/App.vue -->
<template>
  <div id="app">
    <AppNavbar />
    <MyAppBreadcrumbs /> <!-- Cambiado aquí -->
    <router-view />
    
  </div>
</template>

<script>
import AppNavbar from './components/AppNavbar.vue';
import MyAppBreadcrumbs from './components/AppBreadcrumbs.vue'; // Cambiado aquí

export default {
  name: 'App',
  components: {
    AppNavbar,
    MyAppBreadcrumbs // Cambiado aquí
  }
};
</script>

<style>
/* Estilos adicionales si los necesitas */
</style>
