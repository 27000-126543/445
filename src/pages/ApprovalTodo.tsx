
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Link2,
} from 'lucide-react';
import { useWarningApprovalStore } from '@/store/useWarningApprovalStore';
import { useUserStore } from '@/store/useUserStore';
import type { ApprovalFlow } from '@/types';
import { cn } from '@/lib/utils';

const typeMap: Record<string, { label: string; className: string }> = {
  official_response: { label: '官方回应', className: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  cooling_strategy: { label: '降热策略', className: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  rumor_refutation: { label: '辟谣处置', className: 'text-green-400 bg-green-500/10 border-green-500/30' },
};

const statusMap: Record<string, { label: string; className: string }> = {
  pending_analyst: { label: '待舆情分析员确认', className: 'text-yellow-400' },
  pending_edu: { label: '待宣教中心复核', className: 'text-blue-400' },
  pending_propaganda: { label: '待宣传部批准', className: 'text-purple-400' },
  approved: { label: '已批准', className: 'text-green-400' },
  rejected: { label: '已驳回', className: 'text-red-400' },
};

export default function ApprovalTodo() {
  const navigate = useNavigate();
  const { level: userLevel, regionName } = useUserStore();
  const { approvalTodos, initData, approveFlow, rejectFlow, getWarningById } = useWarningApprovalStore();
  const [selectedApproval, setSelectedApproval] = useState<ApprovalFlow | null>(null);
  const [opinionText, setOpinionText] = useState('');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    initData(userLevel);
  }, [userLevel, initData]);

  // 同步选中
  useEffect(() => {
    if (approvalTodos.length > 0 && !selectedApproval) {
      setSelectedApproval(approvalTodos[0]);
    }
    // 更新选中
    if (selectedApproval) {
      const fresh = approvalTodos.find(f => f.id === selectedApproval.id);
      if (fresh) setSelectedApproval(fresh);
      else if (approvalTodos.length > 0) setSelectedApproval(approvalTodos[0]);
      else setSelectedApproval(null);
    }
  }, [approvalTodos, selectedApproval]);

  const handleApprove = () => {
    if (!selectedApproval) return;
    const opinion = opinionText.trim() || '同意该审批事项';
    approveFlow(selectedApproval.id, opinion);
    setOpinionText('');

    const flowIdShort = selectedApproval.id.slice(-6);
    if (selectedApproval.currentStep >= 3) {
      setToast({ type: 'success', msg: `审批通过！（${flowIdShort}）已完成全部三级审批，可在「已办审批」中查看` });
    } else {
      setToast({ type: 'success', msg: `已通过，进入下一审批环节（${flowIdShort}）` });
    }
    setTimeout(() => setToast(null), 3000);
  };

  const handleReject = () => {
    if (!selectedApproval) return;
    const opinion = opinionText.trim() || '驳回该审批事项';
    rejectFlow(selectedApproval.id, opinion);
    setOpinionText('');
    setToast({ type: 'error', msg: `已驳回审批（${selectedApproval.id.slice(-6)}），可在「已办审批」中查看记录` });
    setTimeout(() => setToast(null), 3000);
  };

  const stepLabels = ['舆情分析员确认', '宣教中心复核', '宣传部批准'];

  const pendingCounts = {
    analyst: approvalTodos.filter(a => a.status === 'pending_analyst').length,
    edu: approvalTodos.filter(a => a.status === 'pending_edu').length,
    propaganda: approvalTodos.filter(a => a.status === 'pending_propaganda').length,
  };

  return (
    <div className="p-6 h-full flex flex-col relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={cn(
              'fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-sm max-w-md',
              toast.type === 'success'
                ? 'bg-green-500/20 border border-green-500/40'
                : 'bg-red-500/20 border border-red-500/40'
            )}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className={cn('w-5 h-5 flex-shrink-0', 'text-green-400')} />
            ) : (
              <AlertCircle className={cn('w-5 h-5 flex-shrink-0', 'text-red-400')} />
            )}
            <span className={cn('text-sm font-medium', toast.type === 'success' ? 'text-green-300' : 'text-red-300')}>
              {toast.msg}
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
            <h1 className="text-2xl font-bold text-white">待办审批</h1>
            <p className="text-slate-400 text-sm mt-1">
              处理待您审批的舆情应急响应申请 · 共 <span className="text-white">{approvalTodos.length}</span> 条
              <span className="mx-2 text-slate-600">|</span>
              分析员 <span className="text-yellow-400">{pendingCounts.analyst}</span>
              <span className="mx-1 text-slate-600">·</span>
              宣教 <span className="text-blue-400">{pendingCounts.edu}</span>
              <span className="mx-1 text-slate-600">·</span>
              宣传 <span className="text-purple-400">{pendingCounts.propaganda}</span>
              {userLevel !== 'national' && (
                <span className="ml-3 text-blue-400">（{regionName}视角）</span>
              )}
            </p>
          </div>
          <button
            onClick={() => navigate('/approval/done')}
            className="px-4 py-2 text-sm text-slate-300 bg-slate-800/50 border border-slate-700/50 rounded-lg hover:bg-slate-700/50 transition-colors"
          >
            查看已办审批 →
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 flex gap-6 min-h-0"
      >
        {/* 左侧审批列表 */}
        <div className="w-96 flex-shrink-0 bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/50">
            <h2 className="text-white font-medium flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-blue-400" />
              待办列表
              <span className="text-xs text-slate-400">({approvalTodos.length})</span>
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            {approvalTodos.length > 0 ? (
              approvalTodos.map((approval, index) => {
                const typeInfo = typeMap[approval.type] || typeMap.official_response;
                const statusInfo = statusMap[approval.status];
                const isSelected = selectedApproval?.id === approval.id;
                const warningInfo = getWarningById(approval.warningId);

                return (
                  <motion.div
                    key={approval.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.03 }}
                    onClick={() => setSelectedApproval(approval)}
                    className={cn(
                      'p-4 border-b border-slate-700/30 cursor-pointer transition-all group',
                      isSelected
                        ? 'bg-blue-500/10 border-l-2 border-l-blue-500'
                        : 'hover:bg-slate-700/30 border-l-2 border-l-transparent'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={cn('text-xs px-2 py-0.5 rounded border font-medium', typeInfo.className)}>
                        {typeInfo.label}
                      </span>
                      <span className={cn('text-xs flex items-center gap-1 font-medium', statusInfo.className)}>
                        <Clock className="w-3 h-3" />
                        {statusInfo.label}
                      </span>
                    </div>
                    <h3 className="text-sm text-slate-200 font-medium line-clamp-2 mb-2 group-hover:text-white transition-colors">
                      {approval.eventTitle}
                    </h3>
                    {warningInfo && (
                      <div className="flex items-center gap-1 mb-2">
                        <Link2 className="w-3 h-3 text-blue-500/60" />
                        <span className="text-xs text-slate-500">关联预警：{warningInfo.id.slice(-6)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>发起人: {approval.initiator}</span>
                      <span>{approval.createdAt?.slice(5, 16)}</span>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-20">
                <CheckCircle2 className="w-10 h-10 text-green-500/50 mb-3" />
                <p className="text-slate-400 text-sm mb-1">暂无待办审批</p>
                <p className="text-xs text-slate-500">所有审批都处理完毕啦 ✨</p>
              </div>
            )}
          </div>
        </div>

        {/* 右侧审批详情 */}
        <div className="flex-1 bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden flex flex-col min-h-0">
          {selectedApproval ? (
            <>
              {/* 审批流头部 */}
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={cn('px-3 py-1 text-sm rounded-lg border font-medium', typeMap[selectedApproval.type]?.className || typeMap.official_response.className)}>
                        {typeMap[selectedApproval.type]?.label || '官方回应'}
                      </span>
                      <span className={cn('text-sm font-medium', statusMap[selectedApproval.status]?.className)}>
                        {statusMap[selectedApproval.status]?.label}
                      </span>
                      <span className="text-xs text-slate-500">#{selectedApproval.id.slice(-8)}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white">{selectedApproval.eventTitle}</h2>
                  </div>
                </div>

                {/* 审批进度条 */}
                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    {stepLabels.map((label, index) => {
                      const step = selectedApproval.steps[index];
                      const isActive = selectedApproval.currentStep === index + 1;
                      const isCompleted = step?.status === 'approved';
                      const isRejected = step?.status === 'rejected';

                      return (
                        <div key={index} className="flex items-center flex-1">
                          <div className="flex flex-col items-center relative z-10">
                            <div className={cn(
                              'w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all',
                              isActive && 'border-blue-500 bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/20',
                              isCompleted && 'border-green-500 bg-green-500/20 text-green-400',
                              isRejected && 'border-red-500 bg-red-500/20 text-red-400',
                              !isActive && !isCompleted && !isRejected && 'border-slate-600 bg-slate-800 text-slate-500'
                            )}>
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : isRejected ? (
                                <XCircle className="w-5 h-5" />
                              ) : (
                                <span className="text-sm font-bold">{index + 1}</span>
                              )}
                            </div>
                            <span className={cn(
                              'text-xs mt-2 font-medium whitespace-nowrap',
                              isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-slate-500'
                            )}>
                              {label}
                            </span>
                          </div>
                          {index < stepLabels.length - 1 && (
                            <div className={cn(
                              'flex-1 h-0.5 mx-1 -mt-6',
                              isCompleted ? 'bg-green-500' : 'bg-slate-700'
                            )} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 审批详情内容 */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* 基本信息 */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">发起人</p>
                    <p className="text-white font-medium">{selectedApproval.initiator}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedApproval.initiatorDept}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                    <p className="text-slate-500 text-xs uppercase tracking-wider mb-1">申请时间</p>
                    <p className="text-white font-medium">{selectedApproval.createdAt}</p>
                    <p className="text-xs text-slate-500 mt-0.5">更新于 {selectedApproval.updatedAt}</p>
                  </div>
                </div>

                {/* 申请内容 */}
                <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700/30">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    申请内容
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    该事件负面舆情持续发酵，已触发预警机制。为防止舆情进一步扩散，
                    建议启动{typeMap[selectedApproval.type]?.label || '官方回应'}方案，
                    通过主流媒体发布权威信息，同时配合降热策略，引导舆论走向正面方向。
                    请相关部门按职责分工配合执行。
                  </p>
                </div>

                {/* 审批记录 */}
                <div className="bg-slate-900/50 rounded-lg p-4 mb-6 border border-slate-700/30">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    审批记录
                  </h3>
                  <div className="space-y-4">
                    {selectedApproval.steps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0',
                            step.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                            step.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                            'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                          )}>
                            <User className="w-4 h-4" />
                          </div>
                          {index < selectedApproval.steps.length - 1 && (
                            <div className="w-0.5 flex-1 bg-slate-700 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-white text-sm font-medium">{step.role}</span>
                            {step.handler && (
                              <span className="text-slate-500 text-xs">- {step.handler}</span>
                            )}
                            {step.status === 'approved' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-xs font-medium">
                                <CheckCircle className="w-3 h-3" />已通过
                              </span>
                            )}
                            {step.status === 'rejected' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 text-xs font-medium">
                                <XCircle className="w-3 h-3" />已驳回
                              </span>
                            )}
                            {step.status === 'pending' && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-400 text-xs font-medium">
                                <Clock className="w-3 h-3" />待处理
                              </span>
                            )}
                          </div>
                          {step.opinion ? (
                            <div className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/30">
                              <p className="text-slate-300 text-sm">「{step.opinion}」</p>
                            </div>
                          ) : (
                            <p className="text-slate-600 text-sm italic">暂无审批意见</p>
                          )}
                          {step.handleTime && (
                            <p className="text-slate-500 text-xs mt-2">
                              处理于 {step.handleTime}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 我的审批意见 */}
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    我的审批意见
                    <span className="text-xs text-slate-500 font-normal">
                      （当前环节：{stepLabels[selectedApproval.currentStep - 1]}）
                    </span>
                  </h3>
                  <textarea
                    value={opinionText}
                    onChange={(e) => setOpinionText(e.target.value)}
                    placeholder="请输入审批意见（不填将使用默认意见）..."
                    className="w-full h-24 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none transition-colors"
                  />
                </div>
              </div>

              {/* 底部操作按钮 */}
              <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleReject}
                    className="px-6 py-2.5 text-slate-300 bg-slate-700/50 border border-slate-600/50 rounded-lg hover:bg-slate-600/50 hover:border-slate-500/50 transition-colors flex items-center gap-2 font-medium"
                  >
                    <XCircle className="w-4 h-4" />
                    驳回审批
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/20 flex items-center gap-2 font-medium"
                  >
                    <Send className="w-4 h-4" />
                    {selectedApproval.currentStep >= 3 ? '最终批准' : '通过并进入下一环节'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 p-10">
              <div className="text-center">
                <ClipboardList className="w-14 h-14 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-300 mb-1">暂无待办</p>
                <p className="text-sm text-slate-500">所有审批事项已处理完毕</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

type _ApprovalRef = ApprovalFlow;
