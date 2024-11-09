<!-- src/components/AppNavbar.vue -->
<template>
  <nav :class="mode === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-light'" class="navbar navbar-expand-lg navbar-container">
    <div class="container-fluid">
      <router-link class="navbar-brand nav-link" to="/">Home</router-link>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
          aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
              <li class="nav-item">
                  <router-link class="nav-link" to="/teams">{{ $t('teams') }}</router-link>
              </li>
              <li class="nav-item">
                  <router-link class="nav-link" to="/pokemons">{{ $t('pokemons') }}</router-link>
              </li>
              <li class="nav-item">
                  <router-link class="nav-link" to="/perfil">{{ $t('profile') }}</router-link>
              </li>
              <li v-if="isAuthenticated" class="nav-item">
                  <router-link class="nav-link" :to="`/my-teams/${userId}`">{{ $t('myTeams') }}</router-link>
              </li>
              <li v-if="isAuthenticated" class="nav-item">
                  <router-link class="nav-link" :to="`/my-pokemons/${userId}`">{{ $t('myPokemons') }}</router-link>
              </li>
          </ul>
          <ul class="navbar-nav">
            <li class="nav-item dropdown">
              <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="languageDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                  <img :src="currentFlag" alt="Idioma" width="24" height="16"> {{ currentLanguage }}
                </button>
                <ul class="dropdown-menu" aria-labelledby="languageDropdown">
                  <li>
                    <a class="dropdown-item" @click="changeLanguage('en')">
                      <img src="https://flagpedia.net/data/flags/w580/us.webp" alt="English" width="24" height="16"> English
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" @click="changeLanguage('es')">
                      <img src="https://flagpedia.net/data/flags/w580/es.webp" alt="Español" width="24" height="16"> Español
                    </a>
                  </li>
                  <li>
                    <a class="dropdown-item" @click="changeLanguage('br')">
                      <img src="https://flagpedia.net/data/flags/w580/br.webp" alt="Português" width="24" height="16"> Português
                    </a>
                  </li>
                </ul>
              </div>
            </li>

            <!-- Botón de modo oscuro/claro -->
            <li class="nav-item">
              <button @click="toggleMode" class="btn btn-outline-secondary mode-toggle">
                <img :src="mode === 'dark' ? sunIcon : moonIcon" alt="Mode Icon" width="20" height="20">
              </button>
            </li>

            <li class="nav-item">
                <button v-if="isAuthenticated" class="btn btn-danger ms-2" @click="logout">{{ $t('logout') }}</button>
                <router-link v-else class="btn btn-success ms-2" to="/login">{{ $t('login') }}</router-link>
            </li>
          </ul>
      </div>
    </div>
  </nav>
</template>

<script>
// eslint-disable-next-line
import { computed, ref, inject } from 'vue'; // Añadir inject
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useI18n } from 'vue-i18n';

export default {
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();
    const { locale } = useI18n();

    const mode = inject('mode'); // Inyectar el modo
    const toggleMode = inject('toggleMode'); // Inyectar la función para cambiar el modo

    const sunIcon = inject('sunIcon');
    const moonIcon = inject('moonIcon');

    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const userId = computed(() => authStore.idUser);

    const currentLanguage = computed(() => {
      return locale.value === 'en' ? 'English' :
             locale.value === 'es' ? 'Español' :
             locale.value === 'br' ? 'Português' : 'English';
    });

    const currentFlag = computed(() => {
      return locale.value === 'en' ? 'https://flagpedia.net/data/flags/w580/us.webp' :
             locale.value === 'es' ? 'https://flagpedia.net/data/flags/w580/es.webp' :
             locale.value === 'br' ? 'https://flagpedia.net/data/flags/w580/br.webp' : 
             'https://flagpedia.net/data/flags/w580/us.webp';
    });

    const logout = () => {
      authStore.logout();
      router.push('/login');
    };

    const changeLanguage = (lang) => {
      locale.value = lang; // Cambia el idioma
      localStorage.setItem('locale', lang); // Guarda el idioma en localStorage
    };

    return {
      isAuthenticated,
      userId,
      logout,
      changeLanguage,
      currentLanguage,
      currentFlag,
      toggleMode,
      mode, // Asegúrate de retornar el modo
      sunIcon,
      moonIcon
    };
  },
};
</script>

<style>
.navbar-container {
  max-width: 1200px; /* Asegúrate de que el contenedor tenga un ancho máximo */
  margin: 0 auto; /* Centra el contenedor en la página */
  padding: 1rem 0; /* Espaciado superior e inferior */
}

.navbar-nav {
  display: flex; /* Asegúrate de que los elementos de la navbar sean flexibles */
  justify-content: center; /* Centra los elementos dentro de la navbar */
}

.nav-link {
  text-align: center; /* Centra el texto dentro de cada enlace */
}

.btn {
  margin-left: 10px;
  text-align: center; /* Centra el texto en los botones */
}
</style>
