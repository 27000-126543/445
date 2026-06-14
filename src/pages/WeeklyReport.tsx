
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Clock,
  Lightbulb,
  BookOpen,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Globe2,
  Building2,
  MapPin,
  Eye,
} from 'lucide-react';
import {
  generateWeeklyReport,
  generateDailyEmotionData,
  generateRegionRank,
} from '@/mock';
import { useUserStore } from '@/store/useUserStore';
import type { WeeklyReport as WeeklyReportType, DailyEmotionData, RegionRankItem } from '@/types';
import { cn } from '@/lib/utils';
import TrendChart from '@/components/charts/TrendChart';

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

export default function WeeklyReport() {
  const { level, regionName } = useUserStore();
  const ratio = LEVEL_RATIO[level];
  const LevelIcon = levelIconMap[level];
  const scopeLabel = level === 'national' ? '全国' : regionName;

  const [report, setReport] = useState<WeeklyReportType | null>(null);
  const [emotionTrend, setEmotionTrend] = useState<DailyEmotionData[]>([]);
  const [regionRank, setRegionRank] = useState<RegionRankItem[]>([]);
  const [dataKey, setDataKey] = useState(0);

  const scaleNumber = (n: number, r: number) => Math.max(1, Math.round(n * r));

  useEffect(() => {
    const raw = generateWeeklyReport();
    const scaledReport: WeeklyReportType = {
      ...raw,
      region: scopeLabel,
      startDate: level === 'national' ? raw.startDate : level === 'provincial' ? raw.startDate : raw.endDate.split('-').slice(0, 2).join('-') + '-20',
      summary: {
        ...raw.summary,
        totalOpinions: scaleNumber(raw.summary.totalOpinions, ratio),
        warningCount: scaleNumber(raw.summary.warningCount, ratio),
        avgResponseTime: Math.round(raw.summary.avgResponseTime * (1 + (1 - ratio) * 0.15)),
        resolvedCount: scaleNumber(raw.summary.resolvedCount, ratio),
        unresolvedCount: scaleNumber(raw.summary.unresolvedCount, ratio),
        weekOnWeek: Math.round(raw.summary.weekOnWeek * ratio),
        weekOnWeekYoY: Math.round(raw.summary.weekOnWeekYoY * ratio),
      },
    };
    setReport(scaledReport);

    const days = level === 'national' ? 7 : (level === 'provincial' ? 7 : 5);
    const rawTrend = generateDailyEmotionData(days);
    setEmotionTrend(rawTrend.map(d => ({
      ...d,
      count: scaleNumber(d.count, ratio),
      positive: scaleNumber(d.positive, ratio),
      neutral: scaleNumber(d.neutral, ratio),
      negative: scaleNumber(d.negative, ratio),
    })) as DailyEmotionData[]);

    const rankCount = level === 'national' ? 10 : (level === 'provincial' ? 6 : 4);
    const rawRank = generateRegionRank();
    setRegionRank(rawRank.slice(0, rankCount).map((r, i) => ({
      ...r,
      region: level === 'municipal'
        ? ['南山', '福田', '罗湖', '宝安', '龙岗', '龙华', '盐田', '坪山'][i] || r.region
        : r.region,
      efficiencyScore: Math.round(r.efficiencyScore * (0.8 + ratio * 0.2)),
      opinionCount: scaleNumber(r.opinionCount, ratio),
    })) as RegionRankItem[]);
  }, [level, regionName, dataKey]);

  if (!report) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const { summary } = report;

  const formatChange = (value: number) => {
    const isPositive = value >= 0;
    return (
      <span className={cn('flex items-center gap-1', isPositive ? 'text-red-400' : 'text-green-400')}>
        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
        {Math.abs(value)}%
      </span>
    );
  };

  const strategies = [
    { id: 1, category: '内容引导', priority: 'high', content: `加强${scopeLabel}范围内正面议题设置，围绕民生热点主动发声`, basis: `本周负面舆情占比上升${(1.2 * (1 + (1 - ratio) * 0.8)).toFixed(1)}%` },
    { id: 2, category: '响应速度', priority: 'high', content: level === 'national' ? '缩短全国预警响应时间，建立2小时快速响应机制' : `缩短${scopeLabel}预警响应时间，建立1.5小时快速响应机制`, basis: `平均响应时间环比增加${Math.round(8 + (1 - ratio) * 15)}%` },
    { id: 3, category: '渠道建设', priority: 'medium', content: `拓展${scopeLabel}短视频平台官方账号矩阵`, basis: '短视频来源舆情占比持续增长' },
    { id: 4, category: '协同联动', priority: 'medium', content: level === 'municipal' ? '加强市-区-街道三级舆情协同处置机制' : '加强跨部门舆情协同处置机制', basis: `多部门协同事件处置效率${level === 'municipal' ? '待提升' : '偏低'}` },
  ];

  const trainingFocuses = [
    { id: 1, topic: '危机公关应对', priority: 'high', type: '实战演练', reason: `${scopeLabel}近期突发公共事件舆情处置能力待提升` },
    { id: 2, topic: '新媒体运营', priority: 'medium', type: '技能培训', reason: '短视频和社交平台运营技巧需要更新' },
    { id: 3, topic: '舆情分析方法', priority: 'medium', type: '专业培训', reason: level !== 'national' ? '基层舆情分析人员专业能力参差不齐' : '舆情分析方法论需持续升级' },
    { id: 4, topic: '法律法规', priority: 'low', type: '知识培训', reason: '网络舆情相关法规政策更新' },
  ];

  const priorityMap: Record<string, { label: string; className: string }> = {
    high: { label: '高优先级', className: 'text-red-400 bg-red-500/10 border-red-500/30' },
    medium: { label: '中优先级', className: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
    low: { label: '低优先级', className: 'text-green-400 bg-green-500/10 border-green-500/30' },
  };

  return (
    <div className="p-6">
      {/* 页面标题 */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        key={`header-${level}-${regionName}-${dataKey}`}
        className="flex items-center justify-between mb-6 flex-wrap gap-4"
      >
        <div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <FileText className="w-7 h-7 text-blue-400" />
              舆情生态诊断报告
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
            <Calendar className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />
            {report.week} · {report.startDate} 至 {report.endDate} · {report.region}
            <span className="mx-2 text-slate-600">|</span>
            <Eye className="w-3.5 h-3.5 inline mr-1 -mt-0.5 text-blue-400" />
            数据可见度 <span className="text-blue-300">{Math.round(ratio * 100)}%</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDataKey(k => k - 1)}
              className="p-1.5 rounded-lg border border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 text-sm bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
              本周
            </button>
            <button
              onClick={() => setDataKey(k => k + 1)}
              className="p-1.5 rounded-lg border border-slate-700/50 text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/20">
            <Download className="w-4 h-4" />
            下载报告
          </button>
        </div>
      </motion.div>

      {/* 核心指标 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`stats-${level}-${regionName}-${dataKey}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6"
        >
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-colors">
            <p className="text-slate-400 text-sm mb-1">舆情总量</p>
            <p className="text-2xl font-bold text-white tabular-nums">
              {(summary.totalOpinions / 10000).toFixed(1)}万
            </p>
            <div className="mt-1 text-xs">环比 {formatChange(summary.weekOnWeek)}</div>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-colors">
            <p className="text-slate-400 text-sm mb-1">正面占比</p>
            <p className="text-2xl font-bold text-green-400 tabular-nums">
              {summary.positiveRatio}%
            </p>
            <div className="mt-1 text-xs">环比 {formatChange(summary.positiveWoW)}</div>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-colors">
            <p className="text-slate-400 text-sm mb-1">负面占比</p>
            <p className="text-2xl font-bold text-red-400 tabular-nums">
              {summary.negativeRatio}%
            </p>
            <div className="mt-1 text-xs">环比 {formatChange(summary.negativeWoW)}</div>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-colors">
            <p className="text-slate-400 text-sm mb-1">预警数量</p>
            <p className="text-2xl font-bold text-orange-400 tabular-nums">
              {summary.warningCount} 起
            </p>
            <div className="mt-1 text-xs">环比 {formatChange(summary.warningWoW)}</div>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600/50 transition-colors">
            <p className="text-slate-400 text-sm mb-1">平均响应</p>
            <p className="text-2xl font-bold text-blue-400 tabular-nums">
              {summary.avgResponseTime}h
            </p>
            <div className="mt-1 text-xs">环比 {formatChange(summary.responseTimeWoW)}</div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* 情感变化趋势 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          key={`trend-${level}-${regionName}`}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
        >
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            情感变化趋势（周同比）
            <span className="ml-2 text-xs text-slate-500 font-normal">
              {emotionTrend.length} 天
            </span>
          </h3>
          <div className="h-[250px]">
            <TrendChart data={emotionTrend} />
          </div>
        </motion.div>

        {/* 传播效率排名 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          key={`rank-${level}-${regionName}`}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
        >
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            {level === 'national' ? '传播效率排名 TOP10' : `${scopeLabel}区域传播效率 TOP${regionRank.length}`}
          </h3>
          <div className="space-y-2">
            {regionRank.map((item, index) => {
              const trendIcon = item.trend === 'up' ? TrendingUp : item.trend === 'down' ? TrendingDown : Minus;
              const TrendIcon = trendIcon;
              return (
                <motion.div
                  key={item.region}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className={cn(
                    'w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white flex-shrink-0',
                    index < 3 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-slate-700'
                  )}>
                    {index + 1}
                  </span>
                  <span className="text-slate-200 text-sm w-16 truncate">{item.region}</span>
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
                      style={{ width: `${item.efficiencyScore}%` }}
                    />
                  </div>
                  <span className="text-slate-300 text-sm w-14 text-right tabular-nums">
                    {item.efficiencyScore}
                  </span>
                  <TrendIcon className={cn(
                    'w-4 h-4 w-5',
                    item.trend === 'up' ? 'text-red-400' : item.trend === 'down' ? 'text-green-400' : 'text-slate-500'
                  )} />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 舆情引导策略推荐 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          key={`strategy-${level}-${regionName}`}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
        >
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400" />
            优化策略推荐
            <span className="ml-1 text-xs text-slate-500 font-normal">（针对{scopeLabel}定制）</span>
          </h3>
          <div className="space-y-3">
            {strategies.map((strategy, index) => {
              const priorityInfo = priorityMap[strategy.priority];
              return (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 text-sm font-medium">{strategy.category}</span>
                      <span className={cn('text-xs px-2 py-0.5 rounded border', priorityInfo.className)}>
                        {priorityInfo.label}
                      </span>
                    </div>
                  </div>
                  <p className="text-slate-200 text-sm mb-2">{strategy.content}</p>
                  <p className="text-xs text-slate-500">依据: {strategy.basis}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* 培训重点推荐 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          key={`training-${level}-${regionName}`}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
        >
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-400" />
            培训重点推荐
            <span className="ml-1 text-xs text-slate-500 font-normal">（{levelLabelMap[level]}层人员）</span>
          </h3>
          <div className="space-y-3">
            {trainingFocuses.map((focus, index) => {
              const priorityInfo = priorityMap[focus.priority];
              return (
                <motion.div
                  key={focus.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.05 }}
                  className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{focus.topic}</span>
                    <span className={cn('text-xs px-2 py-0.5 rounded border', priorityInfo.className)}>
                      {priorityInfo.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {focus.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{focus.reason}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* 辟谣响应统计 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        key={`refute-${level}-${regionName}`}
        className="mt-6 bg-slate-800/30 border border-slate-700/50 rounded-xl p-5"
      >
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-400" />
          辟谣响应时长分析 · {scopeLabel}
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-slate-600/30 transition-colors">
            <p className="text-3xl font-bold text-blue-400 mb-1 tabular-nums">
              {(2.5 * (1 + (1 - ratio) * 0.4)).toFixed(1)}h
            </p>
            <p className="text-sm text-slate-400">平均响应时间</p>
            <p className="text-xs text-green-400 mt-1">↓ {Math.round(15 * ratio)}% 环比</p>
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-slate-600/30 transition-colors">
            <p className="text-3xl font-bold text-green-400 mb-1 tabular-nums">
              {(87.3 - (1 - ratio) * 8).toFixed(1)}%
            </p>
            <p className="text-sm text-slate-400">辟谣有效率</p>
            <p className="text-xs text-green-400 mt-1">↑ {(5.2 * ratio).toFixed(1)}% 环比</p>
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-slate-600/30 transition-colors">
            <p className="text-3xl font-bold text-purple-400 mb-1 tabular-nums">
              {Math.max(2, scaleNumber(12, ratio))}
            </p>
            <p className="text-sm text-slate-400">本周辟谣次数</p>
            <p className="text-xs text-red-400 mt-1">↑ {Math.max(1, scaleNumber(3, ratio))} 起环比</p>
          </div>
          <div className="text-center p-4 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-slate-600/30 transition-colors">
            <p className="text-3xl font-bold text-orange-400 mb-1 tabular-nums">
              {(4.2 * (1 + (1 - ratio) * 0.5)).toFixed(1)}h
            </p>
            <p className="text-sm text-slate-400">最长响应时间</p>
            <p className={cn('text-xs mt-1', (1 - ratio) > 0.4 ? 'text-yellow-400' : 'text-yellow-400')}>
              {(1 - ratio) > 0.4 ? '需重点关注' : '需关注'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
