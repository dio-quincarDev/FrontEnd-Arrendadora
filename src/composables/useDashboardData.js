import { ref } from 'vue'
import { useQuasar } from 'quasar'
import ReportService from 'src/services/report.service'
import { downloadFile } from 'src/utils/fileDownload'

export default function useDashboardData() {
  const $q = useQuasar()
  const loading = ref(false)
  const downloading = ref(false)

  const initialData = {
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
    averageRentalDurationByTopCustomers: {},
    newCustomers: 0,
    uniqueCustomers: 0,
  };

  const dashboardData = ref({ ...initialData });

  const loadDashboardData = async (filters) => {
    loading.value = true
    try {
      const data = await ReportService.getDashboardData(filters)
      if (data && typeof data === 'object') {
        dashboardData.value = {
          ...initialData, // Asegura que todas las propiedades se resetean
          ...data, // Sobrescribe con los datos recibidos
        };
      }
    } catch (error) {
      console.error('[Dashboard] Error al cargar datos', error)
      $q.notify({ 
        type: 'negative', 
        message: 'No se pudieron cargar los datos', 
        caption: 'El servidor respondió con un error. Inténtalo con otro rango de fechas.',
        position: 'top'
      });
      // Resetea los datos a su estado inicial para que los gráficos muestren "Sin datos"
      dashboardData.value = { ...initialData };
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
