<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title> Arrendadora Alberto Junior </q-toolbar-title>

        <q-btn flat label="Cerrar sesión" icon="logout" @click="logout" />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list>
        <q-item-label header> Menú </q-item-label>

        <q-item to="/" clickable v-ripple exact>
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>Inicio</q-item-section>
        </q-item>

        <q-item to="/customers" clickable v-ripple>
          <q-item-section avatar><q-icon name="people" /></q-item-section>
          <q-item-section>Clientes</q-item-section>
        </q-item>

        <q-item to="/vehicles" clickable v-ripple>
          <q-item-section avatar><q-icon name="directions_car" /></q-item-section>
          <q-item-section>Vehículos</q-item-section>
        </q-item>

        <q-item to="/rentals" clickable v-ripple>
          <q-item-section avatar><q-icon name="key" /></q-item-section>
          <q-item-section>Rentas</q-item-section>
        </q-item>

        <!-- Corregir ruta del dashboard y agrupar reportes -->
        <q-item to="/reports" clickable v-ripple>
          <q-item-section avatar><q-icon name="assessment" /></q-item-section>
          <q-item-section>Reportes</q-item-section>
        </q-item>

        <q-item to="/reports/dashboard" clickable v-ripple>
          <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
          <q-item-section>Dashboard</q-item-section>
          <!-- Nombre consistente -->
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
  router.push('/auth/login')
}
</script>

<style scoped>
/* Puedes personalizar colores o estilos adicionales aquí */
</style>
