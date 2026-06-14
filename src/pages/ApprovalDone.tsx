
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Calendar,
  Search,
  ArrowLeft,
  Clock,
  User,
  MessageSquare,
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

export default function ApprovalDone() {
  const navigate = useNavigate();
  const { level: userLevel, regionName } = useUserStore();
  const { approvalDones, initData, getWarningById } = useWarningApprovalStore();
  const [searchText, setSearchText] = useState('');
  const [selectedApproval, setSelectedApproval] = useState<ApprovalFlow | null>(null);

  useEffect(() => {
    initData(userLevel, regionName);
  }, [userLevel, regionName, initData]);

  // 搜索 + 状态 + 类型
  const [statusFilter, setStatusFilter] = useState('全部状态');
  const [typeFilter, setTypeFilter] = useState('全部类型');

  const filteredApprovals = approvalDones.filter(a => {
    if (searchText && !a.eventTitle.includes(searchText)) return false;
    if (statusFilter === '已批准' && a.status !== 'approved') return false;
    if (statusFilter === '已驳回' && a.status !== 'rejected') return false;
    if (typeFilter !== '全部类型') {
      const typeReverse: Record<string, string> = { '官方回应': 'official_response', '降热策略': 'cooling_strategy', '辟谣处置': 'rumor_refutation' };
      if (a.type !== typeReverse[typeFilter]) return false;
    }
    return true;
  });

  const approvedCount = approvalDones.filter(a => a.status === 'approved').length;
  const rejectedCount = approvalDones.filter(a => a.status === 'rejected').length;

  const stepLabels = ['舆情分析员确认', '宣教中心复核', '宣传部批准'];

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <button
          onClick={() => navigate('/approval/todo')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          返回待办审批
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">已办审批</h1>
            <p className="text-slate-400 text-sm mt-1">
              已处理的审批记录 · 共 <span className="text-white">{approvalDones.length}</span> 条
              <span className="mx-2 text-slate-600">|</span>
              <span className="text-green-400">通过 {approvedCount}</span>
              <span className="mx-1 text-slate-600">·</span>
              <span className="text-red-400">驳回 {rejectedCount}</span>
              {userLevel !== 'national' && (
                <span className="ml-3 text-blue-400">（{regionName}视角）</span>
              )}
            </p>
          </div>
        </div>
      </motion.div>

      {/* 搜索和筛选 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 mb-6"
      >
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索事件名称..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-9 pl-10 pr-4 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select className="h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none">
              <option>全部时间</option>
              <option>近7天</option>
              <option>近30天</option>
              <option>近90天</option>
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none"
          >
            <option>全部状态</option>
            <option>已批准</option>
            <option>已驳回</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none"
          >
            <option>全部类型</option>
            <option>官方回应</option>
            <option>降热策略</option>
            <option>辟谣处置</option>
          </select>
        </div>
      </motion.div>

      <div className="flex gap-6">
        {/* 审批列表 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden transition-all',
            selectedApproval ? 'flex-1' : 'w-full'
          )}
        >
          {/* 表头 */}
          <div className="px-5 py-3 border-b border-slate-700/50 bg-slate-800/50">
            <div className="grid grid-cols-12 gap-4 text-sm text-slate-400">
              <div className="col-span-4">事件名称</div>
              <div className="col-span-2">审批类型</div>
              <div className="col-span-2">审批状态</div>
              <div className="col-span-2">处理时间</div>
              <div className="col-span-2">申请人</div>
            </div>
          </div>

          {/* 列表内容 */}
          <div className={cn('divide-y divide-slate-700/30', !selectedApproval && 'min-h-[500px]')}>
            {filteredApprovals.length > 0 ? (
              filteredApprovals.map((approval, index) => {
                const typeInfo = typeMap[approval.type] || typeMap.official_response;
                const isApproved = approval.status === 'approved';
                const isSelected = selectedApproval?.id === approval.id;
                const warningInfo = getWarningById(approval.warningId);

                return (
                  <motion.div
                    key={approval.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.02 }}
                    onClick={() => setSelectedApproval(approval)}
                    className={cn(
                      'px-5 py-4 transition-colors cursor-pointer',
                      isSelected ? 'bg-blue-500/10 border-l-2 border-l-blue-500' : 'hover:bg-slate-700/20 border-l-2 border-l-transparent'
                    )}
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-4">
                        <div className="flex items-center gap-2">
                          <ClipboardCheck className={cn(
                            'w-5 h-5 flex-shrink-0',
                            isApproved ? 'text-green-400' : 'text-red-400'
                          )} />
                          <div className="min-w-0">
                            <h3 className="text-slate-200 font-medium truncate">
                              {approval.eventTitle}
                            </h3>
                            {warningInfo && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <Link2 className="w-3 h-3 text-slate-500" />
                                <span className="text-xs text-slate-500">预警 {warningInfo.id.slice(-6)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className={cn('text-xs px-2 py-1 rounded border', typeInfo.className)}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center gap-1">
                          {isApproved ? (
                            <>
                              <CheckCircle className="w-4 h-4 text-green-400" />
                              <span className="text-green-400 text-sm font-medium">已批准</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4 text-red-400" />
                              <span className="text-red-400 text-sm font-medium">已驳回</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-slate-400">
                        {approval.updatedAt?.slice(0, 16)}
                      </div>
                      <div className="col-span-2 text-sm text-slate-400">
                        {approval.initiator}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="py-24 text-center">
                <ClipboardCheck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 mb-1">暂无匹配的审批记录</p>
                {approvalDones.length === 0 ? (
                  <p className="text-xs text-slate-500">处理过的审批会自动出现在这里</p>
                ) : (
                  <p className="text-xs text-slate-500">试试调整筛选条件</p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* 右侧详情面板 */}
        <AnimatePresence>
          {selectedApproval && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-[440px] flex-shrink-0 bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden flex flex-col max-h-[calc(100vh-280px)] sticky top-6"
            >
              {/* 头 */}
              <div className="p-5 border-b border-slate-700/50 bg-slate-800/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'px-3 py-1 text-sm rounded-lg border font-medium',
                      selectedApproval.status === 'approved'
                        ? 'text-green-400 bg-green-500/10 border-green-500/30'
                        : 'text-red-400 bg-red-500/10 border-red-500/30'
                    )}>
                      {selectedApproval.status === 'approved' ? '✅ 已批准' : '❌ 已驳回'}
                    </span>
                    <span className={cn(
                      'px-2.5 py-0.5 text-xs rounded border',
                      typeMap[selectedApproval.type]?.className || typeMap.official_response.className
                    )}>
                      {typeMap[selectedApproval.type]?.label || '官方回应'}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedApproval(null)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-white font-bold text-lg leading-snug">{selectedApproval.eventTitle}</h3>
                <p className="text-xs text-slate-500 mt-1">ID: {selectedApproval.id.slice(-10)}</p>
              </div>

              {/* 进度条 */}
              <div className="px-5 pt-4 pb-3">
                <div className="flex items-center justify-between">
                  {stepLabels.map((label, index) => {
                    const step = selectedApproval.steps[index];
                    const isCompleted = step?.status === 'approved';
                    const isRejected = step?.status === 'rejected';

                    return (
                      <div key={index} className="flex items-center flex-1 overflow-hidden">
                        <div className="flex flex-col items-center flex-shrink-0 w-16">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold',
                            isCompleted ? 'border-green-500 bg-green-500/20 text-green-400' :
                            isRejected ? 'border-red-500 bg-red-500/20 text-red-400' :
                            'border-slate-600 bg-slate-800 text-slate-500'
                          )}>
                            {isCompleted ? <CheckCircle className="w-4 h-4" /> : isRejected ? <XCircle className="w-4 h-4" /> : index + 1}
                          </div>
                          <span className={cn(
                            'text-[10px] mt-1 text-center leading-tight',
                            isCompleted ? 'text-green-400' : isRejected ? 'text-red-400' : 'text-slate-500'
                          )}>
                            {label.slice(0, 5)}
                          </span>
                        </div>
                        {index < stepLabels.length - 1 && (
                          <div className={cn(
                            'flex-1 h-0.5 mx-1',
                            isCompleted ? 'bg-green-500' : isRejected ? 'bg-red-500' : 'bg-slate-700'
                          )} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 内容 */}
              <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4 min-h-0">
                {/* 基本信息 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                    <p className="text-slate-500 text-[11px] uppercase tracking-wider mb-1">发起人</p>
                    <p className="text-white text-sm font-medium">{selectedApproval.initiator}</p>
                    <p className="text-xs text-slate-500">{selectedApproval.initiatorDept}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/30">
                    <p className="text-slate-500 text-[11px] uppercase tracking-wider mb-1">完成时间</p>
                    <p className="text-white text-sm font-medium">{selectedApproval.updatedAt?.slice(5, 16)}</p>
                    <p className="text-xs text-slate-500">申请于 {selectedApproval.createdAt?.slice(5, 16)}</p>
                  </div>
                </div>

                {/* 审批记录 */}
                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                  <h4 className="text-white text-sm font-medium mb-3 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                    审批记录
                  </h4>
                  <div className="space-y-3">
                    {selectedApproval.steps.map((step, i) => (
                      <div key={i} className="flex gap-3">
                        <div className={cn(
                          'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0',
                          step.status === 'approved' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                          step.status === 'rejected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                          'bg-slate-700/50 text-slate-400 border border-slate-600/50'
                        )}>
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-white text-sm font-medium">{step.role}</span>
                            {step.handler && <span className="text-slate-500 text-xs">{step.handler}</span>}
                            {step.status === 'approved' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-green-500/15 text-green-400 border border-green-500/30">通过</span>
                            )}
                            {step.status === 'rejected' && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/15 text-red-400 border border-red-500/30">驳回</span>
                            )}
                          </div>
                          {step.opinion ? (
                            <div className="bg-slate-800/80 rounded-lg p-2 border border-slate-700/30">
                              <p className="text-slate-300 text-xs leading-relaxed">「{step.opinion}」</p>
                            </div>
                          ) : (
                            <p className="text-slate-600 text-xs italic">无审批意见</p>
                          )}
                          {step.handleTime && (
                            <p className="text-slate-500 text-[11px] mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />{step.handleTime}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

type _DoneApprovalRef = ApprovalFlow;
