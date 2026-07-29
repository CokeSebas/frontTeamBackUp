<template>
  <nav
    :class="[
      'navbar navbar-expand-lg app-navbar',
      mode === 'dark' ? 'navbar-dark bg-dark' : 'navbar-light bg-light'
    ]"
    aria-label="Navegación principal"
  >
    <div class="container-fluid navbar-inner">
      <router-link to="/" class="navbar-brand" @click="closeMobileMenu">
        <img
          :src="logoSrc"
          class="navbar-logo"
          alt="PokeCircuit"
          width="42"
          height="42"
        />
        <span class="brand-text">PokeCircuit</span>
      </router-link>

      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#mainNavbar"
        aria-controls="mainNavbar"
        aria-expanded="false"
        aria-label="Abrir o cerrar navegación"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div id="mainNavbar" class="collapse navbar-collapse">
        <ul class="navbar-nav me-auto mb-3 mb-lg-0">
          <li v-for="item in publicNavigation" :key="item.to" class="nav-item">
            <router-link class="nav-link" :to="item.to" @click="closeMobileMenu">
              {{ $t(item.label) }}
            </router-link>
          </li>

          <template v-if="isAuthenticated && userId">
            <li v-for="item in privateNavigation" :key="item.to" class="nav-item">
              <router-link class="nav-link" :to="item.to" @click="closeMobileMenu">
                {{ $t(item.label) }}
              </router-link>
            </li>
          </template>

          <li class="nav-item">
            <router-link class="nav-link" to="/perfil" @click="closeMobileMenu">
              {{ $t('profile') }}
            </router-link>
          </li>
        </ul>

        <ul class="navbar-nav navbar-actions">
          <li class="nav-item dropdown">
            <button
              class="btn btn-outline-secondary dropdown-toggle action-button language-button"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              :aria-label="`Idioma actual: ${currentLanguage}`"
              title="Cambiar idioma"
            >
              <img
                :src="currentFlag"
                class="language-flag"
                :alt="currentLanguage"
                width="24"
                height="16"
              />
              <span class="language-name"></span>
            </button>

            <ul class="dropdown-menu dropdown-menu-end language-menu">
              <li v-for="language in languages" :key="language.code">
                <button
                  type="button"
                  class="dropdown-item language-option"
                  :class="{ active: locale === language.code }"
                  @click="changeLanguage(language.code)"
                >
                  <img
                    :src="language.flag"
                    class="language-flag"
                    :alt="language.name"
                    width="24"
                    height="16"
                    loading="lazy"
                  />
                  <span>{{ language.name }}</span>
                </button>
              </li>
            </ul>
          </li>

          <li class="nav-item">
            <router-link
              to="/guide"
              class="btn btn-outline-secondary action-button help-button"
              aria-label="Guía de uso"
              title="Guía de uso"
              @click="closeMobileMenu"
            >
              <span aria-hidden="true">
                <img
                  v-if="unowIcon"
                  :src="unowIcon"
                  width="25"
                  height="25"
                  alt=""
                  aria-hidden="true"
                />
              </span>
            </router-link>
          </li>

          <!-- NOTIFICACIONES -->
          <li class="nav-item dropdown notification-wrapper">
            <button
              class="btn btn-outline-secondary action-button notification-button"
              type="button"
              data-bs-toggle="dropdown"
              data-bs-auto-close="outside"
              aria-expanded="false"
              aria-label="Novedades"
              title="Novedades"
            >
              <!-- Campana -->
              <img
                v-if="notificationIcon"
                :src="notificationIcon"
                width="25"
                height="25"
                alt=""
                aria-hidden="true"
              />

              <!-- Indicador -->
              <span
                v-if="unreadNotifications > 0"
                class="notification-badge"
              >
                {{ unreadNotifications > 9 ? '9+' : unreadNotifications }}
              </span>
            </button>

            <div
              class="dropdown-menu dropdown-menu-end notification-menu"
            >
              <div class="notification-header">
                <div>
                  <span class="notification-overline">
                    POKECIRCUIT
                  </span>

                  <h6 class="notification-title">
                    Novedades
                  </h6>
                </div>

                <button
                  v-if="unreadNotifications > 0"
                  type="button"
                  class="mark-read-button"
                  @click="markAllNotificationsAsRead"
                >
                  Marcar como leídas
                </button>
              </div>

              <div
                v-if="notifications.length"
                class="notification-list"
              >
                <button
                  v-for="notification in notifications"
                  :key="notification.id"
                  type="button"
                  class="notification-item"
                  :class="{
                    'notification-unread': !isNotificationRead(notification.id)
                  }"
                  @click="openNotification(notification)"
                >
                  <span
                    v-if="!isNotificationRead(notification.id)"
                    class="notification-dot"
                  ></span>

                  <div class="notification-content">
                    <strong>
                      {{ notification.title }}
                    </strong>

                    <p>
                      {{ notification.message }}
                    </p>

                    <small>
                      {{ notification.date }}
                    </small>
                  </div>
                </button>
              </div>

              <div
                v-else
                class="notification-empty"
              >
                No hay novedades por el momento.
              </div>
            </div>
          </li>

          <li class="nav-item">
            <button
              type="button"
              class="btn btn-outline-secondary action-button mode-button"
              :aria-label="mode === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'"
              :title="mode === 'dark' ? 'Activar modo claro' : 'Activar modo oscuro'"
              @click="handleToggleMode"
            >
              <img
                v-if="modeIcon"
                :src="modeIcon"
                width="20"
                height="20"
                alt=""
                aria-hidden="true"
              />
              <span v-else aria-hidden="true">
                {{ mode === 'dark' ? '☀️' : '🌙' }}
              </span>
            </button>
          </li>

          <li class="nav-item auth-action">
            <button
              v-if="isAuthenticated"
              type="button"
              class="btn btn-danger action-button auth-button"
              @click="logout"
            >
              {{ $t('logout') }}
            </button>

            <router-link
              v-else
              class="btn btn-success action-button auth-button"
              to="/login"
              @click="closeMobileMenu"
            >
              {{ $t('login') }}
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>

  <script setup>
  import { computed, inject, ref, unref } from 'vue'
  import { useRouter } from 'vue-router'
  import { useI18n } from 'vue-i18n'
  import { useAuthStore } from '@/stores/authStore'
  import logo from '@/assets/pokecircuit.png'

  const router = useRouter()
  const authStore = useAuthStore()
  const { locale } = useI18n()

  const injectedMode = inject('mode', ref('light'))
  const injectedToggleMode = inject('toggleMode', () => {})
  const sunIcon = inject('sunIcon', '')
  const moonIcon = inject('moonIcon', '')
  const unowIcon = inject('unowIcon', '')
  const notificationIcon = inject('notificacionIcon', '')

  const logoSrc = logo;

  const notifications = ref([
    {
      id: '2026-07-guia',
      title: 'Guia de Uso',
      message: 'Explicación de las funciones basicas de PokeCircuit.',
      link: '/guide',
      date: '27/07/2026'
    },
    {
      id: '2026-07-new-image',
      title: 'Nueva Imagen',
      message: 'Mas colores, mas informacion, mas PokeCircuit.',
      link: '/',
      date: '22/07/2026'
    },
    {
      id: '2026-07-team-sheet',
      title: 'Hoja de equipo',
      message: 'Ahora puedes generar e imprimir tu hoja de equipo directamente desde PokeCircuit.',
      link: '/vgc/print-team-sheet',
      date: '20/07/2026'
    },
    {
      id: '2026-07-match-record',
      title: '¡Nueva funcionalidad!',
      message: 'Ahora puedes registrar tus partidas y llevar un historial de tus enfrentamientos.',
      link: '/vgc/match-record',
      date: '13/07/2026'
    }
  ])

  const readNotifications = ref(
    JSON.parse(localStorage.getItem('pokecircuit_read_notifications') || '[]')
  )

  const unreadNotifications = computed(() => {
    return notifications.value.filter(
      notification => !readNotifications.value.includes(notification.id)
    ).length
  })

  function isNotificationRead(notificationId) {
    return readNotifications.value.includes(notificationId)
  }

  function saveReadNotifications() {
    try {
      localStorage.setItem(
        'pokecircuit_read_notifications',
        JSON.stringify(readNotifications.value)
      )
    } catch (error) {
      console.warn(
        'No fue posible guardar las notificaciones leídas.',
        error
      )
    }
  }

  function markNotificationAsRead(notificationId) {
    if (isNotificationRead(notificationId)) {
      return
    }

    readNotifications.value.push(notificationId)

    saveReadNotifications()
  }

  function markAllNotificationsAsRead() {
    readNotifications.value = notifications.value.map(
      notification => notification.id
    )

    saveReadNotifications()
  }

  async function openNotification(notification) {
    markNotificationAsRead(notification.id)

    if (notification.link) {
      await router.push(notification.link)
    }
  }

  const languages = [
    {
      code: 'en',
      name: 'English',
      flag: 'https://flagpedia.net/data/flags/w580/us.webp'
    },
    {
      code: 'es',
      name: 'Español',
      flag: 'https://flagpedia.net/data/flags/w580/es.webp'
    },
    {
      code: 'br',
      name: 'Português',
      flag: 'https://flagpedia.net/data/flags/w580/br.webp'
    },
    {
      code: 'fr',
      name: 'Français',
      flag: 'https://flagpedia.net/data/flags/w580/fr.webp'
    },
    {
      code: 'it',
      name: 'Italiano',
      flag: 'https://flagpedia.net/data/flags/w580/it.webp'
    },
    {
      code: 'de',
      name: 'Deutsch',
      flag: 'https://flagpedia.net/data/flags/w580/de.webp'
    }
  ]

  const publicNavigation = [
    { to: '/vgc/teams', label: 'teams' },
    { to: '/vgc/pokemons', label: 'pokemons' },
    { to: '/tournament/ver-torneos', label: 'seeTournaments' },
    { to: '/vgc/print-team-sheet', label: 'teamSheetSection.printTeamSheet' },
    { to: '/vgc/match-record', label: 'matchRecordSection.title' }
  ]

  const mode = computed(() =>
    unref(injectedMode) === 'dark' ? 'dark' : 'light'
  )

  const isAuthenticated = computed(() => Boolean(authStore.isAuthenticated))
  const userId = computed(() => authStore.idUser)

  const privateNavigation = computed(() => [
    { to: `/vgc/my-teams/${userId.value}`, label: 'myTeams' },
    { to: `/vgc/my-pokemons/${userId.value}`, label: 'myPokemons' }
  ])

  const selectedLanguage = computed(() =>
    languages.find((language) => language.code === locale.value) ?? languages[0]
  )

  const currentLanguage = computed(() => selectedLanguage.value.name)
  const currentFlag = computed(() => selectedLanguage.value.flag)

  const modeIcon = computed(() =>
    mode.value === 'dark' ? unref(sunIcon) : unref(moonIcon)
  )

  function changeLanguage(languageCode) {
    const isSupportedLanguage = languages.some(
      (language) => language.code === languageCode
    )

    if (!isSupportedLanguage) return

    locale.value = languageCode

    try {
      localStorage.setItem('locale', languageCode)
    } catch (error) {
      console.warn('No fue posible guardar el idioma seleccionado.', error)
    }
  }

  function handleToggleMode() {
    const toggleModeHandler = unref(injectedToggleMode)

    if (typeof toggleModeHandler === 'function') {
      toggleModeHandler()
    }
  }

  function closeMobileMenu() {
    const menu = document.getElementById('mainNavbar')
    const toggler = document.querySelector('[aria-controls="mainNavbar"]')

    if (!menu?.classList.contains('show')) return

    menu.classList.remove('show')
    toggler?.classList.add('collapsed')
    toggler?.setAttribute('aria-expanded', 'false')
  }

  async function logout() {
    try {
      await authStore.logout()
    } finally {
      try {
        localStorage.removeItem('token')
      } catch (error) {
        console.warn('No fue posible eliminar el token local.', error)
      }

      closeMobileMenu()
      await router.push('/login')
    }
  }
