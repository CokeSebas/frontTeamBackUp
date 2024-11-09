<!-- src/components/AppFooter.vue -->
<template>
  <footer :class="footerClass">
    <div class="footer-content">
      <p>Creado por MakiseVGC ({{ currentYear }})</p>
      <p>
        Contacto: <a :href="'mailto:' + contactEmail">{{ contactEmail }}</a>
      </p>
    </div>
  </footer>
</template>

<script>
import { inject, computed } from 'vue';

export default {
  setup() {
    const mode = inject('mode'); // Inyectar el modo

    // Computed para definir la clase del footer
    const footerClass = computed(() => {
      return mode.value === 'dark' ? 'footer-dark' : 'footer-light';
    });

    return {
      mode,
      footerClass, // Retorna la clase calculada
      currentYear: new Date().getFullYear(),
      contactEmail: 'teamsbackupokemon@gmail.com'
    };
  },
};
</script>

<style scoped>

.footer {
  display: flex;
  justify-content: center; /* Centra los elementos horizontalmente */
  align-items: center; /* Centra los elementos verticalmente */
  flex-direction: column; /* Alinea el contenido en columna */
  background-color: #f1f1f1;
  color: #000;
  padding: 20px 0;
  text-align: center;
  width: 100%; /* Asegura que el footer ocupe el ancho completo */
}


.footer-light {
  background-color: #f1f1f1;
  color: #000;
  padding: 20px 0;
  text-align: center;
}

.footer-dark {
  background-color: #333;
  color: #fff;
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
