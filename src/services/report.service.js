// src/services/report.service.js
import { api, API_CONSTANTS } from '../boot/axios'

const ALLOWED_FORMATS = ['PDF', 'EXCEL', 'CHART_PNG', 'CHART_SVG']
const ALLOWED_REPORT_TYPES = [
  'RENTAL_SUMMARY',
  'REVENUE_ANALYSIS',
  'VEHICLE_USAGE',
  'CUSTOMER_ACTIVITY',
  'GENERIC_METRICS',
  'RENTAL_TRENDS',
]

async function makeApiRequest(endpoint, params = {}, options = {}) {
  try {
    console.debug(`[API] Calling ${endpoint}`, params)

    const response = await api.get(endpoint, {
      params: { ...params, _t: Date.now() },
      ...options,
    })

    console.debug(`[API] Success ${endpoint}`, response.data)
    return response.data
  } catch (error) {
    console.error(`[API Error] ${endpoint}`, {
      status: error.response?.status,
      data: error.response?.data,
      params,
    })
    throw error
  }
}

export default {
  // Métricas principales
  async getTotalRentalsMetric(params) {
    return makeApiRequest(
      `${API_CONSTANTS.REPORTS_ROUTE}/metrics/total-rentals`,
      this.sanitizeParams(params),
    )
  },

  async getTotalRevenueMetric(params) {
    const result = await makeApiRequest(
      `${API_CONSTANTS.REPORTS_ROUTE}/metrics/total-revenue`,
      this.sanitizeParams(params),
    )
    return parseFloat(result) || 0
  },

  async getUniqueVehiclesRentedMetric(params) {
    return makeApiRequest(
      `${API_CONSTANTS.REPORTS_ROUTE}/metrics/unique-vehicles`,
      this.sanitizeParams(params),
    )
  },

  async getMostRentedVehicleMetric(params) {
    return makeApiRequest(
      `${API_CONSTANTS.REPORTS_ROUTE}/metrics/most-rented-vehicle`,
      this.sanitizeParams(params),
    )
  },

  async getNewCustomersCountMetric(params) {
    return makeApiRequest(
      `${API_CONSTANTS.REPORTS_ROUTE}/metrics/new-customers`,
      this.sanitizeParams(params),
    )
  },

  async getRentalTrendsMetric(params) {
    const data = await makeApiRequest(
      `${API_CONSTANTS.REPORTS_ROUTE}/metrics/rental-trends`,
      this.sanitizeParams(params, true),
    )
    return Array.isArray(data) ? data : []
  },

  // Exportación de reportes
  async exportReport(params) {
    const validatedParams = this.validateExportParams(params)
    try {
      console.log('[API Request - exportReport] Params:', validatedParams) // Log de los parámetros enviados
      const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/export`, {
        params: validatedParams,
        responseType: this.getResponseType(validatedParams.format),
      })
      console.log('[API Response - exportReport] Status:', response.status) // Log del código de estado de la respuesta
      console.log('[API Response - exportReport] Headers:', response.headers) // Log de los headers de la respuesta
      console.log('[API Response - exportReport] Data (Blob):', response.data) // Log del objeto Blob recibido
      this.validateBlob(response.data, validatedParams.format) // Validación del Blob
      return response.data
    } catch (error) {
      console.error('[API Error - exportReport]', error) // Log del error completo
      throw error
    }
  },

  // Métodos auxiliares
  sanitizeParams(params, includePeriod = false) {
    // Validación de fechas
    let startDate = this.formatDate(params.startDate)
    let endDate = this.formatDate(params.endDate)

    // Asegurar startDate <= endDate
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start > end) [startDate, endDate] = [endDate, startDate]
    }

    const sanitized = {
      startDate,
      endDate,
      period: includePeriod ? params.period || 'MONTHLY' : undefined,
      chartType: ['CHART_PNG', 'CHART_SVG'].includes(params.format)
        ? params.chartType || 'bar'
        : undefined,
    }

    // Eliminar valores undefined/null
    return Object.fromEntries(
      Object.entries(sanitized).filter(([, v]) => v !== undefined && v !== null),
    )
  },

  validateExportParams(params) {
    if (!ALLOWED_FORMATS.includes(params.format)) {
      throw new Error(`Formato no soportado: ${params.format}`)
    }

    if (!ALLOWED_REPORT_TYPES.includes(params.reportType)) {
      throw new Error(`Tipo de reporte inválido: ${params.reportType}`)
    }

    return {
      format: params.format,
      reportType: params.reportType,
      ...this.sanitizeParams(params, true),
    }
  },

  getResponseType(format) {
    return ['PDF', 'EXCEL', 'CHART_PNG', 'CHART_SVG'].includes(format) ? 'blob' : 'json'
  },

  formatDate(date) {
    if (!date) return null
    const d = new Date(date)
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0]
  },

  // Método adicional para validar blobs
  validateBlob(blobData, format) {
    if (!(blobData instanceof Blob)) {
      throw new Error('Respuesta no es un archivo válido')
    }

    if (blobData.size === 0) {
      throw new Error('El archivo recibido está vacío')
    }

    const expectedTypes = {
      PDF: 'application/pdf',
      EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      CHART_PNG: 'image/png',
      CHART_SVG: 'image/svg+xml',
    }

    if (blobData.type !== expectedTypes[format]) {
      console.warn(`Tipo MIME inesperado: ${blobData.type} para formato ${format}`)
    }
  },
}
