
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
  // 国家级完整原始数据（只初始化一次）
  rawAllEvents: EventItem[];
  
  // 按当前层级过滤后的展示数据
  allEvents: EventItem[];
  filteredEvents: EventItem[];
  
  filters: FilterState;
  initialized: boolean;
  currentLevel: UserLevel;
  currentRegion: string;
  
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

// 从完整数据按层级和地区过滤
const filterEventsByLevel = (events: EventItem[], level: UserLevel, regionName?: string): EventItem[] => {
  let result = [...events];
  
  // 先按数量比例过滤
  if (level === 'provincial') {
    result = result.slice(0, Math.max(10, Math.floor(result.length * 0.6)));
  } else if (level === 'municipal') {
    result = result.slice(0, Math.max(6, Math.floor(result.length * 0.35)));
  }
  
  // 再按地区真实过滤
  if (level !== 'national' && regionName) {
    result = result.filter(e =>
      e.region.provinces.some(p => p.includes(regionName) || regionName.includes(p))
    );
    // 如果没匹配到，给事件加上当前地区标签，保证有数据
    if (result.length === 0) {
      result = events.slice(0, 5).map((e, i) => ({
        ...e,
        id: `event-local-${i}`,
        region: {
          ...e.region,
          provinces: [regionName],
        },
      }));
    }
  }
  
  return result;
};

export const useEventStore = create<EventStore>()(
  persist(
    (set, get) => ({
      rawAllEvents: [],
      allEvents: [],
      filteredEvents: [],
      filters: { ...defaultFilters },
      initialized: false,
      currentLevel: 'national',
      currentRegion: '',

      initEvents: (level, regionName) => {
        const curState = get();
        const region = regionName || '';
        
        // 只在首次初始化时生成 mock 原始数据
        if (!curState.initialized || curState.rawAllEvents.length === 0) {
          const rawAllEvents = generateEvents(50);
          const allEvents = filterEventsByLevel(rawAllEvents, level, region);
          
          set({
            rawAllEvents,
            allEvents,
            filteredEvents: allEvents,
            filters: { ...defaultFilters, region: level === 'national' ? '全部地区' : region },
            initialized: true,
            currentLevel: level,
            currentRegion: region,
          });
          
          // 应用筛选
          setTimeout(() => get().applyFilters(), 0);
        } else {
          // 已初始化，只从原始数据重新过滤展示数据，绝不修改原始数据
          const allEvents = filterEventsByLevel(curState.rawAllEvents, level, region);
          
          set({
            allEvents,
            currentLevel: level,
            currentRegion: region,
            filters: {
              ...curState.filters,
              region: level === 'national' ? '全部地区' : (curState.filters.region === '全部地区' ? '全部地区' : curState.filters.region),
            },
          });
          
          // 重新应用筛选
          setTimeout(() => get().applyFilters(), 0);
        }
      },

      setDataLevel: (level, regionName) => {
        get().initEvents(level, regionName);
      },

      resetInit: () => {
        set({
          initialized: false,
          currentLevel: 'national',
          currentRegion: '',
          rawAllEvents: [],
          allEvents: [],
          filteredEvents: [],
          filters: { ...defaultFilters },
        });
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
        const curState = get();
        set({
          filters: {
            ...defaultFilters,
            region: curState.currentLevel === 'national' ? '全部地区' : curState.currentRegion,
          },
        });
        get().applyFilters();
      },

      applyFilters: () => {
        const { allEvents, filters, currentLevel, currentRegion } = get();

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
        if (filters.region !== '全部地区' && filters.region !== currentRegion) {
          result = result.filter(e =>
            e.region.provinces.some(p => p.includes(filters.region) || filters.region.includes(p))
          );
        }

        set({ filteredEvents: result });
      },
    }),
    {
      name: 'event-storage-v2',
    }
  )
);
