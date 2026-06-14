
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserLevel } from '@/types';

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  setUser: (user: User) => void;
  logout: () => void;
  updateUserLevel: (level: UserLevel) => void;
}

const mockUser: User = {
  id: '1',
  username: 'admin',
  realName: '张管理员',
  avatar: '',
  level: 'national',
  region: {
    code: '100000',
    name: '全国',
  },
  role: {
    id: '1',
    name: '国家级管理员',
    code: 'national_admin',
    permissions: [],
  },
  status: 'active',
  lastLogin: new Date().toISOString(),
  createdAt: '2024-01-01 00:00:00',
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: mockUser,
      isLoggedIn: true,
      setUser: (user) => set({ user, isLoggedIn: true }),
      logout: () => set({ user: null, isLoggedIn: false }),
      updateUserLevel: (level) =>
        set((state) => state.user
          ? { user: { ...state.user, level } }
          : state
        ),
    }),
    {
      name: 'user-storage',
    }
  )
);
