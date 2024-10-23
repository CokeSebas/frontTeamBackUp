// services/authService.js
import { reactive } from 'vue'

class AuthService {
  // Hacer que el estado sea reactivo
  state = reactive({
    isAuthenticated: !!localStorage.getItem('token')
  })

  login(token) {
    // Guardar el token en localStorage
    localStorage.setItem('token', token)
    this.state.isAuthenticated = true  // Actualizar el estado reactivo
  }

  logout() {
    // Eliminar el token de localStorage
    localStorage.removeItem('token')
    this.state.isAuthenticated = false  // Actualizar el estado reactivo
  }

  getAuthStatus() {
    return this.state
  }
}

export default new AuthService()
