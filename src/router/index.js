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

import ViewAddTournament from '@/views/ViewAddTournament.vue';
import ViewListUsers from '@/views/ViewListUsers.vue';
import ViewOrgTorneo from '@/views/ViewOrgTorneo.vue';
import ViewGoToRound from '@/views/ViewGoToRound.vue';
import ViewGoToStanding from '@/views/ViewGoToStanding.vue';
import ViewGoToResults from '@/views/ViewGoToResults.vue';
import ViewTournaments from '@/views/ViewSeeTournamets.vue';
import ViewAddStanding from '@/views/ViewAddStanding.vue';
import ViewTopsTournament from '@/views/ViewTopsTournament.vue';

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
        text: 'Perfil',
        link: '/perfil',
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
        text: 'Perfil',
        link: '/perfil/',
      }
    }
  },
  {
    path: '/verify-account',
    name: 'VerifyAccount',
    component: ViewVerifyAccount,
    meta: {
      title: 'Verificar cuenta',
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
  },
  {
    path: '/add-tournament/:id_user',
    name: 'ViewAddTournament',
    component: ViewAddTournament,
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore(); // Usa el authStore de Pinia
      if (!authStore.isAuthenticated) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
  },
  {
    path: '/add-standing/:id_torneo',
    name: 'ViewAddStanding',
    component: ViewAddStanding,
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore(); // Usa el authStore de Pinia
      if (!authStore.isAuthenticated) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
    meta: {
      title: 'Organizar Torneo',
      breadcrumb: {
        text: 'Agregar Torneo',
        link: 'back',
      }
    }
  },
  {
    path:'/goToTops/:id_torneo',
    name: 'ViewTopsTournament',
    component: ViewTopsTournament,
    meta: {
      title: 'Ver Top',
      breadcrumb: {
        text: 'Ver Torneos',
        link: 'back',
      }
    }
  },
  {
    path: '/list-users',
    name: 'ViewListUsers',
    component: ViewListUsers,
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore(); // Usa el authStore de Pinia
      if (!authStore.isAuthenticated) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
    meta: {
      title: 'Agregar Torneo',
      breadcrumb: {
        text: 'Perfil',
        link: '/perfil',
      },
    }
  },
  {
    path: '/ver-torneos',
    name: 'ViewTournaments',
    component: ViewTournaments,
    meta: {
      title: 'Ver Torneos',
      breadcrumb: {
        text: 'Home',
        link: '/',
      },
    }
  },
  {
    path: '/organizar-torneo/:id_torneo',
    name: 'ViewOrgTorneo',
    component: ViewOrgTorneo,
    meta: {
      title: 'Organizar Torneo',
      breadcrumb: {
        text: 'Agregar Torneo',
        link: 'back',
      }
    }
  },
  {
    path: '/view-round/:id_torneo',
    name: 'ViewGoToRound',
    component: ViewGoToRound,
    meta: {
      title: 'Ronda Actual',
      breadcrumb: {
        text: 'Organizar Torneo',
        link: 'back',
      }
    }
  },
  {
    path: '/goToStanding/:id_torneo',
    name: 'ViewGoToStanding',
    component: ViewGoToStanding,
    meta: {
      title: 'Standing',
      breadcrumb: {
        text: 'Organizar Torneo',
        link: 'back',
      }
    }
  },
  {
    path: '/goToResults/:id_torneo',
    name: 'ViewGoToResults',
    component: ViewGoToResults,
    meta: {
      title: 'Resultados',
      breadcrumb: {
        text: 'Organizar Torneo',
        link: 'back',
      }
    }
  },
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
