<template>
  <main
    class="edit-profile-page"
    :class="{ 'theme-dark': isDark }"
  >
    <div class="profile-container">
      <section
        v-if="loading"
        class="state-card loading-state"
        aria-label="Cargando perfil"
        aria-live="polite"
        aria-busy="true"
      >
        <img
          v-if="gifLoading"
          :src="gifLoading"
          class="loading-image"
          alt="Cargando perfil"
        >
        <span
          v-else
          class="loading-spinner"
          aria-hidden="true"
        />
      </section>

      <section
        v-else-if="loadError"
        class="state-card error-state"
        role="alert"
      >
        <h1>{{ $t('responseApisSeccion.oops') }}</h1>
        <p>{{ loadError }}</p>

        <div class="state-actions">
          <button
            v-if="hasValidSession"
            type="button"
            class="action-button button-primary"
            @click="loadProfile"
          >
            Reintentar
          </button>

          <button
            v-else
            type="button"
            class="action-button button-primary"
            @click="goToLogin"
          >
            Iniciar sesión
          </button>
        </div>
      </section>

      <div
        v-else-if="user"
        class="profile-layout"
      >
        <section class="profile-card">
          <header class="page-header">
            <span class="header-kicker">
              <span class="header-kicker-dot" aria-hidden="true" />
              Perfil de usuario
            </span>

            <h1>{{ $t('profileSeccion.title') }}</h1>

            <p class="page-description">
              Actualiza tus datos personales, administra tu contraseña
              y accede rápidamente a las funciones de tu cuenta.
            </p>

            <div class="header-stats">
              <span class="stat-chip">
                <strong>{{ displayName }}</strong>
              </span>

              <span
                v-if="isOrganizer"
                class="stat-chip"
              >
                Organizador
              </span>

              <span
                v-if="isAdmin"
                class="stat-chip"
              >
                Administrador
              </span>
            </div>
          </header>

          <div class="profile-content">
            <div class="avatar-section">
              <img
                v-if="avatarPreview && !avatarLoadError"
                :src="avatarPreview"
                :alt="`Avatar de ${displayName}`"
                class="avatar-image"
                width="160"
                height="160"
                @error="avatarLoadError = true"
              >

              <div
                v-else
                class="avatar-placeholder"
                aria-hidden="true"
              >
                {{ avatarInitials }}
              </div>

              <div class="role-badges">
                <span
                  v-if="isOrganizer"
                  class="role-badge organizer-badge"
                >
                  Organizer
                </span>

                <span
                  v-if="isAdmin"
                  class="role-badge admin-badge"
                >
                  Admin
                </span>
              </div>
            </div>

            <div class="profile-information">
              <form
                v-if="isEditing"
                class="edit-form"
                novalidate
                :aria-busy="isSavingProfile"
                @submit.prevent="saveChanges"
              >
                <div class="form-grid">
                  <div class="field-group">
                    <label for="profile-name">
                      {{ $t('profileSeccion.name') }}
                    </label>

                    <input
                      id="profile-name"
                      v-model="editedUser.name"
                      class="form-control"
                      :class="{
                        'is-invalid':
                          profileTouched.name &&
                          profileValidation.name
                      }"
                      type="text"
                      autocomplete="given-name"
                      maxlength="80"
                      :disabled="isSavingProfile"
                      @blur="profileTouched.name = true"
                      @input="clearProfileError"
                    >

                    <p
                      v-if="
                        profileTouched.name &&
                        profileValidation.name
                      "
                      class="field-error"
                    >
                      {{ profileValidation.name }}
                    </p>
                  </div>

                  <div class="field-group">
                    <label for="profile-last-name">
                      {{ $t('profileSeccion.lastName') }}
                    </label>

                    <input
                      id="profile-last-name"
                      v-model="editedUser.lastName"
                      class="form-control"
                      :class="{
                        'is-invalid':
                          profileTouched.lastName &&
                          profileValidation.lastName
                      }"
                      type="text"
                      autocomplete="family-name"
                      maxlength="100"
                      :disabled="isSavingProfile"
                      @blur="profileTouched.lastName = true"
                      @input="clearProfileError"
                    >

                    <p
                      v-if="
                        profileTouched.lastName &&
                        profileValidation.lastName
                      "
                      class="field-error"
                    >
                      {{ profileValidation.lastName }}
                    </p>
                  </div>

                  <div class="field-group full-width">
                    <label for="profile-nickname">
                      {{ $t('profileSeccion.nickName') }}
                    </label>

                    <input
                      id="profile-nickname"
                      v-model="editedUser.nickName"
                      class="form-control"
                      :class="{
                        'is-invalid':
                          profileTouched.nickName &&
                          profileValidation.nickName
                      }"
                      type="text"
                      autocomplete="nickname"
                      maxlength="50"
                      :disabled="isSavingProfile"
                      @blur="profileTouched.nickName = true"
                      @input="clearProfileError"
                    >

                    <p
                      v-if="
                        profileTouched.nickName &&
                        profileValidation.nickName
                      "
                      class="field-error"
                    >
                      {{ profileValidation.nickName }}
                    </p>
                  </div>

                  <div class="field-group full-width">
                    <label for="profile-avatar-url">
                      {{ $t('profileSeccion.avatarUrl') }}
                    </label>

                    <input
                      id="profile-avatar-url"
                      v-model="editedUser.avatarUrl"
                      class="form-control"
                      :class="{
                        'is-invalid':
                          profileTouched.avatarUrl &&
                          profileValidation.avatarUrl
                      }"
                      type="url"
                      inputmode="url"
                      autocomplete="url"
                      maxlength="500"
                      :disabled="isSavingProfile"
                      @blur="profileTouched.avatarUrl = true"
                      @input="handleAvatarInput"
                    >

                    <p
                      v-if="
                        profileTouched.avatarUrl &&
                        profileValidation.avatarUrl
                      "
                      class="field-error"
                    >
                      {{ profileValidation.avatarUrl }}
                    </p>
                  </div>
                </div>

                <p
                  v-if="profileFormError"
                  class="form-error"
                  role="alert"
                  aria-live="assertive"
                >
                  {{ profileFormError }}
                </p>

                <div class="form-actions">
                  <button
                    type="submit"
                    class="action-button button-success"
                    :disabled="isSavingProfile"
                  >
                    <span
                      v-if="isSavingProfile"
                      class="button-spinner"
                      aria-hidden="true"
                    />
                    {{
                      isSavingProfile
                        ? 'Guardando...'
                        : $t('buttons.saveChanges')
                    }}
                  </button>

                  <button
                    type="button"
                    class="action-button button-secondary"
                    :disabled="isSavingProfile"
                    @click="cancelEdit"
                  >
                    {{ $t('buttons.cancel') }}
                  </button>
                </div>
              </form>

              <dl
                v-else
                class="profile-list"
              >
                <div class="profile-row">
                  <dt>{{ $t('profileSeccion.name') }}</dt>
                  <dd>{{ user.name || '-' }}</dd>
                </div>

                <div class="profile-row">
                  <dt>{{ $t('profileSeccion.lastName') }}</dt>
                  <dd>{{ user.lastName || '-' }}</dd>
                </div>

                <div class="profile-row">
                  <dt>{{ $t('profileSeccion.nickName') }}</dt>
                  <dd class="nickname">
                    {{ user.nickName || '-' }}
                  </dd>
                </div>

                <div
                  v-if="user.email"
                  class="profile-row"
                >
                  <dt>{{ $t('profileSeccion.email') }}</dt>
                  <dd>{{ user.email }}</dd>
                </div>
              </dl>
            </div>
          </div>

          <form
            v-if="showChangePasswordForm"
            class="password-form"
            novalidate
            :aria-busy="isChangingPassword"
            @submit.prevent="changePassword"
          >
            <header class="password-header">
              <h2>{{ $t('profileSeccion.changePassword') }}</h2>
            </header>

            <div class="password-grid">
              <div class="field-group">
                <label for="current-password">
                  {{ $t('profileSeccion.currentPassword') }}
                </label>

                <input
                  id="current-password"
                  v-model="currentPassword"
                  class="form-control"
                  type="password"
                  autocomplete="current-password"
                  :disabled="isChangingPassword"
                  @input="passwordFormError = ''"
                >
              </div>

              <div class="field-group">
                <label for="new-password">
                  {{ $t('profileSeccion.newPassword') }}
                </label>

                <input
                  id="new-password"
                  v-model="newPassword"
                  class="form-control"
                  type="password"
                  autocomplete="new-password"
                  :disabled="isChangingPassword"
                  @input="passwordFormError = ''"
                >
              </div>

              <div class="field-group">
                <label for="confirm-password">
                  {{ $t('profileSeccion.confirmPassword') }}
                </label>

                <input
                  id="confirm-password"
                  v-model="confirmPassword"
                  class="form-control"
                  type="password"
                  autocomplete="new-password"
                  :disabled="isChangingPassword"
                  @input="passwordFormError = ''"
                >
              </div>
            </div>

            <p
              v-if="passwordFormError"
              class="form-error"
              role="alert"
              aria-live="assertive"
            >
              {{ passwordFormError }}
            </p>

            <div class="form-actions">
              <button
                type="submit"
                class="action-button button-success"
                :disabled="isChangingPassword"
              >
                <span
                  v-if="isChangingPassword"
                  class="button-spinner"
                  aria-hidden="true"
                />
                {{
                  isChangingPassword
                    ? 'Actualizando...'
                    : $t('buttons.changePassword')
                }}
              </button>

              <button
                type="button"
                class="action-button button-secondary"
                :disabled="isChangingPassword"
                @click="cancelChangePassword"
              >
                {{ $t('buttons.cancel') }}
              </button>
            </div>
          </form>
        </section>

        <aside class="actions-card">
          <span class="section-kicker">Accesos rápidos</span>
          <h2>{{ $t('profileSeccion.actions') }}</h2>
          <p class="actions-description">
            Gestiona tus equipos, Pokémon, estadísticas y opciones de cuenta.
          </p>

          <div class="actions-list">
            <button
              type="button"
              class="action-button button-success"
              @click="goToTeams"
            >
              {{ $t('buttons.goToMyTeams') }}
            </button>

            <button
              type="button"
              class="action-button button-success"
              @click="goToPokemons"
            >
              {{ $t('buttons.goToMyPokemons') }}
            </button>

            <button
              type="button"
              class="action-button button-success"
              @click="goToMyStats"
            >
              {{ $t('buttons.goToMyStats') }}
            </button>

            <button
              v-if="isOrganizer"
              type="button"
              class="action-button button-success"
              @click="goToOrgTorneo"
            >
              {{ $t('buttons.organizar') }}
            </button>

            <button
              v-if="isAdmin"
              type="button"
              class="action-button button-success"
              @click="goToListUsers"
            >
              {{ $t('buttons.goToListUsers') }}
            </button>

            <button
              type="button"
              class="action-button button-secondary"
              :disabled="
                isEditing ||
                showChangePasswordForm ||
                isSavingProfile ||
                isChangingPassword
              "
              @click="enableEdit"
            >
              {{ $t('buttons.editProfile') }}
            </button>

            <button
              type="button"
              class="action-button button-secondary"
              :disabled="
                isEditing ||
                showChangePasswordForm ||
                isSavingProfile ||
                isChangingPassword
              "
              @click="openPasswordForm"
            >
              {{ $t('buttons.changePassword') }}
            </button>
          </div>
        </aside>
      </div>
    </div>
  </main>
