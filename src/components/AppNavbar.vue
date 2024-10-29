<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light navbar-container">
        <div class="container-fluid">
            <router-link class="navbar-brand nav-link" to="/">Home</router-link>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
                aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <router-link class="nav-link" to="/teams">Equipos</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/pokemons">Pokémon</router-link>
                    </li>
                    <li class="nav-item">
                        <router-link class="nav-link" to="/perfil">Perfil</router-link>
                    </li>
                    <li v-if="isAuthenticated" class="nav-item">
                        <router-link class="nav-link" :to="`/my-teams/${userId}`">Mis Equipos</router-link>
                    </li>
                    <li v-if="isAuthenticated" class="nav-item">
                        <router-link class="nav-link" :to="`/my-pokemons/${userId}`">Mis Pokémon</router-link>
                    </li>
                </ul>
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <button v-if="isAuthenticated" class="btn btn-danger ms-2" @click="logout">Logout</button>
                        <router-link v-else class="btn btn-primary ms-2" to="/login">Iniciar sesión</router-link>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

export default {
  setup() {
    const router = useRouter();
    const authStore = useAuthStore();

    const isAuthenticated = computed(() => authStore.isAuthenticated);
    const userId = computed(() => authStore.idUser);

    const logout = () => {
      authStore.logout();
      router.push('/login');
    };

    return {
      isAuthenticated,
      userId,
      logout,
    };
  },
};
</script>

<style>
.navbar-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 0;
}

.navbar-toggler {
  border-color: transparent; /* Quitar borde para mejor apariencia */
}

.btn {
  margin-left: 10px;
}

@media (max-width: 992px) {
  .navbar-brand {
    margin: 0 auto; /* Centrar en pantallas medianas y pequeñas */
  }
}
</style>
