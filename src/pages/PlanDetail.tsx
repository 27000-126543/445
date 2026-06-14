
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
  User,
  Radio,
  Lightbulb,
  TrendingUp,
  Clock,
  MapPin,
  Star,
  ChevronRight,
  FileSpreadsheet,
  Sparkles,
} from 'lucide-react';
import { usePlanStore } from '@/store/usePlanStore';
import type {
  Plan,
  PlanKeyNode,
  RiskPrediction,
  SpeakerRec,
  ChannelRec,
} from '@/types';
import { cn } from '@/lib/utils';

const riskLevelMap: Record<string, { label: string; className: string; dotClass: string }> = {
  high: { label: '高风险', className: 'text-red-400 bg-red-500/10 border-red-500/30', dotClass: 'bg-red-500' },
  medium: { label: '中风险', className: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30', dotClass: 'bg-yellow-500' },
  low: { label: '低风险', className: 'text-green-400 bg-green-500/10 border-green-500/30', dotClass: 'bg-green-500' },
};

export default function PlanDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPlanById, getPlanDetail, plans } = usePlanStore();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [keyNodes, setKeyNodes] = useState<PlanKeyNode[]>([]);
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>([]);
  const [speakers, setSpeakers] = useState<SpeakerRec[]>([]);
  const [channels, setChannels] = useState<ChannelRec[]>([]);
  const [activeTab, setActiveTab] = useState('nodes');
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    if (!id) return;

    // 如果 store 还没初始化，手动 init 一下（防止用户直接刷新详情页）
    const found = getPlanById(id) || plans[0];
    if (found) {
      setPlan(found);
      setIsNew(!!found.fileName);
      const detail = getPlanDetail(id);
      setKeyNodes(detail.keyNodes);
      setRiskPredictions(detail.riskPredictions);
      setSpeakers(detail.speakerRecs);
      setChannels(detail.channelRecs);
    } else {
      // fallback - 生成默认
      setKeyNodes([
        { id: '1', title: '两会期间', date: '2024-03-05', type: '重要会议', description: '全国两会期间舆情引导', riskLevel: 'high' as const },
        { id: '2', title: '春节', date: '2024-01-28', type: '重大节日', description: '春节及春运期间', riskLevel: 'medium' as const },
        { id: '3', title: '高考', date: '2024-06-07', type: '敏感节点', description: '高考及升学季', riskLevel: 'high' as const },
      ]);
      setRiskPredictions([]);
      setSpeakers([]);
      setChannels([]);
    }
  }, [id, getPlanById, getPlanDetail, plans]);

  if (!plan) {
    return (
      <div className="flex items-center justify-center h-full p-20">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-400">正在加载预案详情...</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'nodes', label: '关键节点', icon: Calendar },
    { id: 'risks', label: '风险预测', icon: AlertTriangle },
    { id: 'speakers', label: '发言人推荐', icon: User },
    { id: 'channels', label: '渠道推荐', icon: Radio },
  ];

  return (
    <div className="p-6">
      {/* 返回 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/plan')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          返回预案列表
        </button>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-white">{plan.name}</h1>
              {isNew && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 text-xs font-medium">
                  <Sparkles className="w-3 h-3" />
                  新解析
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
              <span>{plan.type}</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>{plan.year}年度</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>创建于 {plan.createdAt?.slice(0, 10)}</span>
              {plan.fileName && (
                <>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span className="inline-flex items-center gap-1.5 text-slate-500">
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    {plan.fileName}
                  </span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 text-sm text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-700/50 transition-colors">
              编辑预案
            </button>
            <button className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
              生成预测报告
            </button>
          </div>
        </div>
      </motion.div>

      {/* 概览卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-4 mb-6"
      >
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">关键节点</p>
          <p className="text-2xl font-bold text-white">{keyNodes.length} 个</p>
          <p className="text-xs text-slate-500 mt-1">已提取关键节点</p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">高风险事件</p>
          <p className="text-2xl font-bold text-red-400">
            {riskPredictions.filter(r => r.riskLevel === 'high').length} 个
          </p>
          <p className="text-xs text-slate-500 mt-1">未来72小时内</p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">推荐发言人</p>
          <p className="text-2xl font-bold text-blue-400">{speakers.length} 位</p>
          <p className="text-xs text-slate-500 mt-1">基于匹配度排序</p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">发声渠道</p>
          <p className="text-2xl font-bold text-purple-400">{channels.length} 个</p>
          <p className="text-xs text-slate-500 mt-1">最佳渠道组合</p>
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
          {/* 关键节点 */}
          {activeTab === 'nodes' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-400" />
                年度关键节点时间线
              </h3>
              {keyNodes.length > 0 ? (
                <div className="space-y-4">
                  {keyNodes.map((node, index) => {
                    const riskInfo = riskLevelMap[node.riskLevel];

                    return (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div className={cn('w-3 h-3 rounded-full mt-1.5', riskInfo.dotClass)} />
                          {index < keyNodes.length - 1 && (
                            <div className="w-0.5 flex-1 bg-slate-700" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-white font-medium">{node.title}</h4>
                            <span className={cn('text-xs px-2 py-0.5 rounded border', riskInfo.className)}>
                              {riskInfo.label}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-400">
                              {node.type}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400 mb-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {node.date}
                            </span>
                          </div>
                          <p className="text-slate-500 text-sm">{node.description}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <Calendar className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-slate-400">暂无关键节点数据</p>
                </div>
              )}
            </motion.div>
          )}

          {/* 风险预测 */}
          {activeTab === 'risks' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                未来72小时高风险事件预测
              </h3>
              {riskPredictions.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {riskPredictions.map((risk, index) => {
                    const riskInfo = riskLevelMap[risk.riskLevel];
                    return (
                      <motion.div
                        key={risk.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="text-white font-medium">{risk.title}</h4>
                          <span className={cn('text-xs px-2 py-0.5 rounded border', riskInfo.className)}>
                            {riskInfo.label}
                          </span>
                        </div>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">
                          {risk.description}
                        </p>
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1 text-slate-400">
                              <TrendingUp className="w-3 h-3 text-red-400" />
                              发生概率 {risk.probability}%
                            </span>
                            <span className="flex items-center gap-1 text-slate-400">
                              <MapPin className="w-3 h-3" />
                              {risk.affectedAreas.length}个地区
                            </span>
                          </div>
                          <span className="flex items-center gap-1 text-slate-500">
                            <Clock className="w-3 h-3" />
                            {risk.predictTime}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <AlertTriangle className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-slate-400">暂无风险预测数据</p>
                </div>
              )}
            </motion.div>
          )}

          {/* 发言人推荐 */}
          {activeTab === 'speakers' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-400" />
                最优发言人安排推荐
              </h3>
              {speakers.length > 0 ? (
                <div className="space-y-3">
                  {speakers.map((spk, index) => (
                    <motion.div
                      key={spk.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-700/50 rounded-xl hover:border-slate-600/50 transition-colors"
                    >
                      <div className="relative">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                          {spk.name[0]}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center">
                            <Star className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-medium">{spk.name}</h4>
                          <span className="text-xs text-slate-500">{spk.title}</span>
                        </div>
                        <p className="text-sm text-slate-400 mb-2">{spk.department}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {spk.expertise.map((ex, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded bg-slate-700/50 text-slate-300">
                              {ex}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-400 mb-1">{spk.matchScore}%</div>
                        <p className="text-xs text-slate-500">匹配度</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <User className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-slate-400">暂无发言人推荐数据</p>
                </div>
              )}
            </motion.div>
          )}

          {/* 渠道推荐 */}
          {activeTab === 'channels' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-400" />
                最佳发声渠道组合推荐
              </h3>
              {channels.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {channels.map((ch, index) => (
                    <motion.div
                      key={ch.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                            <Lightbulb className="w-5 h-5 text-purple-400" />
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{ch.name}</h4>
                            <p className="text-xs text-slate-500">{ch.type}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-purple-400">{ch.weight}%</div>
                          <p className="text-xs text-slate-500">权重占比</p>
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm mb-3 line-clamp-2">
                        {ch.description}
                      </p>
                      <div className="flex items-center justify-between text-xs border-t border-slate-700/50 pt-3">
                        <span className="text-slate-400">
                          预计覆盖 <span className="text-white font-medium">{ch.reach.toLocaleString()}</span> 人
                        </span>
                        <span className="flex items-center gap-1 text-green-400">
                          <ChevronRight className="w-3 h-3" />
                          建议优先发布
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16">
                  <Radio className="w-12 h-12 text-slate-600 mb-3" />
                  <p className="text-slate-400">暂无渠道推荐数据</p>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// 类型引用
type _PlanTypesRef = Plan | PlanKeyNode | RiskPrediction | SpeakerRec | ChannelRec;