</template>

<script setup>
import {
  computed,
  inject,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  unref
} from 'vue';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'vue-router';
import Swal from 'sweetalert2';
import { useI18n } from 'vue-i18n';

const apiUrl = inject('apiUrl', '');
const gifLoading = inject('gifLoading', null);
const mode = inject('mode', 'light');

const router = useRouter();
const { t } = useI18n();

const user = ref(null);
const editedUser = ref(null);

const loading = ref(true);
const loadError = ref('');
const isEditing = ref(false);
const isSavingProfile = ref(false);
const isChangingPassword = ref(false);
const showChangePasswordForm = ref(false);

const profileFormError = ref('');
const passwordFormError = ref('');
const avatarLoadError = ref(false);

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');

const profileTouched = reactive({
  name: false,
  lastName: false,
  nickName: false,
  avatarUrl: false
});

let loadController = null;
let profileController = null;
let passwordController = null;
let themeObserver = null;

const globalDarkMode = ref(false);

const detectGlobalDarkMode = () => {
  if (typeof document === 'undefined') {
    return false;
  }

  const elements = [
    document.documentElement,
    document.body
  ].filter(Boolean);

  return elements.some((element) => {
    const classes = element.classList;
    const dataTheme = element.getAttribute('data-theme');
    const bootstrapTheme =
      element.getAttribute('data-bs-theme');

    return (
      classes.contains('dark') ||
      classes.contains('dark-mode') ||
      classes.contains('theme-dark') ||
      classes.contains('is-dark') ||
      dataTheme === 'dark' ||
      bootstrapTheme === 'dark'
    );
  });
};

