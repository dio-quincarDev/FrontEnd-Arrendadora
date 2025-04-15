// src/services/rental.service.js
import { api, API_CONSTANTS } from 'src/boot/axios'

export default {
  // Crear una nueva renta
  createRental(rental) {
    // Elimina el async aquí para devolver la promesa directamente
    try {
      return api.post(
        // Devuelve la promesa
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.RENTAL_ROUTE}`,
        rental,
      )
    } catch (error) {
      console.error('Error creando renta:', error)
      throw error
    }
  },

  // Obtener todas las rentas
  getRentals() {
    // Elimina el async aquí para devolver la promesa directamente
    try {
      return api.get(`${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.RENTAL_ROUTE}`) // Devuelve la promesa
    } catch (error) {
      console.error('Error obteniendo rentas:', error)
      throw error
    }
  },

  // Obtener una renta por ID
  getRentalById(id) {
    // Elimina el async aquí para devolver la promesa directamente
    try {
      return api.get(`${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.RENTAL_ROUTE}/${id}`) // Devuelve la promesa
    } catch (error) {
      console.error(`Error obteniendo renta con ID ${id}:`, error)
      throw error
    }
  },

  // Actualizar una renta
  updateRental(id, rental) {
    // Elimina el async aquí para devolver la promesa directamente
    try {
      return api.put(
        // Devuelve la promesa
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.RENTAL_ROUTE}/${id}`,
        rental,
      )
    } catch (error) {
      console.error(`Error actualizando renta con ID ${id}:`, error)
      throw error
    }
  },

  // Cancelar una renta
  cancelRental(id) {
    // Elimina el async aquí para devolver la promesa directamente
    try {
      return api.put(
        // Devuelve la promesa
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.RENTAL_ROUTE}/${id}/cancel`,
      )
    } catch (error) {
      console.error(`Error cancelando renta con ID ${id}:`, error)
      throw error
    }
  },

  // Eliminar una renta
  deleteRental(id) {
    // Elimina el async aquí para devolver la promesa directamente
    try {
      return api.delete(
        // Devuelve la promesa
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.RENTAL_ROUTE}/${id}`,
      )
    } catch (error) {
      console.error(`Error eliminando renta con ID ${id}:`, error)
      throw error
    }
  },
}
