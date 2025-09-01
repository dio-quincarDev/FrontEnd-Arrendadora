import { defineStore } from 'pinia';
import { Notify } from 'quasar';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
  }),
  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.read).length,
  },
  actions: {
    addNotification(message) {
      // 1. Añadir a la lista de estado (al principio)
      this.notifications.unshift({
        id: Date.now(),
        message: message,
        read: false,
        timestamp: new Date().toLocaleString(),
      });

      // 2. Reproducir sonido
      const audio = new Audio('/notification.mp3');
      audio.play().catch(error => {
        console.error('Error al reproducir el sonido de notificación:', error);
      });

      // 3. Mostrar notificación emergente
      Notify.create({
        message: message,
        color: 'info',
        position: 'top',
        timeout: 3000,
      });
    },
    markAsRead(id) {
      const notification = this.notifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
      }
    },
    markAllAsRead() {
      this.notifications.forEach(n => (n.read = true));
    },
    clearNotifications() {
      this.notifications = [];
    },
  },
});