const syncGlobalTheme = () => {
  globalDarkMode.value = detectGlobalDarkMode();
};

const isDark = computed(() => {
  const injectedMode = String(unref(mode) || '')
    .trim()
    .toLowerCase();

  return injectedMode === 'dark' || globalDarkMode.value;
});

const getToken = () => localStorage.getItem('token');

const getAuthenticatedUserId = () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const decodedToken = jwtDecode(token);
    return decodedToken?.userId ?? decodedToken?.id ?? null;
  } catch (error) {
    console.error('Token inválido:', error);
    return null;
  }
};

const userId = computed(() => getAuthenticatedUserId());
const hasValidSession = computed(() => userId.value != null);

const normalizeBoolean = (value) =>
  value === true ||
  value === 1 ||
  value === '1' ||
  value === 'true';

const normalizeUser = (data) => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  return {
    ...data,
    name: String(data.name || ''),
    lastName: String(data.lastName || ''),
    nickName: String(data.nickName || ''),
    email: String(data.email || ''),
    avatarUrl: String(data.avatarUrl || ''),
    isAdmin: normalizeBoolean(data.isAdmin),
    isOrganizer: normalizeBoolean(data.isOrganizer)
  };
};

const extractUserFromResponse = (data) => {
  if (Array.isArray(data)) {
    const firstItem = data[0];

    if (firstItem?.data && typeof firstItem.data === 'object') {
      return firstItem.data;
    }

    return firstItem || null;
  }

  if (Array.isArray(data?.data)) {
    return data.data[0] || null;
  }

  if (data?.data && typeof data.data === 'object') {
    return data.data;
  }

  return data && typeof data === 'object' ? data : null;
};

