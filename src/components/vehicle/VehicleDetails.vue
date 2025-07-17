<template>
  <q-card v-if="vehicle" style="width: 500px; max-width: 90vw">
    <q-card-section>
      <div class="text-h6">Detalles de {{ vehicle.brand }} {{ vehicle.model }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <q-list separator>
        <q-item>
          <q-item-section>
            <q-item-label overline>Marca</q-item-label>
            <q-item-label>{{ vehicle.brand }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label overline>Modelo</q-item-label>
            <q-item-label>{{ vehicle.model }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label overline>Tipo de Vehículo</q-item-label>
            <q-item-label>{{ vehicleTypeDescription }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label overline>Año</q-item-label>
            <q-item-label>{{ vehicle.year }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label overline>Placa</q-item-label>
            <q-item-label>{{ vehicle.plate }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label overline>Estado</q-item-label>
            <q-item-label>
              <q-badge :color="badgeColor">
                {{ statusDescription }}
              </q-badge>
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label overline>Creado</q-item-label>
            <q-item-label>{{ formattedCreatedAt }}</q-item-label>
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
      <div class="text-h6 text-grey-7">No se proporcionaron datos del vehículo.</div>
      <q-icon name="sym_o_sentiment_dissatisfied" size="xl" color="grey-5" class="q-mt-md" />
    </q-card-section>
  </q-card>
</template>

<script>
import { computed } from 'vue'
import { date } from 'quasar'

export default {
  name: 'VehicleDetails',
  props: {
    vehicle: {
      type: Object,
      required: true,
    },
  },
  emits: ['edit', 'close'],
  setup(props, { emit }) {
    const getStatusDescription = (status) => {
      const mapping = {
        AVAILABLE: 'Disponible',
        RENTED: 'Alquilado',
        MAINTENANCE: 'En Mantenimiento',
        OUT_OF_SERVICE: 'Fuera de Servicio',
      }
      return mapping[status] || status || 'Desconocido'
    }

    const getVehicleTypeDescription = (type) => {
      const mapping = {
        PICKUP: 'Doble Cabina',
        SUV: 'Camioneta',
        SEDAN: 'Sedan',
        HATCHBACK: 'Hatchback',
      }
      return mapping[type] || type || 'Desconocido'
    }

    const getBadgeColor = (status) => {
      const colors = {
        AVAILABLE: 'green',
        RENTED: 'blue',
        MAINTENANCE: 'orange',
        OUT_OF_SERVICE: 'grey',
      }
      return colors[status] || 'primary'
    }

    const formattedCreatedAt = computed(() => {
      if (props.vehicle?.createdAt) {
        return date.formatDate(props.vehicle.createdAt, 'D [de] MMMM [de] YYYY, h:mm A')
      }
      return 'N/A'
    })

    const statusDescription = computed(() => getStatusDescription(props.vehicle?.status))
    const vehicleTypeDescription = computed(() => getVehicleTypeDescription(props.vehicle?.vehicleType))
    const badgeColor = computed(() => getBadgeColor(props.vehicle?.status))

    const emitEditEvent = () => {
      emit('edit', props.vehicle)
    }

    const emitCloseEvent = () => {
      emit('close')
    }

    return {
      statusDescription,
      badgeColor,
      formattedCreatedAt,
      vehicleTypeDescription,
      emitEditEvent,
      emitCloseEvent,
    }
  },
}
</script>

<style scoped lang="scss">
.q-item__label--overline {
  font-size: 0.75rem;
  color: $grey-7;
}
</style>
