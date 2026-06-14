
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ClipboardCheck,
  CheckCircle,
  XCircle,
  Calendar,
  Search,
} from 'lucide-react';
import { generateApprovalFlows } from '@/mock';
import type { ApprovalFlow } from '@/types';
import { cn } from '@/lib/utils';

const typeMap: Record<string, { label: string; className: string }> = {
  official_response: { label: '官方回应', className: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
  cooling_strategy: { label: '降热策略', className: 'text-orange-400 bg-orange-500/10 border-orange-500/30' },
  rumor_refutation: { label: '辟谣处置', className: 'text-green-400 bg-green-500/10 border-green-500/30' },
};

export default function ApprovalDone() {
  const [approvals, setApprovals] = useState<ApprovalFlow[]>([]);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const data = generateApprovalFlows(12).filter(a => 
      a.status === 'approved' || a.status === 'rejected'
    );
    setApprovals(data);
  }, []);

  const filteredApprovals = approvals.filter(a => 
    searchText ? a.eventTitle.includes(searchText) : true
  );

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-white">已办审批</h1>
        <p className="text-slate-400 text-sm mt-1">查看您已处理的审批记录</p>
      </motion.div>

      {/* 搜索和筛选 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 mb-6"
      >
        <div className="flex items-center gap-4">
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
          <select className="h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none">
            <option>全部类型</option>
            <option>官方回应</option>
            <option>降热策略</option>
            <option>辟谣处置</option>
          </select>
        </div>
      </motion.div>

      {/* 审批列表 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden"
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
        <div className="divide-y divide-slate-700/30">
          {filteredApprovals.map((approval, index) => {
            const typeInfo = typeMap[approval.type];
            const isApproved = approval.status === 'approved';

            return (
              <motion.div
                key={approval.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.03 }}
                className="px-5 py-4 hover:bg-slate-700/20 transition-colors cursor-pointer"
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-4">
                    <div className="flex items-center gap-2">
                      <ClipboardCheck className={cn(
                        'w-5 h-5',
                        isApproved ? 'text-green-400' : 'text-red-400'
                      )} />
                      <h3 className="text-slate-200 font-medium truncate">
                        {approval.eventTitle}
                      </h3>
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
                          <span className="text-green-400 text-sm">已批准</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 text-sm">已驳回</span>
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
          })}
        </div>

        {filteredApprovals.length === 0 && (
          <div className="py-16 text-center text-slate-500">
            暂无审批记录
          </div>
        )}
      </motion.div>
    </div>
  );
}
