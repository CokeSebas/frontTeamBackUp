<template>
  <main
    class="users-page"
    :class="{ 'theme-dark': isDark }"
  >
    <div class="users-container">
      <section
        v-if="loading"
        class="state-card"
        aria-label="Cargando usuarios"
        aria-live="polite"
        aria-busy="true"
      >
        <img
          v-if="gifLoadingValue"
          :src="gifLoadingValue"
          class="loading-image"
          alt="Cargando usuarios"
        >
        <span
          v-else
          class="loading-spinner"
          aria-hidden="true"
        ></span>
      </section>

      <section
        v-else-if="accessDenied"
        class="state-card"
        role="alert"
      >
        <h1>No autorizado</h1>
        <p>No tienes permisos para ver esta página.</p>

        <button
          type="button"
          class="action-button button-secondary"
          @click="goBack"
        >
          Volver
        </button>
      </section>

      <section
        v-else-if="loadError"
        class="state-card"
        role="alert"
      >
        <h1>{{ $t('responseApisSeccion.oops') }}</h1>
        <p>{{ loadError }}</p>

        <button
          type="button"
          class="action-button button-primary"
          @click="loadUsers"
        >
          Reintentar
        </button>
      </section>

      <section
        v-else
        class="users-card"
      >
        <header class="page-header">
          <span class="header-kicker">
            <span class="header-kicker-dot" aria-hidden="true" />
            Administración
          </span>

          <h1>Lista de usuarios</h1>

          <p class="page-description">
            Administra los datos, permisos y estado de acceso de los
            usuarios registrados en la plataforma.
          </p>

          <div class="header-stats">
            <span class="stat-chip">
              <strong>{{ users.length }}</strong>
              {{ users.length === 1 ? 'usuario' : 'usuarios' }}
            </span>

            <span class="stat-chip">
              <strong>{{ activeUsersCount }}</strong>
              activos
            </span>

            <span class="stat-chip">
              <strong>{{ organizerUsersCount }}</strong>
              organizadores
            </span>
          </div>
        </header>

        <div class="users-toolbar">
          <div class="toolbar-summary">
            <span class="section-kicker">USUARIOS REGISTRADOS</span>

            <strong>
              {{ filteredUsers.length }}
              {{
                filteredUsers.length === 1
                  ? 'resultado'
                  : 'resultados'
              }}
            </strong>
          </div>

          <div class="search-field">
            <label for="user-search" class="sr-only">
              Buscar usuario
            </label>

            <div class="search-control">
              <input
                id="user-search"
                v-model.trim="searchTerm"
                class="form-control"
                type="search"
                autocomplete="off"
                placeholder="Buscar por nombre, nickname o correo"
                @keydown.esc="clearSearch"
              >

              <button
                v-if="searchTerm"
                type="button"
                class="clear-search"
                aria-label="Limpiar búsqueda"
                title="Limpiar búsqueda"
                @click="clearSearch"
              >
                ×
              </button>
            </div>
          </div>
        </div>

        <div
          v-if="filteredUsers.length"
          class="desktop-users"
        >
          <div class="table-scroll">
            <table class="users-table">
              <thead>
                <tr>
                  <th scope="col">
                    {{ $t('profileSeccion.avatarUrl') }}
                  </th>
                  <th scope="col">
                    {{ $t('profileSeccion.name') }}
                  </th>
                  <th scope="col">
                    {{ $t('profileSeccion.lastName') }}
                  </th>
                  <th scope="col">
                    {{ $t('profileSeccion.nickName') }}
                  </th>
                  <th scope="col">
                    {{ $t('profileSeccion.email') }}
                  </th>
                  <th scope="col">
                    {{ $t('profileSeccion.isOrganizer') }}
                  </th>
                  <th scope="col">
                    {{ $t('profileSeccion.isActive') }}
                  </th>
                  <th scope="col" class="actions-heading">
                    {{ $t('profileSeccion.actions') }}
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="user in filteredUsers"
                  :key="user.clientId"
                  :class="{ 'editing-row': user.editing }"
                >
                  <td>
                    <div class="avatar-wrapper">
                      <img
                        v-if="user.avatarUrl && !user.avatarError"
                        :src="user.avatarUrl"
                        class="avatar"
                        :alt="`Avatar de ${getFullName(user)}`"
                        width="44"
                        height="44"
                        loading="lazy"
                        @error="user.avatarError = true"
                      >

                      <span
                        v-else
                        class="avatar-placeholder"
                        aria-hidden="true"
                      >
                        {{ getInitials(user) }}
                      </span>
                    </div>
                  </td>

                  <td>
                    <input
                      v-if="user.editing"
                      v-model="user.name"
                      class="form-control table-input"
                      type="text"
                      maxlength="80"
                      :aria-label="`Nombre de ${getFullName(user)}`"
                      :disabled="isSavingUser(user)"
                      @input="clearRowError(user)"
                    >
                    <span v-else>{{ user.name || '-' }}</span>
                  </td>

                  <td>
                    <input
                      v-if="user.editing"
                      v-model="user.lastName"
                      class="form-control table-input"
                      type="text"
                      maxlength="100"
                      :aria-label="`Apellido de ${getFullName(user)}`"
                      :disabled="isSavingUser(user)"
                      @input="clearRowError(user)"
                    >
                    <span v-else>{{ user.lastName || '-' }}</span>
                  </td>

                  <td>
                    <input
                      v-if="user.editing"
                      v-model="user.nickName"
                      class="form-control table-input"
                      type="text"
                      maxlength="50"
                      :aria-label="`Nickname de ${getFullName(user)}`"
                      :disabled="isSavingUser(user)"
                      @input="clearRowError(user)"
                    >
                    <span v-else>{{ user.nickName || '-' }}</span>
                  </td>

                  <td class="email-cell">
                    <input
                      v-if="user.editing"
                      v-model="user.email"
                      class="form-control table-input email-input"
                      type="email"
                      maxlength="150"
                      :aria-label="`Correo de ${getFullName(user)}`"
                      :disabled="isSavingUser(user)"
                      @input="clearRowError(user)"
                    >
                    <span v-else>{{ user.email || '-' }}</span>
                  </td>

                  <td class="center-cell">
                    <label
                      v-if="user.editing"
                      class="checkbox-control"
                    >
                      <input
                        v-model="user.isOrganizer"
                        type="checkbox"
                        :disabled="isSavingUser(user)"
                      >
                      <span class="sr-only">
                        Organizador
                      </span>
                    </label>

                    <span
                      v-else
                      class="status-badge"
                      :class="
                        user.isOrganizer
                          ? 'status-positive'
                          : 'status-neutral'
                      "
                    >
                      {{ user.isOrganizer ? 'Sí' : 'No' }}
                    </span>
                  </td>

                  <td class="center-cell">
                    <label
                      v-if="user.editing"
                      class="checkbox-control"
                    >
                      <input
                        v-model="user.isActive"
                        type="checkbox"
                        :disabled="isSavingUser(user)"
                      >
                      <span class="sr-only">
                        Usuario activo
                      </span>
                    </label>

                    <span
                      v-else
                      class="status-badge"
                      :class="
                        user.isActive
                          ? 'status-positive'
                          : 'status-negative'
                      "
                    >
                      {{ user.isActive ? 'Sí' : 'No' }}
                    </span>
                  </td>

                  <td>
                    <div class="row-actions">
                      <button
                        v-if="!user.editing"
                        type="button"
                        class="action-button button-primary button-small"
                        @click="editUser(user)"
                      >
                        Editar
                      </button>

                      <template v-else>
                        <button
                          type="button"
                          class="action-button button-success button-small"
                          :disabled="isSavingUser(user)"
                          @click="saveUser(user)"
                        >
                          <span
                            v-if="isSavingUser(user)"
                            class="button-spinner"
                            aria-hidden="true"
                          ></span>
                          {{
                            isSavingUser(user)
                              ? 'Guardando...'
                              : 'Guardar'
                          }}
                        </button>

                        <button
                          type="button"
                          class="action-button button-danger button-small"
                          :disabled="isSavingUser(user)"
                          @click="cancelEdit(user)"
                        >
                          Cancelar
                        </button>
                      </template>
                    </div>

                    <p
                      v-if="user.rowError"
                      class="row-error"
                      role="alert"
                    >
                      {{ user.rowError }}
                    </p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div
          v-if="filteredUsers.length"
          class="mobile-users"
        >
          <article
            v-for="user in filteredUsers"
            :key="user.clientId"
            class="user-mobile-card"
            :class="{ 'editing-card': user.editing }"
          >
            <header class="mobile-card-header">
              <div class="mobile-user">
                <div class="avatar-wrapper">
                  <img
                    v-if="user.avatarUrl && !user.avatarError"
                    :src="user.avatarUrl"
                    class="avatar"
                    :alt="`Avatar de ${getFullName(user)}`"
                    width="52"
                    height="52"
                    loading="lazy"
                    @error="user.avatarError = true"
                  >

                  <span
                    v-else
                    class="avatar-placeholder mobile-avatar"
                    aria-hidden="true"
                  >
                    {{ getInitials(user) }}
                  </span>
                </div>

                <div>
                  <h2>{{ getFullName(user) }}</h2>
                  <p>{{ user.email || '-' }}</p>
                </div>
              </div>

              <span
                class="status-badge"
                :class="
                  user.isActive
                    ? 'status-positive'
                    : 'status-negative'
                "
              >
                {{ user.isActive ? 'Activo' : 'Inactivo' }}
              </span>
            </header>

            <div
              v-if="user.editing"
              class="mobile-edit-grid"
            >
              <div class="field-group">
                <label :for="`mobile-name-${user.clientId}`">
                  {{ $t('profileSeccion.name') }}
                </label>
                <input
                  :id="`mobile-name-${user.clientId}`"
                  v-model="user.name"
                  class="form-control"
                  type="text"
                  maxlength="80"
                  :disabled="isSavingUser(user)"
                  @input="clearRowError(user)"
                >
              </div>

              <div class="field-group">
                <label :for="`mobile-last-name-${user.clientId}`">
                  {{ $t('profileSeccion.lastName') }}
                </label>
                <input
                  :id="`mobile-last-name-${user.clientId}`"
                  v-model="user.lastName"
                  class="form-control"
                  type="text"
                  maxlength="100"
                  :disabled="isSavingUser(user)"
                  @input="clearRowError(user)"
                >
              </div>

              <div class="field-group">
                <label :for="`mobile-nickname-${user.clientId}`">
                  {{ $t('profileSeccion.nickName') }}
                </label>
                <input
                  :id="`mobile-nickname-${user.clientId}`"
                  v-model="user.nickName"
                  class="form-control"
                  type="text"
                  maxlength="50"
                  :disabled="isSavingUser(user)"
                  @input="clearRowError(user)"
                >
              </div>

              <div class="field-group">
                <label :for="`mobile-email-${user.clientId}`">
                  {{ $t('profileSeccion.email') }}
                </label>
                <input
                  :id="`mobile-email-${user.clientId}`"
                  v-model="user.email"
                  class="form-control"
                  type="email"
                  maxlength="150"
                  :disabled="isSavingUser(user)"
                  @input="clearRowError(user)"
                >
              </div>

              <div class="mobile-checks">
                <label class="toggle-row">
                  <span>
                    {{ $t('profileSeccion.isOrganizer') }}
                  </span>
                  <input
                    v-model="user.isOrganizer"
                    type="checkbox"
                    :disabled="isSavingUser(user)"
                  >
                </label>

                <label class="toggle-row">
                  <span>
                    {{ $t('profileSeccion.isActive') }}
                  </span>
                  <input
                    v-model="user.isActive"
                    type="checkbox"
                    :disabled="isSavingUser(user)"
                  >
                </label>
              </div>
            </div>

            <dl
              v-else
              class="mobile-details"
            >
              <div>
                <dt>{{ $t('profileSeccion.nickName') }}</dt>
                <dd>{{ user.nickName || '-' }}</dd>
              </div>

              <div>
                <dt>{{ $t('profileSeccion.isOrganizer') }}</dt>
                <dd>{{ user.isOrganizer ? 'Sí' : 'No' }}</dd>
              </div>
            </dl>

            <p
              v-if="user.rowError"
              class="row-error"
              role="alert"
            >
              {{ user.rowError }}
            </p>

            <footer class="mobile-actions">
              <button
                v-if="!user.editing"
                type="button"
                class="action-button button-primary"
                @click="editUser(user)"
              >
                Editar
              </button>

              <template v-else>
                <button
                  type="button"
                  class="action-button button-success"
                  :disabled="isSavingUser(user)"
                  @click="saveUser(user)"
                >
                  <span
                    v-if="isSavingUser(user)"
                    class="button-spinner"
                    aria-hidden="true"
                  ></span>
                  {{
                    isSavingUser(user)
                      ? 'Guardando...'
                      : 'Guardar'
                  }}
                </button>

                <button
                  type="button"
                  class="action-button button-danger"
                  :disabled="isSavingUser(user)"
                  @click="cancelEdit(user)"
                >
                  Cancelar
                </button>
              </template>
            </footer>
          </article>
        </div>

        <section
          v-if="!filteredUsers.length"
          class="empty-state"
        >
          <h2>No se encontraron usuarios</h2>
          <p>
            {{
              searchTerm
                ? 'Prueba con otro término de búsqueda.'
                : 'No existen usuarios registrados.'
            }}
          </p>
        </section>
      </section>
    </div>
  </main>
