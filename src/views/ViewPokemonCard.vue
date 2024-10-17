<template>
    <div class="card p-3">
        <h5 class="card-title">{{ name }}</h5>
        <p class="card-text">ID: {{ id }}</p>
        <p class="card-text">Tipo: {{ type }}</p>
    </div>
</template>

<script>
export default {
    props: {
        name: String,
        id: Number,
        type: String
    }
};
</script>

<style scoped>
.card {
    width: 100%;
    max-width: 200px;
    margin: 10px;
}
</style>
