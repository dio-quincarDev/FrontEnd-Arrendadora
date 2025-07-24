
import { boot } from 'quasar/wrappers';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { useNotificationStore } from 'src/stores/notification.module';

export default boot(({ app }) => {
  const socket = new SockJS('http://localhost:8080/admin-alerts');
  const stompClient = Stomp.over(socket);

  stompClient.connect({}, frame => {
    console.log('Conectado: ' + frame);
    stompClient.subscribe('/topic/rental-alerts', message => {
      console.log('Mensaje recibido: ' + message.body);
      const notificationStore = useNotificationStore();
      notificationStore.addNotification(message.body);

      app.config.globalProperties.$q.notify({
        message: message.body,
        color: 'info',
        position: 'top',
        timeout: 3000
      });
    });
  }, error => {
    console.error('Error de conexión WebSocket:', error);
  });

  // Opcional: Hacer stompClient disponible globalmente o a través de Pinia
  // app.config.globalProperties.$stompClient = stompClient;
});