</template>

<script setup>
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  ref,
  unref
} from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

const apiUrl = inject('apiUrl', '');
const mode = inject('mode', ref('light'));
const gifLoading = inject('gifLoading', '');

const router = useRouter();
const { t } = useI18n();

const users = ref([]);
const loading = ref(true);
const loadError = ref('');
const accessDenied = ref(false);
const searchTerm = ref('');
const savingUserId = ref(null);
const detectedDarkTheme = ref(false);

const userBackups = new Map();

let loadController = null;
let saveController = null;
let themeObserver = null;
let userSequence = 0;

const modeValue = computed(() =>
  String(unref(mode) || '').trim().toLowerCase()
);

const gifLoadingValue = computed(() =>
  String(unref(gifLoading) || '').trim()
);

const isDark = computed(
  () =>
    modeValue.value === 'dark' ||
    modeValue.value === 'oscuro' ||
    detectedDarkTheme.value
);

const isAdmin = computed(() =>
  typeof window !== 'undefined' &&
  sessionStorage.getItem('isAdmin') === 'true'
);

const normalizeSearchText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase();

const activeUsersCount = computed(
  () => users.value.filter((user) => user.isActive).length
);

const organizerUsersCount = computed(
  () => users.value.filter((user) => user.isOrganizer).length
);

