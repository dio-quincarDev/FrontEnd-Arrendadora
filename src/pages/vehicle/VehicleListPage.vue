<template>
  <q-page padding>
    <div class="row justify-between items-center q-mb-md">
      <h1 class="text-h4">Vehículos</h1>
      <q-btn
        icon="sym_o_add"
        label="Crear Vehículo"
        outline
        text-color="accent"
        @click="handleCreateVehicle"
        class="flex flex-center bg-grey-1"
      />
    </div>

    <vehicle-table
      ref="vehicleTableRef"
      @edit-vehicle="handleEditVehicle"
      @view-details="handleViewDetails"
    />

    <q-dialog v-model="showFormDialog" persistent>
      <vehicle-form
        :vehicle-to-edit="selectedVehicle"
        @vehicle-saved="onVehicleSaved"
        @cancel="showFormDialog = false"
      />
    </q-dialog>

    <q-dialog v-model="showDetailsDialog">
      <vehicle-details
        :vehicle="selectedVehicle"
        @edit="handleEditFromDetails"
        @close="showDetailsDialog = false"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import VehicleTable from 'src/components/vehicle/VehicleTable.vue'
import VehicleForm from 'src/components/vehicle/VehicleForm.vue'
import VehicleDetails from 'src/components/vehicle/VehicleDetails.vue'

const vehicleTableRef = ref(null)
const showFormDialog = ref(false)
const showDetailsDialog = ref(false)
const selectedVehicle = ref(null)

const handleCreateVehicle = () => {
  selectedVehicle.value = null
  showFormDialog.value = true
}

const handleEditVehicle = (vehicle) => {
  selectedVehicle.value = vehicle
  showFormDialog.value = true
}

const handleViewDetails = (vehicle) => {
  selectedVehicle.value = vehicle
  showDetailsDialog.value = true
}

const onVehicleSaved = () => {
  showFormDialog.value = false
  vehicleTableRef.value.refresh()
}

const handleEditFromDetails = (vehicle) => {
  showDetailsDialog.value = false
  setTimeout(() => {
    handleEditVehicle(vehicle)
  }, 150)
}
</script>

<style lang="scss" scoped>
.q-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
