<template>
  <nav
    v-if="breadcrumbs.length"
    class="breadcrumb-container"
    aria-label="Navegación secundaria"
  >
    <ol class="breadcrumb-list">
      <li
        v-for="(crumb, index) in breadcrumbs"
        :key="crumb.key"
        class="breadcrumb-item"
        :aria-current="index === breadcrumbs.length - 1 ? 'page' : undefined"
      >
        <router-link
          v-if="crumb.link && crumb.link !== 'back'"
          :to="crumb.link"
          class="breadcrumb-link"
        >
          {{ crumb.text }}
        </router-link>

        <button
          v-else-if="crumb.link === 'back'"
          type="button"
          class="breadcrumb-link breadcrumb-back"
          @click="goBack"
        >
          {{ crumb.text }}
        </button>

        <span v-else class="breadcrumb-current">
          {{ crumb.text }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const breadcrumbs = computed(() =>
  route.matched
    .filter((matchedRoute) => matchedRoute.meta?.breadcrumb)
    .map((matchedRoute, index) => {
      const breadcrumb = matchedRoute.meta.breadcrumb
      const normalizedBreadcrumb =
        typeof breadcrumb === 'string'
          ? { text: breadcrumb }
          : breadcrumb

      return {
        key: matchedRoute.name ?? matchedRoute.path ?? index,
        text: normalizedBreadcrumb?.text ?? '',
        link: normalizedBreadcrumb?.link ?? null
      }
    })
    .filter((breadcrumb) => breadcrumb.text)
)

function goBack() {
  const hasInternalHistory =
    typeof window !== 'undefined' && Boolean(window.history.state?.back)

  if (hasInternalHistory) {
    router.back()
    return
  }

  router.push('/')
}
</script>

<style scoped>
.breadcrumb-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem 0;
}

.breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0;
  padding: 0;
  margin: 0;
  list-style: none;
  font-size: 0.92rem;
}

.breadcrumb-item {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  color: var(--bs-secondary-color, #6c757d);
}

.breadcrumb-item + .breadcrumb-item::before {
  content: '/';
  padding: 0 0.55rem;
  color: var(--bs-tertiary-color, #adb5bd);
}

.breadcrumb-link,
.breadcrumb-back {
  display: inline;
  max-width: 100%;
  padding: 0;
  overflow: hidden;
  color: var(--bs-link-color, #0d6efd);
  text-overflow: ellipsis;
  white-space: nowrap;
  text-decoration: none;
}

.breadcrumb-back {
  border: 0;
  background: transparent;
  font: inherit;
  cursor: pointer;
}

.breadcrumb-link:hover,
.breadcrumb-back:hover {
  color: var(--bs-link-hover-color, #0a58ca);
  text-decoration: underline;
}

.breadcrumb-link:focus-visible,
.breadcrumb-back:focus-visible {
  border-radius: 0.25rem;
  outline: 3px solid rgba(13, 110, 253, 0.3);
  outline-offset: 3px;
}

.breadcrumb-current {
  max-width: min(420px, 60vw);
  overflow: hidden;
  color: var(--bs-body-color, #212529);
  font-weight: 600;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 575.98px) {
  .breadcrumb-container {
    padding: 0.8rem 1rem 0;
  }

  .breadcrumb-list {
    font-size: 0.84rem;
  }

  .breadcrumb-item + .breadcrumb-item::before {
    padding: 0 0.4rem;
  }
}
</style>