const filteredUsers = computed(() => {
  const query = normalizeSearchText(searchTerm.value);

  if (!query) {
    return users.value;
  }

  return users.value.filter((user) =>
    [
      user.name,
      user.lastName,
      user.nickName,
      user.email
    ].some((value) =>
      normalizeSearchText(value).includes(query)
    )
  );
});

const clearSearch = () => {
  searchTerm.value = '';
};

const buildApiUrl = (path) => {
  const baseUrl = String(unref(apiUrl) || '')
    .replace(/\/+$/, '');
  const cleanPath = String(path || '')
    .replace(/^\/+/, '');

  return baseUrl
    ? `${baseUrl}/${cleanPath}`
    : `/${cleanPath}`;
};

const getAuthHeaders = () => {
  const token =
    typeof window !== 'undefined'
      ? localStorage.getItem('token')
      : null;

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

const normalizeBoolean = (value) =>
  value === true ||
  value === 1 ||
  value === '1' ||
  value === 'true';

const createClientId = (user, index) => {
  userSequence += 1;

  return String(
    user.id ??
    user.userId ??
    user.user_id ??
    `user-${Date.now()}-${index}-${userSequence}`
  );
};

const normalizeUsers = (data) => {
  const source = Array.isArray(data)
    ? data
    : Array.isArray(data?.salida?.[0]?.data)
      ? data.salida[0].data
      : Array.isArray(data?.data)
        ? data.data
        : [];

  return source
    .filter((user) => user && typeof user === 'object')
    .map((user, index) => ({
      ...user,
      id:
        user.id ??
        user.userId ??
        user.user_id ??
        null,
      clientId: createClientId(user, index),
      name: String(user.name || ''),
      lastName: String(user.lastName || ''),
      nickName: String(user.nickName || ''),
      email: String(user.email || ''),
      avatarUrl: String(user.avatarUrl || ''),
      isOrganizer: normalizeBoolean(user.isOrganizer),
      isActive: normalizeBoolean(user.isActive),
      editing: false,
      avatarError: false,
      rowError: ''
    }));
};

const isCanceledRequest = (error) =>
  error?.name === 'CanceledError' ||
  error?.code === 'ERR_CANCELED';

const loadUsers = async () => {
  if (!isAdmin.value) {
    loading.value = false;
    accessDenied.value = true;
    users.value = [];
    return;
  }

  loading.value = true;
  loadError.value = '';
  accessDenied.value = false;

  loadController?.abort();

  const currentController = new AbortController();
  loadController = currentController;

  try {
    const response = await axios.get(
      buildApiUrl('users'),
      {
        headers: getAuthHeaders(),
        signal: currentController.signal
      }
    );

    users.value = normalizeUsers(response?.data);
  } catch (error) {
    if (isCanceledRequest(error)) {
      return;
    }

    console.error('Error al cargar usuarios:', error);
    users.value = [];
    loadError.value =
      error?.response?.data?.message ||
      t('responseApisSeccion.loadingDataError') ||
      'No se pudieron cargar los usuarios.';
  } finally {
    if (loadController === currentController) {
      loading.value = false;
      loadController = null;
    }
  }
};

const getFullName = (user) =>
  [user.name, user.lastName]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' ') || 'Usuario';

