<!-- src/components/AppNavbar.vue -->
<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light navbar-container">
        <div class="container-fluid">
            <a class="navbar-brand" >
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
                </ul>
                
                <!-- Botón de cerrar sesión -->
                <ul class="navbar-nav">
                  <li class="nav-item" v-if="isAuthenticated">
                    <button class="btn btn-danger" @click="logout">Cerrar sesión</button>
                  </li>
                </ul>

                <!-- Botón de iniciar sesión si no está autenticado -->
                <ul class="navbar-nav">
                  <li class="nav-item" v-if="!isAuthenticated">
                    <router-link class="btn btn-primary" to="/login">Iniciar sesión</router-link>
                  </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/authService'

export default {
  setup() {
    const router = useRouter()

    // Observar el estado reactivo de isAuthenticated desde el servicio
    const isAuthenticated = computed(() => authService.getAuthStatus().isAuthenticated)

    // Función para cerrar sesión
    const logout = () => {
      authService.logout()
      router.push('/login')
    }

    return {
      isAuthenticated,
      logout
    }
  }
}
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
