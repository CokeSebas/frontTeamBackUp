<template>
  <div class="share-buttons">
    <!-- WhatsApp -->
    <a
      :href="`https://wa.me/?text=${encodeURIComponent(shareText)}`"
      target="_blank"
      rel="noopener noreferrer"
    >
      <i class="fab fa-whatsapp"></i>
    </a>

    <!-- Facebook -->
    <a
      :href="`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`"
      target="_blank"
      rel="noopener noreferrer"
    >
      <i class="fab fa-facebook"></i>
    </a>

    <!-- Twitter -->
    <a
      :href="`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`"
      target="_blank"
      rel="noopener noreferrer"
    >
      <i class="fab fa-twitter"></i>
    </a>
  </div>
</template>

<script>
  export default {
    props: {
      shareUrl: {
        type: String,
        required: true,
      },
      shareText: {
        type: String,
        required: true,
      },
    },
  };
</script>

<style scoped>
  .share-buttons a {
    display: inline-block;
    margin: 8px;
    text-decoration: none;
    color: #444;
  }
  .share-buttons a i {
    margin-right: 8px;
  }
</style>
