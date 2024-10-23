// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';

// Importa los componentes correspondientes
import HomeView from '@/views/HomeView.vue';
import ViewEditProfile from '@/views/ViewEditProfile.vue';
import ViewTeamsPublic from '@/views/ViewTeamsPublic.vue';
import ViewEditTeams from '@/views/ViewEditTeams.vue';
import ViewPokemonPublic from '@/views/ViewPokemonsPublic.vue';
import ViewEditPokemons from '@/views/ViewEditPokemons.vue';
import TeamDetail from '@/views/TeamDetail.vue';
import PokemonDetail from '@/views/PokemonDetail.vue';
import ViewCreateTeam from '@/views/ViewCreateTeam.vue';
import ViewCreatePokemon from '@/views/ViewCreatePokemon.vue';
import LoginPage from '@/views/ViewLogin.vue';
import { isAuthenticated } from '../services/isAuthenticated';
import ViewCreateAccount from '@/views/ViewCreateAccount.vue';


console.log('isAuthenticated '+isAuthenticated.value);

// Define las rutas
const routes = [
  {
    path: '/', // Ruta principal
    name: 'Home',
    component: HomeView, // Componente que se va a renderizar para esta ruta
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage,
    meta: {
      title: 'Login',
      breadcrumb: {
        text: 'Home',
        link: '/'
      } 
    }
  },
  {
    path: '/create-team',
    name: 'ViewCreateTeam',
    component: ViewCreateTeam,
    meta:{
      title: 'Crear Equipo',
      breadcrumb: {
        text: 'Equipos',
        link: '/teams'
      }
    }
  },
  {
    path: '/create-pokemon',
    name: 'ViewCreatePokemon',
    component: ViewCreatePokemon,
    meta:{
      title: 'Crear Pokemon',
      breadcrumb:{ 
        text: 'Pokémon', 
        link:'pokemons'
      }
    }
  },
  {
    path: '/teams',
    component: ViewTeamsPublic,
    name: 'ViewTeamsPublic',
    meta:{
      title: 'Equipos',
      breadcrumb: {
        text: 'Home',
        link: '/'
      }
    }
  },
  {
    path: '/team/:id',
    name: 'TeamDetail',
    component: TeamDetail,
    props: true, // Permite pasar el parámetro 'id' como prop al componente
    meta:{
      title: 'Equipo',
      breadcrumb: {
        text: 'Equipos',
        link: '/teams'
      }
    }
  },
  {
    path: '/pokemons',
    name: 'ViewPokemonPublic',
    component: ViewPokemonPublic,
    meta:{
      title: 'Pokemons',
      breadcrumb: {
        text: 'Home',
        link: '/'
      }
    }
  },
  {
    path: '/pokemon/:id',
    name: 'PokemonDetail',
    component: PokemonDetail,
    props: true,
    meta:{
      title: 'Pokemon',
      breadcrumb: {
        text: 'Pokémons',
        link: '/pokemons'
      }
    }
  },
  {
    path:'/create-account',
    name: 'CrearCuenta',
    component: ViewCreateAccount,
    meta:{
      title: 'Crear cuenta',
      breadcrumb: {
        text: 'Home',
        link: '/'
      }
    }
  },
  {
    path: '/perfil',
    name: 'ViewEditProfile',
    component: ViewEditProfile,
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated.value) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
    meta:{
      title: 'Perfil',
      breadcrumb: {
        text: 'Home', 
        link:'/'
      }
    }
  },
  {
    path: '/my-pokemons/:id_user',
    name: 'ViewEditPokemons',
    component: ViewEditPokemons,
    props: true,
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated.value) {
        //next('/login'); // Redirige a la página de inicio de sesión si no está autenticado
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
    meta:{
      title: 'Mis Pokemons',
      breadcrumb: {
        text: 'Pokémon',
        link: '/pokemons'
      }
    }
  },
  {
    path: '/my-teams/:id_user',
    component: ViewEditTeams,
    name: 'ViewEditTeams',
    props: true,
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated.value) {
        //next('/login'); // Redirige a la página de inicio de sesión si no está autenticado
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
    meta:{
      title: 'Mis Equipos',
      breadcrumb: {
        text: 'Equipos',
        link: '/teams'
      }
    }
  },
  /*
  {
    path: '/my-team/:id',
    name: 'TeamDetail',
    component: TeamDetail,
    props: true, // Permite pasar el parámetro 'id' como prop al componente
    beforeEnter: (to, from, next) => {
      if (!isAuthenticated.value) {
        //next('/login'); // Redirige a la página de inicio de sesión si no está autenticado
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    }
  }*/
];

// Crea el router
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
