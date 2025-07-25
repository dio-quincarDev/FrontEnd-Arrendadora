<template>
  <q-page padding>
    <q-card>
      <q-card-section>
        <div class="text-h6">Crear Nuevo Usuario</div>
      </q-card-section>

      <q-card-section>
        <q-form @submit="onSubmit" class="q-gutter-md">
          <q-input
            filled
            v-model="user.username"
            label="Nombre de Usuario *"
            type="username"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Por favor, ingresa un nombre de usuario']"
          />

          <q-input
            filled
            v-model="user.email"
            label="Email *"
            type="email"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || 'Por favor, ingresa un email',
              (val) => /.+@.+\..+/.test(val) || 'Por favor, ingresa un email válido',
            ]"
          />

          <q-input
            filled
            v-model="user.password"
            label="Contraseña *"
            type="password"
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Por favor, ingresa una contraseña']"
          />

          <q-select
            filled
            v-model="user.role"
            :options="roleOptions"
            label="Rol *"
            emit-value
            map-options
            lazy-rules
            :rules="[(val) => (val && val.length > 0) || 'Por favor, selecciona un rol']"
          />

          <div>
            <q-btn
              label="Crear Usuario"
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
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useUserStore } from 'src/stores/user.module'

const userStore = useUserStore()
const router = useRouter()
const $q = useQuasar()

const user = ref({
  username: '',
  email: '',
  password: '',
  role: 'USERS', // Default role
})

const roleOptions = [
  { label: 'Usuario', value: 'USERS' },
  { label: 'Administrador', value: 'ADMIN' },
]

async function onSubmit() {
  try {
    await userStore.createUser(user.value)
    $q.notify({
      type: 'positive',
      message: 'Usuario creado exitosamente.',
    })
    router.push('/admin/users')
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al crear usuario.',
    })
    console.error('Error al crear usuario:', error)
  }
}
</script>
