<!-- src/views/TeamDetail.vue -->
<template>
    <div>
        <h1>Detalle del Equipo</h1>
        <!-- Aquí puedes añadir el contenido relacionado con el detalle del equipo -->
        <p>ID del equipo: {{ teamId }}</p>
    </div>
</template>

<script>
export default {
    name: 'TeamDetail',
    props: {
        teamId: {
            type: String,
            required: true
        }
    }
};
</script>

<style scoped>
/* Estilos específicos para el componente TeamDetail */
</style>
