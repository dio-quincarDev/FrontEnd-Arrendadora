<template>
  <q-card>
    <q-card-section>
      <div class="text-h6">Detalles de la Renta #{{ rental.id }}</div>
      <div v-if="rental.vehicleId">ID Vehículo: {{ rental.vehicleId }}</div>
      <div v-if="rental.customerId">ID Cliente: {{ rental.customerId }}</div>
      <div v-if="rental.startDate">Fecha Inicio: {{ rental.startDate }}</div>
      <div v-if="rental.endDate">Fecha Fin: {{ rental.endDate }}</div>
      <div v-if="rental.totalPrice">Precio Total: {{ rental.totalPrice }}</div>
      <div v-if="rental.rentalStatus">Estado: {{ rental.rentalStatus }}</div>
    </q-card-section>
    <q-card-actions>
      <q-btn label="Editar" @click="goToEdit" color="primary" />
      <q-btn label="Volver" @click="goBack" flat />
    </q-card-actions>
  </q-card>
</template>

<script>
import RentalService from 'src/services/rental.service'

export default {
  name: 'RentalDetails',
  props: {
    rentalId: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      rental: {},
    }
  },
  async created() {
    try {
      const response = await RentalService.getRentalById(this.rentalId)
      this.rental = response.data
      // eslint-disable-next-line no-unused-vars
    } catch (error) {
      this.$q.notify({ type: 'negative', message: 'Error al cargar los detalles de la renta' })
    }
  },
  methods: {
    goToEdit() {
      this.$router.push(`/rentals/edit/${this.rentalId}`)
    },
    goBack() {
      this.$router.push('/rentals')
    },
  },
}
</script>
