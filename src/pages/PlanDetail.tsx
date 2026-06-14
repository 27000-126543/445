
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
} from 'lucide-react';
import {
  generatePlans,
  generatePlanKeyNodes,
  generateRiskPredictions,
  generateSpeakerRecs,
  generateChannelRecs,
} from '@/mock';
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
  const [plan, setPlan] = useState<Plan | null>(null);
  const [keyNodes, setKeyNodes] = useState<PlanKeyNode[]>([]);
  const [riskPredictions, setRiskPredictions] = useState<RiskPrediction[]>([]);
  const [speakers, setSpeakers] = useState<SpeakerRec[]>([]);
  const [channels, setChannels] = useState<ChannelRec[]>([]);
  const [activeTab, setActiveTab] = useState('nodes');

  useEffect(() => {
    const plans = generatePlans(5);
    const found = plans.find(p => p.id === id) || plans[0];
    setPlan(found);
    setKeyNodes(generatePlanKeyNodes(8));
    setRiskPredictions(generateRiskPredictions(6));
    setSpeakers(generateSpeakerRecs(4));
    setChannels(generateChannelRecs(6));
  }, [id]);

  if (!plan) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
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
            <h1 className="text-2xl font-bold text-white">{plan.name}</h1>
            <p className="text-slate-400 text-sm mt-1">{plan.type} · 创建于 {plan.createdAt?.slice(0, 10)}</p>
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
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">高风险事件</p>
          <p className="text-2xl font-bold text-red-400">
            {riskPredictions.filter(r => r.riskLevel === 'high').length} 个
          </p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">推荐发言人</p>
          <p className="text-2xl font-bold text-blue-400">{speakers.length} 位</p>
        </div>
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4">
          <p className="text-slate-400 text-sm mb-1">发声渠道</p>
          <p className="text-2xl font-bold text-purple-400">{channels.length} 个</p>
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
                        <p className="text-slate-400 text-sm mb-2 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {node.date}
                        </p>
                        <p className="text-slate-500 text-sm">{node.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 风险预测 */}
          {activeTab === 'risks' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-400" />
                未来72小时高风险事件预测
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {riskPredictions.map((risk, index) => {
                  const riskInfo = riskLevelMap[risk.riskLevel];
                  
                  return (
                    <motion.div
                      key={risk.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="text-white font-medium">{risk.eventType}</h4>
                        <span className={cn('text-xs px-2 py-0.5 rounded border', riskInfo.className)}>
                          {riskInfo.label}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-500 w-20">发生概率</span>
                          <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', riskInfo.dotClass)}
                              style={{ width: `${risk.probability}%` }}
                            />
                          </div>
                          <span className="text-slate-300 w-12 text-right">{risk.probability}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Clock className="w-3 h-3" />
                          预计时间: {risk.predictedTime?.slice(0, 16)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <MapPin className="w-3 h-3" />
                          影响地区: {risk.predictedRegion.join('、')}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-700/50">
                        <p className="text-xs text-slate-500 mb-2">应对建议:</p>
                        <ul className="space-y-1">
                          {risk.suggestions.slice(0, 2).map((s, i) => (
                            <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                              <Lightbulb className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 发言人推荐 */}
          {activeTab === 'speakers' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                最优发言人推荐
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {speakers.map((speaker, index) => (
                  <motion.div
                    key={speaker.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-900/50 rounded-xl p-5 border border-slate-700/50 hover:border-blue-500/30 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                        {speaker.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-white font-semibold">{speaker.name}</h4>
                          <span className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">
                            推荐指数 {speaker.suitabilityScore}
                          </span>
                        </div>
                        <p className="text-slate-400 text-sm mb-2">{speaker.title} · {speaker.department}</p>
                        <div className="flex flex-wrap gap-1">
                          {speaker.expertise.map((exp, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-300 rounded">
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mt-4 pt-4 border-t border-slate-700/50">
                      推荐理由: {speaker.reason}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* 渠道推荐 */}
          {activeTab === 'channels' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Radio className="w-5 h-5 text-purple-400" />
                最佳发声渠道组合
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {channels.map((channel, index) => (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-white font-medium">{channel.channel}</h4>
                      <span className="text-xs px-2 py-0.5 bg-slate-700/50 text-slate-400 rounded">
                        {channel.channelType}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">受众覆盖</span>
                        <span className="text-slate-300">{(channel.audienceCoverage / 10000).toFixed(0)}万</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">效果评分</span>
                        <span className="text-green-400 font-medium">{channel.effectivenessScore}分</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">最佳时段</span>
                        <span className="text-slate-300">{channel.recommendedTime}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-700/50">
                      <p className="text-xs text-slate-500 line-clamp-2">{channel.reason}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
