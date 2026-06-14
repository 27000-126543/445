
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserLevel } from '@/types';

interface UserState {
  user: User | null;
  isLoggedIn: boolean;
  level: UserLevel;
  regionName: string;
  regionCode: string;
  setUser: (user: User) => void;
  logout: () => void;
  updateUserLevel: (level: UserLevel, regionName?: string, regionCode?: string) => void;
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

const sampleProvinces = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '四川省', '山东省', '湖北省', '河南省', '福建省'];
const sampleCities = ['深圳市', '广州市', '杭州市', '南京市', '成都市', '青岛市', '武汉市', '苏州市', '宁波市', '厦门市'];
const sampleProvinceCodes = ['110000', '310000', '440000', '320000', '330000', '510000', '370000', '420000', '410000', '350000'];
const sampleCityCodes = ['440300', '440100', '330100', '320100', '510100', '370200', '420100', '320500', '330200', '350200'];

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: mockUser,
      isLoggedIn: true,
      level: 'national',
      regionName: '全国',
      regionCode: '100000',
      setUser: (user) => set({
        user,
        isLoggedIn: true,
        level: user.level,
        regionName: user.region?.name || '全国',
        regionCode: user.region?.code || '100000',
      }),
      logout: () => set({
        user: null,
        isLoggedIn: false,
        level: 'national',
        regionName: '全国',
        regionCode: '100000',
      }),
      updateUserLevel: (level: UserLevel, customRegionName?: string, customRegionCode?: string) =>
        set((state) => {
          let regionName = '全国';
          let regionCode = '100000';

          if (level === 'provincial') {
            const idx = Math.floor(Math.random() * sampleProvinces.length);
            regionName = customRegionName || sampleProvinces[idx];
            regionCode = customRegionCode || sampleProvinceCodes[idx];
          } else if (level === 'municipal') {
            const idx = Math.floor(Math.random() * sampleCities.length);
            regionName = customRegionName || sampleCities[idx];
            regionCode = customRegionCode || sampleCityCodes[idx];
          }

          return {
            level,
            regionName,
            regionCode,
            user: state.user
              ? { ...state.user, level, region: { code: regionCode, name: regionName } }
              : state.user,
          };
        }),
    }),
    {
      name: 'user-storage-v2',
    }
  )
);
