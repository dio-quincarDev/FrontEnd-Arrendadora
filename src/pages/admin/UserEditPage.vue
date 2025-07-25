<template>
  <q-page padding>
    <q-card>
      <q-card-section>
        <div class="text-h6">Editar Usuario</div>
      </q-card-section>

      <q-card-section v-if="userStore.currentUser">
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            filled
            v-model="userStore.currentUser.username"
            label="Nombre de Usuario *"
            type="username"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Por favor, ingresa un nombre de usuario']"
          />

          <q-input
            filled
            v-model="userStore.currentUser.email"
            label="Email *"
            type="email"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Por favor, ingresa un email',
              (val) => /.+@.+\..+/.test(val) || 'Por favor, ingresa un email válido',
            ]"
          />

          <q-select
            filled
            v-model="userStore.currentUser.role"
            :options="roleOptions"
            label="Rol *"
            emit-value
            map-options
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Por favor, selecciona un rol']"
          />

          <div>
            <q-btn
              label="Guardar Cambios"
              type="submit"
              color="accent"
              :loading="userStore.loading"
            />
            <q-btn
              label="Cancelar"
              type="reset"
              color="negative"
              flat
              class="q-ml-sm"
              @click="router.back()"
            />
          </div>
        </q-form>
      </q-card-section>
      <q-card-section v-else>
        <q-spinner color="primary" size="3em" />
        <div>Cargando usuario...</div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user.module'

const userStore = useUserStore()
const route = useRoute()
const router = useRouter()
const $q = useQuasar()

const userId = ref(null)

const roleOptions = [
  { label: 'Usuario', value: 'USERS' },
  { label: 'Administrador', value: 'ADMIN' },
  { label: 'Super Administrador', value: 'SUPER_ADMIN' },
]

onMounted(() => {
  userId.value = route.params.id
  userStore.fetchUserById(userId.value)
})

// Watch for changes in route.params.id if navigating between edit pages
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      userId.value = newId
      userStore.fetchUserById(userId.value)
    }
  },
)

async function onSubmit() {
  try {
    await userStore.updateUser(userId.value, userStore.currentUser)
    $q.notify({
      type: 'positive',
      message: 'Usuario actualizado exitosamente.',
    })
    router.push('/admin/users')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar usuario.',
    })
    console.error('Error al actualizar usuario:', error)
  }
}
</script>
