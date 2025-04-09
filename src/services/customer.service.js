// src/services/customer.service.js
import { api, API_CONSTANTS } from 'src/boot/axios'

export default {
  // Crear un cliente
  async createCustomer(customer) {
    try {
      const response = await api.post(
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.CUSTOMERS_ROUTE}`,
        customer,
      )
      return response.data // Retorna la respuesta procesada
    } catch (error) {
      console.error('Error creando cliente:', error) // Log para depuración
      throw error // Lanza el error para manejo en el componente
    }
  },

  // Obtener todos los clientes
  async getCustomers() {
    try {
      const response = await api.get(`${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.CUSTOMERS_ROUTE}`)
      return response.data // Retorna la lista de clientes
    } catch (error) {
      console.error('Error obteniendo clientes:', error)
      throw error
    }
  },

  // Obtener un cliente por ID
  async getCustomerById(id) {
    try {
      const response = await api.get(
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.CUSTOMERS_ROUTE}/${id}`,
      )
      return response.data
    } catch (error) {
      console.error(`Error obteniendo cliente con ID ${id}:`, error)
      throw error
    }
  },

  // Actualizar un cliente
  async updateCustomer(id, customer) {
    try {
      const response = await api.put(
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.CUSTOMERS_ROUTE}/${id}`,
        customer,
      )
      return response.data
    } catch (error) {
      console.error(`Error actualizando cliente con ID ${id}:`, error)
      throw error
    }
  },

  // Eliminar un cliente
  async deleteCustomer(id) {
    try {
      const response = await api.delete(
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.CUSTOMERS_ROUTE}/${id}`,
      )
      return response.data
    } catch (error) {
      console.error(`Error eliminando cliente con ID ${id}:`, error)
      throw error
    }
  },
}
