<template>
  <div
    class="app-layout"
    :class="{ 'theme-dark': mode === 'dark' }"
    :data-page-theme="pageTheme"
  >
    <AppNavbar />
    <!--<MyAppBreadcrumbs />-->
    <router-view />
    <Footer />
    <ScrollToTopButton />
  </div>
</template>

<script>
import { computed, provide, ref, watchEffect } from 'vue';
import { useRoute } from 'vue-router';

import AppNavbar from './components/AppNavbar.vue';
//import MyAppBreadcrumbs from './components/AppBreadcrumbs.vue';
import Footer from './components/AppFooter.vue';
import ScrollToTopButton from './components/ScrollToTopButton.vue';

import {
  API_URL,
  GIF_LOAD,
  SUN_ICON,
  MOON_ICON,
  UNOW_ICON,
  NOTT_ICON
} from '@/config/config';

const ALLOWED_PAGE_THEMES = [
  'green',
  'purple',
  'blue',
  'yellow',
  'neutral'
];

export default {
  name: 'App',

  components: {
    AppNavbar,
    //MyAppBreadcrumbs,
    Footer,
    ScrollToTopButton
  },
  provide: {
    apiUrl: API_URL,
    gifLoading: GIF_LOAD,
    sunIcon: SUN_ICON,
    moonIcon: MOON_ICON,
    unowIcon: UNOW_ICON,
    notificacionIcon: NOTT_ICON
  },

  setup() {
    const route = useRoute();
    const mode = ref('light');

    const applyModeToDocument = (selectedMode) => {
      document.body.setAttribute('data-theme', selectedMode);
    };

    const toggleMode = () => {
      mode.value = mode.value === 'dark'
        ? 'light'
        : 'dark';

      applyModeToDocument(mode.value);

      try {
        localStorage.setItem('theme', mode.value);
      } catch (error) {
        console.warn(
          'No fue posible guardar el tema seleccionado.',
          error
        );
      }
    };

    try {
      const savedMode = localStorage.getItem('theme');

      if (savedMode === 'light' || savedMode === 'dark') {
        mode.value = savedMode;
      }
    } catch (error) {
      console.warn(
        'No fue posible recuperar el tema guardado.',
        error
      );
    }

    applyModeToDocument(mode.value);

    const pageTheme = computed(() => {
      /*
       * Busca el tema desde la ruta más específica hacia
       * sus rutas padre. Esto es más seguro cuando existen
       * rutas anidadas.
       */
      const matchedTheme = [...route.matched]
        .reverse()
        .map((matchedRoute) => matchedRoute.meta?.themeColor)
        .find((themeColor) => themeColor !== undefined && themeColor !== null);

      const normalizedTheme = String(
        matchedTheme ?? route.meta?.themeColor ?? 'neutral'
      )
        .trim()
        .toLowerCase();
        

      /*
       * Un valor ausente, mal escrito o no permitido nunca
       * debe volver automáticamente al verde.
       */
      return ALLOWED_PAGE_THEMES.includes(normalizedTheme)
        ? normalizedTheme
        : 'neutral';
    });

    /*
     * Facilita la inspección desde el navegador y permite
     * que componentes teletransportados al body conozcan
     * también el tema actual.
     */
    watchEffect(() => {
      document.documentElement.setAttribute(
        'data-page-theme',
        pageTheme.value
      );

      document.body.setAttribute(
        'data-page-theme',
        pageTheme.value
      );
    });

    provide('mode', mode);
    provide('toggleMode', toggleMode);

    return {
      mode,
      pageTheme,
      toggleMode
    };
  }
};
</script>