const getInitials = (user) => {
  const initials = [
    user.name,
    user.lastName
  ]
    .map((value) =>
      String(value || '').trim().charAt(0)
    )
    .filter(Boolean)
    .join('')
    .toUpperCase();

  return initials || 'U';
};

const isSavingUser = (user) =>
  String(savingUserId.value) === String(user.clientId);

const clearRowError = (user) => {
  user.rowError = '';
  user.avatarError = false;
};

const closeOtherEdits = (currentUser) => {
  users.value.forEach((user) => {
    if (
      user.clientId !== currentUser.clientId &&
      user.editing
    ) {
      cancelEdit(user);
    }
  });
};

const editUser = (user) => {
  closeOtherEdits(user);

  userBackups.set(
    user.clientId,
    {
      name: user.name,
      lastName: user.lastName,
      nickName: user.nickName,
      email: user.email,
      avatarUrl: user.avatarUrl,
      isOrganizer: user.isOrganizer,
      isActive: user.isActive
    }
  );

  user.rowError = '';
  user.editing = true;
};

const cancelEdit = (user) => {
  const backup = userBackups.get(user.clientId);

  if (backup) {
    Object.assign(user, backup);
  }

  user.editing = false;
  user.rowError = '';
  user.avatarError = false;
  userBackups.delete(user.clientId);
};

