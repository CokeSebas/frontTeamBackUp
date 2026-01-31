<!-- src/components/AppFooter.vue -->
<template>
  <footer :class="['footer', footerClass]">
    <div class="footer-content">

      <!-- Logo -->
      <div class="footer-logo">
        <img
          :src="logoSrc"
          alt="MakiseVGC Logo"
        />
      </div>

      <!-- Información -->
      <div class="footer-info">
        <p>
          Creado por <a href="https://x.com/CokeSebas"> <strong>CokeSebas </strong> ({{ currentYear }}) </a>
        </p>
        <p>
          Contacto:
          <a :href="'mailto:' + contactEmail">
            {{ contactEmail }}
          </a>
        </p>
      </div>

    </div>
  </footer>
</template>

<script>
  import { inject, computed } from 'vue';
  import logo from '@/assets/pokecircuit.png'; // 👈 ajusta el path si es necesario

  export default {
    setup() {
      const mode = inject('mode');

      const footerClass = computed(() =>
        mode.value === 'dark' ? 'footer-dark' : 'footer-light'
      );

      return {
        footerClass,
        logoSrc: logo,
        currentYear: new Date().getFullYear(),
        contactEmail: 'teamsbackupokemon@gmail.com'
      };
    },
  };
</script>

<style scoped>
  /* Base footer */
  .footer {
    width: 100%;
    padding: 30px 0;
  }

  /* Light / Dark */
  .footer-light {
    background-color: #f1f1f1;
    color: #000;
  }

  .footer-dark {
    background-color: #333;
    color: #fff;
  }

  /* Layout */
  .footer-content {
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 0 16px;
  }

  /* Logo */
  .footer-logo img {
    height: 70px;
    width: auto;
    max-height: 60px;
  }


  /* Info */
  .footer-info {
    text-align: left;
    font-size: 14px;
  }

  .footer-info p {
    margin: 4px 0;
  }

  /* Links */
  .footer a {
    color: #007bff;
    text-decoration: none;
    font-weight: 500;
  }

  .footer a:hover {
    text-decoration: underline;
  }

  /* Responsive */
  @media (max-width: 600px) {
    .footer-content {
      flex-direction: column;
      text-align: center;
    }

    .footer-info {
      text-align: center;
    }
  }
</style>
