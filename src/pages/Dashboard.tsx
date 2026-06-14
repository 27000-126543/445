
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Clock,
  MessageSquare,
  Zap,
  RefreshCw,
  Globe2,
  Building2,
  MapPin,
  Eye,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import ChinaHeatMap from '@/components/charts/ChinaHeatMap';
import EmotionRankChart from '@/components/charts/EmotionRankChart';
import TrendChart from '@/components/charts/TrendChart';
import RealtimeFeed from '@/components/RealtimeFeed';
import HotEventsList from '@/components/HotEventsList';
import { useUserStore } from '@/store/useUserStore';
import {
  generateDashboardStats,
  generateProvinceHeatData,
  generateEvents,
  generateOpinionList,
  generateDailyEmotionData,
} from '@/mock';
import type { ProvinceHeatData, EventItem, DashboardStats, OpinionItem, DailyEmotionData } from '@/types';
import { cn } from '@/lib/utils';

const LEVEL_RATIO = { national: 1, provincial: 0.6, municipal: 0.35 };

const levelIconMap: Record<string, typeof Globe2> = {
  national: Globe2,
  provincial: Building2,
  municipal: MapPin,
};
const levelColorMap: Record<string, string> = {
  national: 'text-purple-400',
  provincial: 'text-blue-400',
  municipal: 'text-green-400',
};
const levelBadgeMap: Record<string, string> = {
  national: 'bg-purple-500/10 border-purple-500/30',
  provincial: 'bg-blue-500/10 border-blue-500/30',
  municipal: 'bg-green-500/10 border-green-500/30',
};
const levelLabelMap: Record<string, string> = {
  national: '国家级',
  provincial: '省级',
  municipal: '市级',
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { level, regionName } = useUserStore();
  const LevelIcon = levelIconMap[level];
  const ratio = LEVEL_RATIO[level];

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [heatData, setHeatData] = useState<ProvinceHeatData[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [opinions, setOpinions] = useState<OpinionItem[]>([]);
  const [emotionTrend, setEmotionTrend] = useState<DailyEmotionData[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataKey, setDataKey] = useState(0);

  useEffect(() => {
    loadData();
  }, [level, regionName, dataKey]);

  const scaleNumber = (n: number, r: number) => Math.max(1, Math.round(n * r));

  const loadData = () => {
    const rawStats = generateDashboardStats();
    const scaledStats: DashboardStats = {
      ...rawStats,
      todayOpinions: scaleNumber(rawStats.todayOpinions, ratio),
      warningCount: scaleNumber(rawStats.warningCount, ratio),
      totalEvents: scaleNumber(rawStats.totalEvents, ratio),
      todayChange: {
        opinions: Math.round(rawStats.todayChange.opinions * ratio),
        negative: Math.round(rawStats.todayChange.negative * ratio),
        warnings: Math.round(rawStats.todayChange.warnings * ratio),
        response: Math.round(rawStats.todayChange.response * (1 + (1 - ratio) * 0.2)),
      },
    };
    setStats(scaledStats);

    let rawHeat = generateProvinceHeatData();
    // 真正按地区过滤热力图数据
    if (level === 'provincial' && regionName) {
      rawHeat = rawHeat.filter(h =>
        h.name.includes(regionName) || regionName.includes(h.name)
      );
      // 如果没找到，找一个模糊匹配的
      if (rawHeat.length === 0) {
        rawHeat = generateProvinceHeatData().slice(0, 2).map(h => ({
          ...h,
          name: regionName.slice(0, 2),
          value: scaleNumber(h.value, ratio),
        }));
      }
    } else if (level === 'municipal' && regionName) {
      // 市级视角只展示当前市
      rawHeat = rawHeat.slice(0, 1).map(h => ({
        ...h,
        name: regionName,
        value: scaleNumber(h.value, ratio),
      }));
    }
    const scaledHeat: ProvinceHeatData[] = rawHeat.map(h => ({
      ...h,
      value: scaleNumber(h.value, ratio),
      negativeRatio: Math.min(100, Math.max(0, h.negativeRatio + (level !== 'national' ? (1 - ratio) * 12 : 0))),
    }));
    setHeatData(scaledHeat);

    let rawEvents = generateEvents(15);
    // 真正按地区过滤事件
    if (level !== 'national' && regionName) {
      rawEvents = rawEvents.filter(e =>
        e.region.provinces.some(p => p.includes(regionName) || regionName.includes(p))
      );
      // 如果没匹配到，给事件加上当前地区标签
      if (rawEvents.length === 0) {
        rawEvents = generateEvents(5).map((e, i) => ({
          ...e,
          id: `event-local-${i}`,
          region: {
            ...e.region,
            provinces: [regionName],
          },
        }));
      }
    }
    const eventCount = Math.max(3, Math.round(rawEvents.length * ratio));
    const selectedEvents = rawEvents.slice(0, eventCount).map(e => ({
      ...e,
      heat: scaleNumber(e.heatIndex, ratio),
      heatIndex: scaleNumber(e.heatIndex, ratio),
      commentCount: scaleNumber(e.commentCount || 0, ratio),
      repostCount: scaleNumber(e.repostCount || 0, ratio),
    }));
    setEvents(selectedEvents as EventItem[]);

    let rawOpinions = generateOpinionList(25);
    // 真正按地区过滤实时舆情
    if (level !== 'national' && regionName) {
      rawOpinions = rawOpinions.filter(o =>
        o.region?.province?.includes(regionName) ||
        regionName.includes(o.region?.province || '') ||
        o.region?.city?.includes(regionName) ||
        regionName.includes(o.region?.city || '')
      );
    }
    const opinionCount = Math.max(5, Math.round(rawOpinions.length * ratio));
    setOpinions(rawOpinions.slice(0, opinionCount).map(o => ({ ...o })) as OpinionItem[]);

    const daysCount = level === 'national' ? 30 : (level === 'provincial' ? 21 : 14);
    const rawTrend = generateDailyEmotionData(daysCount);
    setEmotionTrend(rawTrend.map(d => ({
      ...d,
      count: scaleNumber(d.count || 0, ratio),
      positive: scaleNumber(d.positive, ratio),
      neutral: scaleNumber(d.neutral, ratio),
      negative: scaleNumber(d.negative, ratio),
    })) as DailyEmotionData[]);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setDataKey(k => k + 1);
      setIsRefreshing(false);
    }, 1000);
  };

  const handleProvinceClick = (province: ProvinceHeatData) => {
    console.log('点击省份:', province.name);
  };

  const handleEventClick = (event: EventItem) => {
    navigate(`/events/${event.id}`);
  };

  const scopeLabel = level === 'national' ? '全国' : regionName;
  const mapTitle = level === 'national' ? '全国舆情热力图' : `${scopeLabel}舆情分布热力图`;

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        key={`header-${level}-${regionName}`}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              舆情总览
            </h1>
            <span className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
              levelBadgeMap[level],
              levelColorMap[level]
            )}>
              <LevelIcon className="w-3.5 h-3.5" />
              {levelLabelMap[level]}视角
            </span>
            {level !== 'national' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-700/50 text-slate-300 border border-slate-600/50">
                <MapPin className="w-3 h-3" />
                {scopeLabel}
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm">
            实时监控{scopeLabel}网络舆情态势 · 数据按{levelLabelMap[level]}视角按比例缩放（{Math.round(ratio * 100)}%）
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs text-slate-300">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            可见度 <span className="text-white font-medium">{Math.round(ratio * 100)}%</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-blue-500/30 disabled:opacity-50"
          >
            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
            刷新数据
          </button>
        </div>
      </motion.div>

      {/* 数据卡片 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`stats-${level}-${regionName}-${dataKey}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <StatCard
            title="今日舆情量"
            value={stats.todayOpinions}
            unit="条"
            change={stats.todayChange.opinions}
            icon={<MessageSquare className="w-6 h-6" />}
            color="blue"
            delay={0}
          />
          <StatCard
            title="负面占比"
            value={stats.negativeRatio}
            unit="%"
            change={stats.todayChange.negative}
            icon={<AlertTriangle className="w-6 h-6" />}
            color="red"
            delay={0.1}
          />
          <StatCard
            title="活跃预警"
            value={stats.warningCount}
            unit="条"
            change={stats.todayChange.warnings}
            icon={<Zap className="w-6 h-6" />}
            color="yellow"
            delay={0.2}
          />
          <StatCard
            title="平均响应"
            value={stats.avgResponseTime}
            unit="小时"
            change={stats.todayChange.response}
            changeLabel="较上周"
            icon={<Clock className="w-6 h-6" />}
            color="green"
            delay={0.3}
          />
        </motion.div>
      </AnimatePresence>

      {/* 主要内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 - 地图或数据卡 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          key={`map-${level}-${regionName}-${dataKey}`}
          className="lg:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              {mapTitle}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => {}}
                className={cn(
                  'px-3 py-1 text-xs rounded-md border transition-colors',
                  level === 'national'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'text-slate-400 border-slate-700/50 hover:bg-slate-700/50'
                )}
              >
                国家级
              </button>
              <button
                className={cn(
                  'px-3 py-1 text-xs rounded-md border transition-colors',
                  level === 'provincial'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'text-slate-400 border-slate-700/50 hover:bg-slate-700/50'
                )}
              >
                省级
              </button>
              <button
                className={cn(
                  'px-3 py-1 text-xs rounded-md border transition-colors',
                  level === 'municipal'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                    : 'text-slate-400 border-slate-700/50 hover:bg-slate-700/50'
                )}
              >
                市级
              </button>
            </div>
          </div>
          
          {/* 市级视角：显示数据卡而非全国地图 */}
          {level === 'municipal' ? (
            <div className="h-[400px] flex items-center justify-center">
              {heatData.length > 0 ? (
                <div className="w-full max-w-md">
                  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{regionName}</h3>
                      <p className="text-slate-400 text-sm">舆情热力数据总览</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      {heatData.map((item, idx) => {
                        const ratio = (item.negativeRatio || 30);
                        const heatColor = ratio > 45 ? 'text-red-400' : ratio > 30 ? 'text-yellow-400' : 'text-green-400';
                        const heatBg = ratio > 45 ? 'bg-red-500/10 border-red-500/30' : ratio > 30 ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-green-500/10 border-green-500/30';
                        return (
                          <div key={idx} className={cn('p-4 rounded-xl border', heatBg)}>
                            <p className="text-slate-400 text-xs mb-1">{item.name}</p>
                            <p className="text-2xl font-bold text-white tabular-nums mb-1">
                              {item.value.toLocaleString()}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-500">舆情量</span>
                              <span className={heatColor}>
                                负面 {Math.round(ratio)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 负面占比进度条 */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">整体负面占比</span>
                        <span className="text-white font-medium">
                          {Math.round(heatData.reduce((a, b) => a + (b.negativeRatio || 0), 0) / heatData.length)}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-yellow-500 to-red-500 rounded-full"
                          style={{ width: `${Math.min(100, heatData.reduce((a, b) => a + (b.negativeRatio || 0), 0) / heatData.length)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-1">暂无{regionName}的热力数据</p>
                  <p className="text-xs text-slate-500">切回国家级视角查看全国地图</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[400px]">
              {heatData.length > 0 ? (
                <ChinaHeatMap data={heatData} onProvinceClick={handleProvinceClick} />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">暂无热力数据</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* 右侧 - 热门事件 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          key={`events-${level}-${regionName}`}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">
              {level === 'national' ? '热门事件榜' : `${scopeLabel}热点事件`}
              <span className="ml-2 text-xs text-slate-500 font-normal">（{events.length} 条）</span>
            </h2>
            <button
              onClick={() => navigate('/events')}
              className="text-xs text-blue-400 hover:text-blue-300"
            >
              查看全部
            </button>
          </div>
          <div className="h-[400px] overflow-y-auto pr-2">
            <HotEventsList events={events} onEventClick={handleEventClick} />
          </div>
        </motion.div>
      </div>

      {/* 下方内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 情感分布排名 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          key={`rank-${level}-${regionName}`}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
        >
          <h2 className="text-white font-semibold mb-4">
            {level === 'national' ? '省份情感分布 TOP10' : `${scopeLabel}地域情感对比`}
          </h2>
          <div className="h-[300px]">
            <EmotionRankChart data={heatData.slice(0, 10)} />
          </div>
        </motion.div>

        {/* 趋势图 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          key={`trend-${level}-${regionName}`}
          className="lg:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">
              情感变化趋势
              <span className="ml-2 text-xs text-slate-500 font-normal">
                （最近 {emotionTrend.length} 天）
              </span>
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs text-slate-400 rounded-md hover:bg-slate-700/50">
                7天
              </button>
              <button className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/30">
                {level === 'national' ? '30天' : level === 'provincial' ? '21天' : '14天'}
              </button>
            </div>
          </div>
          <div className="h-[300px]">
            <TrendChart data={emotionTrend} />
          </div>
        </motion.div>
      </div>

      {/* 实时舆情流 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        key={`feed-${level}-${regionName}`}
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {level === 'national' ? '实时舆情流' : `${scopeLabel}实时舆情`}
            <span className="ml-2 text-xs text-slate-500 font-normal">
              （{opinions.length} 条 / 采样率 {Math.round(ratio * 100)}%）
            </span>
          </h2>
          <div className="flex gap-2">
            <button className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/30">
              全部
            </button>
            <button className="px-3 py-1 text-xs text-slate-400 rounded-md hover:bg-slate-700/50">
              仅负面
            </button>
            <button className="px-3 py-1 text-xs text-slate-400 rounded-md hover:bg-slate-700/50">
              含敏感词
            </button>
          </div>
        </div>
        <div className="h-[320px]">
          <RealtimeFeed data={opinions} />
        </div>
      </motion.div>
    </div>
  );
}
