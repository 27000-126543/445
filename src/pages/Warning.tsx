
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Filter,
  Clock,
  MapPin,
  ChevronRight,
  Bell,
  CheckCircle,
  XCircle,
  Loader,
} from 'lucide-react';
import { generateWarnings } from '@/mock';
import type { Warning } from '@/types';
import { cn } from '@/lib/utils';

const levelFilters = ['全部级别', '一级预警', '二级预警', '三级预警'];
const statusFilters = ['全部状态', '待确认', '处理中', '已解决', '已驳回'];

const triggerTypeMap: Record<string, string> = {
  negative_ratio: '负面占比超标',
  heat_threshold: '热度突破阈值',
  sensitive_word: '敏感词触发',
};

export default function Warning() {
  const navigate = useNavigate();
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('全部级别');
  const [selectedStatus, setSelectedStatus] = useState('全部状态');
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null);

  useEffect(() => {
    const data = generateWarnings(12);
    setWarnings(data);
    if (data.length > 0) setSelectedWarning(data[0]);
  }, []);

  const getLevelInfo = (level: number) => {
    const map: Record<number, { label: string; className: string; bgClass: string }> = {
      1: { label: '一级预警', className: 'text-red-400 bg-red-500/10 border-red-500/50', bgClass: 'from-red-600/20 to-red-500/5' },
      2: { label: '二级预警', className: 'text-orange-400 bg-orange-500/10 border-orange-500/50', bgClass: 'from-orange-600/20 to-orange-500/5' },
      3: { label: '三级预警', className: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/50', bgClass: 'from-yellow-600/20 to-yellow-500/5' },
    };
    return map[level];
  };

  const getStatusInfo = (status: string) => {
    const map: Record<string, { label: string; icon: typeof AlertTriangle; className: string }> = {
      pending: { label: '待确认', icon: Clock, className: 'text-yellow-400' },
      confirmed: { label: '已确认', icon: CheckCircle, className: 'text-blue-400' },
      processing: { label: '处理中', icon: Loader, className: 'text-blue-400' },
      resolved: { label: '已解决', icon: CheckCircle, className: 'text-green-400' },
      dismissed: { label: '已驳回', icon: XCircle, className: 'text-slate-400' },
    };
    return map[status] || { label: status, icon: AlertTriangle, className: 'text-slate-400' };
  };

  const filteredWarnings = warnings.filter(w => {
    if (selectedLevel !== '全部级别') {
      const levelNum = selectedLevel === '一级预警' ? 1 : selectedLevel === '二级预警' ? 2 : 3;
      if (w.level !== levelNum) return false;
    }
    if (selectedStatus !== '全部状态') {
      const statusMap: Record<string, string> = {
        '待确认': 'pending',
        '处理中': 'processing',
        '已解决': 'resolved',
        '已驳回': 'dismissed',
      };
      if (w.status !== statusMap[selectedStatus]) return false;
    }
    return true;
  });

  const handleConfirm = (warning: Warning) => {
    setWarnings(prev => prev.map(w => 
      w.id === warning.id ? { ...w, status: 'confirmed' as const } : w
    ));
    setSelectedWarning(prev => prev ? { ...prev, status: 'confirmed' as const } : null);
  };

  const handleDismiss = (warning: Warning) => {
    setWarnings(prev => prev.map(w => 
      w.id === warning.id ? { ...w, status: 'dismissed' as const } : w
    ));
    setSelectedWarning(prev => prev ? { ...prev, status: 'dismissed' as const } : null);
  };

  return (
    <div className="p-6 h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-white">预警中心</h1>
        <p className="text-slate-400 text-sm mt-1">查看和处理所有舆情预警信息</p>
      </motion.div>

      {/* 筛选栏 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 mb-6"
      >
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-sm text-slate-400">预警级别:</span>
            <div className="flex gap-1">
              {levelFilters.map(level => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(level)}
                  className={cn(
                    'px-3 py-1 text-xs rounded-md transition-colors',
                    selectedLevel === level
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:bg-slate-700/50 border border-transparent'
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="h-5 w-px bg-slate-700" />

          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400">状态:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-8 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none"
            >
              {statusFilters.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* 主内容区 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-1 flex gap-6 min-h-0"
      >
        {/* 左侧预警列表 */}
        <div className="w-96 flex-shrink-0 bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
            <h2 className="text-white font-medium flex items-center gap-2">
              <Bell className="w-4 h-4 text-yellow-400" />
              预警列表
              <span className="text-xs text-slate-400">({filteredWarnings.length})</span>
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredWarnings.map((warning, index) => {
              const levelInfo = getLevelInfo(warning.level);
              const statusInfo = getStatusInfo(warning.status);
              const StatusIcon = statusInfo.icon;
              const isSelected = selectedWarning?.id === warning.id;

              return (
                <motion.div
                  key={warning.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.03 }}
                  onClick={() => setSelectedWarning(warning)}
                  className={cn(
                    'p-4 border-b border-slate-700/30 cursor-pointer transition-all',
                    isSelected
                      ? 'bg-blue-500/10 border-l-2 border-l-blue-500'
                      : 'hover:bg-slate-700/30 border-l-2 border-l-transparent'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs px-2 py-0.5 rounded border font-medium', levelInfo.className)}>
                        {levelInfo.label}
                      </span>
                    </div>
                    <span className={cn('flex items-center gap-1 text-xs', statusInfo.className)}>
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </span>
                  </div>
                  <h3 className="text-sm text-slate-200 font-medium line-clamp-2 mb-2">
                    {warning.eventTitle}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {warning.region}
                    </span>
                    <span>{warning.pushTime?.slice(5, 16)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 右侧预警详情 */}
        <div className="flex-1 bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
          {selectedWarning ? (
            <div className="h-full flex flex-col">
              {/* 详情头部 */}
              <div className={cn(
                'p-6 bg-gradient-to-r',
                getLevelInfo(selectedWarning.level).bgClass,
                'border-b border-slate-700/50'
              )}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn(
                        'px-3 py-1 text-sm rounded-lg border font-medium',
                        getLevelInfo(selectedWarning.level).className
                      )}>
                        {getLevelInfo(selectedWarning.level).label}
                      </span>
                      <span className="text-slate-400 text-sm">
                        {triggerTypeMap[selectedWarning.triggerType]}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">
                      {selectedWarning.eventTitle}
                    </h2>
                    <p className="text-slate-400 text-sm">
                      预警编号: {selectedWarning.id}
                    </p>
                  </div>
                  {selectedWarning.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleDismiss(selectedWarning)}
                        className="px-4 py-2 text-sm text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors"
                      >
                        驳回
                      </button>
                      <button
                        onClick={() => handleConfirm(selectedWarning)}
                        className="px-4 py-2 text-sm text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        确认预警
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 详情内容 */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-500 text-sm mb-2">阈值</p>
                    <p className="text-xl font-bold text-white">
                      {selectedWarning.triggerCondition.threshold}
                      {selectedWarning.triggerType === 'negative_ratio' ? '%' : ''}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-500 text-sm mb-2">实际值</p>
                    <p className="text-xl font-bold text-red-400">
                      {selectedWarning.triggerCondition.actualValue}
                      {selectedWarning.triggerType === 'negative_ratio' ? '%' : ''}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-500 text-sm mb-2">持续时间</p>
                    <p className="text-xl font-bold text-white">
                      {selectedWarning.triggerCondition.duration} 分钟
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-500 text-sm mb-2">涉及地区</p>
                    <p className="text-xl font-bold text-white">
                      {selectedWarning.region}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
                  <h3 className="text-white font-medium mb-3">推送对象</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedWarning.pushTargets.map((target, i) => (
                      <span key={i} className="px-3 py-1 bg-slate-800 rounded-full text-sm text-slate-300">
                        {target}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
                  <h3 className="text-white font-medium mb-3">时间线</h3>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-slate-200">预警触发</p>
                        <p className="text-xs text-slate-500">{selectedWarning.pushTime}</p>
                      </div>
                    </div>
                    {selectedWarning.confirmTime && (
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-slate-200">预警确认 - {selectedWarning.handler}</p>
                          <p className="text-xs text-slate-500">{selectedWarning.confirmTime}</p>
                        </div>
                      </div>
                    )}
                    {selectedWarning.resolveTime && (
                      <div className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-slate-200">问题解决</p>
                          <p className="text-xs text-slate-500">{selectedWarning.resolveTime}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/events/${selectedWarning.eventId}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 rounded-lg transition-colors"
                  >
                    查看关联事件
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {selectedWarning.status === 'confirmed' || selectedWarning.status === 'processing' ? (
                    <button
                      onClick={() => navigate('/approval/todo')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      发起审批流程
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              请选择一条预警查看详情
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
