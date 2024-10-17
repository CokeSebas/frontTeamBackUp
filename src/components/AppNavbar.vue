<!-- src/components/AppNavbar.vue -->
<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
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
                <button class="btn btn-outline-danger" @click="logout">Logout</button>
            </div>
        </div>
    </nav>
</template>

<script>
export default {
    name: 'AppNavbar',
    methods: {
        logout() {
            // Lógica para cerrar sesión
            alert('Cerrando sesión...');
        }
    }
};
</script>

<style>
nav {
    display: flex;
    gap: 10px;
}
</style>
