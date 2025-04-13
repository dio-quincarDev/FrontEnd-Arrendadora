<template>
  <div>
    <h1>Crear Nueva Renta</h1>
    <rental-form @rental-created="onRentalCreated" />
  </div>
</template>

<script>
import RentalForm from 'src/components/rental/RentalForm.vue'

export default {
  name: 'RentalCreatePage',
  components: {
    RentalForm,
  },
  methods: {
    onRentalCreated() {
      this.$router.push('/rentals')
    },
  },
}
</script>
