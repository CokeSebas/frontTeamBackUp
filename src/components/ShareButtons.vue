<template>
  <div class="share-buttons" role="group" aria-label="Compartir contenido">
    <a
      :href="whatsAppUrl"
      class="share-button share-button--whatsapp"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Compartir por WhatsApp"
      title="Compartir por WhatsApp"
    >
      <i class="fab fa-whatsapp" aria-hidden="true"></i>
      <span class="share-label">WhatsApp</span>
    </a>

    <a
      :href="facebookUrl"
      class="share-button share-button--facebook"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Compartir en Facebook"
      title="Compartir en Facebook"
    >
      <i class="fab fa-facebook-f" aria-hidden="true"></i>
      <span class="share-label">Facebook</span>
    </a>

    <a
      :href="xUrl"
      class="share-button share-button--x"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Compartir en X"
      title="Compartir en X"
    >
      <i class="fab fa-twitter" aria-hidden="true"></i>
      <span class="share-label">X</span>
    </a>
  </div>
</template>

<script setup>
/* global defineProps */
import { computed } from 'vue'

const props = defineProps({
  shareUrl: {
    type: String,
    required: true
  },
  shareText: {
    type: String,
    required: true
  }
})

const normalizedUrl = computed(() => props.shareUrl.trim())
const normalizedText = computed(() => props.shareText.trim())

const completeShareText = computed(() =>
  [normalizedText.value, normalizedUrl.value].filter(Boolean).join(' ')
)

const whatsAppUrl = computed(
  () => `https://wa.me/?text=${encodeURIComponent(completeShareText.value)}`
)

const facebookUrl = computed(() => {
  const params = new URLSearchParams({ u: normalizedUrl.value })

  if (normalizedText.value) {
    params.set('quote', normalizedText.value)
  }

  return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
})

const xUrl = computed(() => {
  const params = new URLSearchParams({
    text: normalizedText.value,
    url: normalizedUrl.value
  })

  return `https://twitter.com/intent/tweet?${params.toString()}`
})
</script>

<style scoped>
.share-buttons {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.65rem;
}

.share-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 42px;
  padding: 0.55rem 0.85rem;
  border: 1px solid transparent;
  border-radius: 0.6rem;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  line-height: 1;
  text-decoration: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  transition:
    filter 0.18s ease,
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.share-button:hover {
  color: #fff;
  filter: brightness(0.93);
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.16);
}

.share-button:active {
  transform: translateY(0);
}

.share-button:focus-visible {
  outline: 3px solid rgba(13, 110, 253, 0.35);
  outline-offset: 3px;
}

.share-button--whatsapp {
  background: #128c4b;
}

.share-button--facebook {
  background: #1877f2;
}

.share-button--x {
  background: #1f2328;
}

.share-button i {
  min-width: 1em;
  font-size: 1.08rem;
  text-align: center;
}

@media (max-width: 479.98px) {
  .share-buttons {
    gap: 0.5rem;
  }

  .share-button {
    width: 42px;
    min-width: 42px;
    padding: 0.55rem;
    border-radius: 50%;
  }

  .share-label {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}
</style>
