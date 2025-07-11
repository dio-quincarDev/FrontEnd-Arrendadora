<template>
  <!-- El componente es una q-card, ideal para diálogos. -->
  <!-- Verificamos que la prop 'customer' tenga datos antes de mostrar. -->
  <q-card v-if="customer" style="width: 500px; max-width: 90vw">
    <q-card-section>
      <div class="text-h6">Detalles de {{ customer.name }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <!-- MEJORA UI: Usamos una lista para una mejor estructura y legibilidad -->
      <q-list separator>
        <q-item>
          <q-item-section>
            <q-item-label overline>Email</q-item-label>
            <q-item-label>{{ customer.email }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label overline>Teléfono</q-item-label>
            <q-item-label>{{ customer.phone }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label overline>Identificación</q-item-label>
            <q-item-label>{{ customer.license }}</q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label overline>Estado</q-item-label>
            <q-item-label>
              <q-badge
                :color="customer.customerStatus === 'ACTIVE' ? 'positive' : 'grey'"
                :label="customer.customerStatus === 'ACTIVE' ? 'Activo' : 'Inactivo'"
              />
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item>
          <q-item-section>
            <q-item-label overline>Cliente desde</q-item-label>
            <q-item-label>{{ formatDate(customer.createdAt) }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-card-section>

    <q-separator />

    <q-card-actions align="right" class="q-pa-md">
      <!-- CAMBIO: El botón de cerrar emite un evento -->
      <q-btn label="Cerrar" flat color="grey" @click="emitCloseEvent" />
      <!-- CAMBIO: El botón de editar emite un evento con los datos del cliente -->
      <q-btn label="Editar" unelevated color="accent" @click="emitEditEvent" />
    </q-card-actions>
  </q-card>

  <!-- Estado de "no encontrado" por si acaso, aunque el padre no debería mostrarlo si no hay datos -->
  <q-card v-else class="text-center">
    <q-card-section>
      <div class="text-h6 text-grey-7">No se proporcionaron datos del cliente.</div>
      <q-icon name="sym_o_sentiment_dissatisfied" size="xl" color="grey-5" class="q-mt-md" />
    </q-card-section>
  </q-card>
</template>

<script>
import { date } from 'quasar'

export default {
  name: 'CustomerDetails',
  // CAMBIO: Definimos la prop y los eventos
  props: {
    customer: {
      type: Object,
      required: true,
    },
  },
  emits: ['edit', 'close'],

  setup(props, { emit }) {
    // CAMBIO: Toda la lógica de carga ha sido eliminada.
    // El componente ahora es "tonto" y solo muestra lo que recibe.

    const formatDate = (isoDate) => {
      if (!isoDate) return 'N/A'
      return date.formatDate(isoDate, 'D [de] MMMM [de] YYYY, h:mm A')
    }

    const emitEditEvent = () => {
      // Emitimos el evento 'edit' y pasamos el cliente actual
      // para que el padre sepa a quién editar.
      emit('edit', props.customer)
    }

    const emitCloseEvent = () => {
      emit('close')
    }

    return {
      formatDate,
      emitEditEvent,
      emitCloseEvent,
    }
  },
}
</script>

<style scoped lang="scss">
.q-item__label--overline {
  font-size: 0.75rem; /* Hacemos la etiqueta un poco más pequeña */
  color: $grey-7; /* Usamos un color de la paleta para consistencia */
}
</style>
