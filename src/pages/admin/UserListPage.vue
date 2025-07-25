<template>
  <q-page padding>
    <q-card>
      <q-card-section class="row items-center justify-between">
        <div class="text-h6">Gestión de Usuarios</div>
        <q-btn color="accent" label="Crear Usuario" @click="goToCreateUser" />
      </q-card-section>

      <q-card-section>
        <q-table
          :rows="userStore.users"
          :columns="columns"
          row-key="id"
          :loading="userStore.loading"
          no-data-label="No hay usuarios disponibles"
        >
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                icon="sym_o_edit"
                color="primary"
                size="sm"
                @click="editUser(props.row.id)"
              />
              <q-btn
                flat
                round
                icon="sym_o_delete"
                color="negative"
                size="sm"
                @click="confirmDelete(props.row.id)"
                :disable="props.row.role === 'SUPER_ADMIN' || props.row.id === currentUserId"
              />
              <q-btn
                flat
                round
                icon="sym_o_manage_accounts"
                color="accent"
                size="sm"
                @click="changeRole(props.row)"
                :disable="props.row.role === 'SUPER_ADMIN' || props.row.id === currentUserId"
              />
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

const columns = [
  { name: 'id', label: 'ID', align: 'left', field: 'id' },
  { name: 'username', label: 'Nombre de Usuario', align: 'left', field: 'username' },
  { name: 'email', label: 'Email', align: 'left', field: 'email' },
  { name: 'role', label: 'Rol', align: 'left', field: 'role' },
  { name: 'actions', label: 'Acciones', align: 'center', field: 'actions' },
]

const showRoleDialog = ref(false)
const userToChangeRole = ref(null)
const selectedRole = ref(null)
const allRoleOptions = [
  { label: 'Usuario', value: 'USER' },
  { label: 'Administrador', value: 'ADMIN' },
  { label: 'Super Administrador', value: 'SUPER_ADMIN' },
]

const filteredRoleOptions = computed(() => {
  if (!userToChangeRole.value) {
    return allRoleOptions
  }

  if (userToChangeRole.value.role === 'SUPER_ADMIN') {
    return allRoleOptions.filter((option) => option.value === 'SUPER_ADMIN')
  }
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
