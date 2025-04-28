// src/services/report.service.js
import { api, API_CONSTANTS } from '../boot/axios'

/**
 * Función auxiliar para hacer peticiones API con mejor manejo de errores y depuración
 * @param {string} url - URL del endpoint
 * @param {Object} params - Parámetros de la petición
 * @param {Object} options - Opciones adicionales
 * @returns {Promise} - Promesa con la respuesta
 */
async function makeApiRequest(url, params = {}, options = {}) {
  try {
    // Registrar la petición para depuración
    console.log(`[API Request] ${url}`, { params })

    const config = {
      ...options,
      params: params,
    }

    // Agregar timestamp para evitar problemas de caché (304)
    if (!params._t) {
      params._t = Date.now()
    }

    const response = await api.get(url, config)

    // Registrar la respuesta exitosa
    console.log(`[API Response] ${url}`, { status: response.status, data: response.data })
    return response.data
  } catch (error) {
    // Registrar el error con información detallada
    console.error(`[API Error] ${url}`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      params: params,
      message: error.message,
    })

    // Manejar errores específicos
    if (error.response?.status === 304) {
      console.warn('Respuesta de caché (304), intentando forzar nueva petición')
      // Forzar nueva petición invalidando la caché
      params._t = Date.now()
      return makeApiRequest(url, params, options)
    }

    throw error
  }
}

export default {
  // Métricas principales
  async getTotalRentalsMetric(params = {}) {
    return makeApiRequest(
      `${API_CONSTANTS.REPORTS_ROUTE}/metrics/total-rentals`,
      this.sanitizeParams(params),
    )
  },

  async getTableData(params = {}) {
    return makeApiRequest(`${API_CONSTANTS.REPORTS_ROUTE}`, this.sanitizeParams(params))
  },

  async getTotalRevenueMetric(params = {}) {
    return makeApiRequest(
      `${API_CONSTANTS.REPORTS_ROUTE}/metrics/total-revenue`,
      this.sanitizeParams(params),
    )
  },

  async getUniqueVehiclesRentedMetric(params = {}) {
    return makeApiRequest(
      `${API_CONSTANTS.REPORTS_ROUTE}/metrics/unique-vehicles`,
      this.sanitizeParams(params),
    )
  },

  async getMostRentedVehicleMetric(params = {}) {
    return makeApiRequest(
      `${API_CONSTANTS.REPORTS_ROUTE}/metrics/most-rented-vehicle`,
      this.sanitizeParams(params),
    )
  },

  async getNewCustomersCountMetric(params = {}) {
    return makeApiRequest(
      `${API_CONSTANTS.REPORTS_ROUTE}/metrics/new-customers`,
      this.sanitizeParams(params),
    )
  },

  async getRentalTrendsMetric(params = {}) {
    return makeApiRequest(
      `${API_CONSTANTS.REPORTS_ROUTE}/metrics/rental-trends`,
      this.sanitizeParams(params, true),
    ) // Incluye period
  },

  async getVehicleUsageMetric(params = {}) {
    return makeApiRequest(
      `${API_CONSTANTS.REPORTS_ROUTE}/metrics/vehicle-usage`,
      this.sanitizeParams(params),
    )
  },

  // Exportación de reportes
  async exportReport(params = {}) {
    try {
      // Validar parámetros críticos
      if (!params.format || !params.reportType) {
        throw new Error('El formato y el tipo de reporte son requeridos')
      }

      const sanitizedParams = this.sanitizeParams(params, true)
      const responseType = this.getResponseType(params.format)

      console.log(
        `[Export Request] format=${params.format}, reportType=${params.reportType}, responseType=${responseType}`,
        sanitizedParams,
      )

      const response = await api.get(`${API_CONSTANTS.REPORTS_ROUTE}/export`, {
        params: sanitizedParams,
        responseType: responseType,
      })

      return response.data
    } catch (error) {
      console.error('Error exportando reporte:', error)
      throw error
    }
  },

  // Métodos auxiliares mejorados
  sanitizeParams(params, includePeriod = false) {
    const sanitized = {}

    // Sanitizar y dar formato a las fechas
    if (params.startDate) {
      sanitized.startDate = this.formatDateParam(params.startDate)
    }

    if (params.endDate) {
      sanitized.endDate = this.formatDateParam(params.endDate)
    }

    // Validar y asegurar que startDate <= endDate
    if (sanitized.startDate && sanitized.endDate) {
      const start = new Date(sanitized.startDate)
      const end = new Date(sanitized.endDate)

      if (start > end) {
        // Intercambiar fechas si están en orden incorrecto
        ;[sanitized.startDate, sanitized.endDate] = [sanitized.endDate, sanitized.startDate]
      }
    }

    // Verificar el período
    if (includePeriod && params.period) {
      // Validar que el período es uno de los valores permitidos
      const allowedPeriods = ['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY']
      sanitized.period = allowedPeriods.includes(params.period) ? params.period : 'MONTHLY'
    }

    // Copiar el resto de parámetros con validación
    if (params.format) sanitized.format = params.format
    if (params.reportType) sanitized.reportType = params.reportType
    if (params.chartType) {
      // Validar tipo de gráfico
      const allowedChartTypes = ['bar', 'line', 'pie', 'area']
      sanitized.chartType = allowedChartTypes.includes(params.chartType) ? params.chartType : 'bar'
    }

    // Agregar timestamp para evitar problemas de caché
    sanitized._t = Date.now()

    return sanitized
  },

  // Método para formatear correctamente las fechas
  formatDateParam(dateValue) {
    if (!dateValue) return null

    try {
      // Si ya es una fecha en formato string ISO
      if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateValue
      }

      // Si es un objeto Date o un string con formato diferente
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) {
        console.warn('Fecha inválida:', dateValue)
        return null
      }

      // Formato YYYY-MM-DD
      return date.toISOString().split('T')[0]
    } catch (error) {
      console.error('Error al formatear fecha:', error)
      return null
    }
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

  buildMetricsExportParams(format, period, startDate, endDate) {
    return {
      format: format,
      reportType: 'GENERIC_METRICS', // Definiremos este reportType en el backend
      period: period,
      startDate: startDate,
      endDate: endDate,
    }
  },
}
