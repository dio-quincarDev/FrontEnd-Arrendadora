<template>
  <div>
    <q-table :rows="customers" :columns="columns">
      <template v-slot:top-right>
        <q-btn v-if="isAdmin" color="primary" label="Crear Cliente" to="/customers/create" />
      </template>
      <template v-slot:body-cell-actions="props">
        <q-btn flat icon="edit" @click="goToEdit(props.row.id)" />
        <q-btn
          v-if="isAdmin"
          flat
          icon="delete"
          @click="confirmDelete(props.row)"
          color="negative"
        />
      </template>
    </q-table>

    <q-dialog v-model="showDialog">
      <q-card>
        <q-card-section> ¿Está seguro que desea eliminar este cliente? </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup />
          <q-btn
            flat
            :disable="!isAdmin"
            label="Eliminar"
            @click="deleteCustomer"
            color="negative"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import CustomerService from 'src/services/customer.service'
import { jwtDecode } from 'jwt-decode' // Asegúrate de instalar esta dependencia

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
  computed: {
    isAdmin() {
      const token = localStorage.getItem('jwtToken')
      if (token) {
        try {
          const decodedToken = jwtDecode(token)
          return decodedToken.roles && decodedToken.roles.includes('ROLE_ADMIN') // Ajusta la clave del rol si es diferente
        } catch (error) {
          console.error('Error al decodificar el token:', error)
          return false
        }
      }
      return false
    },
  },
  async created() {
    await this.loadCustomers()
  },
  methods: {
    async loadCustomers() {
      try {
        this.customers = await CustomerService.getCustomers()
      } catch (error) {
        console.error('Error al cargar los clientes:', error)
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
        await this.loadCustomers()
      } catch (error) {
        console.error('Error al eliminar el cliente:', error)
        this.$q.notify({ type: 'negative', message: 'Error al eliminar el cliente' })
      } finally {
        this.showDialog = false
      }
    },
  },
}
</script>
