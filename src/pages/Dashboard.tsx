
import { useState, useEffect, useMemo } from 'react';
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
  ChevronUp,
  ChevronDown,
  BarChart3,
  Flame,
  Radio,
  Users,
  Filter,
  ArrowRight,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import ChinaHeatMap from '@/components/charts/ChinaHeatMap';
import EmotionRankChart from '@/components/charts/EmotionRankChart';
import TrendChart from '@/components/charts/TrendChart';
import RealtimeFeed from '@/components/RealtimeFeed';
import HotEventsList from '@/components/HotEventsList';
import { useUserStore } from '@/store/useUserStore';
import { useDashboardStore } from '@/store/useDashboardStore';
import type {
  ProvinceHeatData,
  EventItem,
  DashboardStats,
  OpinionItem,
  DailyEmotionData,
  UserLevel,
  DashboardMetric,
} from '@/types';
import { cn } from '@/lib/utils';

const LEVEL_RATIO: Record<UserLevel, number> = { national: 1, provincial: 0.6, municipal: 0.35 };

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

const metricList: Array<{ key: DashboardMetric; label: string; icon: typeof Flame; color: string; badge: string }> = [
  { key: 'total', label: '舆情总量', icon: BarChart3, color: 'text-blue-400', badge: 'bg-blue-500/20 border-blue-500/30' },
  { key: 'negative', label: '负面占比', icon: AlertTriangle, color: 'text-red-400', badge: 'bg-red-500/20 border-red-500/30' },
  { key: 'speed', label: '传播速度', icon: Flame, color: 'text-orange-400', badge: 'bg-orange-500/20 border-orange-500/30' },
  { key: 'warning', label: '预警数量', icon: Zap, color: 'text-yellow-400', badge: 'bg-yellow-500/20 border-yellow-500/30' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { level, regionName, updateUserLevel } = useUserStore();
  const {
    initDashboardData,
    currentMetric,
    setMetric,
    getScopedStats,
    getScopedHeatData,
    getScopedEvents,
    getScopedOpinions,
    getScopedTrend,
  } = useDashboardStore();

  const LevelIcon = levelIconMap[level];
  const ratio = LEVEL_RATIO[level];
  const scopeLabel = (() => {
    if (level === 'national') return '全国';
    if (!regionName || regionName === '全国') {
      return level === 'provincial' ? '北京' : '北京市';
    }
    return regionName;
  })();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dataKey, setDataKey] = useState(0);

  useEffect(() => {
    initDashboardData();
  }, [initDashboardData]);

  useEffect(() => {
    if (level !== 'national' && (!regionName || regionName === '全国')) {
      const fallback = level === 'provincial' ? '北京' : '北京市';
      updateUserLevel(level, fallback);
    }
  }, [level, regionName, updateUserLevel]);

  const stats: DashboardStats = useMemo(
    () => getScopedStats(level, regionName),
    [level, regionName, dataKey, getScopedStats],
  );
  const heatData: ProvinceHeatData[] = useMemo(
    () => getScopedHeatData(level, regionName),
    [level, regionName, dataKey, getScopedHeatData],
  );
  const events: EventItem[] = useMemo(
    () => getScopedEvents(level, regionName),
    [level, regionName, dataKey, getScopedEvents],
  );
  const opinions: OpinionItem[] = useMemo(
    () => getScopedOpinions(level, regionName),
    [level, regionName, dataKey, getScopedOpinions],
  );
  const emotionTrend: DailyEmotionData[] = useMemo(
    () => getScopedTrend(level, regionName),
    [level, regionName, dataKey, getScopedTrend],
  );

  const mapTitle = level === 'national'
    ? '全国舆情热力图'
    : level === 'provincial'
      ? `${scopeLabel}各地市舆情排行`
      : `${scopeLabel}舆情数据总览`;

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setDataKey(k => k + 1);
      setIsRefreshing(false);
    }, 800);
  };

  const handleDrillDown = (item: ProvinceHeatData) => {
    if (level === 'national') {
      updateUserLevel('provincial', item.name);
    } else if (level === 'provincial') {
      updateUserLevel('municipal', item.name);
    }
  };

  const handleEventClick = (event: EventItem) => {
    navigate(`/events/${event.id}`);
  };

  const handleJumpToEvents = (presetRegion?: string) => {
    navigate('/events', { state: { presetRegion: presetRegion || scopeLabel } });
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const avgNegativeRatio = heatData.length > 0
    ? Math.round(heatData.reduce((sum, h) => sum + (h.negativeRatio || 0), 0) / heatData.length)
    : 0;
  const totalWarnings = heatData.reduce((sum, h) => sum + (h.warningCount || 0), 0);
  const totalOpinions = heatData.reduce((sum, h) => sum + h.value, 0);
  const avgSpreadSpeed = heatData.length > 0
    ? Number((heatData.reduce((sum, h) => sum + (h.spreadSpeed || 0), 0) / heatData.length).toFixed(1))
    : 0;

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        key={`header-${level}-${regionName}-${currentMetric}`}
        className="flex items-start justify-between flex-wrap gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              舆情总览
            </h1>
            <span className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border',
              levelBadgeMap[level],
              levelColorMap[level],
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
            {level !== 'national' && ' · 点击上方返回国家级视角'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50 text-xs text-slate-300">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            可见度 <span className="text-white font-medium">{Math.round(ratio * 100)}%</span>
          </div>
          {level !== 'national' && (
            <button
              onClick={() => updateUserLevel('national')}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300 rounded-lg text-xs font-medium transition-colors border border-slate-700/50"
            >
              <ChevronUp className="w-4 h-4" />
              返回国家级
            </button>
          )}
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

      {/* 指标切换栏 */}
      <motion.div
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-2 p-2 bg-slate-800/30 border border-slate-700/50 rounded-xl w-fit"
      >
        <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
          <Filter className="w-3.5 h-3.5" />
          展示指标
        </span>
        {metricList.map(m => {
          const MIcon = m.icon;
          const active = currentMetric === m.key;
          return (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
                active
                  ? cn(m.badge, m.color, 'shadow-sm')
                  : 'text-slate-400 border-transparent hover:bg-slate-700/50 hover:text-slate-200',
              )}
            >
              <MIcon className="w-3.5 h-3.5" />
              {m.label}
            </button>
          );
        })}
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
        {/* 左侧 - 地图/列表/数据卡 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          key={`map-${level}-${regionName}-${currentMetric}-${dataKey}`}
          className="lg:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              {mapTitle}
            </h2>
            <div className="flex gap-2 items-center">
              {level !== 'municipal' && (
                <span className="text-[11px] text-slate-500">
                  {level === 'national' ? '点击省份 → 进入省级视角' : '点击地市 → 进入市级视角'}
                </span>
              )}
              <div className="flex gap-1">
                {(['national', 'provincial', 'municipal'] as UserLevel[]).map(lv => (
                  <button
                    key={lv}
                    onClick={() => {
                      if (lv === 'national') updateUserLevel('national');
                      else if (lv === 'provincial') updateUserLevel('provincial', regionName);
                      else updateUserLevel('municipal', regionName);
                    }}
                    className={cn(
                      'px-2.5 py-1 text-xs rounded-md border transition-colors',
                      level === lv
                        ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        : 'text-slate-400 border-slate-700/50 hover:bg-slate-700/50',
                    )}
                  >
                    {levelLabelMap[lv]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {level === 'municipal' ? (
            <div className="h-[400px] flex items-center justify-center">
              {heatData.length > 0 ? (
                <div className="w-full max-w-lg">
                  <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <MapPin className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1">{scopeLabel}</h3>
                      <p className="text-slate-400 text-sm">市级视角 · 舆情数据汇总</p>
                    </div>

                    {/* 核心指标 Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="p-4 rounded-xl border bg-slate-800/40 border-slate-700/50">
                        <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                          <BarChart3 className="w-3 h-3" />
                          舆情总量
                        </p>
                        <p className="text-2xl font-bold text-white tabular-nums">
                          {totalOpinions.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 rounded-xl border bg-slate-800/40 border-slate-700/50">
                        <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          整体负面占比
                        </p>
                        <p className={cn(
                          'text-2xl font-bold tabular-nums',
                          avgNegativeRatio > 40 ? 'text-red-400' : avgNegativeRatio > 25 ? 'text-yellow-400' : 'text-green-400',
                        )}>
                          {isNaN(avgNegativeRatio) ? 0 : avgNegativeRatio}%
                        </p>
                      </div>
                      <div className="p-4 rounded-xl border bg-slate-800/40 border-slate-700/50">
                        <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          平均传播速度
                        </p>
                        <p className="text-2xl font-bold text-orange-400 tabular-nums">
                          {isNaN(avgSpreadSpeed) ? 0 : avgSpreadSpeed}
                          <span className="text-sm text-slate-500 ml-1">级</span>
                        </p>
                      </div>
                      <div className="p-4 rounded-xl border bg-slate-800/40 border-slate-700/50">
                        <p className="text-slate-400 text-xs mb-1 flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          当前预警数量
                        </p>
                        <p className="text-2xl font-bold text-yellow-400 tabular-nums">
                          {totalWarnings}
                          <span className="text-sm text-slate-500 ml-1">条</span>
                        </p>
                      </div>
                    </div>

                    {/* 负面占比进度条 */}
                    <div className="space-y-2 mb-4 p-3 bg-slate-900/30 rounded-lg">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">整体负面占比</span>
                        <span className={cn(
                          'font-medium tabular-nums',
                          avgNegativeRatio > 40 ? 'text-red-400' : avgNegativeRatio > 25 ? 'text-yellow-400' : 'text-green-400',
                        )}>
                          {isNaN(avgNegativeRatio) ? 0 : avgNegativeRatio}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            avgNegativeRatio > 40
                              ? 'bg-gradient-to-r from-yellow-500 to-red-500'
                              : avgNegativeRatio > 25
                                ? 'bg-gradient-to-r from-green-400 to-yellow-400'
                                : 'bg-gradient-to-r from-green-500 to-emerald-400',
                          )}
                          style={{ width: `${Math.min(100, isNaN(avgNegativeRatio) ? 0 : avgNegativeRatio)}%` }}
                        />
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleJumpToEvents()}
                        className="flex-1 py-2.5 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-xs font-medium border border-blue-500/30 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Radio className="w-3.5 h-3.5" />
                        查看{scopeLabel}相关事件
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => updateUserLevel('national')}
                        className="py-2.5 px-4 bg-slate-700/50 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-600/50 transition-colors flex items-center gap-1.5"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                        上一级
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-1">暂无{scopeLabel}的热力数据</p>
                  <p className="text-xs text-slate-500">切回国家级视角查看全国地图</p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-[400px]">
              {heatData.length > 0 ? (
                <ChinaHeatMap
                  data={heatData}
                  metric={currentMetric}
                  level={level}
                  scopeName={scopeLabel}
                  onProvinceClick={handleDrillDown}
                />
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
          key={`events-${level}-${regionName}-${dataKey}`}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">
              {level === 'national' ? '热门事件榜' : `${scopeLabel}热点事件`}
              <span className="ml-2 text-xs text-slate-500 font-normal">（{events.length} 条）</span>
            </h2>
            <button
              onClick={() => handleJumpToEvents()}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              查看全部
              <ArrowRight className="w-3 h-3" />
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
          key={`rank-${level}-${regionName}-${currentMetric}-${dataKey}`}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
        >
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            {level === 'national'
              ? `省份${metricList.find(m => m.key === currentMetric)?.label || '情感'} TOP10`
              : level === 'provincial'
                ? `${scopeLabel}地市排行`
                : `${scopeLabel}数据概览`}
          </h2>
          <div className="h-[300px]">
            <EmotionRankChart data={heatData.slice(0, 10)} metric={currentMetric} />
          </div>
        </motion.div>

        {/* 趋势图 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          key={`trend-${level}-${regionName}-${dataKey}`}
          className="lg:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">
              情感变化趋势
              <span className="ml-2 text-xs text-slate-500 font-normal">
                （最近 {emotionTrend.length} 天 · {scopeLabel}）
              </span>
            </h2>
            <div className="flex gap-2">
              {[7, level === 'national' ? 30 : level === 'provincial' ? 21 : 14].map((d, i) => (
                <button
                  key={d}
                  className={cn(
                    'px-3 py-1 text-xs rounded-md border transition-colors',
                    i === 1
                      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                      : 'text-slate-400 border-slate-700/50 hover:bg-slate-700/50',
                  )}
                >
                  {d}天
                </button>
              ))}
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
        key={`feed-${level}-${regionName}-${dataKey}`}
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
