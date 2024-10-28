import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore'; // Importa el store de autenticación de Pinia

// Importa los componentes correspondientes
import HomeView from '@/views/HomeView.vue';
import ViewEditProfile from '@/views/ViewEditProfile.vue';
import ViewTeamsPublic from '@/views/ViewTeamsPublic.vue';
import ViewMyTeams from '@/views/ViewMyTeams.vue';
import ViewPokemonPublic from '@/views/ViewPokemonsPublic.vue';
import ViewMyPokemons from '@/views/ViewMyPokemons.vue';
import TeamDetail from '@/views/TeamDetail.vue';
import PokemonDetail from '@/views/PokemonDetail.vue';
import ViewCreateTeam from '@/views/ViewCreateTeam.vue';
import ViewCreatePokemon from '@/views/ViewCreatePokemon.vue';
import LoginPage from '@/views/ViewLogin.vue';
import ViewCreateAccount from '@/views/ViewCreateAccount.vue';

import ViewEditTeamDetail from '@/views/MyTeamDetail.vue';
import ViewEditPokemonDetail from '@/views/MyPokemonDetail.vue';

import ViewVerifyAccount from '@/views/VerifyAccount.vue';

import ViewForgotPassword from '@/views/ViewForgotPassword.vue';
import ViewResetPassword from '@/views/ViewRecuperarPassword.vue';

// Define las rutas
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/login',
    name: 'LoginPage',
    component: LoginPage,
    meta: {
      title: 'Login',
      breadcrumb: {
        text: 'Home',
        link: '/',
      },
    },
  },
  {
    path: '/create-team',
    name: 'ViewCreateTeam',
    component: ViewCreateTeam,
    meta: {
      title: 'Crear Equipo',
      breadcrumb: {
        text: 'Equipos',
        link: '/teams',
      },
    },
  },
  {
    path: '/create-pokemon',
    name: 'ViewCreatePokemon',
    component: ViewCreatePokemon,
    meta: {
      title: 'Crear Pokemon',
      breadcrumb: {
        text: 'Pokémon',
        link: 'pokemons',
      },
    },
  },
  {
    path: '/teams',
    name: 'ViewTeamsPublic',
    component: ViewTeamsPublic,
    meta: {
      title: 'Equipos',
      breadcrumb: {
        text: 'Home',
        link: '/',
      },
    },
  },
  {
    path: '/team/:id',
    name: 'TeamDetail',
    component: TeamDetail,
    props: true,
    meta: {
      title: 'Equipo',
      breadcrumb: {
        text: 'Equipos',
        link: '/teams',
      },
    },
  },
  {
    path: '/pokemons',
    name: 'ViewPokemonPublic',
    component: ViewPokemonPublic,
    meta: {
      title: 'Pokemons',
      breadcrumb: {
        text: 'Home',
        link: '/',
      },
    },
  },
  {
    path: '/pokemon/:id',
    name: 'PokemonDetail',
    component: PokemonDetail,
    props: true,
    meta: {
      title: 'Pokemon',
      breadcrumb: {
        text: 'Pokémons',
        link: '/pokemons',
      },
    },
  },
  {
    path: '/create-account',
    name: 'CrearCuenta',
    component: ViewCreateAccount,
    meta: {
      title: 'Crear cuenta',
      breadcrumb: {
        text: 'Home',
        link: '/',
      },
    },
  },
  {
    path: '/perfil',
    name: 'ViewEditProfile',
    component: ViewEditProfile,
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore(); // Usa el authStore de Pinia
      if (!authStore.isAuthenticated) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
    meta: {
      title: 'Perfil',
      breadcrumb: {
        text: 'Home',
        link: '/',
      },
    },
  },
  {
    path: '/my-pokemons/:id_user',
    name: 'ViewMyPokemons',
    component: ViewMyPokemons,
    props: true,
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore(); // Usa el authStore de Pinia
      if (!authStore.isAuthenticated) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
    meta: {
      title: 'Mis Pokemons',
      breadcrumb: {
        text: 'Pokémon',
        link: '/pokemons',
      },
    },
  },
  {
    path: '/my-pokemon-detail/:id',
    name: 'ViewEditPokemonDetail',
    component: ViewEditPokemonDetail,
    props: true,
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore(); // Usa el authStore de Pinia
      if (!authStore.isAuthenticated) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
    meta: {
      title: 'Mis Pokemons',
      breadcrumb: {
        text: 'Pokémons',
        link: '/pokemons',
      }
    }
  },
  {
    path: '/my-teams/:id_user',
    name: 'ViewMyTeams',
    component: ViewMyTeams,
    props: true,
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore(); // Usa el authStore de Pinia
      if (!authStore.isAuthenticated) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
    meta: {
      title: 'Mis Equipos',
      breadcrumb: {
        text: 'Equipos',
        link: '/teams',
      },
    },
  },
  {
    path:'/my-team-detail/:id',
    name: 'ViewEditTeamDetail',
    component: ViewEditTeamDetail,
    props: true,
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore(); // Usa el authStore de Pinia
      if (!authStore.isAuthenticated) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
    meta: {
      title: 'Mi Equipo',
      breadcrumb: {
        text: 'Equipos',
        link: '/teams',
      }
    }
  },
  {
    path: '/verify-account',
    name: 'VerifyAccount',
    component: ViewVerifyAccount,
    meta: {
      title: 'Verificar cuenta',
      //breadcrumb: {
      //  text: 'Home',
      //  link: '/',
      //},
    }
  },
  {
    path: '/forgot-password',
    name: 'ViewForgotPassword',
    component: ViewForgotPassword,
    meta: {
      title: 'Olvide mi contraseña',
    }
  },
  {
    path: '/reset-password',
    name: 'ViewResetPassword',
    component: ViewResetPassword,
    meta: {
      title: 'Restablecer contraseña',
    }
  }
];



// Crea el router
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  document.title = to.meta.title || 'Respaldo Equipos Pokémon'; // Cambiar el título dinámicamente
  next();
});

export default router;
