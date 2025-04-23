// report.service.js
import { api, API_CONSTANTS } from '../boot/axios'

export default {
  async exportReport(params) {
    try {
      const isBinary = ['PDF', 'EXCEL', 'CHART_PNG', 'CHART_SVG'].includes(params.format)
      const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/export`, {
        params: {
          format: params.format || 'PDF',
          reportType: params.reportType || 'RENTAL_SUMMARY',
          period: params.period || 'MONTHLY',
          startDate: params.startDate,
          endDate: params.endDate,
        },
        responseType: isBinary ? 'blob' : 'json',
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

  async getMetric(endpoint, params = {}) {
    const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/${endpoint}`, {
      params,
    })
    return response.data
  },

  async getRentalTrends(params) {
    const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/metrics/rental-trends`, {
      params,
    })
    return response.data || []
  },
}
