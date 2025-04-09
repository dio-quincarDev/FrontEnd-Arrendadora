<template>
  <div>
    <q-card>
      <q-card-section>
        <div class="text-h6">{{ customer.name }}</div>
        <div>Email: {{ customer.email }}</div>
        <div>Identificación: {{ customer.license }}</div>
        <div>Teléfono: {{ customer.phone }}</div>
        <div>Estado: {{ customer.customerStatus }}</div>
        <div>Creado: {{ formatDate(customer.createdAt) }}</div>
        <div>Actualizado: {{ formatDate(customer.updatedAt) }}</div>
      </q-card-section>
      <q-card-actions>
        <q-btn label="Editar" @click="goToEdit" color="primary" />
        <q-btn label="Volver" @click="goBack" flat />
      </q-card-actions>
    </q-card>
  </div>
</template>

<script>
import CustomerService from 'src/services/customer.service'
import { date } from 'quasar'

export default {
  name: 'CustomerDetails',
  data() {
    return {
      customer: {}, // Inicia con un objeto vacío para manejar datos dinámicos
    }
  },
  async created() {
    await this.loadCustomer() // Modulariza la carga de datos en un método
  },
  methods: {
    async loadCustomer() {
      try {
        // Carga los detalles del cliente desde el servicio optimizado
        this.customer = await CustomerService.getCustomerById(this.$route.params.id)
      } catch (error) {
        console.error('Error al cargar los detalles del cliente:', error) // Log detallado
        this.$q.notify({ type: 'negative', message: 'Error al cargar los detalles del cliente' })
      }
    },
    goToEdit() {
      this.$router.push(`/customers/edit/${this.$route.params.id}`) // Navegación a la página de edición
    },
    goBack() {
      this.$router.push('/customers') // Navegación para volver a la lista de clientes
    },
    formatDate(isoDate) {
      if (!isoDate) return '' // Validación si la fecha es inválida
      return date.formatDate(isoDate, 'YYYY-MM-DD HH:mm') // Formatea la fecha
    },
  },
}
</script>
