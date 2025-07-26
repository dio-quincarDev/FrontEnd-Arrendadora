<template>
  <q-page padding>
    <q-card>
      <q-card-section
        class="row items-center justify-between q-gutter-sm q-pb-none q-px-md-lg q-pt-md-lg wrap"
      >
        <div class="text-h6">Gestión de Usuarios</div>
        <q-space />
        <q-input
          dense
          outlined
          v-model="search"
          placeholder="Buscar usuario..."
          class="q-mr-md"
          :style="$q.screen.lt.sm ? 'width: 100%' : 'min-width: 200px'"
        >
          <template v-slot:append>
            <q-icon name="sym_o_search" />
          </template>
        </q-input>
        <q-btn color="accent" label="Crear Usuario" @click="goToCreateUser" />
      </q-card-section>

      <q-card-section class="q-pa-none q-px-md-lg">
        <q-table
          :rows="filteredUsers"
          :columns="columns"
          row-key="id"
          :loading="userStore.loading"
          no-data-label="No hay usuarios disponibles"
          grid
          hide-header
          :card-container-class="$q.screen.lt.sm ? 'q-col-gutter-md' : ''"
        >
          <q-inner-loading :showing="userStore.loading">
            <q-spinner-gears size="50px" color="primary" />
          </q-inner-loading>
          <template v-slot:item="props">
            <div class="q-pa-xs col-xs-12 col-sm-6 col-md-4 col-lg-3 grid-style-transition">
              <q-card class="q-py-sm">
                <q-list dense>
                  <q-item
                    v-for="col in props.cols.filter((col) => col.name !== 'actions')"
                    :key="col.name"
                    style="min-height: 45px;"
                  >
                    <q-item-section>
                      <q-item-label>{{ col.label }}</q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-item-label caption class="text-no-wrap ellipsis">{{ col.value }}</q-item-label>
                    </q-item-section>
                  </q-item>
                  <q-card-actions align="right">
                    <q-btn
                      flat
                      round
                      dense
                      icon="sym_o_edit"
                      color="primary"
                      @click="editUser(props.row.id)"
                    >
                      <q-tooltip>Editar Usuario</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      icon="sym_o_delete"
                      color="negative"
                      @click="confirmDelete(props.row.id)"
                      :disable="props.row.role === 'SUPER_ADMIN' || props.row.id === currentUserId"
                    >
                      <q-tooltip>Eliminar Usuario</q-tooltip>
                    </q-btn>
                    <q-btn
                      flat
                      round
                      dense
                      icon="sym_o_manage_accounts"
                      color="accent"
                      @click="changeRole(props.row)"
                      :disable="props.row.role === 'SUPER_ADMIN' || props.row.id === currentUserId"
                    >
                      <q-tooltip>Cambiar Rol</q-tooltip>
                    </q-btn>
                  </q-card-actions>
                </q-list>
              </q-card>
            </div>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn-dropdown flat round dense dropdown-icon="sym_o_more_vert" no-icon-animation>
                <q-list dense>
                  <q-item clickable v-close-popup @click="editUser(props.row.id)">
                    <q-item-section avatar>
                      <q-icon name="sym_o_edit" color="primary" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Editar</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="confirmDelete(props.row.id)"
                    :disable="props.row.role === 'SUPER_ADMIN' || props.row.id === currentUserId"
                  >
                    <q-item-section avatar>
                      <q-icon name="sym_o_delete" color="negative" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Eliminar</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item
                    clickable
                    v-close-popup
                    @click="changeRole(props.row)"
                    :disable="props.row.role === 'SUPER_ADMIN' || props.row.id === currentUserId"
                  >
                    <q-item-section avatar>
                      <q-icon name="sym_o_manage_accounts" color="accent" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label>Cambiar Rol</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-btn-dropdown>
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <q-dialog v-model="showRoleDialog">
      <q-card>
        <q-card-section>
          <div class="text-h6">Cambiar Rol de Usuario</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-select
            v-model="selectedRole"
            :options="filteredRoleOptions"
            label="Seleccionar Rol"
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="negative" v-close-popup />
          <q-btn flat label="Guardar" color="accent" @click="updateUserRole" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user.module'
import AuthService from 'src/services/auth.service'

const userStore = useUserStore()
const router = useRouter()
const $q = useQuasar()

const currentUserId = AuthService.getCurrentUserId()

const search = ref('') // Nuevo ref para el término de búsqueda

const filteredUsers = computed(() => {
  if (!search.value) {
    return userStore.users
  }
  const searchTerm = search.value.toLowerCase()
  return userStore.users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm),
  )
})

const columns = [
  { name: 'username', label: 'Nombre de Usuario', align: 'left', field: 'username' },
  { name: 'email', label: 'Email', align: 'left', field: 'email' },
  { name: 'role', label: 'Rol', align: 'left', field: 'role' },
  { name: 'actions', label: 'Acciones', align: 'center', field: 'actions', style: 'min-width: 100px' },
]

const showRoleDialog = ref(false)
const userToChangeRole = ref(null)
const selectedRole = ref(null)
const allRoleOptions = [
  { label: 'Usuario', value: 'USERS' },
  { label: 'Administrador', value: 'ADMIN' },
]

const filteredRoleOptions = computed(() => {
  return allRoleOptions
})

onMounted(async () => {
  try {
    await userStore.fetchAllUsers()
  } catch (error) {
    console.error('Error al cargar usuarios en la UI:', error)
    $q.notify({
      type: 'negative',
      message: 'No se pudieron cargar los usuarios. Revisa la conexión con el servidor.',
    })
  }
})

function goToCreateUser() {
  router.push('/admin/users/create')
}

function editUser(id) {
  router.push(`/admin/users/edit/${id}`)
}

function confirmDelete(id) {
  $q.dialog({
    title: 'Confirmar Eliminación',
    message: '¿Estás seguro de que quieres eliminar este usuario?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await userStore.deleteUser(id)
      $q.notify({
        type: 'positive',
        message: 'Usuario eliminado exitosamente.',
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar usuario.',
      })
      console.error('Error al eliminar usuario:', error)
    }
  })
}

function changeRole(user) {
  userToChangeRole.value = user
  selectedRole.value = user.role
  showRoleDialog.value = true
}

async function updateUserRole() {
  try {
    await userStore.updateUserRole(userToChangeRole.value.id, selectedRole.value)
    $q.notify({
      type: 'positive',
      message: 'Rol de usuario actualizado exitosamente.',
    })
    showRoleDialog.value = false
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar el rol del usuario.',
    })
    console.error('Error al actualizar el rol del usuario:', error)
  }
}
</script>
