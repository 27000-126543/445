
import { create } from 'zustand';

interface AppState {
  sidebarCollapsed: boolean;
  isFullscreen: boolean;
  notifications: number;
  toggleSidebar: () => void;
  toggleFullscreen: () => void;
  setNotifications: (count: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarCollapsed: false,
  isFullscreen: false,
  notifications: 5,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  toggleFullscreen: () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      set({ isFullscreen: true });
    } else {
      document.exitFullscreen();
      set({ isFullscreen: false });
    }
  },
  setNotifications: (count) => set({ notifications: count }),
}));
