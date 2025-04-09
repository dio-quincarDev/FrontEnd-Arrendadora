<template>
  <div>
    <q-table :rows="customers" :columns="columns">
      <template v-slot:body-cell-actions="props">
        <q-btn flat icon="edit" @click="goToEdit(props.row.id)" />
        <q-btn flat icon="delete" @click="confirmDelete(props.row)" color="negative" />
      </template>
    </q-table>

    <q-dialog v-model="showDialog">
      <q-card>
        <q-card-section> ¿Está seguro que desea eliminar este cliente? </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn flat label="Eliminar" @click="deleteCustomer" color="negative" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import CustomerService from 'src/services/customer.service'

export default {
  name: 'CustomerTable',
  data() {
    return {
      customers: [],
      columns: [
        { name: 'name', label: 'Nombre', field: 'name', align: 'left' },
        { name: 'email', label: 'Email', field: 'email', align: 'left' },
        { name: 'license', label: 'Identificación', field: 'license', align: 'left' },
        { name: 'phone', label: 'Teléfono', field: 'phone', align: 'left' },
        { name: 'actions', label: 'Acciones', field: 'actions', align: 'center' },
      ],
      showDialog: false,
      customerToDelete: null,
    }
  },
  async created() {
    await this.loadCustomers() // Asynchronous handling
  },
  methods: {
    async loadCustomers() {
      try {
        this.customers = await CustomerService.getCustomers() // Ahora solo usa `response.data` directamente
      } catch (error) {
        console.error('Error al cargar los clientes:', error) // Log para depuración
        this.$q.notify({ type: 'negative', message: 'Error al cargar los clientes' })
      }
    },
    goToEdit(id) {
      this.$router.push(`/customers/edit/${id}`)
    },
    confirmDelete(customer) {
      this.customerToDelete = customer
      this.showDialog = true
    },
    async deleteCustomer() {
      try {
        await CustomerService.deleteCustomer(this.customerToDelete.id)
        this.$q.notify({ type: 'positive', message: 'Cliente eliminado correctamente' })
        await this.loadCustomers() // Recargar la lista de clientes
      } catch (error) {
        console.error('Error al eliminar el cliente:', error) // Log para depuración
        this.$q.notify({ type: 'negative', message: 'Error al eliminar el cliente' })
      } finally {
        this.showDialog = false
      }
    },
  },
}
</script>
