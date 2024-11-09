// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { createPinia } from 'pinia';
import { createHead } from '@vueuse/head';


import { createI18n } from 'vue-i18n';
// Importar archivos de traducción
import en from './locales/en.json';
import es from './locales/es.json';
import br from './locales/br.json';



// Configurar i18n
const i18n = createI18n({
  locale: localStorage.getItem('locale') || 'es', // Establece el idioma inicial
  fallbackLocale: 'es', // Idioma de respaldo en caso de que falte una clave de traducción
  messages: {
    en,
    es,
    br
  }
});

const app = createApp(App);
const pinia = createPinia();
const head = createHead();

app.use(router);
app.use(pinia);
app.use(i18n);
app.use(head);

//app.component("font-awesome-icon", FontAwesomeIcon);

app.mount('#app');

//para usar local
//npm run serve


//subir a google
//npm run build
//firebase deploy


//firebaseinit