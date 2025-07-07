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
      // Usar 'authToken' como confirmamos
      const token = localStorage.getItem('authToken')
      console.log('DEBUG (CustomerTable): Token de localStorage (authToken):', token)

      if (!token) {
        console.log('DEBUG (CustomerTable): No hay token (authToken). isAdmin = false.')
        return false
      }

      try {
        const decodedToken = jwtDecode(token)
        console.log('DEBUG (CustomerTable): Token decodificado:', decodedToken)

        // --- ¡¡¡CAMBIO CRÍTICO AQUÍ!!! ---
        // 1. Acceder a 'decodedToken.role' (singular)
        // 2. Comparar el valor directamente con 'ADMIN' (exactamente como está en el payload)
        const userRole = decodedToken.role // Accedemos a la propiedad 'role' (singular)
        console.log('DEBUG (CustomerTable): Rol en el token (valor real):', userRole)

        const hasAdminRole = userRole === 'ADMIN' // Comparamos si el valor es exactamente 'ADMIN'

        console.log('DEBUG (CustomerTable): ¿Tiene rol ADMIN?', hasAdminRole)
        // --- FIN CAMBIO CRÍTICO ---

        return hasAdminRole
      } catch (error) {
        console.error('DEBUG (CustomerTable): Error al decodificar el token con authToken:', error)
        return false
      }
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
