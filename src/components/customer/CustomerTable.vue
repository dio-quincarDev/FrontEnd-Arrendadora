<template>
  <q-card flat class="q-pa-md">
    <q-card-section>
      <div class="row items-center q-gutter-md">
        <div class="col">
          <h2 class="text-h5 text-dark q-my-none">Gestión de Clientes</h2>
          <p class="text-grey-7 q-mb-none">Aquí puedes administrar todos tus clientes.</p>
        </div>
        <div class="col-12 col-md-auto">
          <q-input
            outlined
            dense
            v-model="filter"
            placeholder="Buscar cliente..."
            clearable
            class="q-mb-md"
          >
            <template v-slot:append>
              <q-icon name="sym_o_search" />
            </template>
          </q-input>
        </div>
      </div>
    </q-card-section>

    <q-card-section class="q-pa-none">
      <q-table
        :rows="filteredCustomers"
        :columns="columns"
        row-key="id"
        :loading="loading"
        flat
        :grid="isMobile"
        :hide-header="isMobile"
      >
        <template v-slot:item="props">
          <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-item">
            <q-card flat bordered>
              <q-card-section class="text-center">
                <div class="text-h6">{{ props.row.name }}</div>
                <div class="text-subtitle2 text-grey-8">{{ props.row.email }}</div>
              </q-card-section>
              <q-separator />
              <q-card-section class="flex flex-center">
                <q-list dense>
                  <q-item>
                    <q-item-section avatar><q-icon name="sym_o_badge" /></q-item-section>
                    <q-item-section>Identificación: {{ props.row.license }}</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="sym_o_phone" /></q-item-section>
                    <q-item-section>Teléfono: {{ props.row.phone }}</q-item-section>
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="sym_o_verified_user" /></q-item-section>
                    <q-item-section
                      >Estado:
                      {{
                        props.row.customerStatus === 'ACTIVE' ? 'Activo' : 'Inactivo'
                      }}</q-item-section
                    >
                  </q-item>
                  <q-item>
                    <q-item-section avatar><q-icon name="sym_o_event" /></q-item-section>
                    <q-item-section
                      >Creado:
                      {{ $q.date.formatDate(props.row.createdAt, 'DD/MM/YYYY') }}</q-item-section
                    >
                  </q-item>
                </q-list>
              </q-card-section>
              <q-separator />
              <q-card-actions align="right">
                <q-btn
                  flat
                  round
                  dense
                  icon="sym_o_info"
                  color="info"
                  @click="emitDetailsEvent(props.row)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="sym_o_edit"
                  color="primary"
                  @click="emitEditEvent(props.row)"
                />
                <q-btn
                  v-if="isAdmin"
                  flat
                  round
                  dense
                  icon="sym_o_delete"
                  color="negative"
                  @click="confirmDelete(props.row)"
                />
              </q-card-actions>
            </q-card>
          </div>
        </template>

        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <q-btn-dropdown flat round dense dropdown-icon="sym_o_more_vert" no-icon-animation>
              <q-list dense>
                <q-item clickable v-close-popup @click="emitDetailsEvent(props.row)">
                  <q-item-section avatar>
                    <q-icon name="sym_o_info" color="info" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Ver Detalles</q-item-label>
                  </q-item-section>
                </q-item>

                <q-item clickable v-close-popup @click="emitEditEvent(props.row)">
                  <q-item-section avatar>
                    <q-icon name="sym_o_edit" color="primary" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Editar</q-item-label>
                  </q-item-section>
                </q-item>

                <q-separator v-if="isAdmin" />

                <q-item v-if="isAdmin" clickable v-close-popup @click="confirmDelete(props.row)">
                  <q-item-section avatar>
                    <q-icon name="sym_o_delete" color="negative" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>Eliminar (Admin)</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-td>
        </template>
      </q-table>
    </q-card-section>
  </q-card>

  <q-dialog v-model="showDialog" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="sym_o_warning" color="warning" text-color="white" class="q-mr-md" />
        <span class="q-ml-sm">
          ¿Estás seguro de que quieres eliminar al cliente
          <strong>"{{ customerToDelete ? customerToDelete.name : '' }}"</strong>? Esta acción no se
          puede deshacer.
        </span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" color="grey" v-close-popup />
        <q-btn
          label="Eliminar"
          color="negative"
          unelevated
          :disable="!isAdmin"
          @click="deleteCustomer"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import CustomerService from 'src/services/customer.service'