const buildApiUrl = (path) => {
  const baseUrl = String(unref(apiUrl) || '').replace(/\/+$/, '');
  const cleanPath = String(path || '').replace(/^\/+/, '');

  return `${baseUrl}/${cleanPath}`;
};

const getAuthHeaders = () => {
  const token = getToken();

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
};

const updateSessionRoles = (profile) => {
  sessionStorage.setItem(
    'isAdmin',
    String(profile?.isAdmin === true)
  );
  sessionStorage.setItem(
    'isOrganizer',
    String(profile?.isOrganizer === true)
  );
};

const isAdmin = computed(() => user.value?.isAdmin === true);
const isOrganizer = computed(
  () => user.value?.isOrganizer === true
);

const displayName = computed(() =>
  [user.value?.name, user.value?.lastName]
    .map((value) => String(value || '').trim())
    .filter(Boolean)
    .join(' ') || 'Usuario'
);

const avatarInitials = computed(() => {
  const initials = [
    user.value?.name,
    user.value?.lastName
  ]
    .map((value) => String(value || '').trim().charAt(0))
    .filter(Boolean)
    .join('')
    .toUpperCase();

  return initials || 'U';
});

const avatarPreview = computed(() => {
  const value = isEditing.value
    ? editedUser.value?.avatarUrl
    : user.value?.avatarUrl;

  return String(value || '').trim();
});

