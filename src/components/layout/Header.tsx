
import { Bell, Search, Maximize2, User, Settings, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useUserStore } from '@/store/useUserStore';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const breadcrumbMap: Record<string, string> = {
  '/dashboard': '核心看板',
  '/events': '事件中心',
  '/warning': '预警中心',
  '/approval': '审批中心',
  '/approval/todo': '待办审批',
  '/approval/done': '已办审批',
  '/plan': '预案管理',
  '/report': '报表中心',
  '/report/weekly': '每周诊断报告',
  '/report/custom': '自定义报表',
  '/system': '系统管理',
  '/system/users': '用户管理',
  '/system/roles': '角色权限',
  '/system/settings': '系统设置',
  '/system/logs': '操作日志',
};

export default function Header() {
  const { toggleFullscreen, notifications } = useAppStore();
  const { user, logout } = useUserStore();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const crumbs: { label: string; path: string }[] = [];
    let currentPath = '';
    
    for (const path of paths) {
      currentPath += `/${path}`;
      const label = breadcrumbMap[currentPath];
      if (label) {
        crumbs.push({ label, path: currentPath });
      }
    }
    
    return crumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 flex items-center justify-between px-6">
      {/* 面包屑 */}
      <div className="flex items-center gap-2">
        {breadcrumbs.map((crumb, index) => (
          <div key={crumb.path} className="flex items-center gap-2">
            {index > 0 && <span className="text-slate-600">/</span>}
            <span
              className={cn(
                'text-sm',
                index === breadcrumbs.length - 1
                  ? 'text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200 cursor-pointer'
              )}
            >
              {crumb.label}
            </span>
          </div>
        ))}
      </div>

      {/* 右侧操作区 */}
      <div className="flex items-center gap-2">
        {/* 搜索 */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="搜索事件、关键词..."
            className="w-64 h-9 pl-10 pr-4 bg-slate-800/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
          />
        </div>

        {/* 全屏 */}
        <button
          onClick={toggleFullscreen}
          className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <Maximize2 className="w-5 h-5" />
        </button>

        {/* 通知 */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-medium">
                {notifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-700">
                <h3 className="text-white font-medium">通知消息</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 py-3 border-b border-slate-700/50 hover:bg-slate-700/30 cursor-pointer">
                    <p className="text-sm text-slate-200 line-clamp-2">
                      【一级预警】某突发事件负面帖文占比达75%
                    </p>
                    <p className="text-xs text-slate-500 mt-1">10分钟前</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-slate-700">
                <button className="w-full text-sm text-blue-400 hover:text-blue-300">
                  查看全部通知
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 用户菜单 */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-semibold">
              {user?.realName?.charAt(0)}
            </div>
            <span className="text-sm text-slate-200">{user?.realName}</span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-11 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="py-2">
                <button className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-3">
                  <User className="w-4 h-4" />
                  个人中心
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-slate-200 hover:bg-slate-700 flex items-center gap-3">
                  <Settings className="w-4 h-4" />
                  系统设置
                </button>
                <div className="border-t border-slate-700 my-1" />
                <button
                  onClick={logout}
                  className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" />
                  退出登录
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
