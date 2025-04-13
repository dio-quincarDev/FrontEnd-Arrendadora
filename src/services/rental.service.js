// src/services/rental.service.js
import { api, API_CONSTANTS } from 'src/boot/axios'

export default {
  // Crear una nueva renta
  async createRental(rental) {
    try {
      const response = await api.post(
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.RENTAL_ROUTE}`,
        rental,
      )
      return response.data
    } catch (error) {
      console.error('Error creando renta:', error)
      throw error
    }
  },

  // Obtener todas las rentas
  async getRentals() {
    try {
      const response = await api.get(`${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.RENTAL_ROUTE}`)
      return response.data
    } catch (error) {
      console.error('Error obteniendo rentas:', error)
      throw error
    }
  },

  // Obtener una renta por ID
  async getRentalById(id) {
    try {
      const response = await api.get(`${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.RENTAL_ROUTE}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Error obteniendo renta con ID ${id}:`, error)
      throw error
    }
  },

  // Actualizar una renta
  async updateRental(id, rental) {
    try {
      const response = await api.put(
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.RENTAL_ROUTE}/${id}`,
        rental,
      )
      return response.data
    } catch (error) {
      console.error(`Error actualizando renta con ID ${id}:`, error)
      throw error
    }
  },

  // Cancelar una renta
  async cancelRental(id) {
    try {
      const response = await api.put(
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.RENTAL_ROUTE}/${id}/cancel`,
      )
      return response.data
    } catch (error) {
      console.error(`Error cancelando renta con ID ${id}:`, error)
      throw error
    }
  },

  // Eliminar una renta
  async deleteRental(id) {
    try {
      const response = await api.delete(
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.RENTAL_ROUTE}/${id}`,
      )
      return response.data
    } catch (error) {
      console.error(`Error eliminando renta con ID ${id}:`, error)
      throw error
    }
  },
}
