// src/main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { createPinia } from 'pinia';
import { createHead } from '@vueuse/head';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "./firebase.ts";

import i18n from '@/i18n' // 👈 ahora sí

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