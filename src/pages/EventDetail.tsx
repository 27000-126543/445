
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  AlertTriangle,
  Share2,
  Download,
  BarChart3,
  Users,
  MessageCircle,
} from 'lucide-react';
import { generateEvents, generateKeyNodes, generateKeywords, generateDailyEmotionData } from '@/mock';
import type { EventItem, KeyNode, KeywordItem, DailyEmotionData } from '@/types';
import { cn } from '@/lib/utils';
import SpreadGraph from '@/components/charts/SpreadGraph';
import WordCloudChart from '@/components/charts/WordCloudChart';
import OpinionLeadersList from '@/components/OpinionLeadersList';
import TrendChart from '@/components/charts/TrendChart';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [keyNodes, setKeyNodes] = useState<KeyNode[]>([]);
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [trendData, setTrendData] = useState<DailyEmotionData[]>([]);
  const [activeTab, setActiveTab] = useState('spread');

  useEffect(() => {
    const events = generateEvents(10);
    const found = events.find(e => e.id === id) || events[0];
    setEvent(found);
    setKeyNodes(generateKeyNodes(20));
    setKeywords(generateKeywords(50));
    setTrendData(generateDailyEmotionData(14));
  }, [id]);

  if (!event) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const getLevelLabel = (level: number) => {
    const labels = ['', '一级', '二级', '三级', '四级'];
    const colors = ['', 'text-red-400 bg-red-500/10 border-red-500/30', 'text-orange-400 bg-orange-500/10 border-orange-500/30', 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', 'text-blue-400 bg-blue-500/10 border-blue-500/30'];
    return { label: labels[level], className: colors[level] };
  };

  const getStatusLabel = (status: string) => {
    const map: Record<string, { label: string; className: string }> = {
      active: { label: '活跃', className: 'text-red-400 bg-red-500/10 border-red-500/30' },
      cooling: { label: '降温中', className: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
      resolved: { label: '已结案', className: 'text-green-400 bg-green-500/10 border-green-500/30' },
    };
    return map[status] || { label: status, className: 'text-slate-400 bg-slate-500/10 border-slate-500/30' };
  };

  const getTrendIcon = (trend: string) => {
    const map: Record<string, { icon: typeof TrendingUp; className: string; label: string }> = {
      rising: { icon: TrendingUp, className: 'text-red-400', label: '上升' },
      stable: { icon: Minus, className: 'text-slate-400', label: '平稳' },
      falling: { icon: TrendingDown, className: 'text-green-400', label: '下降' },
    };
    return map[trend];
  };

  const levelInfo = getLevelLabel(event.level);
  const statusInfo = getStatusLabel(event.status);
  const trendInfo = getTrendIcon(event.heatTrend);
  const TrendIcon = trendInfo.icon;

  const tabs = [
    { id: 'spread', label: '传播路径', icon: Share2 },
    { id: 'leaders', label: '意见领袖', icon: Users },
    { id: 'keywords', label: '关键词云', icon: MessageCircle },
    { id: 'trend', label: '趋势分析', icon: BarChart3 },
  ];

  return (
    <div className="p-6">
      {/* 返回和操作 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/events')}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            返回事件列表
          </button>
          <div className="h-5 w-px bg-slate-700" />
          <span className="text-slate-500 text-sm">事件详情</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 text-sm text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-700/50 transition-colors flex items-center gap-2">
            <Download className="w-4 h-4" />
            导出报告
          </button>
          <button className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            发起预警
          </button>
        </div>
      </motion.div>

      {/* 事件基本信息 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 mb-6"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{event.title}</h1>
              <span className={cn('text-xs px-2 py-1 rounded border font-medium', levelInfo.className)}>
                {levelInfo.label}事件
              </span>
              <span className={cn('text-xs px-2 py-1 rounded border font-medium', statusInfo.className)}>
                {statusInfo.label}
              </span>
            </div>
            <p className="text-slate-400">{event.description}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-slate-500 text-sm mb-1">热度指数</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-orange-400 tabular-nums">
                {event.heatIndex.toLocaleString()}
              </span>
              <div className={cn('flex items-center text-xs', trendInfo.className)}>
                <TrendIcon className="w-3 h-3" />
                <span>{trendInfo.label}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-slate-500 text-sm mb-1">负面占比</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-bold text-red-400 tabular-nums">
                {event.negativeRatio}%
              </span>
            </div>
            <div className="mt-2 h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                style={{ width: `${event.negativeRatio}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-slate-500 text-sm mb-1">情感得分</p>
            <span className="text-2xl font-bold text-blue-400 tabular-nums">
              {event.emotionScore.toFixed(1)}
            </span>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-slate-500 text-sm mb-1">传播速度</p>
            <span className="text-2xl font-bold text-purple-400 tabular-nums">
              {event.spreadSpeed.toFixed(1)}
            </span>
            <span className="text-xs text-slate-500 ml-1">级/小时</span>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-slate-500 text-sm mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              发生时间
            </p>
            <span className="text-lg font-medium text-slate-200">
              {event.startTime}
            </span>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-slate-500 text-sm mb-1 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              涉及地域
            </p>
            <span className="text-sm text-slate-200">
              {event.region.provinces.join('、')}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tab切换 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden"
      >
        <div className="border-b border-slate-700/50 px-4">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'px-4 py-3 text-sm font-medium flex items-center gap-2 border-b-2 transition-colors',
                    isActive
                      ? 'text-blue-400 border-blue-400'
                      : 'text-slate-400 border-transparent hover:text-slate-200'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* 传播路径图谱 */}
          {activeTab === 'spread' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[500px]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  近7天传播路径图谱
                </h3>
                <div className="flex gap-2 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    意见领袖
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-yellow-500" />
                    核心传播者
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    一般节点
                  </span>
                </div>
              </div>
              <SpreadGraph nodes={keyNodes} />
            </motion.div>
          )}

          {/* 意见领袖 */}
          {activeTab === 'leaders' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  意见领袖影响力排名 TOP20
                </h3>
              </div>
              <OpinionLeadersList leaders={keyNodes} />
            </motion.div>
          )}

          {/* 关键词云 */}
          {activeTab === 'keywords' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[500px]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-green-400" />
                  网民评论关键词云
                </h3>
                <div className="flex gap-2 text-xs">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                    正面
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    中性
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    负面
                  </span>
                </div>
              </div>
              <WordCloudChart data={keywords} />
            </motion.div>
          )}

          {/* 趋势分析 */}
          {activeTab === 'trend' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-[500px]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  近14天情感变化趋势
                </h3>
              </div>
              <TrendChart data={trendData} />
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
