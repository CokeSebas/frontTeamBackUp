<!-- src/components/AppNavbar.vue -->
<!-- src/components/AppNavbar.vue -->
<template>
  <nav
    :class="[
      'navbar navbar-expand-lg navbar-container',
      mode === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-light'
    ]"
  >
    <div class="container-fluid navbar-inner">

      <!-- Logo + Brand -->
      <router-link to="/" class="navbar-brand d-flex align-items-center gap-2">
        <img
          :src="logoSrc"
          alt="PokeCircuit"
          class="navbar-logo"
        />
        <span class="brand-text">PokeCircuit</span>
      </router-link>

      <!-- Toggler -->
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
        aria-controls="navbarNav"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <!-- Nav -->
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto mb-2 mb-lg-0">
          <li class="nav-item">
            <router-link class="nav-link" to="/vgc/teams">{{ $t('teams') }}</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/vgc/pokemons">{{ $t('pokemons') }}</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/perfil">{{ $t('profile') }}</router-link>
          </li>
          <li class="nav-item">
            <router-link class="nav-link" to="/tournament/ver-torneos">{{ $t('seeTournaments') }}</router-link>
          </li>
          <li v-if="isAuthenticated" class="nav-item">
            <router-link class="nav-link" :to="`/vgc/my-teams/${userId}`">{{ $t('myTeams') }}</router-link>
          </li>
          <li v-if="isAuthenticated" class="nav-item">
            <router-link class="nav-link" :to="`/vgc/my-pokemons/${userId}`">{{ $t('myPokemons') }}</router-link>
          </li>
        </ul>

        <!-- Right side -->
        <ul class="navbar-nav align-items-center">

          <!-- Language -->
          <li class="nav-item dropdown">
            <button
              class="btn btn-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
            >
              <img :src="currentFlag" width="24" height="16" />
              {{ currentLanguage }}
            </button>

            <ul class="dropdown-menu">
              <li>
                <a class="dropdown-item" @click="changeLanguage('en')">
                  <img src="https://flagpedia.net/data/flags/w580/us.webp" width="24" height="16" />
                  English
                </a>
              </li>
              <li>
                <a class="dropdown-item" @click="changeLanguage('es')">
                  <img src="https://flagpedia.net/data/flags/w580/es.webp" width="24" height="16" />
                  Español
                </a>
              </li>
              <li>
                <a class="dropdown-item" @click="changeLanguage('br')">
                  <img src="https://flagpedia.net/data/flags/w580/br.webp" width="24" height="16" />
                  Português
                </a>
              </li>
            </ul>
          </li>

          <!-- Mode toggle -->
          <li class="nav-item">
            <button @click="toggleMode" class="btn btn-outline-secondary ms-2">
              <img
                :src="mode === 'dark' ? sunIcon : moonIcon"
                width="20"
                height="20"
              />
            </button>
          </li>

          <!-- Auth -->
          <li class="nav-item">
            <button
              v-if="isAuthenticated"
              class="btn btn-danger ms-2"
              @click="logout"
            >
              {{ $t('logout') }}
            </button>
            <router-link
              v-else
              class="btn btn-success ms-2"
              to="/login"
            >
              {{ $t('login') }}
            </router-link>
          </li>

        </ul>
      </div>
    </div>
  </nav>
</template>


<script>
  import { computed, inject } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '@/stores/authStore';
  import { useI18n } from 'vue-i18n';
  import logo from '@/assets/pokecircuit.png'; // 👈 tu logo

  export default {
    setup() {
      const router = useRouter();
      const authStore = useAuthStore();
      const { locale } = useI18n();

      const mode = inject('mode');
      const toggleMode = inject('toggleMode');
      const sunIcon = inject('sunIcon');
      const moonIcon = inject('moonIcon');

      const isAuthenticated = computed(() => authStore.isAuthenticated);
      const userId = computed(() => authStore.idUser);

      const logout = () => {
        authStore.logout();
        localStorage.removeItem('token');
        router.push('/login');
      };

      const changeLanguage = (lang) => {
        locale.value = lang;
        localStorage.setItem('locale', lang);
      };

      const currentLanguage = computed(() =>
        locale.value === 'en' ? 'English' :
        locale.value === 'es' ? 'Español' :
        locale.value === 'br' ? 'Português' : 'English'
      );

      const currentFlag = computed(() =>
        locale.value === 'en' ? 'https://flagpedia.net/data/flags/w580/us.webp' :
        locale.value === 'es' ? 'https://flagpedia.net/data/flags/w580/es.webp' :
        locale.value === 'br' ? 'https://flagpedia.net/data/flags/w580/br.webp' :
        'https://flagpedia.net/data/flags/w580/us.webp'
      );

      return {
        isAuthenticated,
        userId,
        logout,
        changeLanguage,
        currentLanguage,
        currentFlag,
        toggleMode,
        mode,
        sunIcon,
        moonIcon,
        logoSrc: logo
      };
    },
  };


</script>

<style>
  .navbar-container {
    width: 100%;
    padding: 12px 0;
  }

  .navbar-inner {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
  }

  /* Logo */
  .navbar-logo {
    height: 42px;
    width: auto;
  }

  /* Brand text */
  .brand-text {
    font-weight: 600;
    font-size: 18px;
  }

  /* Mejor alineación */
  .navbar-nav {
    align-items: center;
  }

  .nav-link {
    text-align: center;
  }

</style>