const validateUser = (user) => {
  if (String(user.name || '').trim().length < 2) {
    return 'El nombre debe tener al menos 2 caracteres.';
  }

  if (String(user.lastName || '').trim().length < 2) {
    return 'El apellido debe tener al menos 2 caracteres.';
  }

  if (!String(user.nickName || '').trim()) {
    return 'El nickname es obligatorio.';
  }

  const email = String(user.email || '')
    .trim()
    .toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Ingresa un correo electrónico válido.';
  }

  return '';
};

const createUserPayload = (user) => ({
  name: user.name.trim(),
  lastName: user.lastName.trim(),
  nickName: user.nickName.trim(),
  email: user.email.trim().toLowerCase(),
  avatarUrl: user.avatarUrl.trim(),
  isOrganizer: Boolean(user.isOrganizer),
  isActive: Boolean(user.isActive)
});

const responseHasError = (data) =>
  data?.salida?.[0]?.status === 'error' ||
  data?.status === 'error' ||
  data?.success === false;

const saveUser = async (user) => {
  if (
    savingUserId.value !== null ||
    user.id == null
  ) {
    if (user.id == null) {
      user.rowError =
        'No se encontró el identificador del usuario.';
    }
    return;
  }

  user.rowError = validateUser(user);

  if (user.rowError) {
    return;
  }

  savingUserId.value = user.clientId;

  saveController?.abort();
  saveController = new AbortController();

  const payload = createUserPayload(user);

  try {
    const response = await axios.post(
      buildApiUrl(`users/edit/${user.id}`),
      payload,
      {
        headers: getAuthHeaders(),
        signal: saveController.signal
      }
    );

    if (responseHasError(response?.data)) {
      throw new Error('UPDATE_USER_FAILED');
    }

    Object.assign(user, payload);
    user.editing = false;
    user.rowError = '';
    userBackups.delete(user.clientId);

    await Swal.fire({
      icon: 'success',
      title: 'Usuario actualizado',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    });
  } catch (error) {
    if (isCanceledRequest(error)) {
      return;
    }

    console.error('Error al actualizar usuario:', error);

    user.rowError =
      error?.response?.data?.message ||
      'No se pudo actualizar el usuario.';

    await Swal.fire({
      icon: 'error',
      title: 'Error',
      text: user.rowError
    });
  } finally {
    savingUserId.value = null;
    saveController = null;
  }
};

const detectGlobalTheme = () => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const body = document.body;

  const classNames = [
    root?.className || '',
    body?.className || ''
  ].join(' ');

  const dataTheme =
    root?.dataset?.theme ||
    body?.dataset?.theme ||
    root?.dataset?.bsTheme ||
    body?.dataset?.bsTheme ||
    '';

  detectedDarkTheme.value =
    /(^|\s)(dark|dark-mode|theme-dark|is-dark)(\s|$)/i.test(
      classNames
    ) ||
    String(dataTheme).toLowerCase() === 'dark';
};

const goBack = () => {
  router.back();
};

onMounted(() => {
  detectGlobalTheme();

  if (typeof MutationObserver !== 'undefined') {
    themeObserver = new MutationObserver(detectGlobalTheme);

    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'data-bs-theme']
    });

    if (document.body) {
      themeObserver.observe(document.body, {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'data-bs-theme']
      });
    }
  }

  loadUsers();
});

onBeforeUnmount(() => {
  loadController?.abort();
  saveController?.abort();
  themeObserver?.disconnect();
});
</script>

<style scoped>
.users-page {
  --accent: #d4ad22;
  --accent-strong: #b88b12;
  --accent-dark: #83620a;
  --accent-soft: rgba(212, 173, 34, 0.13);
  --accent-border: rgba(184, 139, 18, 0.32);
  --accent-glow: rgba(212, 173, 34, 0.2);
  --accent-text: #2b2208;

  --page-bg: #fffdf5;
  --page-text: #28251c;
  --card-bg: rgba(255, 255, 255, 0.95);
  --card-border: #e9e2c9;
  --card-shadow: 0 24px 60px rgba(93, 72, 12, 0.11);
  --soft-bg: #fffaf0;
  --input-bg: #ffffff;
  --input-text: #28251c;
  --input-border: #d9d0b6;
  --muted-text: #716b59;
  --table-header-bg: #f8f0d4;
  --table-hover-bg: #fff9e9;
  --error-text: #b42318;
  --focus-ring: rgba(212, 173, 34, 0.25);
  --secondary-bg: #626b75;

  min-height: 100dvh;
  padding: clamp(1rem, 3vw, 2.5rem) 0;
  background:
    radial-gradient(
      circle at 8% 0%,
      rgba(212, 173, 34, 0.16),
      transparent 28rem
    ),
    radial-gradient(
      circle at 94% 16%,
      rgba(236, 207, 91, 0.12),
      transparent 25rem
    ),
    linear-gradient(
      180deg,
      #fffdf5 0%,
      #ffffff 55%,
      #fffbef 100%
    );
  color: var(--page-text);
}

