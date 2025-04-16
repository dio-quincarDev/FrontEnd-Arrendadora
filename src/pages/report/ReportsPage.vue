<template>
  <q-page padding>
    <div class="q-pa-md">
      <h1>Generación de Reportes (Solo Administradores)</h1>

      <q-card>
        <q-card-section>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <q-select
                v-model="reportFormat"
                :options="reportFormatOptions"
                label="Formato de Descarga"
              />
            </div>

            <div class="col-12">
              <q-select v-model="period" :options="periodOptions" label="Período del Reporte" />
            </div>

            <div v-if="period === 'CUSTOM'" class="col-12 row q-col-gutter-md">
              <div class="col-6">
                <q-input v-model="startDate" type="date" label="Fecha de Inicio" />
              </div>
              <div class="col-6">
                <q-input v-model="endDate" type="date" label="Fecha de Fin" />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            label="Descargar PDF"
            color="primary"
            @click="downloadPdfReport"
            :loading="loading && reportFormat === 'PDF'"
          />
          <q-btn
            label="Descargar Excel"
            color="secondary"
            @click="downloadExcelReport"
            :loading="loading && reportFormat === 'EXCEL'"
            class="q-ml-md"
          />
        </q-card-actions>
      </q-card>

      <div v-if="loading && reportFormat !== 'PDF' && reportFormat !== 'EXCEL'" class="q-mt-md">
        <q-spinner color="primary" size="2em" />
        <p class="q-mt-sm">Generando reporte...</p>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import ReportService from 'src/services/report.service'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const reportFormat = ref('PDF') // Valor inicial
const period = ref('MONTHLY') // Valor inicial
const startDate = ref(null)
const endDate = ref(null)
const loading = ref(false)

const reportFormatOptions = [
  { label: 'PDF', value: 'PDF' },
  { label: 'Excel', value: 'EXCEL' },
]

const periodOptions = [
  { label: 'Mensual', value: 'MONTHLY' },
  { label: 'Trimestral', value: 'QUARTERLY' },
  { label: 'Anual', value: 'YEARLY' },
  { label: 'Personalizado', value: 'CUSTOM' },
]

async function downloadPdfReport() {
  loading.value = true
  try {
    const params = {
      format: 'PDF',
      reportType: 'RENTAL_SUMMARY', // Puedes ajustarlo si tienes diferentes tipos de reportes
      period: period.value,
      startDate: period.value === 'CUSTOM' ? startDate.value : null,
      endDate: period.value === 'CUSTOM' ? endDate.value : null,
    }
    const response = await ReportService.exportReport(params)
    downloadFile(
      response,
      'application/pdf',
      generateFilename('rental_summary', period.value, startDate.value, endDate.value, 'pdf'),
    )
  } catch (error) {
    console.error('Error al descargar el reporte PDF:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar y descargar el reporte PDF.',
    })
  } finally {
    loading.value = false
  }
}

async function downloadExcelReport() {
  loading.value = true
  try {
    const params = {
      format: 'EXCEL',
      reportType: 'RENTAL_SUMMARY', // Ajusta si es necesario
      period: period.value,
      startDate: period.value === 'CUSTOM' ? startDate.value : null,
      endDate: period.value === 'CUSTOM' ? endDate.value : null,
    }
    const response = await ReportService.exportReport(params)
    downloadFile(
      response,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      generateFilename('rental_summary', period.value, startDate.value, endDate.value, 'xlsx'),
    )
  } catch (error) {
    console.error('Error al descargar el reporte Excel:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar y descargar el reporte Excel.',
    })
  } finally {
    loading.value = false
  }
}

function generateFilename(reportType, period, startDate, endDate, extension) {
  let filename = `${reportType}_${period}`
  if (startDate && endDate) {
    filename += `_${startDate}_${endDate}`
  } else {
    const today = new Date().toISOString().slice(0, 10)
    filename += `_${today}`
  }
  return `${filename}.${extension}`
}

function downloadFile(data, mimeType, filename) {
  const blob = new Blob([data], { type: mimeType })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
</script>
