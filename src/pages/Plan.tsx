
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Upload,
  Calendar,
  User,
  Clock,
  ChevronRight,
  Plus,
  Search,
} from 'lucide-react';
import { generatePlans } from '@/mock';
import type { Plan } from '@/types';
import { cn } from '@/lib/utils';

const statusMap: Record<string, { label: string; className: string }> = {
  active: { label: '启用中', className: 'text-green-400 bg-green-500/10 border-green-500/30' },
  draft: { label: '草稿', className: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  archived: { label: '已归档', className: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
};

export default function Plan() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    setPlans(generatePlans(6));
  }, []);

  const filteredPlans = plans.filter(p => 
    searchText ? p.name.includes(searchText) : true
  );

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">预案管理</h1>
          <p className="text-slate-400 text-sm mt-1">管理年度宣传引导预案，支持风险预测和智能推荐</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          上传预案
        </button>
      </motion.div>

      {/* 搜索栏 */}
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
              placeholder="搜索预案名称..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-9 pl-10 pr-4 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <select className="h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none">
            <option>全部状态</option>
            <option>启用中</option>
            <option>草稿</option>
            <option>已归档</option>
          </select>
          <select className="h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none">
            <option>全部类型</option>
            <option>年度总预案</option>
            <option>专项预案</option>
            <option>应急方案</option>
          </select>
        </div>
      </motion.div>

      {/* 预案列表 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredPlans.map((plan, index) => {
          const statusInfo = statusMap[plan.status];

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              onClick={() => navigate(`/plan/${plan.id}`)}
              className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-700/30 hover:border-slate-600/50 cursor-pointer transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className={cn('text-xs px-2 py-1 rounded border font-medium', statusInfo.className)}>
                  {statusInfo.label}
                </span>
              </div>

              <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors">
                {plan.name}
              </h3>
              <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                {plan.description}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3" />
                  <span>{plan.year}年</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3" />
                  <span>{plan.createdBy}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  创建于 {plan.createdAt?.slice(0, 10)}
                </div>
                <span className="text-blue-400 text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                  查看详情
                  <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* 上传弹窗 */}
      {showUploadModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowUploadModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-2">上传预案</h3>
            <p className="text-slate-400 text-sm mb-6">支持上传Excel格式的年度宣传引导预案</p>

            <div className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-blue-500/50 hover:bg-blue-500/5 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-300 font-medium mb-1">点击或拖拽文件到此处</p>
              <p className="text-slate-500 text-xs">支持 .xlsx, .xls 格式，最大 10MB</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 px-4 py-2.5 text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors"
              >
                取消
              </button>
              <button className="flex-1 px-4 py-2.5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
                确认上传
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