<style>
  html,
  body,
  #app {
    min-height: 100%;
  }

  body {
    margin: 0;
    transition:
      background-color 250ms ease,
      color 250ms ease;
  }

  body[data-theme='light'] {
    background-color: #ffffff;
    color: #000000;
  }

  body[data-theme='dark'] {
    background-color: #121212;
    color: #ffffff;
  }

  .router-view {
    padding: 20px;
  }

  /* =====================================================
  * Estructura y tema base
  * ===================================================== */
  .app-layout {
    /*
    * Valores neutros por defecto. Si una ruta no entrega
    * themeColor, la interfaz nunca queda verde por accidente.
    */
    --layout-accent: #4b5563;
    --layout-accent-strong: #252a31;
    --layout-accent-bright: #8b95a3;
    --layout-accent-soft: rgba(75, 85, 99, 0.14);
    --layout-accent-border: rgba(75, 85, 99, 0.28);
    --layout-accent-glow: rgba(0, 0, 0, 0.18);

    --layout-navbar-start: #17171d;
    --layout-navbar-end: #101014;
    --layout-footer-start: #101014;
    --layout-footer-end: #17171d;

    display: flex;
    min-height: 100dvh;
    flex-direction: column;

    transition:
      background-color 250ms ease,
      color 250ms ease;
  }

  .app-layout[data-page-theme='neutral'] {
    --layout-accent: #4b5563;
    --layout-accent-strong: #252a31;
    --layout-accent-bright: #8b95a3;
    --layout-accent-soft: rgba(75, 85, 99, 0.14);
    --layout-accent-border: rgba(75, 85, 99, 0.28);
    --layout-accent-glow: rgba(0, 0, 0, 0.18);

    --layout-navbar-start: #17171d;
    --layout-navbar-end: #101014;
    --layout-footer-start: #101014;
    --layout-footer-end: #17171d;
  }

  /* =====================================================
  * VERDE ELÉCTRICO
  * ===================================================== */
  .app-layout[data-page-theme='green'] {
    --layout-accent: #198754;
    --layout-accent-strong: #146c43;
    --layout-accent-bright: #37be78;
    --layout-accent-soft: rgba(25, 135, 84, 0.14);
    --layout-accent-border: rgba(25, 135, 84, 0.28);
    --layout-accent-glow: rgba(25, 135, 84, 0.2);

    --layout-navbar-start: #eef7f2;
    --layout-navbar-end: #f5f7f8;
    --layout-footer-start: #f5f7f8;
    --layout-footer-end: #edf5f0;
  }

  /* =====================================================
  * MORADO ELÉCTRICO MODERADO
  * ===================================================== */
  .app-layout[data-page-theme='purple'] {
    --layout-accent: #7657d8;
    --layout-accent-strong: #6044bd;
    --layout-accent-bright: #9a82e8;
    --layout-accent-soft: rgba(118, 87, 216, 0.14);
    --layout-accent-border: rgba(118, 87, 216, 0.28);
    --layout-accent-glow: rgba(118, 87, 216, 0.2);

    --layout-navbar-start: #f2effb;
    --layout-navbar-end: #f5f7f8;
    --layout-footer-start: #f5f7f8;
    --layout-footer-end: #f0edf9;
  }

  /* =====================================================
  * AZUL ELÉCTRICO
  * ===================================================== */
  .app-layout[data-page-theme='blue'] {
    --layout-accent: #2563eb;
    --layout-accent-strong: #1d4ed8;
    --layout-accent-bright: #60a5fa;
    --layout-accent-soft: rgba(37, 99, 235, 0.14);
    --layout-accent-border: rgba(37, 99, 235, 0.28);
    --layout-accent-glow: rgba(37, 99, 235, 0.2);

    --layout-navbar-start: #eef4ff;
    --layout-navbar-end: #f4f6f9;
    --layout-footer-start: #f4f6f9;
    --layout-footer-end: #edf3ff;
  }

  /* =====================================================
  * AMARILLO ELÉCTRICO
  * ===================================================== */
  .app-layout[data-page-theme='yellow'] {
    --layout-accent: #d4ad22;
    --layout-accent-strong: #b88b12;
    --layout-accent-bright: #eccf5b;
    --layout-accent-soft: rgba(212, 173, 34, 0.14);
    --layout-accent-border: rgba(184, 139, 18, 0.3);
    --layout-accent-glow: rgba(212, 173, 34, 0.2);

    --layout-navbar-start: #fff9e8;
    --layout-navbar-end: #fffdf5;
    --layout-footer-start: #fffdf5;
    --layout-footer-end: #fff8e2;
  }


  /* =====================================================
  * NEUTRAL — MODO OSCURO
  * ===================================================== */
  .app-layout.theme-dark[data-page-theme='neutral'] {
    --layout-accent: #6b7280;
    --layout-accent-strong: #374151;
    --layout-accent-bright: #9ca3af;
    --layout-accent-soft: rgba(107, 114, 128, 0.14);
    --layout-accent-border: rgba(107, 114, 128, 0.24);
    --layout-accent-glow: rgba(0, 0, 0, 0.2);

    --layout-navbar-start: #17171d;
    --layout-navbar-end: #101014;
    --layout-footer-start: #101014;
    --layout-footer-end: #17171d;
  }

  /* =====================================================
  * VERDE — MODO OSCURO
  * ===================================================== */
  .app-layout.theme-dark[data-page-theme='green'] {
    --layout-accent: #37be78;
    --layout-accent-strong: #2ba968;
    --layout-accent-bright: #6dd99a;
    --layout-accent-soft: rgba(55, 190, 120, 0.14);
    --layout-accent-border: rgba(55, 190, 120, 0.26);
    --layout-accent-glow: rgba(55, 190, 120, 0.18);

    --layout-navbar-start: #18231d;
    --layout-navbar-end: #101412;
    --layout-footer-start: #101412;
    --layout-footer-end: #18211c;
  }

  /* =====================================================
  * MORADO — MODO OSCURO
  * ===================================================== */
  .app-layout.theme-dark[data-page-theme='purple'] {
    --layout-accent: #8264df;
    --layout-accent-strong: #684bc3;
    --layout-accent-bright: #aa94ef;
    --layout-accent-soft: rgba(130, 100, 223, 0.15);
    --layout-accent-border: rgba(170, 148, 239, 0.25);
    --layout-accent-glow: rgba(130, 100, 223, 0.18);

    --layout-navbar-start: #201b2d;
    --layout-navbar-end: #111015;
    --layout-footer-start: #111015;
    --layout-footer-end: #1e1929;
  }

  /* =====================================================
  * AZUL — MODO OSCURO
  * ===================================================== */
  .app-layout.theme-dark[data-page-theme='blue'] {
    --layout-accent: #3b82f6;
    --layout-accent-strong: #2563eb;
    --layout-accent-bright: #60a5fa;
    --layout-accent-soft: rgba(59, 130, 246, 0.15);
    --layout-accent-border: rgba(96, 165, 250, 0.26);
    --layout-accent-glow: rgba(59, 130, 246, 0.18);

    --layout-navbar-start: #172033;
    --layout-navbar-end: #111827;
    --layout-footer-start: #111827;
    --layout-footer-end: #192335;
  }

  /* =====================================================
  * AMARILLO — MODO OSCURO
  * ===================================================== */
  .app-layout.theme-dark[data-page-theme='yellow'] {
    --layout-accent: #dfc14d;
    --layout-accent-strong: #c7a92f;
    --layout-accent-bright: #f0d96c;
    --layout-accent-soft: rgba(223, 193, 77, 0.14);
    --layout-accent-border: rgba(223, 193, 77, 0.28);
    --layout-accent-glow: rgba(223, 193, 77, 0.18);

    --layout-navbar-start: #242116;
    --layout-navbar-end: #14130f;
    --layout-footer-start: #14130f;
    --layout-footer-end: #211e14;
  }
  
</style>