.users-page.theme-dark {
  --accent: #dfc14d;
  --accent-strong: #c7a92f;
  --accent-dark: #9d8019;
  --accent-soft: rgba(223, 193, 77, 0.14);
  --accent-border: rgba(223, 193, 77, 0.3);
  --accent-glow: rgba(223, 193, 77, 0.18);
  --accent-text: #251e08;

  --page-bg: #14130f;
  --page-text: #f7f3e7;
  --card-bg: rgba(31, 29, 22, 0.96);
  --card-border: #4a4535;
  --card-shadow: 0 24px 60px rgba(0, 0, 0, 0.4);
  --soft-bg: #28251c;
  --input-bg: #302d23;
  --input-text: #fffdf5;
  --input-border: #5d5744;
  --muted-text: #cec7b2;
  --table-header-bg: #302d23;
  --table-hover-bg: #29261d;
  --error-text: #ff9b91;
  --focus-ring: rgba(223, 193, 77, 0.28);
  --secondary-bg: #525862;

  background:
    radial-gradient(
      circle at 8% 0%,
      rgba(223, 193, 77, 0.16),
      transparent 30rem
    ),
    radial-gradient(
      circle at 94% 18%,
      rgba(199, 169, 47, 0.1),
      transparent 26rem
    ),
    linear-gradient(
      180deg,
      #14130f 0%,
      #191711 54%,
      #11100d 100%
    );
}

.users-page,
.users-page * {
  box-sizing: border-box;
}

.users-container {
  width: min(100% - 2rem, 1380px);
  margin: 0 auto;
}

.users-card,
.state-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--card-border);
  border-radius: 22px;
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(12px);
}

.users-card {
  padding: 0 clamp(1rem, 3vw, 2rem) clamp(1.25rem, 3vw, 2rem);
}

.page-header {
  position: relative;
  margin: 0 clamp(-2rem, -3vw, -1rem) 1.75rem;
  padding: clamp(1.6rem, 4vw, 2.8rem);
  overflow: hidden;
  background:
    linear-gradient(
      135deg,
      var(--accent-dark) 0%,
      var(--accent-strong) 48%,
      var(--accent) 100%
    );
  color: var(--accent-text);
  text-align: center;
  isolation: isolate;
}

.page-header::before,
.page-header::after {
  position: absolute;
  border: 1px solid rgba(43, 34, 8, 0.18);
  border-radius: 50%;
  content: '';
  pointer-events: none;
}

.page-header::before {
  top: -6rem;
  right: -3rem;
  width: 15rem;
  height: 15rem;
}

.page-header::after {
  bottom: -8rem;
  left: -4rem;
  width: 18rem;
  height: 18rem;
}

.header-kicker,
.stat-chip,
.section-kicker {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  font-weight: 800;
}

.header-kicker {
  gap: 0.45rem;
  margin-bottom: 0.75rem;
  padding: 0.4rem 0.72rem;
  border: 1px solid rgba(43, 34, 8, 0.22);
  background: rgba(255, 255, 255, 0.2);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.header-kicker-dot {
  width: 0.48rem;
  height: 0.48rem;
  border-radius: 50%;
  background: var(--accent-text);
  box-shadow: 0 0 12px rgba(43, 34, 8, 0.38);
}

.page-header h1 {
  position: relative;
  z-index: 1;
  margin: 0;
  font-size: clamp(1.8rem, 4.5vw, 2.7rem);
  line-height: 1.12;
  text-wrap: balance;
}

.page-description {
  position: relative;
  z-index: 1;
  max-width: 720px;
  margin: 0.8rem auto 0;
  color: rgba(43, 34, 8, 0.8);
  line-height: 1.6;
  text-wrap: balance;
}

.header-stats {
  position: relative;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  justify-content: center;
  margin-top: 1.15rem;
}

.stat-chip {
  min-height: 34px;
  gap: 0.35rem;
  padding: 0.42rem 0.72rem;
  border: 1px solid rgba(43, 34, 8, 0.2);
  background: rgba(255, 255, 255, 0.2);
  font-size: 0.86rem;
}

.users-toolbar {
  display: flex;
  gap: 1.25rem;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 1.4rem;
  padding: 1rem;
  border: 1px solid var(--accent-border);
  border-radius: 15px;
  background:
    linear-gradient(135deg, var(--accent-soft), transparent 72%);
}

.toolbar-summary {
  display: grid;
  gap: 0.35rem;
}

.section-kicker {
  width: fit-content;
  color: var(--accent-dark);
  font-size: 0.72rem;
  letter-spacing: 0.09em;
}

.theme-dark .section-kicker {
  color: var(--accent);
}

.toolbar-summary strong {
  color: var(--page-text);
  font-size: 1.05rem;
}

.search-field {
  width: min(100%, 430px);
}

.search-control {
  position: relative;
}

.form-control {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 44px;
  padding: 0.68rem 0.82rem;
  border: 1px solid var(--input-border);
  border-radius: 11px;
  outline: none;
  background: var(--input-bg);
  color: var(--input-text);
  font: inherit;
  line-height: 1.3;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease;
}

.search-control .form-control {
  padding-right: 2.7rem;
}

.form-control::placeholder {
  color: var(--muted-text);
  opacity: 0.8;
}

.form-control:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 0.22rem var(--focus-ring);
}

