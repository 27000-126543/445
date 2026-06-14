
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardList,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  MessageSquare,
  Send,
} from 'lucide-react';
import { generateApprovalFlows } from '@/mock';
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
  const [approvals, setApprovals] = useState<ApprovalFlow[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalFlow | null>(null);
  const [opinionText, setOpinionText] = useState('');

  useEffect(() => {
    const data = generateApprovalFlows(8).filter(a => 
      a.status === 'pending_analyst' || a.status === 'pending_edu' || a.status === 'pending_propaganda'
    );
    setApprovals(data);
    if (data.length > 0) setSelectedApproval(data[0]);
  }, []);

  const handleApprove = () => {
    if (!selectedApproval) return;
    // 模拟审批通过
    setApprovals(prev => prev.filter(a => a.id !== selectedApproval.id));
    setSelectedApproval(null);
  };

  const handleReject = () => {
    if (!selectedApproval) return;
    setApprovals(prev => prev.filter(a => a.id !== selectedApproval.id));
    setSelectedApproval(null);
  };

  const stepLabels = ['舆情分析员确认', '宣教中心复核', '宣传部批准'];

  return (
    <div className="p-6 h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-white">待办审批</h1>
        <p className="text-slate-400 text-sm mt-1">处理待您审批的舆情应急响应申请</p>
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
              <span className="text-xs text-slate-400">({approvals.length})</span>
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {approvals.map((approval, index) => {
              const typeInfo = typeMap[approval.type];
              const statusInfo = statusMap[approval.status];
              const isSelected = selectedApproval?.id === approval.id;

              return (
                <motion.div
                  key={approval.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.03 }}
                  onClick={() => setSelectedApproval(approval)}
                  className={cn(
                    'p-4 border-b border-slate-700/30 cursor-pointer transition-all',
                    isSelected
                      ? 'bg-blue-500/10 border-l-2 border-l-blue-500'
                      : 'hover:bg-slate-700/30 border-l-2 border-l-transparent'
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={cn('text-xs px-2 py-0.5 rounded border font-medium', typeInfo.className)}>
                      {typeInfo.label}
                    </span>
                    <span className={cn('text-xs flex items-center gap-1', statusInfo.className)}>
                      <Clock className="w-3 h-3" />
                      {statusInfo.label}
                    </span>
                  </div>
                  <h3 className="text-sm text-slate-200 font-medium line-clamp-2 mb-2">
                    {approval.eventTitle}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>申请人: {approval.initiator}</span>
                    <span>{approval.createdAt?.slice(5, 16)}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 右侧审批详情 */}
        <div className="flex-1 bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden flex flex-col">
          {selectedApproval ? (
            <>
              {/* 审批流头部 */}
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn('px-3 py-1 text-sm rounded-lg border font-medium', typeMap[selectedApproval.type].className)}>
                        {typeMap[selectedApproval.type].label}
                      </span>
                      <span className={cn('text-sm', statusMap[selectedApproval.status].className)}>
                        {statusMap[selectedApproval.status].label}
                      </span>
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
                          <div className="flex flex-col items-center">
                            <div className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center border-2',
                              isActive && 'border-blue-500 bg-blue-500/20 text-blue-400',
                              isCompleted && 'border-green-500 bg-green-500/20 text-green-400',
                              isRejected && 'border-red-500 bg-red-500/20 text-red-400',
                              !isActive && !isCompleted && !isRejected && 'border-slate-600 bg-slate-800 text-slate-500'
                            )}>
                              {isCompleted ? (
                                <CheckCircle className="w-5 h-5" />
                              ) : isRejected ? (
                                <XCircle className="w-5 h-5" />
                              ) : (
                                <span className="text-sm font-medium">{index + 1}</span>
                              )}
                            </div>
                            <span className={cn(
                              'text-xs mt-2',
                              isActive ? 'text-blue-400' : isCompleted ? 'text-green-400' : 'text-slate-500'
                            )}>
                              {label}
                            </span>
                          </div>
                          {index < stepLabels.length - 1 && (
                            <div className={cn(
                              'flex-1 h-0.5 mx-2',
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
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-500 text-sm mb-1">申请人</p>
                    <p className="text-white font-medium">{selectedApproval.initiator}</p>
                    <p className="text-xs text-slate-500">{selectedApproval.initiatorDept}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-4">
                    <p className="text-slate-500 text-sm mb-1">申请时间</p>
                    <p className="text-white font-medium">{selectedApproval.createdAt}</p>
                  </div>
                </div>

                {/* 申请内容 */}
                <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-400" />
                    申请内容
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    该事件负面舆情持续发酵，已触发一级预警。为防止舆情进一步扩散，建议启动官方回应机制，
                    通过主流媒体发布权威信息，同时配合降热策略，引导舆论走向正面方向。
                  </p>
                </div>

                {/* 审批记录 */}
                <div className="bg-slate-900/50 rounded-lg p-4 mb-6">
                  <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    审批记录
                  </h3>
                  <div className="space-y-4">
                    {selectedApproval.steps.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center',
                            step.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                            step.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                            'bg-slate-700 text-slate-500'
                          )}>
                            <User className="w-4 h-4" />
                          </div>
                          {index < selectedApproval.steps.length - 1 && (
                            <div className="w-0.5 flex-1 bg-slate-700 mt-1" />
                          )}
                        </div>
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white text-sm font-medium">{step.role}</span>
                            {step.handler && (
                              <span className="text-slate-500 text-xs">- {step.handler}</span>
                            )}
                            {step.status === 'approved' && (
                              <span className="text-green-400 text-xs">已通过</span>
                            )}
                            {step.status === 'rejected' && (
                              <span className="text-red-400 text-xs">已驳回</span>
                            )}
                            {step.status === 'pending' && (
                              <span className="text-yellow-400 text-xs">待处理</span>
                            )}
                          </div>
                          {step.opinion ? (
                            <p className="text-slate-300 text-sm">{step.opinion}</p>
                          ) : (
                            <p className="text-slate-600 text-sm italic">暂无意见</p>
                          )}
                          {step.handleTime && (
                            <p className="text-slate-500 text-xs mt-1">{step.handleTime}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 我的审批意见 */}
                <div className="bg-slate-900/50 rounded-lg p-4">
                  <h3 className="text-white font-medium mb-3">我的审批意见</h3>
                  <textarea
                    value={opinionText}
                    onChange={(e) => setOpinionText(e.target.value)}
                    placeholder="请输入审批意见..."
                    className="w-full h-24 p-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 resize-none"
                  />
                </div>
              </div>

              {/* 底部操作按钮 */}
              <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={handleReject}
                    className="px-6 py-2.5 text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors flex items-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    驳回
                  </button>
                  <button
                    onClick={handleApprove}
                    className="px-6 py-2.5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    通过
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500">
              请选择一条审批查看详情
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
