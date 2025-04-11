import { api } from 'src/boot/axios'

// Importamos las constantes directamente para este servicio
const API_CONSTANTS = {
  V1_ROUTE: '/v1',
  VEHICLES_ROUTE: '/vehicles',
}

export default {
  // Crear un vehículo
  async createVehicle(vehicle) {
    try {
      const response = await api.post(
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.VEHICLES_ROUTE}`,
        vehicle,
      )
      return response.data
    } catch (error) {
      console.error('Error creando vehículo:', error)
      throw error
    }
  },

  // Obtener todos los vehículos
  async getVehicles() {
    try {
      const response = await api.get(`${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.VEHICLES_ROUTE}`)
      console.log('Datos recibidos en el servicio:', response.data)
      return response.data
    } catch (error) {
      console.error('Error obteniendo vehículos:', error)
      throw error
    }
  },

  // Obtener un vehículo por ID
  async getVehicleById(id) {
    try {
      const response = await api.get(
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.VEHICLES_ROUTE}/${id}`,
      )
      return response.data
    } catch (error) {
      console.error(`Error obteniendo vehículo con ID ${id}:`, error)
      throw error
    }
  },

  // Actualizar un vehículo
  async updateVehicle(id, vehicle) {
    try {
      const response = await api.put(
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.VEHICLES_ROUTE}/${id}`,
        vehicle,
      )
      return response.data
    } catch (error) {
      console.error(`Error actualizando vehículo con ID ${id}:`, error)
      throw error
    }
  },

  // Eliminar un vehículo
  async deleteVehicle(id) {
    try {
      const response = await api.delete(
        `${API_CONSTANTS.V1_ROUTE}${API_CONSTANTS.VEHICLES_ROUTE}/${id}`,
      )
      return response.data
    } catch (error) {
      console.error(`Error eliminando vehículo con ID ${id}:`, error)
      throw error
    }
  },
}