.form-control:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.clear-search {
  position: absolute;
  top: 50%;
  right: 0.55rem;
  display: grid;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  place-items: center;
  color: var(--accent-dark);
  background: var(--accent-soft);
  font-size: 1.2rem;
  line-height: 1;
  cursor: pointer;
  transform: translateY(-50%);
}

.clear-search:hover {
  color: var(--accent-text);
  background: var(--accent);
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
  border: 1px solid var(--card-border);
  border-radius: 15px;
  background: var(--card-bg);
}

.users-table {
  width: 100%;
  min-width: 1080px;
  border-collapse: separate;
  border-spacing: 0;
  color: var(--page-text);
}

.users-table th,
.users-table td {
  padding: 0.78rem 0.68rem;
  border-bottom: 1px solid var(--card-border);
  text-align: left;
  vertical-align: middle;
}

.users-table th {
  position: sticky;
  z-index: 2;
  top: 0;
  background: var(--table-header-bg);
  color: var(--page-text);
  font-size: 0.82rem;
  font-weight: 800;
  white-space: nowrap;
}

.users-table tbody tr {
  background: var(--card-bg);
  transition:
    background-color 140ms ease,
    box-shadow 140ms ease;
}

.users-table tbody tr:hover {
  background: var(--table-hover-bg);
}

.users-table tbody tr:last-child td {
  border-bottom: 0;
}

.editing-row {
  background: var(--soft-bg) !important;
  box-shadow: inset 4px 0 0 var(--accent);
}

.avatar-wrapper {
  display: flex;
  justify-content: center;
}

.avatar,
.avatar-placeholder {
  width: 46px;
  height: 46px;
  flex: 0 0 46px;
  border: 3px solid var(--card-bg);
  border-radius: 50%;
  box-shadow: 0 0 0 2px var(--accent-border);
}

.avatar {
  display: block;
  background: var(--soft-bg);
  object-fit: cover;
}

.avatar-placeholder {
  display: grid;
  place-items: center;
  color: var(--accent-text);
  background:
    linear-gradient(
      135deg,
      var(--accent-dark),
      var(--accent)
    );
  font-size: 0.82rem;
  font-weight: 900;
}

.mobile-avatar {
  width: 54px;
  height: 54px;
  flex-basis: 54px;
}

.table-input {
  min-width: 120px;
}

.email-input {
  min-width: 220px;
}

.email-cell {
  max-width: 280px;
  overflow-wrap: anywhere;
}

.center-cell,
.actions-heading {
  text-align: center !important;
}

.checkbox-control {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.checkbox-control input,
.toggle-row input {
  width: 20px;
  height: 20px;
  accent-color: var(--accent-strong);
  cursor: pointer;
}

.status-badge {
  display: inline-flex;
  min-height: 27px;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.62rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
}

.status-positive {
  color: #80600a;
  background: var(--accent-soft);
}

.status-negative {
  color: #a53126;
  background: rgba(192, 57, 43, 0.14);
}

.status-neutral {
  color: #625c4e;
  background: rgba(98, 92, 78, 0.14);
}

.theme-dark .status-positive {
  color: #f0d875;
}

.theme-dark .status-negative {
  color: #ff9b91;
}

.theme-dark .status-neutral {
  color: #d2cbbb;
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  justify-content: center;
}

.row-error {
  margin: 0.5rem 0 0;
  color: var(--error-text);
  font-size: 0.82rem;
  font-weight: 700;
  text-align: center;
}

.mobile-users {
  display: none;
}

.user-mobile-card {
  padding: 1rem;
  border: 1px solid var(--card-border);
  border-radius: 15px;
  background: var(--soft-bg);
  box-shadow: 0 8px 22px rgba(93, 72, 12, 0.06);
}

.user-mobile-card + .user-mobile-card {
  margin-top: 1rem;
}

.editing-card {
  border-color: var(--accent);
  box-shadow:
    inset 4px 0 0 var(--accent),
    0 8px 22px var(--accent-glow);
}

.mobile-card-header {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  justify-content: space-between;
}

.mobile-user {
  display: flex;
  min-width: 0;
  gap: 0.75rem;
  align-items: center;
}

.mobile-user > div:last-child {
  min-width: 0;
}

.mobile-user h2,
.mobile-user p {
  margin: 0;
  overflow-wrap: anywhere;
}

.mobile-user h2 {
  color: var(--page-text);
  font-size: 1rem;
}

.mobile-user p {
  margin-top: 0.2rem;
  color: var(--muted-text);
  font-size: 0.88rem;
}

.mobile-details {
  margin: 1rem 0 0;
}

.mobile-details > div {
  display: grid;
  grid-template-columns: minmax(120px, auto) minmax(0, 1fr);
  gap: 0.75rem;
  padding: 0.58rem 0;
  border-bottom: 1px solid var(--card-border);
}

.mobile-details > div:last-child {
  border-bottom: 0;
}

.mobile-details dt {
  color: var(--muted-text);
  font-weight: 700;
}

.mobile-details dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  text-align: right;
}

