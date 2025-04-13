// src/boot/axios.js
import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Constantes para rutas de la API
const API_CONSTANTS = {
  BASE_URL: 'http://localhost:8080', // URL base del backend
  V1_ROUTE: '/v1',
  AUTH_ROUTE: '/auth',
  CUSTOMERS_ROUTE: '/customers',
  VEHICLES_ROUTE: '/vehicles',
  REPORTS_ROUTE: '/reports',
  LOGIN_ROUTE: '/login',
  RENTAL_ROUTE: '/rentals',
}

let routerInstance // Instancia del router para manejar redirecciones

// Configuración base de Axios
const api = axios.create({
  baseURL: API_CONSTANTS.BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Función para verificar si el token es válido (puedes adaptarla según tus necesidades)
function isValidToken(token) {
  // Ejemplo: verificar la expiración del token si el backend lo permite
  return !!token // Por ahora, asumimos que cualquier token no nulo es válido
}

// Interceptor para añadir el token JWT a cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token && isValidToken(token)) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Interceptor para manejar errores globales
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handleUnauthorized()
    } else if (error.response?.status === 403) {
      console.error('Acceso denegado: permisos insuficientes.')
    } else if (error.response) {
      console.error(`Error ${error.response.status}: ${error.response.statusText}`)
    } else {
      console.error('Error en la solicitud:', error.message)
    }
    return Promise.reject(error)
  },
)

// Función para manejar redirecciones en caso de error 401
function handleUnauthorized() {
  if (routerInstance) {
    routerInstance.push(`${API_CONSTANTS.AUTH_ROUTE}${API_CONSTANTS.LOGIN_ROUTE}`)
  } else {
    console.error('Router instance not initialized in interceptor.')
    window.location.href = `${API_CONSTANTS.AUTH_ROUTE}${API_CONSTANTS.LOGIN_ROUTE}` // Fallback
  }
}

export default boot(({ app, router }) => {
  app.config.globalProperties.$axios = axios
  app.config.globalProperties.$api = api
  routerInstance = router // Guarda la instancia del router
})

export { api, API_CONSTANTS }
