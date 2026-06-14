
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EventItem } from '@/types';
import { generateEvents } from '@/mock';
import type { UserLevel } from '@/types';

interface FilterState {
  searchText: string;
  category: string;
  emotion: string;
  status: string;
  timeRange: string;
  region: string;
  currentPage: number;
}

interface EventStore {
  allEvents: EventItem[];
  filteredEvents: EventItem[];
  filters: FilterState;
  initialized: boolean;
  currentLevel: UserLevel;
  
  initEvents: (level: UserLevel, regionName?: string) => void;
  setDataLevel: (level: UserLevel, regionName?: string) => void;
  resetInit: () => void;
  
  setSearchText: (text: string) => void;
  setCategory: (cat: string) => void;
  setEmotion: (emo: string) => void;
  setStatus: (st: string) => void;
  setTimeRange: (range: string) => void;
  setRegion: (reg: string) => void;
  setCurrentPage: (page: number) => void;
  applyFilters: () => void;
  resetFilters: () => void;
}

const defaultFilters: FilterState = {
  searchText: '',
  category: '全部',
  emotion: '全部情感',
  status: '全部状态',
  timeRange: '全部时间',
  region: '全部地区',
  currentPage: 1,
};

const filterEventsByLevel = (events: EventItem[], level: UserLevel, regionName?: string): EventItem[] => {
  let result = [...events];
  
  // 按层级数量过滤
  if (level === 'provincial') {
    result = result.slice(0, Math.max(10, Math.floor(result.length * 0.6)));
  } else if (level === 'municipal') {
    result = result.slice(0, Math.max(6, Math.floor(result.length * 0.35)));
  }
  
  // 按地区真实过滤
  if (level !== 'national' && regionName) {
    result = result.filter(e =>
      e.region.provinces.some(p => p.includes(regionName) || regionName.includes(p))
    );
  }
  
  return result;
};

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      allEvents: [],
      filteredEvents: [],
      filters: { ...defaultFilters },
      initialized: false,
      currentLevel: 'national',

      initEvents: (level, regionName) => {
        const curState = get();
        let events: EventItem[];
        const filteredCur = curState.allEvents.filter(e => e.id.includes('event-'));

        if (!curState.initialized || curState.allEvents.length === 0) {
          // 首次初始化，生成 mock 数据
          events = generateEvents(50);
          
          // 按层级和地区过滤
          events = filterEventsByLevel(events, level, regionName);
          
          set({
            allEvents: events,
            filteredEvents: events,
            filters: { ...defaultFilters },
            initialized: true,
            currentLevel: level,
          });
        } else {
          // 已初始化，只按新层级重新过滤已有数据，保留筛选状态
          const filtered = filterEventsByLevel(curState.allEvents, level, regionName);
          set({
            allEvents: filtered,
            currentLevel: level,
          });
          // 重新应用筛选
          get().applyFilters();
        }
      },

      setDataLevel: (level, regionName) => {
        get().initEvents(level, regionName);
      },

      resetInit: () => {
        set({ initialized: false, currentLevel: 'national' });
      },

      setSearchText: (text) => {
        set({ filters: { ...get().filters, searchText: text, currentPage: 1 } });
        get().applyFilters();
      },

      setCategory: (cat) => {
        set({ filters: { ...get().filters, category: cat, currentPage: 1 } });
        get().applyFilters();
      },

      setEmotion: (emo) => {
        set({ filters: { ...get().filters, emotion: emo, currentPage: 1 } });
        get().applyFilters();
      },

      setStatus: (st) => {
        set({ filters: { ...get().filters, status: st, currentPage: 1 } });
        get().applyFilters();
      },

      setTimeRange: (range) => {
        set({ filters: { ...get().filters, timeRange: range, currentPage: 1 } });
        get().applyFilters();
      },

      setRegion: (reg) => {
        set({ filters: { ...get().filters, region: reg, currentPage: 1 } });
        get().applyFilters();
      },

      setCurrentPage: (page) => {
        set({ filters: { ...get().filters, currentPage: page } });
      },

      resetFilters: () => {
        set({ filters: { ...defaultFilters } });
        get().applyFilters();
      },

      applyFilters: () => {
        const { allEvents, filters } = get();

        let result = [...allEvents];

        // 搜索
        if (filters.searchText) {
          const t = filters.searchText.toLowerCase();
          result = result.filter(e =>
            e.title.toLowerCase().includes(t) ||
            e.description.toLowerCase().includes(t)
          );
        }

        // 分类
        if (filters.category !== '全部') {
          result = result.filter(e => e.category === filters.category);
        }

        // 情感
        if (filters.emotion === '正面为主') {
          result = result.filter(e => (100 - e.negativeRatio) > 60);
        } else if (filters.emotion === '中性为主') {
          result = result.filter(e => e.emotionScore >= 40 && e.emotionScore <= 60);
        } else if (filters.emotion === '负面为主') {
          result = result.filter(e => e.negativeRatio > 45);
        }

        // 状态
        if (filters.status === '活跃') {
          result = result.filter(e => e.status === 'active');
        } else if (filters.status === '降温中') {
          result = result.filter(e => e.status === 'cooling');
        } else if (filters.status === '已结案') {
          result = result.filter(e => e.status === 'resolved');
        }

        // 时间范围
        if (filters.timeRange === '近7天') {
          result = result.slice(0, Math.ceil(result.length * 0.3));
        } else if (filters.timeRange === '近30天') {
          result = result.slice(0, Math.ceil(result.length * 0.7));
        } else if (filters.timeRange === '近90天') {
          result = result.slice(0, Math.ceil(result.length * 0.95));
        }

        // 地域（真实过滤，空结果不塞回）
        if (filters.region !== '全部地区') {
          result = result.filter(e =>
            e.region.provinces.some(p => p.includes(filters.region) || filters.region.includes(p))
          );
        }

        set({ filteredEvents: result });
      },
    }),
    {
      name: 'event-storage',
    }
  )
);
