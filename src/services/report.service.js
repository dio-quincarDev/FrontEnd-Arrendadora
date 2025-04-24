// src/services/report.service.js
import { api, API_CONSTANTS } from '../boot/axios'

export default {
  // Métricas principales
  async getTotalRentalsMetric(params = {}) {
    const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/total-rentals`, {
      params: this.sanitizeParams(params),
    })
    return response.data
  },

  async getTableData(params = {}) {
    try {
      const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}`, {
        params: this.sanitizeParams(params),
      })
      return response.data
    } catch (error) {
      console.error('Error obteniendo datos de la tabla:', error)
      throw error
    }
  },

  async getTotalRevenueMetric(params = {}) {
    const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/total-revenue`, {
      params: this.sanitizeParams(params),
    })
    return response.data
  },

  async getUniqueVehiclesRentedMetric(params = {}) {
    const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/unique-vehicles`, {
      params: this.sanitizeParams(params),
    })
    return response.data
  },

  async getMostRentedVehicleMetric(params = {}) {
    const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/most-rented-vehicle`, {
      params: this.sanitizeParams(params),
    })
    return response.data
  },

  async getNewCustomersCountMetric(params = {}) {
    const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/new-customers`, {
      params: this.sanitizeParams(params),
    })
    return response.data
  },

  async getRentalTrendsMetric(params = {}) {
    const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/rental-trends`, {
      params: this.sanitizeParams(params, true), // Incluye period
    })
    return response.data
  },

  async getVehicleUsageMetric(params = {}) {
    const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/vehicle-usage`, {
      params: this.sanitizeParams(params),
    })
    return response.data
  },

  // Exportación de reportes
  async exportReport(params = {}) {
    try {
      const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/export`, {
        params: this.sanitizeParams(params, true),
        responseType: this.getResponseType(params.format),
      })
      return response.data
    } catch (error) {
      console.error('Error exporting report:', error)
      throw error
    }
  },

  async exportGenericTable({ headers, data, format }) {
    try {
      const response = await api.post(
        `${API_CONSTANTS.REPORTS_ROUTE}/export-metrics`,
        { headers, data, format },
        {
          responseType: 'blob',
          headers: { 'Content-Type': 'application/json' },
        },
      )
      return response.data
    } catch (error) {
      console.error('Error exporting table:', error)
      throw error
    }
  },

  // Métodos auxiliares
  sanitizeParams(params, includePeriod = false) {
    const sanitized = {}

    if (params.startDate) sanitized.startDate = params.startDate
    if (params.endDate) sanitized.endDate = params.endDate
    if (includePeriod && params.period) sanitized.period = params.period
    if (params.format) sanitized.format = params.format
    if (params.reportType) sanitized.reportType = params.reportType
    if (params.chartType) sanitized.chartType = params.chartType

    return sanitized
  },

  getResponseType(format) {
    switch (format) {
      case 'PDF':
      case 'EXCEL':
      case 'CHART_PNG':
        return 'blob'
      case 'CHART_SVG':
        return 'text'
      default:
        return 'json'
    }
  },
}
