<!-- src/views/ViewEditPokemons.vue -->
<template>
    <div>
        <!-- Contenido principal centrado -->
        <div class="container mt-4">
            <div class="text-center">
                <h2 class="mb-4">Mis Pokémons</h2>
                <button class="btn btn-primary mb-3" @click="addPoke">Agregar Pokemon</button>
                <div class="row">
                    <div class="col-6 col-md-4 col-lg-3" v-for="(pokemon, index) in pokemons" :key="index">
                        <PokemonCard :name="pokemon.name" :id="pokemon.id" :type="pokemon.type" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>


<script>

import PokemonCard from './ViewPokemonCard.vue'

export default {
    name: 'ViewEditPokemons',
    components: {PokemonCard},
    data() {
        return {
            pokemons: [
                { id: 1, name: 'Pikachu', type: 'Eléctrico' },
                { id: 2, name: 'Charmander', type: 'Fuego' },
                { id: 3, name: 'Bulbasaur', type: 'Planta' },
                { id: 4, name: 'Squirtle', type: 'Agua' }
            ]
        };
    },
    methods: {
        addPoke() {
            // Lógica para agregar un nuevo equipo
            alert('Funcionalidad para agregar un equipo');
        },
        deletePoke(index) {
            this.teams.splice(index, 1); // Elimina el equipo seleccionado
        },
    }
};
</script>

<style scoped>
.container {
    margin-top: 50px;
}
</style>
