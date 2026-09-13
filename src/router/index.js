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
import ViewTeamSheet from '@/views/ViewTeamSheet.vue';
import ViewTeamSheetPublic from '@/views/ViewTeamSheet.vue';
import ViewPrintTeamSheet from '@/views/ViewTeamSheet.vue';
import ViewAddMatchRecord from '@/views/ViewAddMatchRecord.vue';
import ViewMyStatsMatch from '@/views/ViewMyStatsMatch.vue';
import ViewGuide from '@/views/ViewGuide.vue';

import i18n from '@/i18n';

import { analytics } from "../firebase.ts";
import { logEvent } from "firebase/analytics";

// Define las rutas
const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: 'Home',
      breadcrumb: {
        text: 'Home',
        link: '/',
      },
      themeColor: 'green',
    },
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
      themeColor: 'green',
    },
  },
  {
    path: '/vgc/create-team',
    name: 'ViewCreateTeam',
    component: ViewCreateTeam,
    meta: {
      title: i18n,
      breadcrumb: {
        text:  i18n.global.t('teams'),
        link: '/vgc/teams',
      },
      themeColor: 'green'
    },
  },
  {
    path: '/vgc/create-pokemon',
    name: 'ViewCreatePokemon',
    component: ViewCreatePokemon,
    meta: {
      title: i18n.global.t('crearPokemon'),
      breadcrumb: {
        text: 'Pokémon',
        link: 'pokemons',
      },
      themeColor: 'green'
    },
  },
  {
    path: '/vgc/teams',
    name: 'ViewTeamsPublic',
    component: ViewTeamsPublic,
    meta: {
      title:  i18n.global.t('teams'),
      breadcrumb: {
        text: 'Home',
        link: '/',
      },
      themeColor: 'green'
    },
  },
  {
    path: '/vgc/team/:id',
    name: 'TeamDetail',
    component: TeamDetail,
    props: true,
    meta: {
      title: i18n.global.t('team'),
      breadcrumb: {
        text:  i18n.global.t('teams'),
        link: '/vgc/teams',
      },
      themeColor: 'green'
    },
  },
  {
    path: '/vgc/pokemons',
    name: 'ViewPokemonPublic',
    component: ViewPokemonPublic,
    meta: {
      title: 'Pokemons',
      breadcrumb: {
        text: 'Home',
        link: '/',
      },
      themeColor: 'green'
    },
  },
  {
    path: '/vgc/pokemon/:id',
    name: 'PokemonDetail',
    component: PokemonDetail,
    props: true,
    meta: {
      title: 'Pokemon',
      breadcrumb: {
        text: 'Pokémons',
        link: '/vgc/pokemons',
      },
      themeColor: 'green'
    },
  },
  {
    path: '/create-account',
    name: 'CrearCuenta',
    component: ViewCreateAccount,
    meta: {
      title: i18n.global.t('createAccount'),
      breadcrumb: {
        text: 'Home',
        link: '/',
      },
      themeColor: 'neutral',
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
      title: i18n.global.t('profile'),
      breadcrumb: {
        text: 'Home',
        link: '/',
      },
      themeColor: 'yellow'
    },
  },
  {
    path: '/vgc/my-pokemons/:id_user',
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
      title: i18n.global.t('myPokemons'),
      breadcrumb: {
        text: i18n.global.t('profile'),
        link: 'back',
      },
      themeColor: 'green'
    },
  },
  {
    path: '/vgc/my-pokemon-detail/:id',
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
      title: i18n.global.t('myPokemons'),
      breadcrumb: {
        text: i18n.global.t('myPokemons'),
        link: 'back',
      },
      themeColor: 'green'
    }
  },
  {
    path: '/vgc/my-teams/:id_user',
    name: 'ViewMyTeams',
    component: ViewMyTeams,
    props: true,
    beforeEnter: (to, from, next) => { // activar login
      const authStore = useAuthStore(); // Usa el authStore de Pinia
      if (!authStore.isAuthenticated) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
    meta: {
      title: i18n.global.t('myTeams'),
      breadcrumb: {
        text: i18n.global.t('profile'),
        link: 'back',
      },
      themeColor: 'green'
    },
  },
  {
    path:'/vgc/my-team-detail/:id',
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
      title: i18n.global.t('myTeams'),
      breadcrumb: {
        text: i18n.global.t('myTeams'),
        link: 'back',
      },
      themeColor: 'green'
    }
  },
  {
    path: '/vgc/my-team-sheet/:id/:type',
    name: 'ViewTeamSheet',
    component: ViewTeamSheet,
    props: true,
    beforeEnter: (to, from, next) => { // activar
      const authStore = useAuthStore(); // Usa el authStore de Pinia
      if (!authStore.isAuthenticated) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
    meta: {
      title: i18n.global.t('myTeams'),
      breadcrumb: {
        text: i18n.global.t('myTeams'),
        link: 'back',
      },
      themeColor: 'blue'
    }
  },
  {
    path: '/vgc/team-sheet/:id/:type',
    name: 'ViewTeamSheetPublic',
    component: ViewTeamSheetPublic,
    props: true,
    meta: {
      title: i18n.global.t('teamSheetSection.title'),
      breadcrumb: {
        text: i18n.global.t('teams'),
        link: 'back',
      },
      themeColor: 'blue'
    }
  },
  {
    path: '/vgc/print-team-sheet',
    name: 'ViewPrintTeamSheet',
    component: ViewPrintTeamSheet,
    props: true,
    meta: {
      title: i18n.global.t('teamSheetSection.title'),
      breadcrumb: {
        text: i18n.global.t('teams'),
        link: 'back',
      },
      themeColor: 'blue'
    }
  },
  {
    path: '/vgc/match-record',
    name: 'ViewAddMatchRecord',
    component: ViewAddMatchRecord,
    props: true,
    meta: {
      title: i18n.global.t('matchRecordSection.title'),
      breadcrumb: {
        text: 'Home',
        link: 'back',
      },
      themeColor: 'purple'
    }
  },
  {
    path: '/verify-account',
    name: 'VerifyAccount',
    component: ViewVerifyAccount,
    meta: {
      title: i18n.global.t('verifyAccount'),
      themeColor: 'neutral',
    }
  },
  {
    path: '/forgot-password',
    name: 'ViewForgotPassword',
    component: ViewForgotPassword,
    meta: {
      title: i18n.global.t('forgotMyPassword'),
      themeColor: 'neutral',
    }
  },
  {
    path: '/reset-password',
    name: 'ViewResetPassword',
    component: ViewResetPassword,
    meta: {
      title: i18n.global.t('resetPassword'),
      themeColor: 'neutral',
    }
  },
  {
    path: '/vgc/match-record/tournament/:id_user',
    name: 'ViewMyStatsMatch',
    component: ViewMyStatsMatch,
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore(); // Usa el authStore de Pinia
      if (!authStore.isAuthenticated) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
    meta: {
      title: i18n.global.t('matchRecordSection.tournamentList'),
      breadcrumb: {
        text: i18n.global.t('profile'),
        link: 'back',
      },
      themeColor: 'purple'
    }
  },
  {
    path: '/tournament/add-tournament/:id_user',
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
    meta: {
      title: i18n.global.t('organizerTournament'),
      breadcrumb: {
        text: i18n.global.t('profile'),
        link: 'back',
      },
      themeColor: 'purple',
    }
  },
  {
    path: '/tournament/add-standing/:id_torneo',
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
      title: i18n.global.t('organizerTournament'),
      breadcrumb: {
        text: i18n.global.t('addTournament'),
        link: 'back',
      },
      themeColor: 'purple',
    }
  },
  {
    path:'/tournament/goToTops/:id_torneo',
    name: 'ViewTopsTournament',
    component: ViewTopsTournament,
    meta: {
      title: i18n.global.t('seeTournaments'),
      breadcrumb: {
        text: i18n.global.t('seeTournaments'),
        link: 'back',
      },
      themeColor: 'purple',
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
      title: i18n.global.t('listUsers'),
      breadcrumb: {
        text: i18n.global.t('profile'),
        link: '/perfil',
      },
      themeColor: 'yellow'
    }
  },
  {
    path: '/tournament/ver-torneos',
    name: 'ViewTournaments',
    component: ViewTournaments,
    meta: {
      title: i18n.global.t('seeTournaments'),
      breadcrumb: {
        text: 'Home',
        link: '/',
      },
      themeColor: 'blue'
    }
  },
  {
    path: '/tournament/organizar-torneo/:id_torneo',
    name: 'ViewOrgTorneo',
    component: ViewOrgTorneo,
    beforeEnter: (to, from, next) => {
      const authStore = useAuthStore(); // Usa el authStore de Pinia
      if (!authStore.isAuthenticated) {
        next({ path: '/login', query: { redirect: to.fullPath } });
      } else {
        next();
      }
    },
    meta: {
      title: i18n.global.t('organizerTournament'),
      breadcrumb: {
        text: i18n.global.t('addTournament'),
        link: 'back',
      }
    }
  },
  {
    path: '/tournament/view-round/:id_torneo',
    name: 'ViewGoToRound',
    component: ViewGoToRound,
    meta: {
      title: i18n.global.t('filesSeccion.currentRound'),
      breadcrumb: {
        text: i18n.global.t('organizerTournament'),
        link: 'back',
      },
      themeColor: 'purple',
    }
  },
  {
    path: '/tournament/goToStanding/:id_torneo',
    name: 'ViewGoToStanding',
    component: ViewGoToStanding,
    meta: {
      title: i18n.global.t('filesSeccion.standing'),
      breadcrumb: {
        text: i18n.global.t('organizerTournament'),
        link: 'back',
      },
      themeColor: 'purple',
    }
  },
  {
    path: '/tournament/goToResults/:id_torneo',
    name: 'ViewGoToResults',
    component: ViewGoToResults,
    meta: {
      title: i18n.global.t('filesSeccion.currentResults'),
      breadcrumb: {
        text: i18n.global.t('organizerTournament'),
        link: 'back',
      },
      themeColor: 'purple',
    }
  },
  {
    path: '/guide',
    name: 'ViewGuide',
    component: ViewGuide,
    meta: {
      title: 'Guía de uso',
      breadcrumb: {
        text: 'Home',
        link: '/',
      },
      themeColor: 'green'
    },
  },
];

// Crea el router
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title;
  } else {
    document.title = i18n.global.t('tittleMetaTag')
  }
  next()
})

router.afterEach((to) => {
  if (analytics) {
    logEvent(analytics, "page_view", {
      page_path: to.fullPath,
    });
  }
});

export default router;
