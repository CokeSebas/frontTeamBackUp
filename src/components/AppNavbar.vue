<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light navbar-container">
        <div class="container-fluid">
            <a class="navbar-brand">
                <router-link class="nav-link" to="/">Home</router-link>
            </a>
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

              <!-- Botón de cerrar sesión -->
              <ul class="navbar-nav">
                <li class="nav-item">
                  <!-- Mostrar el botón correspondiente dependiendo del estado de autenticación -->
                  <button v-if="isAuthenticated" class="btn btn-danger" @click="logout">Logout</button>
                  <router-link v-else class="btn btn-primary" to="/login">Iniciar sesión</router-link>
                </li>
              </ul>
            </div>
        </div>
    </nav>
</template>

<script>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore'; // Importa la store de autenticación

export default {
  setup() {
    const router = useRouter();
    const authStore = useAuthStore(); // Usa la store de Pinia

    // Computed para verificar si el usuario está autenticado
    const isAuthenticated = computed(() => authStore.isAuthenticated);
    //console.log(authStore);
    const userId = computed(() => authStore.idUser);

    // Función para cerrar sesión
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
  max-width: 1200px;  /* Ancho máximo */
  margin: 0 auto;     /* Centrado */
  padding: 1rem 0;    /* Añadir espaciado superior/inferior */
}

.btn {
  margin-left: 10px;
}
</style>
