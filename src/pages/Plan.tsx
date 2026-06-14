
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  Calendar,
  User,
  Clock,
  ChevronRight,
  Plus,
  Search,
  X,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { usePlanStore } from '@/store/usePlanStore';
import type { Plan } from '@/types';
import { cn } from '@/lib/utils';

const statusMap: Record<string, { label: string; className: string }> = {
  active: { label: '启用中', className: 'text-green-400 bg-green-500/10 border-green-500/30' },
  draft: { label: '草稿', className: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30' },
  archived: { label: '已归档', className: 'text-slate-400 bg-slate-500/10 border-slate-500/30' },
  parsing: { label: '解析中', className: 'text-blue-400 bg-blue-500/10 border-blue-500/30' },
};

export default function Plan() {
  const navigate = useNavigate();
  const { plans, initPlans, addPlan } = usePlanStore();
  const [searchText, setSearchText] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [planName, setPlanName] = useState('');
  const [planYear, setPlanYear] = useState(String(new Date().getFullYear()));
  const [planType, setPlanType] = useState<'年度总预案' | '专项预案' | '应急方案'>('年度总预案');
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initPlans();
  }, [initPlans]);

  const filteredPlans = plans.filter(p =>
    searchText ? p.name.includes(searchText) : true
  );

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证格式
    const validExts = ['.xlsx', '.xls'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExts.includes(ext)) {
      setErrorMsg('仅支持 .xlsx 或 .xls 格式的文件');
      setSelectedFile(null);
      return;
    }

    // 验证大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg('文件大小不能超过 10MB');
      setSelectedFile(null);
      return;
    }

    setErrorMsg('');
    setSelectedFile(file);

    // 自动填预案名
    const nameWithoutExt = file.name
      .replace(/\.(xlsx|xls)$/i, '')
      .replace(/[_\-]+/g, ' ');
    if (!planName) setPlanName(nameWithoutExt);

    // 尝试从文件名提取年份
    const yearMatch = file.name.match(/(20\d{2})/);
    if (yearMatch) setPlanYear(yearMatch[1]);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const closeModal = () => {
    // 没选文件可以正常关闭
    setShowUploadModal(false);
    setSelectedFile(null);
    setPlanName('');
    setPlanYear(String(new Date().getFullYear()));
    setPlanType('年度总预案');
    setErrorMsg('');
    setUploadSuccess(false);
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleConfirmUpload = async () => {
    setErrorMsg('');

    if (!selectedFile) {
      setErrorMsg('请先选择要上传的 Excel 文件');
      return;
    }

    if (!planName.trim()) {
      setErrorMsg('请填写预案名称');
      return;
    }

    setIsUploading(true);

    // 模拟上传 + 解析过程
    await new Promise(resolve => setTimeout(resolve, 1200));

    // 加入列表
    addPlan({
      name: planName.trim(),
      description: `从 ${selectedFile.name} 解析生成的${planType}，包含年度宣传引导关键节点与风险预测模型`,
      year: parseInt(planYear),
      type: planType,
      status: 'active',
      createdBy: '当前用户',
      nodesCount: 6 + Math.floor(Math.random() * 4),
      fileSize: selectedFile.size,
      fileName: selectedFile.name,
    });

    setIsUploading(false);
    setUploadSuccess(true);

    // 成功提示后关闭
    await new Promise(resolve => setTimeout(resolve, 900));
    closeModal();
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">预案管理</h1>
          <p className="text-slate-400 text-sm mt-1">
            管理年度宣传引导预案 · 共 <span className="text-white font-medium">{plans.length}</span> 份预案
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
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
        {filteredPlans.length > 0 ? (
          filteredPlans.map((plan, index) => {
            const statusInfo = statusMap[plan.status] || statusMap.draft;

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

                <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors line-clamp-1">
                  {plan.name}
                </h3>
                <p className="text-slate-400 text-sm line-clamp-2 mb-4 min-h-[40px]">
                  {plan.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3" />
                    <span>{plan.year}年 · {plan.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3" />
                    <span>{plan.createdBy}</span>
                  </div>
                </div>

                {plan.fileName && (
                  <div className="mt-3 text-xs text-slate-600 flex items-center gap-1.5">
                    <FileSpreadsheet className="w-3 h-3" />
                    <span className="truncate">{plan.fileName}</span>
                  </div>
                )}

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
          })
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 rounded-full bg-slate-700/30 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-500" />
            </div>
            <p className="text-slate-400 mb-1">暂无预案记录</p>
            <p className="text-xs text-slate-500">点击右上角「上传预案」开始</p>
          </div>
        )}
      </motion.div>

      {/* 上传弹窗 */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-xl font-bold text-white">上传年度宣传引导预案</h3>
                  <p className="text-slate-400 text-sm mt-1">支持 .xlsx / .xls 格式，最大 10MB</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 文件选择区域 */}
              <div className="mt-5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!selectedFile ? (
                  <div
                    onClick={handleFileSelect}
                    className="border-2 border-dashed border-slate-600 rounded-xl p-8 text-center hover:border-blue-500/60 hover:bg-blue-500/5 transition-all cursor-pointer group"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-500/20 transition-colors">
                      <Upload className="w-7 h-7 text-slate-400 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <p className="text-slate-300 font-medium mb-1">点击选择文件</p>
                    <p className="text-slate-500 text-xs">或将文件拖拽至此区域</p>
                  </div>
                ) : (
                  <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/30 flex items-center justify-center flex-shrink-0">
                        <FileSpreadsheet className="w-6 h-6 text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-slate-200 font-medium truncate">{selectedFile.name}</p>
                            <p className="text-slate-500 text-xs mt-0.5">
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFile();
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-red-400 transition-colors flex-shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        {isUploading && (
                          <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ x: '-100%' }}
                              animate={{ x: ['-100%', '0%', '100%'] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                              className="h-full w-1/2 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 表单 */}
              <div className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">预案名称 <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="例：2025年度全国宣传引导工作预案"
                    className="w-full h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">适用年度</label>
                    <select
                      value={planYear}
                      onChange={(e) => setPlanYear(e.target.value)}
                      className="w-full h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                    >
                      {Array.from({ length: 6 }, (_, i) => String(new Date().getFullYear() - 1 + i)).map(y => (
                        <option key={y} value={y}>{y}年</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">预案类型</label>
                    <select
                      value={planType}
                      onChange={(e) => setPlanType(e.target.value as typeof planType)}
                      className="w-full h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="年度总预案">年度总预案</option>
                      <option value="专项预案">专项预案</option>
                      <option value="应急方案">应急方案</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 错误提示 */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 overflow-hidden"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-sm text-red-400">{errorMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 成功提示 */}
              <AnimatePresence>
                {uploadSuccess && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 px-3 py-2 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 overflow-hidden"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <span className="text-sm text-green-400">上传成功，已生成预案详情</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 按钮 */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeModal}
                  disabled={isUploading}
                  className="flex-1 px-4 py-2.5 text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors disabled:opacity-50"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmUpload}
                  disabled={isUploading || uploadSuccess}
                  className={cn(
                    'flex-1 px-4 py-2.5 rounded-lg transition-colors font-medium flex items-center justify-center gap-2',
                    isUploading || uploadSuccess
                      ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
                      : 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                  )}
                >
                  {isUploading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      </svg>
                      上传解析中...
                    </>
                  ) : uploadSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      已完成
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      确认上传
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 类型引用
type _PlanRef = Plan;
