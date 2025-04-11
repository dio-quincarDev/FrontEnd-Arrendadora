<template>
  <q-form @submit.prevent="submitForm">
    <q-input v-model="customer.name" label="Nombre" outlined />
    <q-input v-model="customer.email" label="Email" outlined />
    <q-input v-model="customer.license" label="Identificación" outlined />
    <q-input v-model="customer.phone" label="Teléfono" outlined />

    <q-btn
      :label="isEditMode ? 'Guardar' : 'Crear'"
      type="submit"
      color="primary"
      class="q-mt-md"
    />
  </q-form>
</template>

<script>
import CustomerService from 'src/services/customer.service'
import { jwtDecode } from 'jwt-decode' // Asegúrate de instalar esta dependencia

export default {
  name: 'CustomerForm',
  data() {
    return {
      customer: {
        name: '',
        email: '',
        license: '',
        phone: '',
      },
      isEditMode: false,
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
    if (this.$route.params.id) {
      this.isEditMode = true
      await this.loadCustomer()
    }
  },
  methods: {
    async loadCustomer() {
      try {
        this.customer = await CustomerService.getCustomerById(this.$route.params.id)
      } catch (error) {
        console.error('Error al cargar el cliente:', error)
        this.$q.notify({ type: 'negative', message: 'Error al cargar el cliente' })
      }
    },
    async submitForm() {
      try {
        const formattedCustomer = {
          name: this.customer.name,
          email: this.customer.email,
          license: this.customer.license,
          phone: this.customer.phone,
          customerStatus: 'ACTIVE', // Estado predeterminado
        }

        if (this.isEditMode) {
          await CustomerService.updateCustomer(this.$route.params.id, formattedCustomer)
          this.$q.notify({ type: 'positive', message: 'Cliente actualizado correctamente' })
        } else {
          await CustomerService.createCustomer(formattedCustomer)
          this.$q.notify({ type: 'positive', message: 'Cliente creado correctamente' })
        }

        this.$router.push('/customers') // Redirigir después de la operación
      } catch (error) {
        console.error('Error al guardar el cliente:', error)
        this.$q.notify({ type: 'negative', message: 'Error al guardar el cliente' })
      }
    },
  },
}
</script>
