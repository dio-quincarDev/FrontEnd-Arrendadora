<template>
  <q-page class="q-pa-md">
    <div class="text-h4 q-mb-md">Reportes</div>

    <!-- Filtros -->
    <q-card class="q-mb-md">
      <q-card-section>
        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-4">
            <q-select
              v-model="selectedReportType"
              :options="reportTypeOptions"
              label="Tipo de Reporte"
              outlined
            />
          </div>

          <div class="col-12 col-md-4">
            <q-select
              v-model="selectedPeriod"
              :options="periodOptions"
              label="Período"
              outlined
              @update:model-value="handlePeriodChange"
            />
          </div>

          <div v-if="showCustomDates" class="col-12 col-md-4">
            <q-input v-model="startDate" label="Fecha de inicio" type="date" outlined />
          </div>

          <div v-if="showCustomDates" class="col-12 col-md-4">
            <q-input v-model="endDate" label="Fecha de fin" type="date" outlined />
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn color="primary" label="Generar Reporte" @click="generateReport" :loading="loading" />
      </q-card-actions>
    </q-card>

    <!-- Vista previa del reporte -->
    <q-card v-if="reportData" class="q-mt-md">
      <q-card-section>
        <div class="text-h6">Vista Previa del Reporte</div>
        <pre class="q-mt-md">{{ reportPreview }}</pre>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          color="primary"
          label="Descargar PDF"
          @click="() => downloadReport('PDF')"
          :loading="downloading === 'PDF'"
        />
        <q-btn
          color="green"
          label="Descargar Excel"
          @click="() => downloadReport('EXCEL')"
          :loading="downloading === 'EXCEL'"
          class="q-ml-sm"
        />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuasar } from 'quasar'
import ReportService from 'src/services/report.service'

const $q = useQuasar()

// Estado del componente
const selectedReportType = ref('RENTAL_SUMMARY')
const selectedPeriod = ref('MONTHLY')
const startDate = ref(null)
const endDate = ref(null)
const reportData = ref(null)
const loading = ref(false)
const downloading = ref(null)

// Opciones de configuración
const reportTypeOptions = [
  { label: 'Resumen de Rentas', value: 'RENTAL_SUMMARY' },
  { label: 'Reporte Financiero', value: 'FINANCIAL_REPORT' },
  { label: 'Reporte de Vehículos', value: 'VEHICLE_REPORT' },
]

const periodOptions = [
  { label: 'Últimos 7 días', value: 'WEEKLY' },
  { label: 'Último mes', value: 'MONTHLY' },
  { label: 'Último trimestre', value: 'QUARTERLY' },
  { label: 'Último año', value: 'YEARLY' },
  { label: 'Personalizado', value: 'CUSTOM' },
]

// Computed properties
const showCustomDates = computed(() => selectedPeriod.value === 'CUSTOM')
const reportPreview = computed(() => {
  if (!reportData.value) return 'No hay datos para mostrar'
  return JSON.stringify(reportData.value, null, 2)
})

// Métodos
function handlePeriodChange() {
  if (selectedPeriod.value !== 'CUSTOM') {
    startDate.value = null
    endDate.value = null
  }
}

function validateCustomDates() {
  if (startDate.value && endDate.value && new Date(startDate.value) > new Date(endDate.value)) {
    $q.notify({
      type: 'negative',
      message: 'La fecha de inicio no puede ser posterior a la fecha de fin',
    })
    return false
  }
  return true
}

function getPrimitiveValue(value) {
  return value?.value ?? value
}

function cleanParams(params) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== null && value !== undefined),
  )
}

async function generateReport() {
  if (showCustomDates.value && !validateCustomDates()) return

  loading.value = true
  try {
    const params = cleanParams({
      format: 'JSON',
      reportType: getPrimitiveValue(selectedReportType.value),
      period: getPrimitiveValue(selectedPeriod.value),
      startDate: showCustomDates.value ? formatDate(startDate.value) : null,
      endDate: showCustomDates.value ? formatDate(endDate.value) : null,
    })

    // Uso de exportReport() para todas las vistas previas
    const response = await ReportService.exportReport({ ...params, format: 'JSON' })
    reportData.value = response // Formateo del JSON

    $q.notify({
      type: 'positive',
      message: 'Reporte generado con éxito',
    })
  } catch (error) {
    console.error('Error al generar el reporte:', error.response?.data || error.message || error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el reporte',
      caption: error.response?.data?.message || error.message,
    })
  } finally {
    loading.value = false
  }
}

async function downloadReport(format) {
  try {
    const params = {
      format: format,
      reportType: selectedReportType.value.value,
      period: selectedPeriod.value.value,
      startDate: showCustomDates.value ? formatDate(startDate.value) : null,
      endDate: showCustomDates.value ? formatDate(endDate.value) : null,
    }

    const response = await ReportService.exportReport(params)
    downloadFile(response, format)

    $q.notify({ type: 'positive', message: 'Reporte descargado' })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al descargar',
      caption: error.response?.data?.message || error.message,
    })
  } finally {
    downloading.value = null
  }
}

function formatDate(dateString) {
  if (!dateString) return null
  return new Date(dateString).toISOString().split('T')[0]
}

function downloadFile(blobData, format) {
  const formats = {
    PDF: { mimeType: 'application/pdf', extension: 'pdf' },
    EXCEL: {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      extension: 'xlsx',
    },
  }

  const blob = new Blob([blobData], { type: formats[format].mimeType })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `reporte_${new Date().toISOString().slice(0, 10)}.${formats[format].extension}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
</script>

<style scoped>
pre {
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
}
</style>