const profileValidation = computed(() => {
  const profile = editedUser.value || {};

  const avatarUrl = String(profile.avatarUrl || '').trim();
  let avatarUrlError = '';

  if (avatarUrl) {
    try {
      const parsedUrl = new URL(avatarUrl);

      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        avatarUrlError =
          'La URL del avatar debe comenzar con http:// o https://.';
      }
    } catch {
      avatarUrlError = 'Ingresa una URL de avatar válida.';
    }
  }

  return {
    name:
      String(profile.name || '').trim().length < 2
        ? 'Ingresa un nombre de al menos 2 caracteres.'
        : '',
    lastName:
      String(profile.lastName || '').trim().length < 2
        ? 'Ingresa un apellido de al menos 2 caracteres.'
        : '',
    nickName:
      !String(profile.nickName || '').trim()
        ? 'Ingresa un nickname.'
        : '',
    avatarUrl: avatarUrlError
  };
});

const hasProfileValidationErrors = computed(() =>
  Object.values(profileValidation.value).some(Boolean)
);

const isCanceledRequest = (error) =>
  error?.name === 'CanceledError' ||
  error?.code === 'ERR_CANCELED';

const loadProfile = async () => {
  const currentUserId = userId.value;

  if (currentUserId == null) {
    loading.value = false;
    user.value = null;
    loadError.value =
      'Tu sesión no es válida. Inicia sesión nuevamente.';
    return;
  }

  loading.value = true;
  loadError.value = '';

  loadController?.abort();

  const controller = new AbortController();
  loadController = controller;

  try {
    const response = await axios.get(
      buildApiUrl(`users/${currentUserId}`),
      {
        headers: getAuthHeaders(),
        signal: controller.signal
      }
    );

    const normalizedUser = normalizeUser(
      extractUserFromResponse(response?.data)
    );

    if (!normalizedUser) {
      throw new Error('INVALID_PROFILE_RESPONSE');
    }

    user.value = normalizedUser;
    editedUser.value = { ...normalizedUser };
    avatarLoadError.value = false;
    updateSessionRoles(normalizedUser);
  } catch (error) {
    if (isCanceledRequest(error)) {
      return;
    }

    console.error('Error al cargar el perfil:', error);
    user.value = null;
    loadError.value =
      error?.response?.data?.message ||
      t('responseApisSeccion.loadingDataError');
  } finally {
    if (loadController === controller) {
      loading.value = false;
      loadController = null;
    }
  }
};

const resetProfileTouched = () => {
  profileTouched.name = false;
  profileTouched.lastName = false;
  profileTouched.nickName = false;
  profileTouched.avatarUrl = false;
};

const enableEdit = () => {
  editedUser.value = { ...user.value };
  resetProfileTouched();
  profileFormError.value = '';
  avatarLoadError.value = false;
  showChangePasswordForm.value = false;
  isEditing.value = true;
};

const cancelEdit = () => {
  editedUser.value = { ...user.value };
  resetProfileTouched();
  profileFormError.value = '';
  avatarLoadError.value = false;
  isEditing.value = false;
};

const clearProfileError = () => {
  profileFormError.value = '';
};

const handleAvatarInput = () => {
  avatarLoadError.value = false;
  clearProfileError();
};

const touchProfileFields = () => {
  profileTouched.name = true;
  profileTouched.lastName = true;
  profileTouched.nickName = true;
  profileTouched.avatarUrl = true;
};

const createProfilePayload = () => ({
  ...editedUser.value,
  name: editedUser.value.name.trim(),
  lastName: editedUser.value.lastName.trim(),
  nickName: editedUser.value.nickName.trim(),
  avatarUrl: editedUser.value.avatarUrl.trim()
});

const responseHasError = (data) =>
  data?.salida?.[0]?.status === 'error' ||
  data?.status === 'error' ||
  data?.success === false;

