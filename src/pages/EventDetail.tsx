
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
  Zap,
  FileCheck,
  FileSpreadsheet,
  ChevronRight,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
} from 'lucide-react';
import { generateEvents, generateKeyNodes, generateKeywords, generateDailyEmotionData, generateRiskPredictions, generateChannelRecs, generateSpeakerRecs } from '@/mock';
import type {
  EventItem,
  KeyNode,
  KeywordItem,
  DailyEmotionData,
  Warning,
  ApprovalFlow,
  Plan,
  RiskPrediction,
  SpeakerRec,
  ChannelRec,
} from '@/types';
import { useWarningApprovalStore } from '@/store/useWarningApprovalStore';
import { usePlanStore } from '@/store/usePlanStore';
import { cn } from '@/lib/utils';
import SpreadGraph from '@/components/charts/SpreadGraph';
import WordCloudChart from '@/components/charts/WordCloudChart';
import OpinionLeadersList from '@/components/OpinionLeadersList';
import TrendChart from '@/components/charts/TrendChart';

export default function EventDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { rawWarnings, rawApprovalTodos, rawApprovalDones } = useWarningApprovalStore();
  const { plans } = usePlanStore();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [keyNodes, setKeyNodes] = useState<KeyNode[]>([]);
  const [keywords, setKeywords] = useState<KeywordItem[]>([]);
  const [trendData, setTrendData] = useState<DailyEmotionData[]>([]);
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>([]);
  const [speakerRecs, setSpeakerRecs] = useState<SpeakerRec[]>([]);
  const [channelRecs, setChannelRecs] = useState<ChannelRec[]>([]);
  const [activeTab, setActiveTab] = useState('spread');

  useEffect(() => {
    const events = generateEvents(30);
    const found = events.find(e => e.id === id) || events[0];
    setEvent(found);
    setKeyNodes(generateKeyNodes(20));
    setKeywords(generateKeywords(50));
    setTrendData(generateDailyEmotionData(14));
    setRiskPredictions(generateRiskPredictions(3));
    setSpeakerRecs(generateSpeakerRecs(3));
    setChannelRecs(generateChannelRecs(4));
  }, [id]);

  const relatedWarnings = rawWarnings.filter(w =>
    w.eventId === id || w.eventTitle.includes(event?.title?.slice(0, 6) || '')
  );
  const relatedApprovals: ApprovalFlow[] = [
    ...rawApprovalTodos.filter(a => a.eventId === id || relatedWarnings.some(w => w.id === a.warningId)),
    ...rawApprovalDones.filter(a => a.eventId === id || relatedWarnings.some(w => w.id === a.warningId)),
  ];
  const relatedPlans: Plan[] = plans.slice(0, 3);

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
    { id: 'related', label: '关联预警/审批', icon: Zap },
    { id: 'plans', label: '推荐预案', icon: FileSpreadsheet },
  ];

  const getApprovalStatusInfo = (status: string) => {
    const map: Record<string, { label: string; icon: typeof CheckCircle2; className: string }> = {
      pending_analyst: { label: '待分析研判', icon: Loader2, className: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
      pending_edu: { label: '待宣教审核', icon: Loader2, className: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
      pending_propaganda: { label: '待宣传审核', icon: Loader2, className: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
      approved: { label: '已通过', icon: CheckCircle2, className: 'text-green-400 bg-green-500/10 border-green-500/30' },
      rejected: { label: '已驳回', icon: XCircle, className: 'text-red-400 bg-red-500/10 border-red-500/30' },
    };
    return map[status] || { label: status, icon: Clock, className: 'text-slate-400 bg-slate-500/10 border-slate-500/30' };
  };

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

          {/* 关联预警和审批 */}
          {activeTab === 'related' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  相关预警
                  <span className="text-xs text-slate-500 font-normal">（{relatedWarnings.length} 条）</span>
                </h3>
                {relatedWarnings.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {relatedWarnings.map(w => {
                      const statusMap: Record<string, { label: string; cls: string }> = {
                        pending: { label: '待确认', cls: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
                        confirmed: { label: '已确认', cls: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
                        processing: { label: '处理中', cls: 'text-purple-400 bg-purple-500/10 border-purple-500/30' },
                        resolved: { label: '已解决', cls: 'text-green-400 bg-green-500/10 border-green-500/30' },
                        dismissed: { label: '已忽略', cls: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
                      };
                      const info = statusMap[w.status] || statusMap.pending;
                      return (
                        <div key={w.id} className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:border-yellow-500/30 transition-colors">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="text-white font-medium line-clamp-1">{w.eventTitle}</h4>
                            <span className={cn('text-xs px-2 py-0.5 rounded border whitespace-nowrap ml-2', info.cls)}>
                              {info.label}
                            </span>
                          </div>
                          <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                            触发条件：{w.triggerCondition.type} 阈值 {w.triggerCondition.threshold}，实际值 {w.triggerCondition.actualValue}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500 flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {w.region || '全国'}
                            </span>
                            <span className="text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {w.createdAt}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-slate-900/30 rounded-xl">
                    <Zap className="w-10 h-10 text-slate-600 mb-2" />
                    <p className="text-slate-400 text-sm">暂无关联预警</p>
                    <button className="mt-3 text-xs px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded border border-yellow-500/30 hover:bg-yellow-500/30 transition-colors">
                      为此事件发起预警
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-purple-400" />
                  审批进度
                  <span className="text-xs text-slate-500 font-normal">（{relatedApprovals.length} 条）</span>
                </h3>
                {relatedApprovals.length > 0 ? (
                  <div className="space-y-3">
                    {relatedApprovals.map(a => {
                      const info = getApprovalStatusInfo(a.status);
                      const StatusIcon = info.icon;
                      const steps = [
                        { key: 'pending_analyst', label: '分析研判' },
                        { key: 'pending_edu', label: '宣教审核' },
                        { key: 'pending_propaganda', label: '宣传审核' },
                        { key: 'approved', label: '最终通过' },
                      ];
                      const currentStep = a.status === 'rejected' ? -1 : steps.findIndex(s => s.key === a.status);
                      return (
                        <div key={a.id} className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="text-white font-medium">{a.eventTitle}</h4>
                              <p className="text-slate-500 text-xs mt-1">
                                申请人：{a.initiator} · {a.initiatorDept} · {a.createdAt}
                              </p>
                            </div>
                            <span className={cn('text-xs px-2 py-0.5 rounded border inline-flex items-center gap-1', info.className)}>
                              <StatusIcon className="w-3 h-3" />
                              {info.label}
                            </span>
                          </div>
                          {a.status !== 'rejected' && (
                            <div className="flex items-center gap-2 mb-3">
                              {steps.map((step, idx) => {
                                const done = idx < currentStep || a.status === 'approved';
                                const active = idx === currentStep && a.status !== 'approved';
                                return (
                                  <div key={step.key} className="flex items-center gap-1 flex-1">
                                    <div className={cn(
                                      'w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold',
                                      done ? 'bg-green-500 text-white' : active ? 'bg-blue-500 text-white animate-pulse' : 'bg-slate-700 text-slate-500',
                                    )}>
                                      {done ? '✓' : idx + 1}
                                    </div>
                                    <span className={cn('text-[11px] whitespace-nowrap',
                                      done ? 'text-green-400' : active ? 'text-blue-400' : 'text-slate-500')}>
                                      {step.label}
                                    </span>
                                    {idx < steps.length - 1 && (
                                      <div className={cn('flex-1 h-px', done ? 'bg-green-500/50' : 'bg-slate-700')} />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                          {a.steps && a.steps.length > 0 && (
                            <div className="pt-3 border-t border-slate-700/50 space-y-2">
                              {a.steps.map((r, i) => (
                                <div key={i} className="text-xs">
                                  <span className="text-slate-500">
                                    [{r.handleTime || a.createdAt}] {r.handler || r.role}：
                                  </span>
                                  <span className="text-slate-300">
                                    {r.status === 'approved' ? '通过' : r.status === 'rejected' ? '驳回' : '待处理'}
                                  </span>
                                  {r.opinion && <span className="text-slate-400 ml-1">「{r.opinion}」</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-slate-900/30 rounded-xl">
                    <FileCheck className="w-10 h-10 text-slate-600 mb-2" />
                    <p className="text-slate-400 text-sm">暂无审批流程</p>
                    <p className="text-slate-500 text-xs mt-1">预警确认后会自动生成审批单</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* 推荐预案 */}
          {activeTab === 'plans' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div>
                <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-green-400" />
                  推荐应急预案
                  <span className="text-xs text-slate-500 font-normal">（{relatedPlans.length} 个）</span>
                </h3>
                {relatedPlans.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {relatedPlans.map(p => {
                      const statusCls = p.status === 'active'
                        ? 'text-green-400 bg-green-500/10 border-green-500/30'
                        : p.status === 'draft'
                          ? 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30'
                          : 'text-slate-400 bg-slate-500/10 border-slate-500/30';
                      const statusLabel = p.status === 'active' ? '已发布' : p.status === 'draft' ? '草稿' : '已归档';
                      return (
                        <motion.div
                          key={p.id}
                          whileHover={{ y: -2 }}
                          onClick={() => navigate(`/plans/${p.id}`)}
                          className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:border-green-500/30 cursor-pointer transition-all group"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center border border-green-500/30">
                              <FileSpreadsheet className="w-5 h-5 text-green-400" />
                            </div>
                            <span className={cn('text-[10px] px-1.5 py-0.5 rounded border', statusCls)}>{statusLabel}</span>
                          </div>
                          <h4 className="text-white font-medium mb-1 line-clamp-1 group-hover:text-green-400 transition-colors">{p.name}</h4>
                          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {p.year}年版
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-700/50">
                            <span className="text-slate-500">{p.nodesCount || 5} 个关键节点</span>
                            <span className="text-green-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                              查看详情
                              <ChevronRight className="w-3 h-3" />
                            </span>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 bg-slate-900/30 rounded-xl">
                    <FileSpreadsheet className="w-10 h-10 text-slate-600 mb-2" />
                    <p className="text-slate-400 text-sm">暂无匹配预案</p>
                  </div>
                )}
              </div>

              {/* 辅助建议：风险、发言人、渠道 */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    风险预测
                  </h4>
                  <div className="space-y-2">
                    {riskPredictions.slice(0, 3).map(r => (
                      <div key={r.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300 line-clamp-1">{r.title || r.eventType}</span>
                        <span className="text-red-400 font-medium tabular-nums">{r.probability}%</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-400" />
                    推荐发言人
                  </h4>
                  <div className="space-y-2">
                    {speakerRecs.slice(0, 3).map(s => (
                      <div key={s.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-[10px] text-white font-bold">
                            {s.name[0]}
                          </div>
                          <span className="text-slate-300">{s.name}</span>
                        </div>
                        <span className="text-blue-400 text-xs tabular-nums">{(s.matchScore || 85)}分</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl">
                  <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-purple-400" />
                    推荐渠道
                  </h4>
                  <div className="space-y-2">
                    {channelRecs.slice(0, 3).map(c => (
                      <div key={c.id} className="flex items-center justify-between text-sm">
                        <span className="text-slate-300">{c.name}</span>
                        <span className="text-purple-400 font-medium tabular-nums">{Math.round((c.weight || 0) * 100)}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
