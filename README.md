# Car Rent Frontend 🚗

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)

[![Quasar Framework](https://img.shields.io/badge/Quasar_Framework-v2-008080?logo=quasar&logoColor=white)](https://quasar.dev/)

[![Axios](https://img.shields.io/badge/Axios-v1.x-5A29E4?logo=axios&logoColor=white)](https://axios-http.com/)

[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)


Este es el repositorio del frontend para la aplicación de gestión de alquiler de vehículos "Arrendadora Alberto Junior". Está construido utilizando **Vue.js** y el framework **Quasar**, proporcionando una interfaz de usuario moderna, responsiva y fácil de usar para la administración del sistema.

## Tecnologías Utilizadas 🛠️

- **Vue.js 3:** Framework de JavaScript progresivo para construir interfaces de usuario.
- **Quasar Framework:** Framework de componentes Vue.js que facilita la creación de aplicaciones web, SPA, SSR, PWA, Electron y móvil con un solo código base.
- **Axios:** Cliente HTTP basado en promesas para realizar peticiones al backend.
- **Vue Router:** Para la navegación entre las diferentes páginas de la aplicación.
- **JavaScript (ES6+):** El lenguaje de programación principal.
- **npm** o **Yarn:** Administradores de paquetes para instalar las dependencias del proyecto.

## Funcionalidades ⚙️

La aplicación frontend permite a los usuarios (principalmente administradores) interactuar con el sistema backend para gestionar diferentes aspectos del negocio de alquiler de vehículos:

- **Gestión de Clientes:**
    - Listado de clientes con opciones de paginación y filtrado.
    - Creación, edición y visualización de detalles de clientes.
    - Posibilidad de eliminar clientes.
- **Gestión de Vehículos:**
    - Listado de vehículos con información detallada y filtrado.
    - Creación, edición y visualización de detalles de vehículos.
    - Funcionalidad para cambiar el estado de los vehículos (disponible, alquilado, etc.).
- **Gestión de Rentas:**
    - Creación de nuevas reservas de alquiler.
    - Listado de reservas activas, pendientes y finalizadas.
    - Cancelación y finalización de reservas.
    - Visualización de detalles de las rentas.
- **Generación de Reportes (Solo Administradores):**
    - Interfaz para seleccionar el formato de descarga (PDF, Excel).
    - Opción para elegir el período del reporte (mensual, trimestral, anual, personalizado).
    - Descarga de reportes detallados en el formato seleccionado.
- **Dashboard de Administración (Solo Administradores):**
    - Visualización de métricas clave del negocio: total de alquileres, ingresos totales, vehículos únicos alquilados, vehículo más alquilado, nuevos clientes.
    - Seguimiento de las tendencias de alquileres por diferentes períodos (diario, semanal, mensual, etc.).
    - Capacidad de filtrar las métricas por rangos de fechas específicas.