const saveChanges = async () => {
  if (isSavingProfile.value || !editedUser.value) {
    return;
  }

  touchProfileFields();
  clearProfileError();

  if (hasProfileValidationErrors.value) {
    profileFormError.value =
      'Revisa los campos antes de guardar los cambios.';
    return;
  }

  const currentUserId = userId.value;

  if (currentUserId == null) {
    profileFormError.value =
      'Tu sesión no es válida. Inicia sesión nuevamente.';
    return;
  }

  isSavingProfile.value = true;
  profileController?.abort();

  const controller = new AbortController();
  profileController = controller;

  const payload = createProfilePayload();

  try {
    const response = await axios.post(
      buildApiUrl(`users/edit/${currentUserId}`),
      payload,
      {
        headers: getAuthHeaders(),
        signal: controller.signal
      }
    );

    if (responseHasError(response?.data)) {
      throw new Error('PROFILE_UPDATE_FAILED');
    }

    user.value = normalizeUser(payload);
    editedUser.value = { ...user.value };
    isEditing.value = false;
    avatarLoadError.value = false;
    updateSessionRoles(user.value);

    await Swal.fire({
      icon: 'success',
      title: t('responseApisSeccion.editProfileTitle'),
      text: t('responseApisSeccion.editProfileSuccess'),
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    });
  } catch (error) {
    if (isCanceledRequest(error)) {
      return;
    }

    console.error('Error al actualizar el perfil:', error);

    profileFormError.value =
      error?.response?.data?.message ||
      t('responseApisSeccion.editProfileError');

    await Swal.fire({
      icon: 'error',
      title: t('responseApisSeccion.editProfileTitle'),
      text: profileFormError.value
    });
  } finally {
    if (profileController === controller) {
      isSavingProfile.value = false;
      profileController = null;
    }
  }
};

const openPasswordForm = () => {
  isEditing.value = false;
  showChangePasswordForm.value = true;
  passwordFormError.value = '';
};

const validatePasswordForm = () => {
  if (
    !currentPassword.value ||
    !newPassword.value ||
    !confirmPassword.value
  ) {
    return 'Completa todos los campos de contraseña.';
  }

  if (newPassword.value !== confirmPassword.value) {
    return t('responseApisSeccion.errorPasswordNotMatch');
  }

  return '';
};

const resetPasswordForm = () => {
  currentPassword.value = '';
  newPassword.value = '';
  confirmPassword.value = '';
  passwordFormError.value = '';
};

const cancelChangePassword = () => {
  resetPasswordForm();
  showChangePasswordForm.value = false;
};

const changePassword = async () => {
  if (isChangingPassword.value) {
    return;
  }

  passwordFormError.value = validatePasswordForm();

  if (passwordFormError.value) {
    return;
  }

  const currentUserId = userId.value;

  if (currentUserId == null) {
    passwordFormError.value =
      'Tu sesión no es válida. Inicia sesión nuevamente.';
    return;
  }

  isChangingPassword.value = true;
  passwordController?.abort();

  const controller = new AbortController();
  passwordController = controller;

  try {
    const response = await axios.post(
      buildApiUrl(`users/edit/password/${currentUserId}`),
      {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value
      },
      {
        headers: getAuthHeaders(),
        signal: controller.signal
      }
    );

    if (responseHasError(response?.data)) {
      throw new Error('PASSWORD_UPDATE_FAILED');
    }

    await Swal.fire({
      icon: 'success',
      title: t('responseApisSeccion.exito'),
      text: t('responseApisSeccion.passwordChanged'),
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true
    });

    resetPasswordForm();
    showChangePasswordForm.value = false;
  } catch (error) {
    if (isCanceledRequest(error)) {
      return;
    }

    console.error('Error al cambiar la contraseña:', error);

    passwordFormError.value =
      error?.response?.data?.message ||
      t('responseApisSeccion.errorPasswordChanged');

    await Swal.fire({
      icon: 'error',
      title: t('responseApisSeccion.error'),
      text: passwordFormError.value
    });
  } finally {
    if (passwordController === controller) {
      isChangingPassword.value = false;
      passwordController = null;
    }
  }
};

const navigateWithUserId = (path) => {
  if (userId.value != null) {
    router.push(`${path}/${userId.value}`);
  }
};

const goToTeams = () =>
  navigateWithUserId('/vgc/my-teams');

const goToPokemons = () =>
  navigateWithUserId('/vgc/my-pokemons');

const goToOrgTorneo = () =>
  navigateWithUserId('/tournament/add-tournament');

const goToMyStats = () =>
  navigateWithUserId('/vgc/match-record/tournament');

const goToListUsers = () => router.push('/list-users');

const goToLogin = () => router.replace('/login');

onMounted(() => {
  syncGlobalTheme();

  if (
    typeof MutationObserver !== 'undefined' &&
    typeof document !== 'undefined'
  ) {
    themeObserver = new MutationObserver(syncGlobalTheme);

    [document.documentElement, document.body]
      .filter(Boolean)
      .forEach((element) => {
        themeObserver.observe(element, {
          attributes: true,
          attributeFilter: [
            'class',
            'data-theme',
            'data-bs-theme'
          ]
        });
      });
  }

  loadProfile();
});

