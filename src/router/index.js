// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// Importa los componentes correspondientes
import HomeView from '@/views/HomeView.vue';
import ViewEditProfile from '@/views/ViewEditProfile.vue';
import ViewEditTeams from '@/views/ViewEditTeams.vue';
import ViewEditPokemons from '@/views/ViewEditPokemons.vue';
import TeamDetail from '@/views/TeamDetail.vue';
import ViewCreateTeam from '@/views/ViewCreateTeam.vue';
import ViewCreatePokemon from '@/views/ViewCreatePokemon.vue';
import LoginPage from '@/views/ViewLogin.vue';
import { isAuthenticated } from '../services/isAuthenticated';

// Define las rutas
const routes = [
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage,
  },
  {
    path: '/', // Ruta principal
    name: 'Home',
    component: HomeView, // Componente que se va a renderizar para esta ruta
  },
  {
    path: '/perfil',
    name: 'ViewEditProfile',
    component: ViewEditProfile,
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated.value) {
        //next('/login'); // Redirige a la página de inicio de sesión si no está autenticado
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
  },
  {
    path: '/teams',
    component: ViewEditTeams,
    name: 'ViewEditTeams',
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated.value) {
        //next('/login'); // Redirige a la página de inicio de sesión si no está autenticado
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
  },
  {
    path: '/pokemons',
    name: 'ViewEditPokemons',
    component: ViewEditPokemons,
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated.value) {
        //next('/login'); // Redirige a la página de inicio de sesión si no está autenticado
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
  },
  {
    path: '/team/:id',
    name: 'TeamDetail',
    component: TeamDetail,
    props: true // Permite pasar el parámetro 'id' como prop al componente
  },
  {
    path: '/create-team',
    name: 'ViewCreateTeam',
    component: ViewCreateTeam
  },
  {
    path: '/create-pokemon',
    name: 'ViewCreatePokemon',
    component: ViewCreatePokemon
  }
];

// Crea el router
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
