
import { create } from 'zustand';

export interface SystemUser {
  id: string;
  name: string;
  username: string;
  level: 'national' | 'provincial' | 'municipal';
  region: string;
  role: string;
  status: 'active' | 'disabled';
  lastLogin: string;
}

interface UserManageStore {
  users: SystemUser[];
  initUsers: () => void;
  addUser: (user: Omit<SystemUser, 'id' | 'lastLogin'>) => void;
  updateUser: (id: string, updates: Partial<SystemUser>) => void;
  deleteUser: (id: string) => void;
  searchUsers: (text: string) => SystemUser[];
  toggleStatus: (id: string) => void;
}

const initialUsers: SystemUser[] = [
  { id: '1', name: '张管理员', username: 'admin', level: 'national', region: '全国', role: '国家级管理员', status: 'active', lastLogin: '2024-06-14 09:30' },
  { id: '2', name: '李主任', username: 'libeijing', level: 'provincial', region: '北京市', role: '省级管理员', status: 'active', lastLogin: '2024-06-14 08:45' },
  { id: '3', name: '王科长', username: 'wangsh', level: 'provincial', region: '上海市', role: '省级管理员', status: 'active', lastLogin: '2024-06-13 16:20' },
  { id: '4', name: '陈分析员', username: 'chenfx', level: 'provincial', region: '广东省', role: '舆情分析员', status: 'active', lastLogin: '2024-06-14 10:15' },
  { id: '5', name: '刘值班员', username: 'liuzb', level: 'municipal', region: '深圳市', role: '值班员', status: 'active', lastLogin: '2024-06-14 07:00' },
  { id: '6', name: '赵宣教', username: 'zhaoxj', level: 'provincial', region: '浙江省', role: '宣教中心', status: 'active', lastLogin: '2024-06-13 14:30' },
  { id: '7', name: '孙宣传', username: 'sunxc', level: 'provincial', region: '江苏省', role: '宣传部', status: 'disabled', lastLogin: '2024-06-10 11:20' },
  { id: '8', name: '周分析', username: 'zhoufx', level: 'municipal', region: '杭州市', role: '舆情分析员', status: 'active', lastLogin: '2024-06-14 09:00' },
];

export const useUserManageStore = create<UserManageStore>((set, get) => ({
  users: [],

  initUsers: () => {
    set({ users: [...initialUsers] });
  },

  addUser: (userData) => {
    const newUser: SystemUser = {
      ...userData,
      id: `user-${Date.now()}`,
      lastLogin: '-',
    };
    set((state) => ({
      users: [newUser, ...state.users],
    }));
  },

  updateUser: (id, updates) => {
    set((state) => ({
      users: state.users.map(u =>
        u.id === id ? { ...u, ...updates } : u
      ),
    }));
  },

  deleteUser: (id) => {
    set((state) => ({
      users: state.users.filter(u => u.id !== id),
    }));
  },

  searchUsers: (text) => {
    if (!text) return get().users;
    const t = text.toLowerCase();
    return get().users.filter(u =>
      u.name.includes(text) ||
      u.username.toLowerCase().includes(t) ||
      u.role.includes(text) ||
      u.region.includes(text)
    );
  },

  toggleStatus: (id) => {
    set((state) => ({
      users: state.users.map(u =>
        u.id === id
          ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' }
          : u
      ),
    }));
  },
}));
