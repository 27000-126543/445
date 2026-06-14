
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  Calendar,
  MapPin,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useEventStore } from '@/store/useEventStore';
import { useUserStore } from '@/store/useUserStore';
import type { EventItem } from '@/types';
import { cn } from '@/lib/utils';

const categories = ['全部', '社会民生', '公共安全', '经济金融', '教育医疗', '环境保护', '交通出行'];
const emotions = ['全部情感', '正面为主', '中性为主', '负面为主'];
const statuses = ['全部状态', '活跃', '降温中', '已结案'];
const timeRanges = ['全部时间', '近7天', '近30天', '近90天'];
const regions = ['全部地区', '北京', '上海', '广东', '江苏', '浙江', '四川', '河南', '山东', '湖北', '福建'];

export default function Events() {
  const navigate = useNavigate();
  const { level, regionName } = useUserStore();
  const {
    allEvents,
    filteredEvents,
    filters,
    initEvents,
    setSearchText,
    setCategory,
    setEmotion,
    setStatus,
    setTimeRange,
    setRegion,
    setCurrentPage,
  } = useEventStore();

  const pageSize = 10;

  useEffect(() => {
    initEvents(level, regionName);
  }, [level, regionName, initEvents]);

  // 注意：filteredEvents 已经在 store 中按层级和地域过滤过了，此处无需重复过滤
  const currentPage = filters.currentPage;
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const totalCount = filteredEvents.length;

  const getStatusLabel = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      active: { label: '活跃', className: 'bg-red-500/10 text-red-400 border-red-500/30' },
      cooling: { label: '降温中', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
      resolved: { label: '已结案', className: 'bg-green-500/10 text-green-400 border-green-500/30' },
    };
    return map[status] || { label: status, className: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
  };

  const getLevelLabel = (lvl: number) => {
    const labels = ['', '一级', '二级', '三级', '四级'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500'];
    return { label: labels[lvl], color: colors[lvl] };
  };

  const getTrendIcon = (trend: string) => {
    const map: Record<string, { icon: typeof TrendingUp; className: string }> = {
      rising: { icon: TrendingUp, className: 'text-red-400' },
      stable: { icon: Minus, className: 'text-slate-400' },
      falling: { icon: TrendingDown, className: 'text-green-400' },
    };
    return map[trend];
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-white">事件中心</h1>
        <p className="text-slate-400 text-sm mt-1">
          查看和管理所有舆情事件 · 总事件 {allEvents.length} 条
          {level !== 'national' && <span className="ml-2 text-blue-400">（{regionName}视角）</span>}
        </p>
      </motion.div>

      {/* 筛选栏 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 mb-6"
      >
        <div className="flex flex-wrap gap-4 items-center">
          {/* 搜索 */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索事件名称、关键词..."
              value={filters.searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-9 pl-10 pr-4 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {/* 分类筛选 */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={filters.category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 情感筛选 */}
          <select
            value={filters.emotion}
            onChange={(e) => setEmotion(e.target.value)}
            className={cn(
              'h-9 px-3 bg-slate-900/50 border rounded-lg text-sm text-slate-200 focus:outline-none transition-colors',
              filters.emotion !== '全部情感'
                ? 'border-blue-500/50 text-blue-400'
                : 'border-slate-700/50 focus:border-blue-500/50'
            )}
          >
            {emotions.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>

          {/* 状态筛选 */}
          <select
            value={filters.status}
            onChange={(e) => setStatus(e.target.value)}
            className={cn(
              'h-9 px-3 bg-slate-900/50 border rounded-lg text-sm text-slate-200 focus:outline-none transition-colors',
              filters.status !== '全部状态'
                ? 'border-blue-500/50 text-blue-400'
                : 'border-slate-700/50 focus:border-blue-500/50'
            )}
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* 时间筛选 */}
          <div className="flex items-center gap-2">
            <Calendar className={cn('w-4 h-4', filters.timeRange !== '全部时间' ? 'text-blue-400' : 'text-slate-400')} />
            <select
              value={filters.timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className={cn(
                'h-9 px-3 bg-slate-900/50 border rounded-lg text-sm text-slate-200 focus:outline-none transition-colors',
                filters.timeRange !== '全部时间'
                  ? 'border-blue-500/50 text-blue-400'
                  : 'border-slate-700/50 focus:border-blue-500/50'
              )}
            >
              {timeRanges.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* 地域筛选 */}
          <div className="flex items-center gap-2">
            <MapPin className={cn('w-4 h-4', filters.region !== '全部地区' ? 'text-blue-400' : 'text-slate-400')} />
            <select
              value={filters.region}
              onChange={(e) => setRegion(e.target.value)}
              className={cn(
                'h-9 px-3 bg-slate-900/50 border rounded-lg text-sm text-slate-200 focus:outline-none transition-colors',
                filters.region !== '全部地区'
                  ? 'border-blue-500/50 text-blue-400'
                  : 'border-slate-700/50 focus:border-blue-500/50'
              )}
            >
              {regions.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 已选筛选标签 */}
        {(filters.emotion !== '全部情感' ||
          filters.status !== '全部状态' ||
          filters.timeRange !== '全部时间' ||
          filters.region !== '全部地区' ||
          filters.category !== '全部') && (
          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-slate-700/30">
            <span className="text-xs text-slate-400 self-center">已选筛选：</span>
            {filters.category !== '全部' && (
              <span className="text-xs px-2 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
                分类：{filters.category}
              </span>
            )}
            {filters.emotion !== '全部情感' && (
              <span className="text-xs px-2 py-1 rounded bg-purple-500/10 border border-purple-500/30 text-purple-400">
                情感：{filters.emotion}
              </span>
            )}
            {filters.status !== '全部状态' && (
              <span className="text-xs px-2 py-1 rounded bg-green-500/10 border border-green-500/30 text-green-400">
                状态：{filters.status}
              </span>
            )}
            {filters.timeRange !== '全部时间' && (
              <span className="text-xs px-2 py-1 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400">
                时间：{filters.timeRange}
              </span>
            )}
            {filters.region !== '全部地区' && (
              <span className="text-xs px-2 py-1 rounded bg-pink-500/10 border border-pink-500/30 text-pink-400">
                地域：{filters.region}
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* 事件列表 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden"
      >
        {/* 表头 */}
        <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/50">
          <div className="grid grid-cols-12 gap-4 text-sm text-slate-400">
            <div className="col-span-4">事件名称</div>
            <div className="col-span-1">级别</div>
            <div className="col-span-1">分类</div>
            <div className="col-span-1">热度指数</div>
            <div className="col-span-1">负面占比</div>
            <div className="col-span-1">传播速度</div>
            <div className="col-span-1">状态</div>
            <div className="col-span-2">发生时间</div>
          </div>
        </div>

        {/* 列表内容 */}
        <div className="divide-y divide-slate-700/30 min-h-[400px]">
          {paginatedEvents.length > 0 ? (
            paginatedEvents.map((event, index) => {
              const statusInfo = getStatusLabel(event.status);
              const levelInfo = getLevelLabel(event.level);
              const trendInfo = getTrendIcon(event.heatTrend);
              const TrendIcon = trendInfo.icon;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.03 }}
                  onClick={() => navigate(`/events/${event.id}`)}
                  className="px-5 py-4 hover:bg-slate-700/20 cursor-pointer transition-colors group"
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-4">
                      <div className="flex items-center gap-2">
                        <span className={cn('w-2 h-2 rounded-full', levelInfo.color)} />
                        <h3 className="text-slate-200 font-medium group-hover:text-white transition-colors truncate">
                          {event.title}
                        </h3>
                      </div>
                      <p className="text-slate-500 text-sm mt-1 line-clamp-1">
                        {event.description}
                      </p>
                    </div>
                    <div className="col-span-1">
                      <span className={cn('text-xs px-2 py-0.5 rounded text-white', levelInfo.color)}>
                        {levelInfo.label}
                      </span>
                    </div>
                    <div className="col-span-1 text-sm text-slate-400">{event.category}</div>
                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        <span className="text-white font-semibold tabular-nums">
                          {event.heatIndex.toLocaleString()}
                        </span>
                        <TrendIcon className={cn('w-4 h-4', trendInfo.className)} />
                      </div>
                    </div>
                    <div className="col-span-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full',
                              event.negativeRatio > 60
                                ? 'bg-gradient-to-r from-red-500 to-rose-600'
                                : event.negativeRatio > 40
                                ? 'bg-gradient-to-r from-orange-500 to-red-500'
                                : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                            )}
                            style={{ width: `${event.negativeRatio}%` }}
                          />
                        </div>
                        <span className={cn(
                          'text-xs w-10 text-right font-medium',
                          event.negativeRatio > 60 ? 'text-red-400' : event.negativeRatio > 40 ? 'text-orange-400' : 'text-slate-400'
                        )}>
                          {event.negativeRatio}%
                        </span>
                      </div>
                    </div>
                    <div className="col-span-1 text-sm text-slate-300">
                      {event.spreadSpeed.toFixed(1)}
                    </div>
                    <div className="col-span-1">
                      <span className={cn('text-xs px-2 py-0.5 rounded border', statusInfo.className)}>
                        {statusInfo.label}
                      </span>
                    </div>
                    <div className="col-span-2 text-sm text-slate-400">
                      {event.startTime}
                    </div>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-16 h-16 rounded-full bg-slate-700/30 flex items-center justify-center mb-4">
                <Filter className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-slate-400 mb-1">没有找到匹配的事件</p>
              <p className="text-xs text-slate-500">试试调整筛选条件</p>
            </div>
          )}
        </div>

        {/* 分页 */}
        <div className="px-5 py-4 border-t border-slate-700/50 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            共 <span className="text-white font-medium">{totalCount}</span> 条记录
            ，第 <span className="text-white">{currentPage}</span>
            /<span className="text-white">{totalPages}</span> 页
            {totalCount !== allEvents.length && (
              <span className="ml-2 text-xs text-slate-500">（已筛选）</span>
            )}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-700/50 text-slate-400 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let page = i + 1;
              if (totalPages > 5) {
                if (currentPage > 3) {
                  page = currentPage - 2 + i;
                }
                if (page > totalPages) page = totalPages - (4 - i);
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={cn(
                    'w-8 h-8 rounded-lg text-sm transition-colors',
                    currentPage === page
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-400 hover:bg-slate-700/50'
                  )}
                >
                  {page}
                </button>
              );
            })}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-700/50 text-slate-400 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// 用于类型检查的引用
type _EventItemRef = EventItem;
