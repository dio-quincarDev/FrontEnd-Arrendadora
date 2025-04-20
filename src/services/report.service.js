import { api, API_CONSTANTS } from '../boot/axios'

export default {
  async exportReport(params) {
    try {
      const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/export`, {
        params: {
          format: params.format || 'PDF',
          reportType: params.reportType || 'RENTAL_SUMMARY',
          period: params.period || 'MONTHLY',
          startDate: params.startDate,
          endDate: params.endDate,
        },
        responseType: params.format === 'JSON' ? 'json' : 'blob', // Importante para manejar archivos binarios
      })
      return response.data
    } catch (error) {
      console.error('Error al exportar el reporte:', error)
      throw error
    }
  },

  async exportGenericTable({ headers, data, format }) {
    const response = await api.post(
      `${API_CONSTANTS.REPORTS_ROUTE}/export-metrics`,
      { headers, data, format },
      { responseType: 'blob' },
    )
    return response.data
  },

  async getTotalRentals(params) {
    try {
      const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/total-rentals`, {
        params: {
          startDate: params?.startDate,
          endDate: params?.endDate,
        },
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
        params: {
          startDate: params?.startDate,
          endDate: params?.endDate,
        },
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
        params: {
          startDate: params?.startDate,
          endDate: params?.endDate,
        },
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
        params: {
          startDate: params?.startDate,
          endDate: params?.endDate,
        },
      })
      return response.data || {}
    } catch (error) {
      console.error('Error al obtener el vehículo más alquilado:', error)
      return {}
    }
  },

  async getNewCustomersCount(params) {
    try {
      const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/new-customers`, {
        params: {
          startDate: params?.startDate,
          endDate: params?.endDate,
        },
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
        params: {
          period: params?.period,
          startDate: params?.startDate,
          endDate: params?.endDate,
        },
      })
      return response.data || []
    } catch (error) {
      console.error('Error al obtener las tendencias de alquileres:', error)
      return []
    }
  },
}
