
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Activity,
  ShieldCheck,
  Globe,
  Building2,
  MapPin,
} from 'lucide-react';
import { useUserStore } from '@/store/useUserStore';
import { cn } from '@/lib/utils';

const levelOptions = [
  { value: 'national', label: '国家级', icon: Globe, desc: '全国数据查看与管理' },
  { value: 'provincial', label: '省级', icon: Building2, desc: '本省数据查看与管理' },
  { value: 'municipal', label: '市级', icon: MapPin, desc: '本市数据查看与管理' },
];

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useUserStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState('national');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return;
    
    setIsLoading(true);
    
    // 模拟登录请求
    setTimeout(() => {
      setUser({
        id: '1',
        username,
        realName: username === 'admin' ? '张管理员' : username,
        avatar: '',
        level: selectedLevel as any,
        region: {
          code: '100000',
          name: selectedLevel === 'national' ? '全国' : selectedLevel === 'provincial' ? '北京市' : '北京市',
        },
        role: {
          id: '1',
          name: selectedLevel === 'national' ? '国家级管理员' : selectedLevel === 'provincial' ? '省级管理员' : '市级管理员',
          code: 'admin',
          permissions: [],
        },
        status: 'active',
        lastLogin: new Date().toISOString(),
        createdAt: '2024-01-01 00:00:00',
      });
      
      setIsLoading(false);
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      {/* 网格背景 */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-5xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-2xl overflow-hidden shadow-2xl">
          {/* 左侧品牌区 */}
          <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-xl border border-r-0 border-slate-700/50 relative overflow-hidden">
            {/* 装饰圆环 */}
            <div className="absolute -right-20 -top-20 w-64 h-64 border border-blue-500/20 rounded-full" />
            <div className="absolute -right-10 -top-10 w-44 h-44 border border-blue-500/30 rounded-full" />
            
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Activity className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">舆情分析平台</h1>
                  <p className="text-blue-300/70 text-sm">Opinion Analysis System</p>
                </div>
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-4 leading-tight">
                全国网络舆情<br />智能分析平台
              </h2>
              <p className="text-slate-400 leading-relaxed">
                实时监控多源社交媒体数据，智能识别舆情热点，
                自动预警应急响应，助力科学决策。
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">三级预警机制</p>
                  <p className="text-slate-500 text-xs">智能识别，及时预警</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-white font-medium text-sm">全链路追踪</p>
                  <p className="text-slate-500 text-xs">传播路径可视化</p>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧登录表单 */}
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8 lg:p-12">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">舆情分析平台</h1>
                <p className="text-slate-500 text-xs">Opinion Analysis System</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">欢迎登录</h2>
            <p className="text-slate-400 mb-8">请选择层级并输入账号密码</p>

            {/* 层级选择 */}
            <div className="mb-6">
              <label className="block text-sm text-slate-400 mb-3">数据层级</label>
              <div className="grid grid-cols-3 gap-2">
                {levelOptions.map((option) => {
                  const Icon = option.icon;
                  const isActive = selectedLevel === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setSelectedLevel(option.value)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                        isActive
                          ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                          : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 账号输入 */}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">账号</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入账号"
                    className="w-full h-11 pl-10 pr-4 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1.5">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full h-11 pl-10 pr-12 bg-slate-800/50 border border-slate-700/50 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* 记住我 & 忘记密码 */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/20" />
                <span className="text-sm text-slate-400">记住密码</span>
              </label>
              <button className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                忘记密码？
              </button>
            </div>

            {/* 登录按钮 */}
            <button
              onClick={handleLogin}
              disabled={isLoading || !username || !password}
              className="w-full h-11 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  登录中...
                </span>
              ) : (
                '登录系统'
              )}
            </button>

            {/* 提示 */}
            <p className="text-center text-slate-500 text-xs mt-6">
              登录即表示同意《用户协议》和《隐私政策》
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
