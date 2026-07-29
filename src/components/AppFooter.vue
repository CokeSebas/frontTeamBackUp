<template>
  <footer :class="['app-footer', `app-footer--${currentMode}`]">
    <div class="footer-content">
      <router-link to="/" class="footer-logo-link" aria-label="Ir al inicio de PokeCircuit">
        <img
          :src="logoSrc"
          class="footer-logo"
          alt="PokeCircuit"
          width="160"
          height="60"
          loading="lazy"
        />
      </router-link>

      <div class="footer-info">
        <p>
          Creado por
          <a
            href="https://x.com/CokeSebas"
            target="_blank"
            rel="noopener noreferrer"
          >
            <strong>CokeSebas</strong>
          </a>
          <span aria-hidden="true"> · </span>
          <span>{{ currentYear }}</span>
        </p>

        <p>
          <span>Contacto: </span>
          <a :href="`mailto:${contactEmail}`">
            {{ contactEmail }}
          </a>
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed, inject, ref, unref } from 'vue'
import logo from '@/assets/pokecircuit.png'

const injectedMode = inject('mode', ref('light'))

const currentMode = computed(() =>
  unref(injectedMode) === 'dark' ? 'dark' : 'light'
)

const logoSrc = logo
const currentYear = new Date().getFullYear()
const contactEmail = 'teamsbackupokemon@gmail.com'
</script>

<style scoped>
.app-footer {
  width: 100%;
  margin-top: auto;
  padding: 1.75rem 0;
  border-top: 1px solid transparent;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease;
}

.app-footer--light {
  border-color: #dee2e6;
  background: #f8f9fa;
  color: #212529;
}

.app-footer--dark {
  border-color: #3f4650;
  background: #212529;
  color: #f8f9fa;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 960px;
  min-height: 72px;
  margin: 0 auto;
  padding: 0 1.5rem;
  gap: 1.5rem;
}

.footer-logo-link {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
}

.footer-logo-link:focus-visible {
  outline: 3px solid rgba(13, 110, 253, 0.35);
  outline-offset: 4px;
}

.footer-logo {
  display: block;
  width: auto;
  height: 56px;
  object-fit: contain;
}

.footer-info {
  min-width: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  text-align: left;
}

.footer-info p {
  margin: 0.15rem 0;
}

.footer-info a {
  color: inherit;
  text-decoration-color: currentColor;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.footer-info a:hover {
  text-decoration-thickness: 2px;
}

@media (max-width: 575.98px) {
  .app-footer {
    padding: 1.4rem 0;
  }

  .footer-content {
    flex-direction: column;
    padding: 0 1rem;
    gap: 0.75rem;
  }

  .footer-logo {
    height: 48px;
  }

  .footer-info {
    font-size: 0.85rem;
    text-align: center;
    overflow-wrap: anywhere;
  }
}
</style>
