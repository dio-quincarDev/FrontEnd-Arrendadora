<template>
  <q-card v-if="rental" style="width: 500px; max-width: 90vw">
    <q-card-section>
      <div class="text-h6">Detalles de la Renta #{{ rental.id }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-list separator>
        <q-item>
          <q-item-section>
            <q-item-label overline>Estado</q-item-label>
            <q-item-label>
              <q-badge :color="getStatusColor(rental.rentalStatus)">
                {{ rental.rentalStatus }}
              </q-badge>
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label overline>Inicio</q-item-label>
            <q-item-label>{{ formatDate(rental.startDate) }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label overline>Fin</q-item-label>
            <q-item-label>{{ formatDate(rental.endDate) }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label overline>Precio Total</q-item-label>
            <q-item-label>{{ formatCurrency(rental.totalPrice) }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="rental.pricingTier">
          <q-item-section>
            <q-item-label overline>Nivel de Precios</q-item-label>
            <q-item-label>{{ rental.pricingTier }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="rental.dailyRate">
          <q-item-section>
            <q-item-label overline>Tarifa Diaria</q-item-label>
            <q-item-label>{{ formatCurrency(rental.dailyRate) }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="rental.createdAt">
          <q-item-section>
            <q-item-label overline>Creado</q-item-label>
            <q-item-label>{{ formatDateTime(rental.createdAt) }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item v-if="rental.vehicle">
          <q-item-section>
            <q-item-label overline>Vehículo</q-item-label>
            <q-item-label
              >{{ rental.vehicle.brand }} {{ rental.vehicle.model }} ({{
                rental.vehicle.plate
              }})</q-item-label
            >
          </q-item-section>
        </q-item>

        <q-item v-if="rental.customer">
          <q-item-section>
            <q-item-label overline>Cliente</q-item-label>
            <q-item-label>{{ rental.customer.name }} ({{ rental.customer.license }})</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right" class="q-pa-md">
      <q-btn label="Cerrar" flat color="grey" @click="emitCloseEvent" />
      <q-btn label="Editar" unelevated color="accent" @click="emitEditEvent" />
    </q-card-actions>
  </q-card>

  <q-card v-else class="text-center">
    <q-card-section>
      <div class="text-h6 text-grey-7">No se proporcionaron datos de la renta.</div>
      <q-icon name="sym_o_sentiment_dissatisfied" size="xl" color="grey-5" class="q-mt-md" />
    </q-card-section>
  </q-card>
</template>

<script setup>

import { date } from 'quasar'

const props = defineProps({
  rental: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['edit', 'close'])

const formatDate = (dateString) =>
  dateString ? date.formatDate(dateString, 'D [de] MMMM [de] YYYY') : 'N/A'
const formatDateTime = (dateString) =>
  dateString ? date.formatDate(dateString, 'D [de] MMMM [de] YYYY, h:mm A') : 'N/A'
const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value)

const getStatusColor = (status) => {
  const statusColors = {
    PENDING: 'negative',
    ACTIVE: 'positive',
    COMPLETED: 'info',
    CANCELLED: 'negative',
  }
  return statusColors[status] || 'grey'
}

const emitEditEvent = () => {
  emit('edit', props.rental)
}

const emitCloseEvent = () => {
  emit('close')
}
</script>

<style scoped lang="scss">
.q-item__label--overline {
  font-size: 0.75rem;
  color: $grey-7;
}
</style>
