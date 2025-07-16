<template>
  <q-page padding class="home-page">
    <!-- 1. Sección de Bienvenida y Métricas -->
    <div class="row items-center justify-between q-mb-md">
      <h1 class="text-h4 text-weight-bold text-primary q-my-none">
        Bienvenido
      </h1>
      <div class="text-grey-7">{{ formattedDate }}</div>
    </div>

    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 col-sm-6 col-md-4">
        <metric-card
          title="Vehículos Disponibles"
          icon="sym_o_local_parking"
          :value="dashboardMetrics.availableVehicles"
          :loading="loadingMetrics"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <metric-card
          title="Rentas Activas"
          icon="sym_o_receipt_long"
          :value="activeRentalsCount"
          :loading="loadingRentals"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <metric-card
          title="Nuevos Clientes (Últ. 7 días)"
          icon="sym_o_person_add"
          :value="dashboardMetrics.newCustomers"
          :loading="loadingMetrics"
        />
      </div>
    </div>

    <!-- 2. Sección de Acciones Rápidas -->
    <div class="q-mb-xl">
      <h2 class="text-h5 text-weight-medium text-primary q-mb-md">¿Qué te gustaría hacer?</h2>
      <div class="row q-col-gutter-md">
        <div v-for="action in quickActions" :key="action.label" class="col-12 col-sm-6 col-md-3">
          <q-card class="action-card text-center" @click="$router.push(action.to)">
            <q-card-section class="action-card-content">
              <q-icon :name="action.icon" color="accent" size="3em" />
              <div class="text-h6 text-weight-regular q-mt-sm">{{ action.label }}</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- 3. Sección de Actividad Reciente -->
    <div>
      <h2 class="text-h5 text-weight-medium text-primary q-mb-md">Últimos Movimientos</h2>
      <q-card flat bordered>
        <q-list separator>
          <q-item v-if="loadingRentals" class="flex flex-center q-pa-md">
            <q-spinner color="primary" size="2em" />
          </q-item>
          <q-item v-else-if="recentRentals.length === 0">
            <q-item-section class="text-grey-7">No hay rentas recientes.</q-item-section>
          </q-item>
          <q-item v-for="rental in recentRentals" :key="rental.id">
            <q-item-section avatar>
              <q-icon :name="getIconForStatus(rental.rentalStatus)" :color="getColorForStatus(rental.rentalStatus)" />
            </q-item-section>
            <q-item-section>
              <q-item-label>
                Renta #{{ rental.id }}: {{ rental.vehicleBrand }} {{ rental.vehicleModel }}
              </q-item-label>
              <q-item-label caption>
                Cliente: {{ rental.customerName }} - Inicia: {{ formatDate(rental.startDate) }}
              </q-item-label>
            </q-item-section>
            <q-item-section side top>
              <q-badge :color="getColorForStatus(rental.rentalStatus)">{{ rental.rentalStatus }}</q-badge>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

import useDashboardData from 'src/composables/useDashboardData'
import RentalService from 'src/services/rental.service'
import MetricCard from 'src/components/report/MetricCard.vue'
import { date } from 'quasar'

const { dashboardData: dashboardMetrics, loading: loadingMetrics, loadDashboardData } = useDashboardData()

const recentRentals = ref([])
const loadingRentals = ref(false)


const formattedDate = computed(() => date.formatDate(Date.now(), 'dddd, D [de] MMMM [de] YYYY'))

const activeRentalsCount = computed(() => {
  return recentRentals.value.filter(r => r.rentalStatus === 'ACTIVE').length;
});

const quickActions = ref([
  {
    label: 'Crear Renta',
    icon: 'sym_o_add_circle',
    to: '/rentals/create',
  },
  {
    label: 'Gestionar Vehículos',
    icon: 'sym_o_directions_car',
    to: '/vehicles',
  },
  {
    label: 'Gestionar Clientes',
    icon: 'sym_o_groups',
    to: '/customers',
  },
  {
    label: 'Ver Dashboard',
    icon: 'sym_o_analytics',
    to: '/reports/dashboard',
  },
])

const fetchRecentRentals = async () => {
  loadingRentals.value = true
  try {
    const response = await RentalService.getRentals()
    if (response.data && Array.isArray(response.data)) {
      recentRentals.value = response.data
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
        .slice(0, 5)
    }
  } catch (error) {
    console.error('Error fetching recent rentals:', error)
  } finally {
    loadingRentals.value = false
  }
}

const formatDate = (dateString) => date.formatDate(dateString, 'DD/MM/YYYY')

const getIconForStatus = (status) => {
  const icons = {
    ACTIVE: 'sym_o_directions_car',
    COMPLETED: 'sym_o_check_circle',
    PENDING: 'sym_o_pending',
    CANCELLED: 'sym_o_cancel',
  }
  return icons[status] || 'sym_o_help'
}

const getColorForStatus = (status) => {
  const colors = {
    ACTIVE: 'positive',
    COMPLETED: 'primary',
    PENDING: 'warning',
    CANCELLED: 'negative',
  }
  return colors[status] || 'grey'
}

onMounted(() => {
  loadDashboardData({ period: 'ALL_TIME' })
  fetchRecentRentals()
})
</script>

<style scoped lang="scss">
.home-page {
  max-width: 1200px;
  margin: 0 auto;
}

.text-primary {
  color: $accent !important;
}

.action-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  height: 130px; /* Altura fija similar a MetricCard */
  display: flex;
  flex-direction: column;
  justify-content: center; /* Centrar contenido verticalmente */
  align-items: center; /* Centrar contenido horizontalmente */
  border-radius: 12px; /* Bordes redondeados consistentes */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Sombra consistente */
  background: linear-gradient(145deg, #ffffff, #f0f0f0); /* Degradado suave consistente */

  .action-card-content {
    padding: 0; /* Eliminar padding extra de q-card-section */
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
}

/* Asegurar que MetricCard tenga el mismo estilo visual */
:deep(.metric-card) {
  height: 130px; /* Altura fija */
  display: flex;
  flex-direction: column;
  justify-content: center;
  border-radius: 12px; /* Bordes redondeados consistentes */
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); /* Sombra consistente */
  background: linear-gradient(145deg, #ffffff, #f0f0f0); /* Degradado suave consistente */
}

:deep(.metric-card .q-card-section) {
  padding: 16px; /* Ajustar padding interno para consistencia */
}
</style>