onBeforeUnmount(() => {
  loadController?.abort();
  profileController?.abort();
  passwordController?.abort();
  themeObserver?.disconnect();
});
</script>

<style scoped>
.edit-profile-page {
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

.edit-profile-page.theme-dark {
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

.edit-profile-page,
.edit-profile-page * {
  box-sizing: border-box;
}

.profile-container {
  width: min(100% - 2rem, 1240px);
  margin: 0 auto;
}

.profile-layout {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(270px, 0.8fr);
  gap: 1.5rem;
  align-items: start;
}

.profile-card,
.actions-card,
.state-card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--card-border);
  border-radius: 22px;
  background: var(--card-bg);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(12px);
}

.profile-card {
  padding: 0 clamp(1rem, 3vw, 2rem) clamp(1.25rem, 3vw, 2rem);
}

.actions-card {
  position: sticky;
  top: 1.5rem;
  padding: 1.5rem;
}

.page-header {
  position: relative;
  margin: 0 clamp(-2rem, -3vw, -1rem) 2rem;
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
  max-width: 680px;
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
  padding: 0.42rem 0.72rem;
  border: 1px solid rgba(43, 34, 8, 0.2);
  background: rgba(255, 255, 255, 0.2);
  font-size: 0.86rem;
}

.profile-content {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  gap: clamp(1.25rem, 3vw, 2rem);
  align-items: start;
}

.avatar-section {
  min-width: 0;
  text-align: center;
}

.avatar-image,
.avatar-placeholder {
  width: 164px;
  height: 164px;
  margin: 0 auto;
  border: 5px solid var(--card-bg);
  border-radius: 50%;
  box-shadow:
    0 10px 28px rgba(0, 0, 0, 0.15),
    0 0 0 3px var(--accent-border);
}

.avatar-image {
  display: block;
  background: var(--soft-bg);
  object-fit: cover;
}

.avatar-placeholder {
  display: grid;
  place-items: center;
  background:
    linear-gradient(
      135deg,
      var(--accent-dark),
      var(--accent)
    );
  color: var(--accent-text);
  font-size: 2.8rem;
  font-weight: 900;
  letter-spacing: 0.05em;
}

.role-badges {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  justify-content: center;
  margin-top: 0.95rem;
}

.role-badge {
  display: inline-flex;
  min-height: 29px;
  align-items: center;
  padding: 0.3rem 0.68rem;
  border-radius: 999px;
  color: #ffffff;
  font-size: 0.78rem;
  font-weight: 850;
}

.organizer-badge {
  background: #8a7214;
}

.admin-badge {
  background: #b44337;
}

.profile-information {
  min-width: 0;
}

.profile-list {
  margin: 0;
  padding: 0.2rem 0;
}

.profile-row {
  display: grid;
  grid-template-columns: minmax(120px, 0.7fr) minmax(0, 1.3fr);
  gap: 1rem;
  padding: 0.95rem 0;
  border-bottom: 1px solid var(--card-border);
}

.profile-row:last-child {
  border-bottom: 0;
}

.profile-row dt {
  color: var(--muted-text);
  font-weight: 800;
}

.profile-row dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  text-align: right;
}

.nickname {
  color: var(--accent-strong);
  font-style: italic;
  font-weight: 800;
}

.form-grid,
.password-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.password-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.field-group {
  min-width: 0;
}

.full-width {
  grid-column: 1 / -1;
}

.field-group label {
  display: block;
  margin-bottom: 0.42rem;
  font-weight: 800;
  line-height: 1.3;
}

.form-control {
  display: block;
  width: 100%;
  min-width: 0;
  min-height: 46px;
  padding: 0.72rem 0.88rem;
  border: 1px solid var(--input-border);
  border-radius: 11px;
  outline: none;
  background: var(--input-bg);
  color: var(--input-text);
  font: inherit;
  line-height: 1.4;
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    background-color 160ms ease,
    transform 160ms ease;
}

.form-control::placeholder {
  color: var(--muted-text);
  opacity: 0.76;
}

