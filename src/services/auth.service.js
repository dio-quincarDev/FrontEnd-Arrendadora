// src/services/auth.service.js
import { api, API_CONSTANTS } from 'src/boot/axios'

export default {
  // Inicio de sesión
  async login(credentials) {
    try {
      const response = await api.post(
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.AUTH_ROUTE}${API_CONSTANTS.LOGIN_ROUTE}`,
        credentials,
      )

      // Guardar el token en localStorage
      if (response.data.token) {
        localStorage.setItem('authToken', response.data.token)
      }
      return response.data // Retornar datos procesados
    } catch (error) {
      console.error('Error en el inicio de sesión:', error)
      throw error // Lanzar error para manejo en el componente
    }
  },

  // Registro de usuario
  async register(userData) {
    try {
      const response = await api.post(
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.AUTH_ROUTE}/register`,
        userData,
      )
      return response.data
    } catch (error) {
      console.error('Error en el registro:', error)
      throw error
    }
  },

  // Verificar si el usuario está autenticado
  isAuthenticated() {
    return !!localStorage.getItem('authToken')
  },

  // Obtener token
  getToken() {
    return localStorage.getItem('authToken')
  },

  // Borrar token
  clearToken() {
    localStorage.removeItem('authToken')
  },

  // Cerrar sesión
  logout() {
    try {
      this.clearToken() // Borrar token de sesión
      console.log('Sesión cerrada correctamente')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  },
}
