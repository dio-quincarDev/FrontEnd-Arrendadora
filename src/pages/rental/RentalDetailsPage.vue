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
        <div class="text-h4">Detalles del Alquiler</div>
      </div>
      <rental-details :rentalId="rentalId" />
    </div>
  </q-page>
</template>

<script>
import RentalDetails from 'components/rental/RentalDetails.vue'

export default {
  name: 'RentalView',
  components: {
    RentalDetails,
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