.form-control:focus {
  border-color: var(--accent);
  box-shadow: 0 0 0 0.23rem var(--focus-ring);
}

.form-control.is-invalid {
  border-color: #d94b42;
}

.form-control:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.field-error {
  margin: 0.42rem 0 0;
  color: var(--error-text);
  font-size: 0.88rem;
  line-height: 1.35;
}

.form-error {
  margin: 1.25rem 0 0;
  padding: 0.8rem 0.95rem;
  border: 1px solid rgba(217, 75, 66, 0.42);
  border-radius: 11px;
  background: rgba(217, 75, 66, 0.08);
  color: var(--error-text);
  font-weight: 750;
  text-align: center;
}

.form-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1.3rem;
}

.password-form {
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--accent-border);
  border-radius: 16px;
  background:
    linear-gradient(
      135deg,
      var(--accent-soft),
      transparent 70%
    );
}

.password-header {
  margin-bottom: 1rem;
}

.password-header h2,
.actions-card h2 {
  margin: 0;
  overflow-wrap: anywhere;
  font-size: 1.35rem;
}

.section-kicker {
  margin-bottom: 0.55rem;
  padding: 0.32rem 0.62rem;
  border: 1px solid var(--accent-border);
  background: var(--accent-soft);
  color: var(--accent-dark);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.theme-dark .section-kicker,
.theme-dark .nickname {
  color: var(--accent);
}

.actions-description {
  margin: 0.65rem 0 0;
  color: var(--muted-text);
  line-height: 1.5;
}

.actions-list {
  display: grid;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.action-button {
  display: inline-flex;
  min-height: 44px;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  padding: 0.68rem 1.05rem;
  border: 1px solid transparent;
  border-radius: 11px;
  color: #ffffff;
  font: inherit;
  font-weight: 850;
  line-height: 1.2;
  cursor: pointer;
  transition:
    transform 140ms ease,
    filter 140ms ease,
    box-shadow 140ms ease;
}

.action-button:hover:not(:disabled) {
  filter: brightness(1.04);
  transform: translateY(-2px);
}

.action-button:focus-visible,
.form-control:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 3px;
}

.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.button-primary,
.button-success {
  color: var(--accent-text);
  background:
    linear-gradient(
      135deg,
      var(--accent-dark),
      var(--accent-strong),
      var(--accent)
    );
  box-shadow: 0 10px 22px var(--accent-glow);
}

.button-secondary {
  background: var(--secondary-bg);
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
  width: 18px;
  height: 18px;
}

.state-card {
  display: grid;
  min-height: 420px;
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

.state-actions {
  display: flex;
  justify-content: center;
}

.loading-image {
  display: block;
  /*max-width: min(100%, 240px);*/
  height: auto;
  object-fit: contain;
}

.loading-spinner {
  width: 66px;
  height: 66px;
  color: var(--accent);
  filter: drop-shadow(0 0 10px var(--accent-glow));
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 991.98px) {
  .profile-layout {
    grid-template-columns: 1fr;
  }

  .actions-card {
    position: static;
  }

  .password-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767.98px) {
  .edit-profile-page {
    padding: 0.75rem 0;
  }

  .profile-container {
    width: min(100% - 1rem, 1240px);
  }

  .profile-card,
  .actions-card,
  .state-card {
    border-radius: 16px;
  }

  .profile-card {
    padding-right: 0.8rem;
    padding-left: 0.8rem;
  }

  .page-header {
    margin-right: -0.8rem;
    margin-left: -0.8rem;
  }

  .profile-content {
    grid-template-columns: 1fr;
  }

  .avatar-image,
  .avatar-placeholder {
    width: 142px;
    height: 142px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .full-width {
    grid-column: auto;
  }

  .profile-row {
    grid-template-columns: 1fr;
    gap: 0.22rem;
  }

  .profile-row dd {
    text-align: left;
  }

  .form-actions {
    align-items: stretch;
  }

  .form-actions .action-button {
    width: 100%;
  }
}

@media (max-width: 479.98px) {
  .actions-card {
    padding: 1rem;
  }

  .password-form {
    padding: 1rem;
  }

  .actions-list .action-button {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .form-control,
  .action-button {
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
