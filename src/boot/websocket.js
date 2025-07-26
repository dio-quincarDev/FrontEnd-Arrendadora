import { boot } from 'quasar/wrappers';
import { Client } from '@stomp/stompjs';
// import SockJS from 'sockjs-client'; // Ya no se importa
import { useNotificationStore } from 'src/stores/notification.module';

export default boot(({ app }) => {
  const client = new Client({
    brokerURL: 'ws://localhost:8080/admin-alerts', // Usar ws:// o wss:// para WebSockets nativos
    // debug: function (str) {
    //   console.log(str);
    // },
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  });

  client.onConnect = function (frame) {
    console.log('Conectado: ' + frame);
    client.subscribe('/topic/rental-alerts', message => {
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
  };

  client.onStompError = function (frame) {
    console.error('Error de STOMP: ' + frame.headers['message']);
    console.error('Detalles: ' + frame.body);
  };

  client.activate();
});