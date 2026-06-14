
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Send,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useWarningApprovalStore } from '@/store/useWarningApprovalStore';
import { useUserStore } from '@/store/useUserStore';
import type { Warning as WarningType } from '@/types';
import { cn } from '@/lib/utils';

const levelFilters = ['全部级别', '一级预警', '二级预警', '三级预警'];
const statusFilters = ['全部状态', '待确认', '已确认', '处理中', '已解决', '已驳回'];

const triggerTypeMap: Record<string, string> = {
  negative_ratio: '负面占比超标',
  heat_threshold: '热度突破阈值',
  sensitive_word: '敏感词触发',
};

export default function Warning() {
  const navigate = useNavigate();
  const { level: userLevel, regionName } = useUserStore();
  const { warnings, initData, confirmWarning, dismissWarning } = useWarningApprovalStore();
  const [selectedLevel, setSelectedLevel] = useState('全部级别');
  const [selectedStatus, setSelectedStatus] = useState('全部状态');
  const [selectedWarning, setSelectedWarning] = useState<WarningType | null>(null);
  const [confirmToast, setConfirmToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    initData(userLevel);
  }, [userLevel, initData]);

  // 同步选中状态
  useEffect(() => {
    if (warnings.length > 0 && !selectedWarning) {
      setSelectedWarning(warnings[0]);
    }
    // 如果选中的预警状态变化了，重新获取最新的
    if (selectedWarning) {
      const fresh = warnings.find(w => w.id === selectedWarning.id);
      if (fresh && fresh !== selectedWarning) {
        setSelectedWarning(fresh);
      }
    }
  }, [warnings, selectedWarning]);

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
        '已确认': 'confirmed',
        '处理中': 'processing',
        '已解决': 'resolved',
        '已驳回': 'dismissed',
      };
      if (w.status !== statusMap[selectedStatus]) return false;
    }
    return true;
  });

  const handleConfirm = async (warning: WarningType) => {
    const newFlow = confirmWarning(warning.id);
    setSelectedWarning(prev => {
      const fresh = warnings.find(w => w.id === warning.id);
      return fresh || prev;
    });

    if (newFlow) {
      setConfirmToast({ type: 'success', msg: `预警已确认，审批单已创建（${newFlow.id.slice(-6)}），可在待办审批中查看` });
      setTimeout(() => setConfirmToast(null), 3500);
    } else {
      setConfirmToast({ type: 'success', msg: '预警已确认' });
      setTimeout(() => setConfirmToast(null), 2500);
    }
  };

  const handleDismiss = (warning: WarningType) => {
    dismissWarning(warning.id);
    setSelectedWarning(prev => {
      const fresh = warnings.find(w => w.id === warning.id);
      return fresh || prev;
    });
    setConfirmToast({ type: 'error', msg: '预警已驳回，未进入审批流程' });
    setTimeout(() => setConfirmToast(null), 2500);
  };

  const pendingCount = warnings.filter(w => w.status === 'pending').length;
  const confirmedCount = warnings.filter(w => w.status === 'confirmed' || w.status === 'processing').length;

  return (
    <div className="p-6 h-full flex flex-col relative">
      {/* Toast */}
      <AnimatePresence>
        {confirmToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={cn(
              'fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-sm',
              confirmToast.type === 'success'
                ? 'bg-green-500/20 border border-green-500/40'
                : 'bg-red-500/20 border border-red-500/40'
            )}
          >
            {confirmToast.type === 'success' ? (
              <CheckCircle2 className={cn('w-5 h-5 flex-shrink-0', 'text-green-400')} />
            ) : (
              <AlertCircle className={cn('w-5 h-5 flex-shrink-0', 'text-red-400')} />
            )}
            <span className={cn('text-sm font-medium', confirmToast.type === 'success' ? 'text-green-300' : 'text-red-300')}>
              {confirmToast.msg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">预警中心</h1>
            <p className="text-slate-400 text-sm mt-1">
              查看和处理所有舆情预警 · 共 <span className="text-white">{warnings.length}</span> 条
              <span className="mx-2 text-slate-600">|</span>
              <span className="text-yellow-400">待确认 {pendingCount}</span>
              <span className="mx-2 text-slate-600">·</span>
              <span className="text-blue-400">已确认 {confirmedCount}</span>
              {userLevel !== 'national' && (
                <span className="ml-3 text-blue-400">（{regionName}视角）</span>
              )}
            </p>
          </div>
        </div>
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
          <div className="flex-1 overflow-y-auto min-h-0">
            {filteredWarnings.length > 0 ? (
              filteredWarnings.map((warning, index) => {
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
                      'p-4 border-b border-slate-700/30 cursor-pointer transition-all group',
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
                        {warning.status === 'pending' && (
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500" />
                          </span>
                        )}
                      </div>
                      <span className={cn('flex items-center gap-1 text-xs', statusInfo.className)}>
                        <StatusIcon className={cn('w-3 h-3', warning.status === 'processing' && 'animate-spin')} />
                        {statusInfo.label}
                      </span>
                    </div>
                    <h3 className="text-sm text-slate-200 font-medium line-clamp-2 mb-2 group-hover:text-white transition-colors">
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
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <Bell className="w-10 h-10 text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">没有匹配的预警</p>
                <p className="text-xs text-slate-500 mt-1">试试调整筛选条件</p>
              </div>
            )}
          </div>
        </div>

        {/* 右侧预警详情 */}
        <div className="flex-1 bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden">
          {selectedWarning ? (
            <div className="h-full flex flex-col min-h-0">
              {/* 详情头部 */}
              <div className={cn(
                'p-6 bg-gradient-to-r',
                getLevelInfo(selectedWarning.level).bgClass,
                'border-b border-slate-700/50'
              )}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={cn(
                        'px-3 py-1 text-sm rounded-lg border font-medium',
                        getLevelInfo(selectedWarning.level).className
                      )}>
                        {getLevelInfo(selectedWarning.level).label}
                      </span>
                      <span className="text-slate-400 text-sm">
                        {triggerTypeMap[selectedWarning.triggerType]}
                      </span>
                      {selectedWarning.status === 'confirmed' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs">
                          <Sparkles className="w-3 h-3" />
                          已进入审批
                        </span>
                      )}
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
                        className="px-4 py-2 text-sm text-slate-300 bg-slate-700/50 border border-slate-600/50 rounded-lg hover:bg-slate-600/50 transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        驳回
                      </button>
                      <button
                        onClick={() => handleConfirm(selectedWarning)}
                        className="px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-4 h-4" />
                        确认预警并发起审批
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 详情内容 */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                    <p className="text-slate-500 text-xs mb-2 uppercase tracking-wider">阈值线</p>
                    <p className="text-2xl font-bold text-slate-300">
                      {selectedWarning.triggerCondition.threshold}
                      {selectedWarning.triggerType === 'negative_ratio' ? '%' : ''}
                    </p>
                  </div>
                  <div className="bg-red-500/5 rounded-lg p-4 border border-red-500/20">
                    <p className="text-slate-500 text-xs mb-2 uppercase tracking-wider">实际值</p>
                    <p className="text-2xl font-bold text-red-400">
                      {selectedWarning.triggerCondition.actualValue}
                      {selectedWarning.triggerType === 'negative_ratio' ? '%' : ''}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                    <p className="text-slate-500 text-xs mb-2 uppercase tracking-wider">持续时间</p>
                    <p className="text-xl font-bold text-white">
                      {selectedWarning.triggerCondition.duration} <span className="text-sm text-slate-400">分钟</span>
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                    <p className="text-slate-500 text-xs mb-2 uppercase tracking-wider">涉及地区</p>
                    <p className="text-xl font-bold text-white">
                      {selectedWarning.region}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700/30">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Send className="w-4 h-4 text-blue-400" />
                    推送对象
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedWarning.pushTargets.map((target, i) => (
                      <span key={i} className="px-3 py-1.5 bg-slate-800 border border-slate-700/50 rounded-full text-sm text-slate-300">
                        {target}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700/30">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-400" />
                    事件时间线
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5" />
                        <div className="w-0.5 flex-1 bg-slate-700 mt-1" />
                      </div>
                      <div className="flex-1 pb-3">
                        <p className="text-sm text-white font-medium">预警触发</p>
                        <p className="text-xs text-slate-500 mt-0.5">系统自动检测到异常指标</p>
                        <p className="text-xs text-slate-400 mt-1">{selectedWarning.pushTime}</p>
                      </div>
                    </div>

                    {selectedWarning.confirmTime && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                          {(selectedWarning.resolveTime || selectedWarning.status !== 'dismissed') && (
                            <div className="w-0.5 flex-1 bg-slate-700 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-3">
                          <p className="text-sm text-white font-medium">预警确认 · 发起三级审批</p>
                          <p className="text-xs text-slate-500 mt-0.5">值班员：{selectedWarning.handler || '当前用户'}</p>
                          <p className="text-xs text-slate-400 mt-1">{selectedWarning.confirmTime}</p>
                        </div>
                      </div>
                    )}

                    {selectedWarning.status === 'dismissed' && selectedWarning.resolveTime && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-slate-500 mt-1.5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">预警驳回</p>
                          <p className="text-xs text-slate-500 mt-0.5">无需进一步处理</p>
                          <p className="text-xs text-slate-400 mt-1">{selectedWarning.resolveTime}</p>
                        </div>
                      </div>
                    )}

                    {selectedWarning.resolveTime && selectedWarning.status === 'resolved' && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-purple-500 mt-1.5" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">问题解决</p>
                          <p className="text-xs text-slate-400 mt-1">{selectedWarning.resolveTime}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate(`/events/${selectedWarning.eventId}`)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-200 rounded-lg transition-colors border border-slate-700/50"
                  >
                    查看关联事件
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  {(selectedWarning.status === 'confirmed' || selectedWarning.status === 'processing') && (
                    <button
                      onClick={() => navigate('/approval/todo')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20"
                    >
                      查看对应审批单
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p>请选择一条预警查看详情</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

type _WarningRef = WarningType;
