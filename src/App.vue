// src/App.vue
<template>
  <div id="app">
    <AppNavbar />
    <MyAppBreadcrumbs />
    <router-view />
    <Footer /> 
  </div>
</template>

<script>
import { ref, provide } from 'vue'; 
import AppNavbar from './components/AppNavbar.vue';
import MyAppBreadcrumbs from './components/AppBreadcrumbs.vue';
import Footer from './components/AppFooter.vue'; 

import { API_URL, GIF_LOAD, SUN_ICON, MOON_ICON } from '@/config/config';

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
    sunIcon: SUN_ICON,
    moonIcon: MOON_ICON
  },
  setup() {
    const mode = ref('light');

    const toggleMode = () => {
      mode.value = mode.value === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', mode.value);
      localStorage.setItem('theme', mode.value);
    };

    // Cargar el modo guardado
    const savedMode = localStorage.getItem('theme');
    if (savedMode) {
      mode.value = savedMode;
      document.body.setAttribute('data-theme', mode.value);
    }

    provide('mode', mode);
    provide('toggleMode', toggleMode);

    return {
      mode,
      toggleMode
    };
  }
};
</script>

<style>
  /* Estilos generales para el modo claro */
  body[data-theme='light'] {
      background-color: #ffffff; /* Color de fondo claro */
      color: #000000; /* Color de texto claro */
  }

  /* Estilos generales para el modo oscuro */
  body[data-theme='dark'] {
      background-color: #121212; /* Color de fondo oscuro */
      color: #ffffff; /* Color de texto oscuro */
  }

  /* Si necesitas cambiar estilos específicos de elementos dentro del router-view */
  .router-view {
      padding: 20px; /* Añadir espaciado */
  }

</style>
