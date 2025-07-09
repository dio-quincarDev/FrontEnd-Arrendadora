<template>
  <q-page padding>
    <!-- 1. El botón de Crear Cliente ahora llama a un método local -->
    <div class="row justify-between items-center q-mb-md">
      <h1 class="text-h4">Clientes</h1>
      <q-btn
        icon="add"
        label="Crear Cliente"
        color="accent"
        unelevated
        @click="handleCreateCustomer"
      />
    </div>

    <!-- 2. La tabla de clientes ahora escucha los eventos que creamos -->
    <customer-table
      ref="customerTableRef" 
      @edit-customer="handleEditCustomer"
      @view-details="handleViewDetails"
    />

    <!-- 3. Diálogo para el Formulario (Crear/Editar) -->
    <q-dialog v-model="showFormDialog" persistent>
      <!-- Pasamos el cliente seleccionado como prop -->
      <!-- Escuchamos los eventos de guardado o cancelación -->
      <customer-form
        :customer-to-edit="selectedCustomer"
        @customer-saved="onCustomerSaved"
        @cancel="showFormDialog = false"
      />
    </q-dialog>

    <!-- 4. Diálogo para los Detalles -->
    <q-dialog v-model="showDetailsDialog">
      <!-- Pasamos el cliente seleccionado como prop -->
      <!-- Escuchamos los eventos de edición o cierre -->
      <customer-details
        :customer="selectedCustomer"
        @edit="handleEditFromDetails"
        @close="showDetailsDialog = false"
      />
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import CustomerTable from 'src/components/customer/CustomerTable.vue'
import CustomerForm from 'src/components/customer/CustomerForm.vue'
import CustomerDetails from 'src/components/customer/CustomerDetails.vue'

// --- Estado de la Página ---
// Referencia al componente de la tabla para poder llamar a su método refresh()
const customerTableRef = ref(null)

// Controla la visibilidad de los diálogos
const showFormDialog = ref(false)
const showDetailsDialog = ref(false)

// Almacena el cliente que ha sido seleccionado para ver o editar
const selectedCustomer = ref(null)

// --- Manejadores de Eventos ---

// Se activa con el botón "Crear Cliente"
const handleCreateCustomer = () => {
  selectedCustomer.value = null // Nos aseguramos de que no haya ningún cliente seleccionado
  showFormDialog.value = true // Abrimos el diálogo del formulario en modo "crear"
}

// Se activa con el evento @edit-customer de la tabla
const handleEditCustomer = (customer) => {
  selectedCustomer.value = customer // Guardamos el cliente a editar
  showFormDialog.value = true // Abrimos el diálogo del formulario en modo "editar"
}

// Se activa con el evento @view-details de la tabla
const handleViewDetails = (customer) => {
  selectedCustomer.value = customer // Guardamos el cliente a ver
  showDetailsDialog.value = true // Abrimos el diálogo de detalles
}

// Se activa con el evento @customer-saved del formulario
const onCustomerSaved = () => {
  showFormDialog.value = false // Cerramos el formulario
  customerTableRef.value.refresh() // Le decimos a la tabla que se actualice
}

// Se activa con el evento @edit desde el diálogo de detalles
const handleEditFromDetails = (customer) => {
  showDetailsDialog.value = false // Cerramos el diálogo de detalles
  // Abrimos el de edición inmediatamente después
  // Usamos un setTimeout para evitar problemas de renderizado de diálogos superpuestos
  setTimeout(() => {
    handleEditCustomer(customer)
  }, 150)
}
</script>