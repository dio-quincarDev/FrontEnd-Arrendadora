<template>
  <q-form @submit.prevent="submitForm">
    <q-input v-model="rental.vehicleId" label="ID Vehículo" type="number" outlined />
    <q-input v-model="rental.customerId" label="ID Cliente" type="number" outlined />
    <q-input v-model="rental.startDate" label="Fecha Inicio" outlined />
    <q-input v-model="rental.endDate" label="Fecha Fin" outlined />
    <q-input v-model="rental.totalPrice" label="Precio Total" type="number" outlined />
    <q-btn
      :label="isEditMode ? 'Guardar Renta' : 'Crear Renta'"
      type="submit"
      color="primary"
      class="q-mt-md"
    />
  </q-form>
</template>

<script>
import RentalService from 'src/services/rental.service'

export default {
  name: 'RentalForm',
  props: {
    rentalId: {
      type: [String, Number],
      default: null,
    },
  },
  data() {
    return {
      rental: {
        vehicleId: null,
        customerId: null,
        startDate: '',
        endDate: '',
        totalPrice: null,
      },
      isEditMode: false,
    }
  },
  async created() {
    if (this.rentalId) {
      this.isEditMode = true
      try {
        const response = await RentalService.getRentalById(this.rentalId)
        this.rental = response.data
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        this.$q.notify({ type: 'negative', message: 'Error al cargar la renta' })
      }
    }
  },
  methods: {
    async submitForm() {
      try {
        if (this.isEditMode) {
          await RentalService.updateRental(this.rentalId, this.rental)
          this.$q.notify({ type: 'positive', message: 'Renta actualizada correctamente' })
        } else {
          await RentalService.createRental(this.rental)
          this.$q.notify({ type: 'positive', message: 'Renta creada correctamente' })
          this.$emit('rental-created')
        }
        this.$router.push('/rentals')
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        this.$q.notify({ type: 'negative', message: 'Error al guardar la renta' })
      }
    },
  },
}
</script>
