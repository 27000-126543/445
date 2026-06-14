
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Activity,
  AlertTriangle,
  ClipboardList,
  FileText,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Globe,
  Building2,
  MapPin,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useUserStore } from '@/store/useUserStore';
import { cn } from '@/lib/utils';
import { UserLevel } from '@/types';

const menuItems = [
  { path: '/dashboard', label: '核心看板', icon: LayoutDashboard },
  { path: '/events', label: '事件中心', icon: Activity },
  { path: '/warning', label: '预警中心', icon: AlertTriangle },
  { path: '/approval/todo', label: '审批中心', icon: ClipboardList },
  { path: '/plan', label: '预案管理', icon: FileText },
  { path: '/report/weekly', label: '报表中心', icon: BarChart3 },
  { path: '/system/users', label: '系统管理', icon: Settings },
];

const levelOptions: { value: UserLevel; label: string; icon: typeof Globe }[] = [
  { value: 'national', label: '国家级', icon: Globe },
  { value: 'provincial', label: '省级', icon: Building2 },
  { value: 'municipal', label: '市级', icon: MapPin },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { user, updateUserLevel } = useUserStore();
  const location = useLocation();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 256 }}
      className="relative flex flex-col bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 h-screen"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-col"
            >
              <span className="text-white font-semibold text-sm">舆情分析平台</span>
              <span className="text-slate-400 text-xs">Opinion Analysis</span>
            </motion.div>
          )}
        </div>
      </div>

      {/* 层级切换 */}
      {!sidebarCollapsed && (
        <div className="px-4 py-3 border-b border-slate-700/50">
          <p className="text-slate-400 text-xs mb-2">数据层级</p>
          <div className="flex gap-1">
            {levelOptions.map((option) => {
              const Icon = option.icon;
              const isActive = user?.level === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => updateUserLevel(option.value)}
                  className={cn(
                    'flex-1 flex flex-col items-center gap-1 py-2 px-2 rounded-lg text-xs transition-all',
                    isActive
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 导航菜单 */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/10 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  )}
                >
                  <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-blue-400')} />
                  {!sidebarCollapsed && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                  {isActive && !sidebarCollapsed && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400"
                    />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* 用户信息 */}
      <div className="p-3 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
            {user?.realName?.charAt(0)}
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.realName}</p>
              <p className="text-slate-400 text-xs truncate">{user?.role.name}</p>
            </div>
          )}
        </div>
      </div>

      {/* 折叠按钮 */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-10"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>
    </motion.aside>
  );
}