import { jwtDecode } from 'jwt-decode'
import { useQuasar, date } from 'quasar'

export default {
  name: 'CustomerTable',
  emits: ['edit-customer', 'view-details'],
  setup() {
    const $q = useQuasar()
    return { $q }
  },
  data() {
    return {
      customers: [],
      filter: '',
      columns: [
        {
          name: 'name',
          required: true,
          label: 'Nombre',
          align: 'left',
          field: 'name',
          sortable: true,
        },
        { name: 'email', label: 'Email', align: 'left', field: 'email', sortable: true },
        {
          name: 'license',
          label: 'Identificación',
          align: 'left',
          field: 'license',
          sortable: true,
        },
        { name: 'phone', label: 'Teléfono', align: 'left', field: 'phone', sortable: true },
        {
          name: 'customerStatus',
          label: 'Estado',
          align: 'center',
          field: 'customerStatus',
          sortable: true,
          format: (val) => (val === 'ACTIVE' ? 'Activo' : 'Inactivo'),
        },
        {
          name: 'createdAt',
          label: 'Creado',
          align: 'left',
          field: 'createdAt',
          sortable: true,
          format: (val) => date.formatDate(val, 'DD/MM/YYYY'),
        },
        { name: 'actions', label: 'Acciones', field: 'actions', align: 'center', sortable: false },
      ],
      loading: false,
      showDialog: false,
      customerToDelete: null,
    }
  },
  computed: {
    isMobile() {
      return this.$q.screen.lt.md
    },
    filteredCustomers() {
      if (!this.filter) {
        return this.customers
      }
      const lowerCaseFilter = this.filter.toLowerCase()
      return this.customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(lowerCaseFilter) ||
          customer.email.toLowerCase().includes(lowerCaseFilter) ||
          customer.license.toLowerCase().includes(lowerCaseFilter) ||
          customer.phone.toLowerCase().includes(lowerCaseFilter),
      )
    },
    isAdmin() {
      const token = localStorage.getItem('authToken')
      if (!token) {
        return false
      }
      try {
        const decodedToken = jwtDecode(token)
        const userRole = decodedToken.role || ''
        return userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'
      } catch (error) {
        console.error('Error al decodificar el token:', error)
        return false
      }
    },
  },
  async created() {
    await this.loadCustomers()
  },
  methods: {
    async refresh() {
      await this.loadCustomers()
    },
    async loadCustomers() {
      this.loading = true
      try {
        this.customers = await CustomerService.getCustomers()
        console.log('Datos de clientes recibidos:', this.customers) // Depuración
      } catch (error) {
        console.error('Error al cargar los clientes:', error)
        this.$q.notify({ type: 'negative', message: 'Error al cargar los clientes' })
      } finally {
        this.loading = false
      }
    },
    emitEditEvent(customer) {
      this.$emit('edit-customer', customer)
    },
    emitDetailsEvent(customer) {
      this.$emit('view-details', customer)
    },
    confirmDelete(customer) {
      this.customerToDelete = customer
      this.showDialog = true
    },
    async deleteCustomer() {
      this.loading = true
      try {
        await CustomerService.deleteCustomer(this.customerToDelete.id)
        this.$q.notify({ type: 'positive', message: 'Cliente eliminado correctamente' })
        await this.loadCustomers()
      } catch (error) {
        console.error('Error al eliminar el cliente:', error)
        const errorMessage = error.response?.data?.message || 'Error al eliminar el cliente.'
        this.$q.notify({ type: 'negative', message: errorMessage })
      } finally {
        this.showDialog = false
        this.loading = false
        this.customerToDelete = null
      }
    },
  },
}
</script>

<style scoped lang="scss">
/* No se necesitan estilos adicionales aquí, la consistencia la da app.scss */
</style>