.mobile-edit-grid {
  display: grid;
  gap: 0.9rem;
  margin-top: 1rem;
}

.field-group {
  min-width: 0;
}

.field-group label {
  display: block;
  margin-bottom: 0.35rem;
  color: var(--page-text);
  font-weight: 700;
}

.mobile-checks {
  display: grid;
  gap: 0.65rem;
}

.toggle-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.72rem;
  border: 1px solid var(--card-border);
  border-radius: 10px;
  background: var(--card-bg);
}

.mobile-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.6rem;
  margin-top: 1rem;
}

.action-button {
  display: inline-flex;
  min-height: 40px;
  gap: 0.45rem;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 0.9rem;
  border: 1px solid transparent;
  border-radius: 9px;
  color: #ffffff;
  font: inherit;
  font-weight: 800;
  line-height: 1.2;
  cursor: pointer;
  transition:
    filter 140ms ease,
    transform 140ms ease,
    box-shadow 140ms ease;
}

.action-button:hover:not(:disabled) {
  filter: brightness(1.03);
  transform: translateY(-1px);
}

.action-button:focus-visible,
.form-control:focus-visible,
.clear-search:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}

.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.button-primary,
.button-success {
  color: var(--accent-text);
  background:
    linear-gradient(
      135deg,
      var(--accent-dark),
      var(--accent)
    );
  box-shadow: 0 8px 18px var(--accent-glow);
}

.button-success {
  background:
    linear-gradient(
      135deg,
      var(--accent-strong),
      var(--accent)
    );
}

.button-danger {
  background: #b54335;
}

.button-secondary {
  background: var(--secondary-bg);
}

.button-small {
  min-height: 34px;
  padding: 0.45rem 0.66rem;
  font-size: 0.84rem;
}

.button-spinner,
.loading-spinner {
  display: inline-block;
  border: 3px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.button-spinner {
  width: 17px;
  height: 17px;
}

.state-card {
  display: grid;
  min-height: 380px;
  place-items: center;
  align-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

.state-card h1,
.state-card p {
  margin: 0;
}

.state-card p,
.empty-state p {
  color: var(--muted-text);
}

.loading-image {
  display: block;
  max-width: min(100%, 220px);
  height: auto;
  object-fit: contain;
}

.loading-spinner {
  width: 64px;
  height: 64px;
  color: var(--accent);
  filter: drop-shadow(0 0 10px var(--accent-glow));
}

.empty-state {
  display: grid;
  min-height: 260px;
  place-items: center;
  align-content: center;
  padding: 2.5rem 1rem;
  text-align: center;
}

.empty-state::before {
  display: grid;
  width: 58px;
  height: 58px;
  margin-bottom: 0.8rem;
  border-radius: 50%;
  place-items: center;
  color: var(--accent-dark);
  background: var(--accent-soft);
  content: '⌕';
  font-size: 1.75rem;
  font-weight: 900;
}

.empty-state h2,
.empty-state p {
  margin: 0;
}

.empty-state p {
  margin-top: 0.5rem;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  border: 0;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1050px) {
  .desktop-users {
    display: none;
  }

  .mobile-users {
    display: block;
  }
}

@media (max-width: 767.98px) {
  .users-page {
    padding: 0.75rem 0;
  }

  .users-container {
    width: min(100% - 1rem, 1380px);
  }

  .users-card,
  .state-card {
    border-radius: 16px;
  }

  .users-card {
    padding-right: 0.8rem;
    padding-left: 0.8rem;
  }

  .page-header {
    margin-right: -0.8rem;
    margin-left: -0.8rem;
  }

  .users-toolbar {
    display: grid;
    align-items: stretch;
  }

  .search-field {
    width: 100%;
  }

  .loading-image {
    width: 160px;
  }
}

@media (max-width: 479.98px) {
  .mobile-card-header {
    flex-direction: column;
  }

  .mobile-details > div {
    grid-template-columns: 1fr;
    gap: 0.15rem;
  }

  .mobile-details dd {
    text-align: left;
  }

  .mobile-card-header > .status-badge {
    align-self: flex-start;
  }

  .header-stats {
    display: grid;
  }

  .stat-chip {
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .users-table tbody tr,
  .action-button,
  .form-control {
    transition: none;
  }

  .action-button:hover:not(:disabled) {
    transform: none;
  }

  .button-spinner,
  .loading-spinner {
    animation-duration: 1.4s;
  }
}
</style>