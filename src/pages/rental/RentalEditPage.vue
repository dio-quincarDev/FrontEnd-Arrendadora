<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center q-mb-md">
        <q-btn
          flat
          round
          color="primary"
          icon="arrow_back"
          @click="$router.push('/rentals')"
          class="q-mr-sm"
        />
        <div class="text-h4">Editar Alquiler</div>
      </div>
      <rental-form :rentalId="rentalId" />
    </div>
  </q-page>
</template>

<script>
import RentalForm from 'components/rental/RentalForm.vue'

export default {
  name: 'RentalEdit',
  components: {
    RentalForm,
  },
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },
  computed: {
    rentalId() {
      return this.id
    },
  },
}
</script>
