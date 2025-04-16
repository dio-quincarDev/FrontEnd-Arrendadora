// src/services/report.service.js
import { api, API_CONSTANTS } from '../boot/axios' // Asegúrate de que la ruta sea correcta

export default {
  async exportReport(params) {
    try {
      const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/export`, {
        params: {
          ...params,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error al exportar el reporte:', error)
      throw error
    }
  },

  async getTotalRentals(params) {
    try {
      const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/total-rentals`, {
        params: params,
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener el total de alquileres:', error)
      throw error
    }
  },

  async getTotalRevenue(params) {
    try {
      const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/total-revenue`, {
        params: params,
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener los ingresos totales:', error)
      throw error
    }
  },

  async getUniqueVehiclesRented(params) {
    try {
      const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/unique-vehicles`, {
        params: params,
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener los vehículos únicos alquilados:', error)
      throw error
    }
  },

  async getMostRentedVehicle(params) {
    try {
      const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/most-rented-vehicle`, {
        params: params,
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener el vehículo más alquilado:', error)
      throw error
    }
  },

  async getNewCustomersCount(params) {
    try {
      const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/new-customers`, {
        params: params,
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener el conteo de nuevos clientes:', error)
      throw error
    }
  },

  async getRentalTrends(params) {
    try {
      const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/rental-trends`, {
        params: params,
      })
      return response.data
    } catch (error) {
      console.error('Error al obtener las tendencias de alquileres:', error)
      throw error
    }
  },
}