</script>

<style scoped>
  .app-navbar {
    width: 100%;
    min-height: 72px;
    padding: 0.65rem 0;
    border-bottom: 1px solid rgba(127, 127, 127, 0.2);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  }

  .navbar-inner {
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }

  .navbar-brand {
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
    margin-right: 1.5rem;
    border-radius: 0.5rem;
  }

  .navbar-logo {
    display: block;
    width: 42px;
    height: 42px;
    object-fit: contain;
  }

  .brand-text {
    font-size: 1.08rem;
    font-weight: 700;
    letter-spacing: 0.01em;
  }

  .navbar-nav {
    align-items: center;
    gap: 0.15rem;
  }

  .nav-link {
    position: relative;
    padding: 0.55rem 0.65rem !important;
    border-radius: 0.45rem;
    font-size: 0.92rem;
    font-weight: 500;
    text-align: center;
    transition:
      background-color 0.18s ease,
      color 0.18s ease;
  }

  .nav-link:hover,
  .nav-link:focus-visible {
    background: rgba(127, 127, 127, 0.12);
  }

  .nav-link.router-link-active {
    font-weight: 700;
  }

  .navbar-actions {
    flex-direction: row;
    gap: 0.5rem;
  }

  .action-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 38px;
    border-radius: 0.5rem;
    white-space: nowrap;
  }

  .language-button {
    gap: 0.45rem;
  }

  .language-flag {
    display: block;
    flex: 0 0 auto;
    border-radius: 2px;
    object-fit: cover;
  }

  .language-menu {
    min-width: 180px;
    padding: 0.4rem;
  }

  .language-option {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    padding: 0.55rem 0.7rem;
    border-radius: 0.35rem;
  }

  .mode-button {
    width: 42px;
    padding-inline: 0.65rem;
  }

  .auth-button {
    min-width: 84px;
  }

  .navbar-brand:focus-visible,
  .nav-link:focus-visible,
  .action-button:focus-visible,
  .language-option:focus-visible {
    outline: 3px solid rgba(13, 110, 253, 0.3);
    outline-offset: 2px;
  }

  @media (max-width: 1199.98px) and (min-width: 992px) {
    .brand-text,
    .language-name {
      display: none;
    }

    .navbar-brand {
      margin-right: 0.75rem;
    }

    .nav-link {
      padding-inline: 0.45rem !important;
      font-size: 0.85rem;
    }
  }

  @media (max-width: 991.98px) {
    .app-navbar {
      padding: 0.55rem 0;
    }

    .navbar-inner {
      padding: 0 1rem;
    }

    .navbar-collapse {
      margin-top: 0.75rem;
      padding: 0.85rem;
      border: 1px solid rgba(127, 127, 127, 0.22);
      border-radius: 0.75rem;
      background: inherit;
    }

    .navbar-nav {
      align-items: stretch;
    }

    .nav-link {
      text-align: left;
    }

    .navbar-actions {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      align-items: stretch;
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid rgba(127, 127, 127, 0.2);
    }

    .navbar-actions .nav-item:first-child {
      min-width: 0;
    }

    .language-button {
      width: 100%;
    }

    .auth-action {
      grid-column: 1 / -1;
    }

    .auth-button {
      width: 100%;
    }
  }

  @media (max-width: 575.98px) {
    .brand-text {
      font-size: 1rem;
    }

    .navbar-logo {
      width: 38px;
      height: 38px;
    }
  }

  /* ============================
    NOTIFICACIONES
  ============================ */

  .notification-wrapper {
    position: relative;
  }

  .notification-button {
    position: relative;
    width: 42px;
    padding-inline: 0.65rem;
  }

  .notification-badge {
    position: absolute;
    top: -6px;
    right: -6px;

    display: flex;
    align-items: center;
    justify-content: center;

    min-width: 18px;
    height: 18px;

    padding: 0 5px;

    border: 2px solid var(--bs-body-bg);
    border-radius: 20px;

    background: #e63946;
    color: #fff;

    font-size: 0.65rem;
    font-weight: 700;
    line-height: 1;
  }

  .notification-menu {
    width: 380px;
    max-height: 480px;

    padding: 0;

    border-radius: 0.8rem;
    overflow: hidden;
  }

  .notification-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;

    padding: 1rem 1.1rem;

    border-bottom: 1px solid rgba(127, 127, 127, 0.2);
  }

  .notification-overline {
    display: block;

    margin-bottom: 0.15rem;

    color: #36c980;

    font-size: 0.65rem;
    font-weight: 800;
    letter-spacing: 0.15em;
  }

  .notification-title {
    margin: 0;

    font-weight: 700;
  }

  .mark-read-button {
    padding: 0;

    border: 0;

    background: transparent;
    color: #36c980;

    font-size: 0.75rem;
    font-weight: 600;
  }

  .mark-read-button:hover {
    text-decoration: underline;
  }

  .notification-list {
    max-height: 380px;
    overflow-y: auto;
  }

  .notification-item {
    position: relative;

    display: block;
    width: 100%;

    padding: 1rem 1.25rem;

    border: 0;
    border-bottom: 1px solid rgba(127, 127, 127, 0.15);

    background: transparent;
    color: inherit;

    text-align: left;

    cursor: pointer;

    transition: background-color 0.15s ease;
  }

  .notification-item:hover {
    background: rgba(127, 127, 127, 0.08);
  }

  .notification-unread {
    background: rgba(54, 201, 128, 0.08);
  }

  .notification-content strong {
    display: block;

    padding-right: 1rem;

    font-size: 0.9rem;
  }

  .notification-content p {
    margin: 0.35rem 0;

    opacity: 0.8;

    font-size: 0.82rem;
    line-height: 1.4;
  }

  .notification-content small {
    opacity: 0.55;

    font-size: 0.72rem;
  }

  .notification-dot {
    position: absolute;
    top: 1.15rem;
    right: 1rem;

    width: 8px;
    height: 8px;

    border-radius: 50%;

    background: #36c980;
  }

  .notification-empty {
    padding: 2rem 1rem;

    opacity: 0.7;

    text-align: center;
    font-size: 0.85rem;
  }

  @media (max-width: 575.98px) {
    .notification-menu {
      width: min(360px, calc(100vw - 2rem));
    }
  }

  .help-button {
    width: 42px;
    padding-inline: 0.65rem;

    font-size: 1.1rem;
    font-weight: 700;

    text-decoration: none;
  }
</style>
