# Car Rent Frontend 🚗

[![Vue.js](https://img.shields.io/badge/Vue.js-3.x-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Quasar Framework](https://img.shields.io/badge/Quasar_Framework-v2-008080?logo=quasar&logoColor=white)](https://quasar.dev/)
[![Axios](https://img.shields.io/badge/Axios-v1.x-5A29E4?logo=axios&logoColor=white)](https://axios-http.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

Este repositorio contiene el código fuente del frontend para la aplicación de gestión de alquiler de vehículos "Arrendadora Alberto Junior". Desarrollado con **Vue.js 3** y **Quasar Framework**, ofrece una interfaz de usuario moderna, responsiva e intuitiva para la administración eficiente de operaciones de alquiler.

## 🚀 Tecnologías Clave

Este proyecto está construido sobre una pila de tecnologías robusta y moderna:

*   **Vue.js 3:** Un framework progresivo de JavaScript para construir interfaces de usuario reactivas y de alto rendimiento.
*   **Quasar Framework:** Un framework de UI basado en Vue.js que permite desarrollar aplicaciones para múltiples plataformas (SPA, SSR, PWA, Mobile, Electron) desde una única base de código. Proporciona un conjunto completo de componentes Material Design.
*   **Axios:** Cliente HTTP basado en promesas para realizar peticiones eficientes y simplificadas al backend.
*   **Vue Router:** El enrutador oficial para Vue.js, esencial para la navegación declarativa y dinámica entre las vistas de la aplicación.
*   **Pinia:** El store de estado intuitivo y ligero para Vue.js, utilizado para la gestión centralizada del estado de la aplicación.
*   **JavaScript (ES6+):** El lenguaje de programación principal, utilizando las últimas características para un código más limpio y eficiente.
*   **npm / Yarn:** Administradores de paquetes utilizados para la gestión de dependencias del proyecto.

## ✨ Funcionalidades Principales

La aplicación frontend permite a los usuarios interactuar con el sistema backend para gestionar diversos aspectos del negocio de alquiler de vehículos, con un enfoque en la administración y la eficiencia operativa:

*   **Autenticación y Autorización:**
    *   Inicio de sesión y registro de usuarios.
    *   Control de acceso basado en roles (`USER`, `ADMIN`, `SUPER_ADMIN`) para proteger rutas y funcionalidades específicas.
*   **Gestión de Usuarios (Rol SUPER_ADMIN):**
    *   Listado completo de usuarios del sistema.
    *   Creación, edición y eliminación de cuentas de usuario.
    *   Actualización de roles de usuario con validaciones de jerarquía.
*   **Gestión de Clientes:**
    *   Visualización, creación, edición y eliminación de perfiles de clientes.
    *   Funcionalidades de paginación y filtrado para una gestión eficiente.
*   **Gestión de Vehículos:**
    *   Administración completa del inventario de vehículos (listado, creación, edición, visualización de detalles).
    *   Capacidad para actualizar el estado de disponibilidad de los vehículos.
*   **Gestión de Rentas:**
    *   Registro y seguimiento de nuevas reservas de alquiler.
    *   Gestión del ciclo de vida de las rentas (activas, pendientes, finalizadas, cancelación).
    *   Visualización detallada de cada transacción de alquiler.
*   **Reportes y Análisis (Roles ADMIN/SUPER_ADMIN):**
    *   **Dashboard Administrativo:** Presentación de métricas clave del negocio (ingresos, alquileres, clientes nuevos, etc.) con visualizaciones interactivas.
    *   **Generación de Reportes:** Herramientas para generar y descargar reportes detallados en formatos como PDF y Excel, con opciones de filtrado por período.

## 🛠️ Configuración y Ejecución

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

### Prerrequisitos

Asegúrate de tener instalado lo siguiente:

*   [Node.js](https://nodejs.org/en/) (versión LTS recomendada)
*   [npm](https://www.npmjs.com/) (viene con Node.js) o [Yarn](https://yarnpkg.com/)

### Instalación

1.  **Clona el repositorio:**
    ```bash
    git clone https://github.com/tu-usuario/car-rent-frontend.git
    cd car-rent-frontend
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    # o
    yarn install
    ```

### Ejecución en Modo Desarrollo

Para iniciar el servidor de desarrollo con recarga en caliente:

```bash
quasar dev
```

Esto abrirá la aplicación en tu navegador predeterminado (generalmente `http://localhost:8080`).

### Construcción para Producción

Para compilar la aplicación para producción:

```bash
quasar build
```

Los archivos de producción se generarán en el directorio `dist/spa`.

## 🤝 Contribución

Las contribuciones son bienvenidas. Si deseas contribuir, por favor, sigue estos pasos:

1.  Haz un fork del repositorio.
2.  Crea una nueva rama (`git checkout -b feature/nueva-funcionalidad`).
3.  Realiza tus cambios y haz commit (`git commit -m 'feat: Añadir nueva funcionalidad'`).
4.  Haz push a tu rama (`git push origin feature/nueva-funcionalidad`).
5.  Abre un Pull Request.

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.