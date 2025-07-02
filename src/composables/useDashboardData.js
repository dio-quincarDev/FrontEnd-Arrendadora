import { ref } from 'vue'
import { useQuasar } from 'quasar'
import ReportService from 'src/services/report.service'
import { downloadFile } from 'src/utils/fileDownload'

export default function useDashboardData() {
  const $q = useQuasar()
  const loading = ref(false)
  const downloading = ref(false)

  const dashboardData = ref({
    totalRentals: 0,
    totalRevenue: 0,
    availableVehicles: 0,
    activeCustomers: 0,
    averageRentalDuration: 0,
    topCustomersByRentals: [],
    vehicleUsage: [],
    customerActivity: [],
    rentalTrends: [],
    mostRentedVehicle: {},
    // ¡Añade esta propiedad para el gráfico de duración promedio por cliente!
    averageRentalDurationByTopCustomers: {}, // Inicializa como objeto vacío
    newCustomers: 0, // También vista en tu JSON de respuesta
    uniqueCustomers: 0, // También vista en tu JSON de respuesta
  })

  const loadDashboardData = async (filters) => {
    loading.value = true
    try {
      const data = await ReportService.getDashboardData(filters)
      if (data && typeof data === 'object') {
        dashboardData.value = {
          totalRentals: data?.totalRentals ?? 0,
          totalRevenue: data?.totalRevenue ?? 0,
          availableVehicles: data?.availableVehicles ?? 0,
          activeCustomers: data?.activeCustomers ?? 0,
          averageRentalDuration: data?.averageRentalDuration ?? 0,
          topCustomersByRentals: data?.topCustomersByRentals ?? [],
          vehicleUsage: data?.vehicleUsage ?? [],
          customerActivity: data?.customerActivity ?? [],
          rentalTrends: data?.rentalTrends ?? [],
          mostRentedVehicle: data?.mostRentedVehicle ?? {},
          // ¡Asegúrate de asignar los datos que vienen de la API!
          averageRentalDurationByTopCustomers: data?.averageRentalDurationByTopCustomers ?? {},
          newCustomers: data?.newCustomers ?? 0,
          uniqueCustomers: data?.uniqueCustomers ?? 0,
        }
        console.log(
          'Datos brutos del dashboard cargados:',
          JSON.parse(JSON.stringify(dashboardData.value)),
        ) // Para depuración
      }
    } catch (error) {
      console.error('[Dashboard] Error al cargar datos', error)
      $q.notify({ type: 'negative', message: 'Error al cargar dashboard', caption: error.message })
    } finally {
      loading.value = false
    }
  }

  const downloadReport = async ({ format, reportType, ...filters }) => {
    downloading.value = true
    try {
      const file = await ReportService.exportReport({
        format,
        reportType,
        ...filters,
      })
      downloadFile(file, format, reportType.toLowerCase())
      $q.notify({ type: 'positive', message: 'Reporte descargado exitosamente' })
    } catch (error) {
      console.error('[Dashboard] Error en downloadReport', error)
      $q.notify({ type: 'negative', message: 'Error al generar reporte', caption: error.message })
    } finally {
      downloading.value = false
    }
  }

  return {
    dashboardData,
    loading,
    downloading,
    loadDashboardData,
    downloadReport,
  }
}
