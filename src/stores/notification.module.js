import { defineStore } from 'pinia';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
  }),
  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.read).length,
  },
  actions: {
    addNotification(message) {
      this.notifications.push({
        id: Date.now(), // Simple unique ID
        message: message,
        read: false,
        timestamp: new Date().toLocaleString(),
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
