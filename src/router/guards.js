import AuthService from 'src/services/auth.service'
import { Notify } from 'quasar'
// eslint-disable-next-line no-unused-vars
import { useRouter } from 'vue-router'

export function authGuard(to, from, next) {
  const isAuthenticated = AuthService.isAuthenticated()

  if (to.meta.requiresAuth && !isAuthenticated) {
    Notify.create({
      type: 'negative',
      message: 'Necesitas iniciar sesión para acceder',
    })
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    })
  } else {
    next()
  }
}
