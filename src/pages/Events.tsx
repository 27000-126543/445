
import { useState, useEffect } from 'react';
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
import { generateEvents } from '@/mock';
import type { EventItem } from '@/types';
import { cn } from '@/lib/utils';

const categories = ['全部', '社会民生', '公共安全', '经济金融', '教育医疗', '环境保护', '交通出行'];
const emotions = ['全部情感', '正面为主', '中性为主', '负面为主'];
const statuses = ['全部状态', '活跃', '降温中', '已结案'];

export default function Events() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('全部');
  const [selectedEmotion, setSelectedEmotion] = useState('全部情感');
  const [selectedStatus, setSelectedStatus] = useState('全部状态');
  const [searchText, setSearchText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setEvents(generateEvents(20));
  }, []);

  const filteredEvents = events.filter(event => {
    if (selectedCategory !== '全部' && event.category !== selectedCategory) return false;
    if (searchText && !event.title.includes(searchText)) return false;
    return true;
  });

  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(filteredEvents.length / pageSize);

  const getStatusLabel = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      active: { label: '活跃', className: 'bg-red-500/10 text-red-400 border-red-500/30' },
      cooling: { label: '降温中', className: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
      resolved: { label: '已结案', className: 'bg-green-500/10 text-green-400 border-green-500/30' },
    };
    return map[status] || { label: status, className: 'bg-slate-500/10 text-slate-400 border-slate-500/30' };
  };

  const getLevelLabel = (level: number) => {
    const labels = ['', '一级', '二级', '三级', '四级'];
    const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500'];
    return { label: labels[level], color: colors[level] };
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
        <p className="text-slate-400 text-sm mt-1">查看和管理所有舆情事件</p>
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
              placeholder="搜索事件名称..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-9 pl-10 pr-4 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>

          {/* 分类筛选 */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* 情感筛选 */}
          <select
            value={selectedEmotion}
            onChange={(e) => setSelectedEmotion(e.target.value)}
            className="h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
          >
            {emotions.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>

          {/* 状态筛选 */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* 时间筛选 */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <button className="h-9 px-4 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 hover:bg-slate-700/50 transition-colors">
              近7天
            </button>
          </div>

          {/* 地域筛选 */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400" />
            <button className="h-9 px-4 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 hover:bg-slate-700/50 transition-colors">
              全部地区
            </button>
          </div>
        </div>
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
        <div className="divide-y divide-slate-700/30">
          {paginatedEvents.map((event, index) => {
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
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                          style={{ width: `${event.negativeRatio}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 w-10 text-right">
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
          })}
        </div>

        {/* 分页 */}
        <div className="px-5 py-4 border-t border-slate-700/50 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            共 {filteredEvents.length} 条记录，第 {currentPage}/{totalPages} 页
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
