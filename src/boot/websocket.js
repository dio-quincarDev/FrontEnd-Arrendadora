import { boot } from 'quasar/wrappers'
import { Client } from '@stomp/stompjs'
import { useNotificationStore } from 'src/stores/notification.module'

export default boot(({ app }) => {
  const baseUrl = process.env.VITE_API_BASE_URL
  let brokerURL

  if (baseUrl && baseUrl.startsWith('http')) {
    // Production: Full URL from .env, convert http/https to ws/wss
    const wsUrl = baseUrl.replace(/^http/, 'ws')
    brokerURL = `${wsUrl}/v1/admin-alerts`
  } else {
    // Development: Relative path from .env or undefined, use browser location
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
    const host = window.location.host
    brokerURL = `${protocol}//${host}/v1/admin-alerts`
  }

  console.log(`[WebSocket] Intentando conectar a: ${brokerURL}`)

  const client = new Client({
    brokerURL: brokerURL,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  })

  client.onConnect = function (frame) {
    console.log('[WebSocket] Conectado: ' + frame)
    client.subscribe('/topic/rental-alerts', message => {
      console.log('[WebSocket] Mensaje recibido: ' + message.body)
      const notificationStore = useNotificationStore()
      notificationStore.addNotification(message.body)

      app.config.globalProperties.$q.notify({
        message: message.body,
        color: 'info',
        position: 'top',
        timeout: 3000
      })
    })
  }

  client.onStompError = function (frame) {
    console.error('[WebSocket] Error de STOMP: ' + frame.headers['message'])
    console.error('[WebSocket] Detalles: ' + frame.body)
  }

  client.activate()
})
