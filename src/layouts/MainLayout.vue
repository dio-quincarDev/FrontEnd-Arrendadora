<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="main-header">
      <q-toolbar>
        <q-btn flat dense round icon="sym_o_menu" aria-label="Menu" @click="toggleLeftDrawer" />

        <q-toolbar-title class="app-title"> Arrendadora Alberto Junior </q-toolbar-title>

        <q-btn
          flat
          dense
          round
          icon="sym_o_logout"
          aria-label="Cerrar sesión"
          @click="logout"
          class="logout-btn"
        />
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="250"
      :breakpoint="700"
      class="q-drawer-custom"
    >
      <q-list>
        <q-item-label header class="menu-header"> Menú Principal </q-item-label>

        <q-item to="/" clickable v-ripple :exact="true" class="q-router-link--active-subtle">
          <q-item-section avatar><q-icon name="sym_o_home" /></q-item-section>
          <q-item-section>Inicio</q-item-section>
        </q-item>
        <q-item
          to="/reports/dashboard"
          clickable
          v-ripple
          :exact="true"
          class="q-router-link--active-subtle"
        >
          <q-item-section avatar><q-icon name="sym_o_dashboard" /></q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-separator class="menu-separator" />

        <q-item-label header class="menu-header"> Gestión </q-item-label>

        <q-item
          to="/rentals"
          clickable
          v-ripple
          :exact="false"
          class="q-router-link--active-subtle"
        >
          <q-item-section avatar><q-icon name="sym_o_key" /></q-item-section>
          <q-item-section>Rentas</q-item-section>
        </q-item>

        <q-item
          to="/vehicles"
          clickable
          v-ripple
          :exact="false"
          class="q-router-link--active-subtle"
        >
          <q-item-section avatar><q-icon name="sym_o_directions_car" /></q-item-section>
          <q-item-section>Vehículos</q-item-section>
        </q-item>

        <q-item
          to="/customers"
          clickable
          v-ripple
          :exact="false"
          class="q-router-link--active-subtle"
        >
          <q-item-section avatar><q-icon name="sym_o_people" /></q-item-section>
          <q-item-section>Clientes</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const leftDrawerOpen = ref(false)
const router = useRouter()

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function logout() {
  localStorage.removeItem('authToken')
  // Aquí podrías añadir una notificación de éxito con QNotify
  router.push('/auth/login')
}
</script>

<style scoped lang="scss">
/* ¡Importante: asegúrate de que lang="scss" esté presente! */

/* Si necesitas ajustar algo específico del header que no puedes lograr con app.scss */

/* Estilo para el título de la aplicación en la barra superior */
.app-title {
  font-weight: 700;
  color: $dark; /* Usando la variable SCSS */
}

/* Estilo para el botón de cerrar sesión */
/* .logout-btn {
  color: $negative;
} */

/* Estilo para el QDrawer si necesitas ajustes que no están en app.scss */
/* .q-drawer-custom {
  background-color: $primary;
} */

/* Estilo para el encabezado de las secciones del menú */
.menu-header {
  font-weight: 700;
  padding-left: 16px;
  padding-top: 16px;
  padding-bottom: 8px;
  color: $dark; /* Usando la variable SCSS */
}

/* Estilo para el separador del menú */
.menu-separator {
  margin: 16px 0;
  background-color: $secondary; /* Usando la variable SCSS */
}

/* Este es un estilo propuesto para el enlace activo del router, más sutil */
.q-list .q-router-link--active-subtle.q-router-link--active {
  background-color: rgba($accent, 0.1);
  color: $accent; /* Usando la variable SCSS */
  font-weight: 500;
  border-left: 4px solid $accent; /* Borde izquierdo para destacar */
  border-radius: 0 8px 8px 0; /* Bordes redondeados solo a la derecha */
  padding-left: 12px; /* Ajustar padding para compensar el borde */
}
</style>
