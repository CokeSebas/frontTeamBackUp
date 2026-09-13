<template>
  <Teleport to="body">
    <Transition name="scroll-button">
      <button
        v-if="isVisible"
        type="button"
        class="scroll-top-button"
        aria-label="Volver al inicio de la página"
        title="Volver arriba"
        @click="scrollToTop"
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            d="M12 19V5M5 12l7-7 7 7"
            fill="none"
            stroke="currentColor"
            stroke-width="2.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue';

const isVisible = ref(false);

const updateVisibility = () => {
  isVisible.value = window.scrollY > 350;
};

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  });
};

onMounted(() => {
  updateVisibility();

  window.addEventListener('scroll', updateVisibility, {
    passive: true
  });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateVisibility);
});
</script>


<style scoped>
.scroll-top-button {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 2000;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 48px;
  height: 48px;
  padding: 0;

  color: #ffffff;

  /*
   * Color negro fijo, independiente del tema
   * green, purple, blue, yellow o neutral.
   */
  background:
    linear-gradient(
      145deg,
      #25252c,
      #101014
    );

  border:
    1px solid
    rgba(255, 255, 255, 0.16);

  border-radius: 50%;

  box-shadow:
    0 10px 26px rgba(0, 0, 0, 0.32),
    0 3px 8px rgba(0, 0, 0, 0.22);

  cursor: pointer;

  transition:
    transform 160ms ease,
    background 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease;
}

.scroll-top-button svg {
  width: 23px;
  height: 23px;
}

.scroll-top-button:hover {
  transform: translateY(-3px);

  background:
    linear-gradient(
      145deg,
      #34343d,
      #18181e
    );

  border-color:
    rgba(255, 255, 255, 0.24);

  box-shadow:
    0 14px 32px rgba(0, 0, 0, 0.4),
    0 4px 10px rgba(0, 0, 0, 0.26);

  filter: brightness(1.04);
}

.scroll-top-button:active {
  transform:
    translateY(-1px)
    scale(0.96);
}

.scroll-top-button:focus-visible {
  outline:
    3px solid
    rgba(148, 163, 184, 0.34);

  outline-offset: 3px;
}

/*
 * En modo oscuro se mantiene negro,
 * con una pequeña variación para distinguirlo
 * del fondo general.
 */
:global(.dark) .scroll-top-button,
:global(.theme-dark) .scroll-top-button,
:global(body.dark) .scroll-top-button,
:global(html.dark) .scroll-top-button {
  color: #ffffff;

  background:
    linear-gradient(
      145deg,
      #2a2a31,
      #121216
    );

  border-color:
    rgba(255, 255, 255, 0.18);

  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.46),
    0 0 16px rgba(255, 255, 255, 0.035);
}

:global(.dark) .scroll-top-button:hover,
:global(.theme-dark) .scroll-top-button:hover,
:global(body.dark) .scroll-top-button:hover,
:global(html.dark) .scroll-top-button:hover {
  background:
    linear-gradient(
      145deg,
      #3a3a43,
      #1b1b21
    );

  box-shadow:
    0 14px 34px rgba(0, 0, 0, 0.52),
    0 0 18px rgba(255, 255, 255, 0.05);
}

/* Animación de entrada y salida */
.scroll-button-enter-active,
.scroll-button-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.scroll-button-enter-from,
.scroll-button-leave-to {
  opacity: 0;
  transform:
    translateY(12px)
    scale(0.88);
}

@media (max-width: 768px) {
  .scroll-top-button {
    right: 16px;
    bottom: 16px;

    width: 44px;
    height: 44px;
  }

  .scroll-top-button svg {
    width: 21px;
    height: 21px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-top-button,
  .scroll-button-enter-active,
  .scroll-button-leave-active {
    transition: none;
  }
}
</style>
