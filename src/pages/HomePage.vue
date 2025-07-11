<template>
  <q-page padding>
    <div class="q-pa-md">
      <div class="row items-center q-gutter-md q-mb-lg">
        <q-icon name="sym_o_dashboard" size="2.5em" color="accent" />
        <h1 class="text-h4 q-my-none">Bienvenido a tu Dashboard</h1>
      </div>

      <p class="text-grey-8 q-mb-xl">
        Aquí encontrarás un resumen rápido de la actividad de tu sistema de gestión de rentas.
      </p>

      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-4">
          <q-card flat bordered class="q-pa-md">
            <q-card-section>
              <div class="text-h6">Rentas Activas</div>
              <div class="text-h4 text-accent q-mt-sm">--</div>
              <p class="text-grey-7">Número de rentas actualmente en curso.</p>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card flat bordered class="q-pa-md">
            <q-card-section>
              <div class="text-h6">Vehículos Disponibles</div>
              <div class="text-h4 text-positive q-mt-sm">--</div>
              <p class="text-grey-7">Vehículos listos para ser alquilados.</p>
            </q-card-section>
          </q-card>
        </div>

        <div class="col-12 col-md-4">
          <q-card flat bordered class="q-pa-md">
            <q-card-section>
              <div class="text-h6">Clientes Registrados</div>
              <div class="text-h4 text-info q-mt-sm">--</div>
              <p class="text-grey-7">Total de clientes en tu base de datos.</p>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="q-mt-xl text-center">
        <q-btn
          label="Ver todas las Rentas"
          icon="sym_o_receipt_long"
          color="primary"
          unelevated
          to="/rentals"
          class="q-mr-md"
        />
        <q-btn
          label="Administrar Vehículos"
          icon="sym_o_directions_car"
          color="secondary"
          outline
          to="/vehicles"
        />
      </div>
    </div>
  </q-page>
</template>

<script setup>
// Aquí podrías importar servicios para cargar los datos de las métricas
// Por ejemplo:
// import { ref, onMounted } from 'vue';
// import RentalService from 'src/services/rental.service';
// import VehicleService from 'src/services/vehicle.service';
// import CustomerService from 'src/services/customer.service';

// const activeRentals = ref(0);
// const availableVehicles = ref(0);
// const registeredCustomers = ref(0);

// onMounted(async () => {
//   // Cargar datos de ejemplo o reales aquí
//   activeRentals.value = 5; // Ejemplo
//   availableVehicles.value = 12; // Ejemplo
//   registeredCustomers.value = 150; // Ejemplo
// });
</script>