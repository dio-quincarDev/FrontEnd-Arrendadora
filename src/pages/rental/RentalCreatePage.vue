<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="text-h4 q-mb-md">Crear Nueva Renta</div>
      <rental-form />
    </div>
  </q-page>
</template>

<script>
// Asegúrate de que la ruta de importación sea correcta para tu RentalForm.vue
import RentalForm from 'src/components/rental/RentalForm.vue'

export default {
  name: 'RentalCreatePage', // Nombre de componente que coincida con el propósito
  components: {
    RentalForm, // Registra el componente RentalForm
  },
}
</script>
