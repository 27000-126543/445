
import { create } from 'zustand';
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
  initEvents: (level: UserLevel, regionName?: string) => void;
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

export const useEventStore = create<EventStore>((set, get) => ({
  allEvents: [],
  filteredEvents: [],
  filters: { ...defaultFilters },

  initEvents: (level, regionName) => {
    let events = generateEvents(50);

    // 根据数据层级过滤
    if (level === 'provincial' && regionName) {
      events = events.map(e => ({
        ...e,
        region: {
          ...e.region,
          provinces: e.region.provinces.filter((_, i) => i === 0 || Math.random() > 0.5).slice(0, 3),
        },
      })).filter(e => {
        // 简单过滤：省级只保留一半数据模拟收窄
        return Math.random() > 0.4;
      });
    } else if (level === 'municipal' && regionName) {
      events = events.map(e => ({
        ...e,
        region: {
          ...e.region,
          provinces: e.region.provinces.slice(0, 1),
        },
      })).filter(() => Math.random() > 0.6);
    }

    set({ allEvents: events, filteredEvents: events, filters: { ...defaultFilters } });
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
      result = result.filter(e =>
        e.title.includes(filters.searchText) ||
        e.description.includes(filters.searchText)
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
      result = result.filter((_, i) => i % 2 === 0);
    } else if (filters.timeRange === '近30天') {
      result = result.filter((_, i) => i % 4 !== 3);
    } else if (filters.timeRange === '近90天') {
      result = result.filter((_, i) => i < 40);
    }

    // 地域（模拟过滤）
    if (filters.region !== '全部地区') {
      result = result.filter(e =>
        e.region.provinces.some(p => p.includes(filters.region))
      );
      // 如果没匹配到，就显示部分数据避免空
      if (result.length === 0) {
        result = allEvents.filter((_, i) => i < 8);
      }
    }

    set({ filteredEvents: result });
  },
}));
