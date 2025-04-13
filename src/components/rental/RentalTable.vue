<template>
  <div>
    <q-table
      :rows="rentals"
      :columns="columns"
      row-key="id"
      loading
      :loading-message="loadingMessage"
    >
      <template v-slot:body-cell-actions="props">
        <q-btn flat icon="visibility" @click="goToDetails(props.row.id)" />
        <q-btn flat icon="edit" @click="goToEdit(props.row.id)" />
        <q-btn flat icon="cancel" color="orange" @click="cancelRental(props.row.id)" />
        <q-btn flat icon="delete" color="negative" @click="confirmDelete(props.row)" />
      </template>
    </q-table>

    <q-dialog v-model="showCancelDialog">
      <q-card>
        <q-card-section> ¿Está seguro que desea cancelar esta renta? </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Confirmar Cancelación" @click="confirmCancelAction" color="orange" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="showDeleteDialog">
      <q-card>
        <q-card-section> ¿Está seguro que desea eliminar esta renta? </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Eliminar" @click="confirmDeleteAction" color="negative" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import RentalService from 'src/services/rental.service'

export default {
  name: 'RentalTable',
  data() {
    return {
      rentals: [],
      columns: [
        { name: 'id', label: 'ID', field: 'id', align: 'left' },
        { name: 'vehicleId', label: 'ID Vehículo', field: 'vehicleId', align: 'left' },
        { name: 'customerId', label: 'ID Cliente', field: 'customerId', align: 'left' },
        { name: 'startDate', label: 'Fecha Inicio', field: 'startDate', align: 'left' },
        { name: 'endDate', label: 'Fecha Fin', field: 'endDate', align: 'left' },
        { name: 'totalPrice', label: 'Precio Total', field: 'totalPrice', align: 'left' },
        { name: 'rentalStatus', label: 'Estado', field: 'rentalStatus', align: 'left' },
        { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
      ],
      loading: false,
      loadingMessage: 'Cargando rentas...',
      showCancelDialog: false,
      cancelRentalId: null,
      showDeleteDialog: false,
      deleteRentalId: null,
    }
  },
  async created() {
    await this.loadRentals()
  },
  methods: {
    async loadRentals() {
      this.loading = true
      try {
        const response = await RentalService.getRentals()
        this.rentals = response.data || []
      } catch (error) {
        console.error('Error al cargar rentas:', error)
        this.$q.notify({ type: 'negative', message: 'Error al cargar las rentas' })
        this.rentals = []
      } finally {
        this.loading = false
      }
    },
    goToDetails(id) {
      this.$router.push(`/rentals/${id}`)
    },
    goToEdit(id) {
      this.$router.push(`/rentals/edit/${id}`)
    },
    async cancelRental(id) {
      this.cancelRentalId = id
      this.showCancelDialog = true
    },
    async confirmCancelAction() {
      this.showCancelDialog = false
      this.loading = true
      try {
        await RentalService.cancelRental(this.cancelRentalId)
        this.$q.notify({ type: 'positive', message: 'Renta cancelada correctamente' })
        await this.loadRentals()
      } catch (error) {
        console.error('Error al cancelar la renta:', error)
        this.$q.notify({ type: 'negative', message: 'Error al cancelar la renta' })
      } finally {
        this.loading = false
      }
    },
    confirmDelete(rental) {
      this.deleteRentalId = rental.id
      this.showDeleteDialog = true
    },
    async confirmDeleteAction() {
      this.showDeleteDialog = false
      this.loading = true
      try {
        await RentalService.deleteRental(this.deleteRentalId)
        this.$q.notify({ type: 'positive', message: 'Renta eliminada correctamente' })
        await this.loadRentals()
      } catch (error) {
        console.error('Error al eliminar la renta:', error)
        this.$q.notify({ type: 'negative', message: 'Error al eliminar la renta' })
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
