<template>
  <footer class="footer">
    <div class="footer-content">
      <p>Creado por MakiseVGC ({{ currentYear }})</p>
      <p>
        Contacto: <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a>
      </p>
    </div>
  </footer>
</template>

<script>
export default {
  data() {
    return {
      currentYear: new Date().getFullYear(),
      contactEmail: 'teamsbackupokemon@gmail.com', // Cambia esto al email que desees
    };
  },
};
</script>

<style scoped>
.footer {
  background-color: #f1f1f1;
  padding: 20px 0;
  text-align: center;
}

.footer-content {
  max-width: 800px;
  margin: 0 auto;
}

.footer a {
  color: #007bff;
  text-decoration: none;
}
.footer a:hover {
  text-decoration: underline;
}
</style>
