import { api, API_CONSTANTS } from '../boot/axios'

const ALLOWED_FORMATS = ['PDF', 'EXCEL', 'CHART_PNG', 'CHART_SVG']
const ALLOWED_REPORT_TYPES = [
  'RENTAL_SUMMARY',
  'REVENUE_ANALYSIS',
  'VEHICLE_USAGE',
  'CUSTOMER_ACTIVITY',
  'GENERIC_METRICS',
  'RENTAL_TRENDS',
  'REVENUE_BY_PRICING_TIER',
  'RENTALS_BY_VEHICLE_TYPE',
]
const DEFAULT_PERIOD = 'ALL_TIME'
const CACHE_TTL = 300000 // 5 min

const responseCache = new Map()

export default {
  async getDashboardData(params = {}) {
    const cacheKey = `dashboard-${JSON.stringify(params)}`
    if (responseCache.has(cacheKey)) {
      const { timestamp, data } = responseCache.get(cacheKey)
      if (Date.now() - timestamp < CACHE_TTL) return data
    }

    try {
      const validatedParams = this.sanitizeParams(params, true)
      console.debug('[Dashboard] Fetching data with params:', validatedParams)
      const response = await api.get(API_CONSTANTS.REPORTS_ROUTE, {
        params: { ...validatedParams, _: Date.now() },
      })
      const responseData = response.data
      responseCache.set(cacheKey, { timestamp: Date.now(), data: responseData })
      return responseData
    } catch (error) {
      console.error('[Dashboard Service Error]', {
        message: error.message,
        status: error.response?.status,
        params,
      })

      if (error.response) {
        const status = error.response.status
        const message = `Error ${status} en el servidor. No se pudieron obtener los datos del dashboard.`
        throw new Error(message)
      }

      // Para errores de red u otros problemas
      throw new Error('Error de red al cargar datos del dashboard.')
    }
  },

  async exportReport(params) {
    const validatedParams = this.validateExportParams(params)
    try {
      console.debug('[Export] Generating report:', validatedParams)
      const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/export`, {
        params: validatedParams,
        responseType: this.getResponseType(validatedParams.format),
      })
      this.validateBlob(response.data)
      return response.data
    } catch (error) {
      console.error('[Export Error]', {
        error: error.response?.data || error.message,
        params: validatedParams,
      })
      throw new Error(this.getExportErrorMessage(error))
    }
  },

  sanitizeParams(params, includePeriod = false) {
    let startDate = this.formatDate(params.startDate)
    let endDate = this.formatDate(params.endDate)

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      ;[startDate, endDate] = [endDate, startDate]
    }

    const sanitized = { startDate, endDate }
    if (includePeriod) sanitized.period = params.period || DEFAULT_PERIOD
    if (['CHART_PNG', 'CHART_SVG'].includes(params.format)) {
      sanitized.chartType = params.chartType || 'bar'
    }
    return sanitized
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

  validateBlob(blobData) {
    if (!(blobData instanceof Blob)) throw new Error('Respuesta no es un archivo válido')
    if (blobData.size === 0) throw new Error('El archivo recibido está vacío')
  },

  getExportErrorMessage(error) {
    if (error.response) {
      switch (error.response.status) {
        case 400:
          return 'Parámetros de reporte inválidos'
        case 500:
          return 'Error al generar el reporte en el servidor'
        default:
          return `Error ${error.response.status} al descargar el reporte`
      }
    }
    return error.message || 'Error desconocido al descargar el reporte'
  },
}
