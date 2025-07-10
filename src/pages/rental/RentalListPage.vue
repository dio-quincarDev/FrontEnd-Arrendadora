<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <h1 class="text-h4">Rentas</h1>
      <q-btn
        icon="sym_o_add"
        label="Crear Renta"
        outline
        text-color="accent"
        @click="handleCreateRental"
        class="flex flex-center bg-grey-1"
      />
    </div>

    <rental-table
      ref="rentalTableRef"
      @edit-rental="handleEditRental"
      @view-details="handleViewDetails"
    />

    <q-dialog v-model="showFormDialog" persistent>
      <rental-form
        :rental-to-edit="selectedRental"
        @rental-saved="onRentalSaved"
        @cancel="showFormDialog = false"
      />
    </q-dialog>

    <q-dialog v-model="showDetailsDialog">
      <rental-details
        :rental="selectedRental"
        @edit="handleEditFromDetails"
        @close="showDetailsDialog = false"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import RentalTable from 'src/components/rental/RentalTable.vue'
import RentalForm from 'src/components/rental/RentalForm.vue'
import RentalDetails from 'src/components/rental/RentalDetails.vue'

const rentalTableRef = ref(null)
const showFormDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedRental = ref(null)

const handleCreateRental = () => {
  selectedRental.value = null
  showFormDialog.value = true
}

const handleEditRental = (rental) => {
  selectedRental.value = rental
  showFormDialog.value = true
}

const handleViewDetails = (rental) => {
  selectedRental.value = rental
  showDetailsDialog.value = true
}

const onRentalSaved = () => {
  showFormDialog.value = false
  rentalTableRef.value.refresh()
}

const handleEditFromDetails = (rental) => {
  showDetailsDialog.value = false
  setTimeout(() => {
    handleEditRental(rental)
  }, 150)
}
</script>

<style lang="scss" scoped>
.q-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
