// src/router/routes.js

import HomePage from 'pages/HomePage.vue'
import CustomerListPage from 'pages/customer/CustomerListPage.vue'
import CustomerCreatePage from 'pages/customer/CustomerCreatePage.vue'
import CustomerDetailsPage from 'pages/customer/CustomerDetailsPage.vue'
import CustomerEditPage from 'pages/customer/CustomerEditPage.vue'
import VehicleListPage from 'pages/vehicle/VehicleListPage.vue'
import VehicleCreatePage from 'pages/vehicle/VehicleCreatePage.vue'
import VehicleDetailsPage from 'pages/vehicle/VehicleDetailsPage.vue'
import VehicleEditPage from 'pages/vehicle/VehicleEditPage.vue'
import LoginPage from 'pages/auth/LoginPage.vue'
import RegisterPage from 'pages/auth/RegisterPage.vue'
import RentalListPage from 'pages/rental/RentalListPage.vue'
import RentalCreatePage from 'pages/rental/RentalCreatePage.vue'
import RentalDetailsPage from 'pages/rental/RentalDetailsPage.vue'
import RentalEditPage from 'pages/rental/RentalEditPage.vue'
import ErrorNotFound from 'pages/ErrorNotFound.vue'
import MainLayout from 'layouts/MainLayout.vue'
import AuthLayout from 'layouts/AuthLayout.vue'
import AdminDashboardPage from 'pages/report/AdminDashboardPage.vue' // Mantenemos la importación

// Subrutas para autenticación
const authRoutes = {
  path: '/auth',
  component: AuthLayout,
  children: [
    { path: 'login', component: LoginPage },
    { path: 'register', component: RegisterPage },
  ],
}

// Subrutas para clientes
const customerRoutes = [
  { path: 'customers', component: CustomerListPage },
  { path: 'customers/create', component: CustomerCreatePage },
  { path: 'customers/:id', component: CustomerDetailsPage, props: true },
  { path: 'customers/edit/:id', component: CustomerEditPage, props: true },
]

// Subrutas para vehículos
const vehicleRoutes = [
  { path: 'vehicles', component: VehicleListPage },
  { path: 'vehicles/create', component: VehicleCreatePage },
  { path: 'vehicles/edit/:id', component: VehicleEditPage, props: true },
  { path: 'vehicles/:id', component: VehicleDetailsPage, props: true },
]

// Subrutas para rentas
const rentalRoutes = [
  { path: 'rentals', component: RentalListPage },
  { path: 'rentals/create', component: RentalCreatePage },
  { path: 'rentals/edit/:id', component: RentalEditPage, props: true },
  { path: 'rentals/:id', component: RentalDetailsPage, props: true },
]

// Rutas principales
export default [
  authRoutes,
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', component: HomePage },
      ...customerRoutes, // Agregar rutas de clientes
      ...vehicleRoutes, // Agregar ruta de vehiculos
      ...rentalRoutes, // Agregar rutas de rentas
      // Eliminamos la ruta a ReportsPage
      {
        path: 'reports/dashboard',
        component: AdminDashboardPage,
        meta: { requiresAuth: true, roles: ['ADMIN'] },
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: ErrorNotFound, // Ruta para manejar errores 404
  },
]
