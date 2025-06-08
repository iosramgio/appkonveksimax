import { create } from 'zustand';

const useNotificationStore = create((set) => ({
  notification: null,
  showNotification: (message, type = 'info') => {
    set({ notification: { message, type } });
    setTimeout(() => {
      set({ notification: null });
    }, 3000);
  },
  clearNotification: () => set({ notification: null }),
}));

export const useNotification = () => {
  const { notification, showNotification, clearNotification } = useNotificationStore();
  return { notification, showNotification, clearNotification };
}; 