<template>
  <nav
    v-if="breadcrumbs.length"
    :class="[
      'app-breadcrumbs',
      currentMode === 'dark'
        ? 'app-breadcrumbs--dark'
        : 'app-breadcrumbs--light'
    ]"
    aria-label="Navegación secundaria"
  >
    <ol class="app-breadcrumbs__list">
      <li
        v-for="(crumb, index) in breadcrumbs"
        :key="crumb.key"
        class="app-breadcrumbs__item"
        :aria-current="
          index === breadcrumbs.length - 1
            ? 'page'
            : undefined
        "
      >
        <router-link
          v-if="crumb.link && crumb.link !== 'back'"
          :to="crumb.link"
          class="app-breadcrumbs__link"
        >
          {{ crumb.text }}
        </router-link>

        <button
          v-else-if="crumb.link === 'back'"
          type="button"
          class="
            app-breadcrumbs__link
            app-breadcrumbs__back
          "
          @click="goBack"
        >
          {{ crumb.text }}
        </button>

        <span
          v-else
          class="app-breadcrumbs__current"
        >
          {{ crumb.text }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import {
  computed,
  inject,
  ref,
  unref
} from 'vue'

import {
  useRoute,
  useRouter
} from 'vue-router'

const route = useRoute()
const router = useRouter()

const injectedMode = inject(
  'mode',
  ref('light')
)

const currentMode = computed(() =>
  unref(injectedMode) === 'dark'
    ? 'dark'
    : 'light'
)

const breadcrumbs = computed(() =>
  route.matched
    .filter(
      (matchedRoute) =>
        matchedRoute.meta?.breadcrumb
    )
    .map((matchedRoute, index) => {
      const breadcrumb =
        matchedRoute.meta.breadcrumb

      const normalizedBreadcrumb =
        typeof breadcrumb === 'string'
          ? {
              text: breadcrumb
            }
          : breadcrumb

      return {
        key:
          matchedRoute.name ??
          matchedRoute.path ??
          index,

        text:
          normalizedBreadcrumb?.text ??
          '',

        link:
          normalizedBreadcrumb?.link ??
          null
      }
    })
    .filter(
      (breadcrumb) =>
        breadcrumb.text
    )
)

function goBack() {
  const hasInternalHistory =
    typeof window !== 'undefined' &&
    Boolean(window.history.state?.back)

  if (hasInternalHistory) {
    router.back()
    return
  }

  router.push('/')
}
</script>

<style scoped>
/*
 * Se usa una clase exclusiva para evitar conflictos con
 * estilos globales que puedan utilizar breadcrumb-container.
 */
.app-breadcrumbs {
  --breadcrumb-surface:
    rgba(255, 255, 255, 0.9);

  --breadcrumb-text:
    #212529;

  --breadcrumb-muted:
    #69736d;

  --breadcrumb-separator:
    #8b9590;

  width: 100%;
  max-width: none;
  margin: 0;

  /*
   * Mantiene el contenido alineado con un contenedor
   * central de hasta 1200px.
   */
  padding:
    1rem
    max(
      1rem,
      calc((100vw - 1200px) / 2 + 1.5rem)
    )
    0;

  color:
    var(--breadcrumb-text);

  /*
   * Fondo dinámico:
   * green, purple, blue, yellow o neutral.
   *
   * Los valores de respaldo son grises para que nunca
   * aparezca verde por defecto.
   */
  /*
   * Franja fija en negro, independiente del tema
   * green, purple, blue, yellow o neutral.
   */
  background: #101014;

  box-shadow:
    inset 0 -1px 0
      rgba(255, 255, 255, 0.1);

  transition:
    color 0.35s ease,
    background 0.35s ease,
    box-shadow 0.35s ease;
}

.app-breadcrumbs--dark {
  --breadcrumb-surface:
    rgba(16, 19, 18, 0.88);

  --breadcrumb-text:
    #eef4f1;

  --breadcrumb-muted:
    #aab5af;

  --breadcrumb-separator:
    #7f8b85;

  box-shadow:
    inset 0 -1px 0
      rgba(255, 255, 255, 0.08),
    0 10px 28px
      rgba(0, 0, 0, 0.16);
}

.app-breadcrumbs__list {
  display: flex;
  width: fit-content;
  max-width: 100%;
  min-height: 42px;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;

  padding:
    0.58rem
    0.85rem;

  margin: 0;

  border:
    1px solid
    var(
      --layout-accent-border,
      rgba(33, 37, 41, 0.3)
    );

  border-radius:
    0.8rem;

  background:
    linear-gradient(
      135deg,
      var(
        --layout-accent-soft,
        rgba(33, 37, 41, 0.14)
      )
      0%,
      var(--breadcrumb-surface)
      72%
    );

  box-shadow:
    0 10px 28px -24px
      var(
        --layout-accent-glow,
        rgba(0, 0, 0, 0.18)
      ),
    inset 0 1px 0
      rgba(255, 255, 255, 0.22);

  list-style:
    none;

  font-size:
    0.92rem;

  transition:
    background 0.35s ease,
    border-color 0.35s ease,
    box-shadow 0.35s ease;
}

.app-breadcrumbs--dark
.app-breadcrumbs__list {
  box-shadow:
    0 12px 28px -24px
      rgba(0, 0, 0, 0.9),
    inset 0 1px 0
      rgba(255, 255, 255, 0.04),
    inset 0 12px 24px -28px
      var(
        --layout-accent-bright,
        #9ca3af
      );
}

.app-breadcrumbs__item {
  display: inline-flex;
  min-width: 0;
  align-items: center;

  color:
    var(--breadcrumb-muted);

  transition:
    color 0.25s ease;
}

.app-breadcrumbs__item
+ .app-breadcrumbs__item::before {
  padding:
    0
    0.55rem;

  color:
    var(--breadcrumb-separator);

  content:
    '/';

  opacity:
    0.72;

  transition:
    color 0.25s ease,
    opacity 0.25s ease;
}

.app-breadcrumbs__link,
.app-breadcrumbs__back {
  display: inline;
  max-width: 100%;
  padding: 0;
  overflow: hidden;

  color:
    var(
      --layout-accent,
      #343a40
    );

  font-weight:
    650;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;

  text-decoration:
    none;

  transition:
    color 0.18s ease,
    background-color 0.18s ease,
    text-decoration-color 0.18s ease;
}

.app-breadcrumbs__back {
  border:
    0;

  background:
    transparent;

  font:
    inherit;

  cursor:
    pointer;
}

.app-breadcrumbs__link:hover,
.app-breadcrumbs__back:hover {
  color:
    var(
      --layout-accent-strong,
      #212529
    );

  text-decoration:
    underline;

  text-decoration-color:
    currentColor;

  text-decoration-thickness:
    2px;

  text-underline-offset:
    3px;
}

.app-breadcrumbs--dark
.app-breadcrumbs__link,
.app-breadcrumbs--dark
.app-breadcrumbs__back {
  color:
    var(
      --layout-accent-bright,
      #9ca3af
    );
}

.app-breadcrumbs--dark
.app-breadcrumbs__link:hover,
.app-breadcrumbs--dark
.app-breadcrumbs__back:hover {
  color:
    var(
      --layout-accent,
      #6b7280
    );
}

.app-breadcrumbs__link:focus-visible,
.app-breadcrumbs__back:focus-visible {
  border-radius:
    0.3rem;

  outline:
    3px solid
    var(
      --layout-accent-soft,
      rgba(75, 85, 99, 0.2)
    );

  outline-offset:
    3px;
}

.app-breadcrumbs__current {
  max-width:
    min(420px, 60vw);

  overflow:
    hidden;

  color:
    var(--breadcrumb-text);

  font-weight:
    750;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;

  transition:
    color 0.25s ease;
}

@media (max-width: 575.98px) {
  .app-breadcrumbs {
    padding:
      0.8rem
      1rem
      0;
  }

  .app-breadcrumbs__list {
    min-height:
      38px;

    padding:
      0.5rem
      0.7rem;

    border-radius:
      0.7rem;

    font-size:
      0.84rem;
  }

  .app-breadcrumbs__item
  + .app-breadcrumbs__item::before {
    padding:
      0
      0.4rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .app-breadcrumbs,
  .app-breadcrumbs__list,
  .app-breadcrumbs__item,
  .app-breadcrumbs__item
  + .app-breadcrumbs__item::before,
  .app-breadcrumbs__link,
  .app-breadcrumbs__back,
  .app-breadcrumbs__current {
    transition:
      none;
  }
}
</style>
