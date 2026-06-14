
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  Clock,
  MessageSquare,
  Zap,
  RefreshCw,
} from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import ChinaHeatMap from '@/components/charts/ChinaHeatMap';
import EmotionRankChart from '@/components/charts/EmotionRankChart';
import TrendChart from '@/components/charts/TrendChart';
import RealtimeFeed from '@/components/RealtimeFeed';
import HotEventsList from '@/components/HotEventsList';
import {
  generateDashboardStats,
  generateProvinceHeatData,
  generateEvents,
  generateOpinionList,
  generateDailyEmotionData,
} from '@/mock';
import type { ProvinceHeatData, EventItem, DashboardStats } from '@/types';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [heatData, setHeatData] = useState<ProvinceHeatData[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [opinions, setOpinions] = useState([]);
  const [emotionTrend, setEmotionTrend] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setStats(generateDashboardStats());
    setHeatData(generateProvinceHeatData());
    setEvents(generateEvents(10));
    setOpinions(generateOpinionList(20));
    setEmotionTrend(generateDailyEmotionData(30));
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      loadData();
      setIsRefreshing(false);
    }, 1000);
  };

  const handleProvinceClick = (province: ProvinceHeatData) => {
    console.log('点击省份:', province.name);
  };

  const handleEventClick = (event: EventItem) => {
    navigate(`/events/${event.id}`);
  };

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
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">舆情总览</h1>
          <p className="text-slate-400 text-sm mt-1">实时监控全国网络舆情态势</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg text-sm font-medium transition-colors border border-blue-500/30"
        >
          <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
          刷新数据
        </button>
      </motion.div>

      {/* 数据卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      </div>

      {/* 主要内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧 - 地图 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              全国舆情热力图
            </h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/30">
                省级
              </button>
              <button className="px-3 py-1 text-xs text-slate-400 rounded-md hover:bg-slate-700/50">
                市级
              </button>
            </div>
          </div>
          <div className="h-[400px]">
            <ChinaHeatMap data={heatData} onProvinceClick={handleProvinceClick} />
          </div>
        </motion.div>

        {/* 右侧 - 热门事件 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">热门事件榜</h2>
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
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
        >
          <h2 className="text-white font-semibold mb-4">省份情感分布 TOP10</h2>
          <div className="h-[300px]">
            <EmotionRankChart data={heatData} />
          </div>
        </motion.div>

        {/* 趋势图 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="lg:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">情感变化趋势</h2>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs text-slate-400 rounded-md hover:bg-slate-700/50">
                7天
              </button>
              <button className="px-3 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-md border border-blue-500/30">
                30天
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
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            实时舆情流
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

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
