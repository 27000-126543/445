
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  Building2,
  MapPin,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const mockUsers = [
  { id: 1, name: '张管理员', username: 'admin', level: 'national', region: '全国', role: '国家级管理员', status: 'active', lastLogin: '2024-06-14 09:30' },
  { id: 2, name: '李主任', username: 'libeijing', level: 'provincial', region: '北京市', role: '省级管理员', status: 'active', lastLogin: '2024-06-14 08:45' },
  { id: 3, name: '王科长', username: 'wangsh', level: 'provincial', region: '上海市', role: '省级管理员', status: 'active', lastLogin: '2024-06-13 16:20' },
  { id: 4, name: '陈分析员', username: 'chenfx', level: 'provincial', region: '广东省', role: '舆情分析员', status: 'active', lastLogin: '2024-06-14 10:15' },
  { id: 5, name: '刘值班员', username: 'liuzb', level: 'municipal', region: '深圳市', role: '值班员', status: 'active', lastLogin: '2024-06-14 07:00' },
  { id: 6, name: '赵宣教', username: 'zhaoxj', level: 'provincial', region: '浙江省', role: '宣教中心', status: 'active', lastLogin: '2024-06-13 14:30' },
  { id: 7, name: '孙宣传', username: 'sunxc', level: 'provincial', region: '江苏省', role: '宣传部', status: 'disabled', lastLogin: '2024-06-10 11:20' },
  { id: 8, name: '周分析', username: 'zhoufx', level: 'municipal', region: '杭州市', role: '舆情分析员', status: 'active', lastLogin: '2024-06-14 09:00' },
];

const levelIconMap: Record<string, typeof Globe> = {
  national: Globe,
  provincial: Building2,
  municipal: MapPin,
};

const levelLabelMap: Record<string, string> = {
  national: '国家级',
  provincial: '省级',
  municipal: '市级',
};

export default function SystemUsers() {
  const [users, setUsers] = useState(mockUsers);
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredUsers = users.filter(u => 
    searchText ? u.name.includes(searchText) || u.username.includes(searchText) : true
  );

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-blue-400" />
            用户管理
          </h1>
          <p className="text-slate-400 text-sm mt-1">管理系统用户账号和权限分配</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          添加用户
        </button>
      </motion.div>

      {/* 筛选栏 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 mb-6"
      >
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="搜索用户姓名、账号..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-9 pl-10 pr-4 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <select className="h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none">
            <option>全部层级</option>
            <option>国家级</option>
            <option>省级</option>
            <option>市级</option>
          </select>
          <select className="h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none">
            <option>全部角色</option>
            <option>管理员</option>
            <option>舆情分析员</option>
            <option>宣教中心</option>
            <option>宣传部</option>
            <option>值班员</option>
          </select>
          <select className="h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none">
            <option>全部状态</option>
            <option>正常</option>
            <option>禁用</option>
          </select>
        </div>
      </motion.div>

      {/* 用户列表 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-800/30 border border-slate-700/50 rounded-xl overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/50">
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-400">用户信息</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-400">层级</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-400">所属地区</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-400">角色</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-400">状态</th>
                <th className="text-left px-5 py-3 text-sm font-medium text-slate-400">最后登录</th>
                <th className="text-right px-5 py-3 text-sm font-medium text-slate-400">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {filteredUsers.map((user, index) => {
                const LevelIcon = levelIconMap[user.level];
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.03 }}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-slate-500 text-sm">{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-300">
                        <LevelIcon className="w-4 h-4 text-blue-400" />
                        {levelLabelMap[user.level]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">{user.region}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-300">
                        <Shield className="w-4 h-4 text-purple-400" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium',
                        user.status === 'active'
                          ? 'bg-green-500/10 text-green-400 border border-green-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      )}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', user.status === 'active' ? 'bg-green-400' : 'bg-red-400')} />
                        {user.status === 'active' ? '正常' : '禁用'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{user.lastLogin}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 分页 */}
        <div className="px-5 py-4 border-t border-slate-700/50 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            共 {filteredUsers.length} 条记录
          </p>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm text-slate-400 border border-slate-700/50 rounded hover:bg-slate-700/50 transition-colors">
              上一页
            </button>
            <button className="px-3 py-1.5 text-sm text-white bg-blue-500 rounded">
              1
            </button>
            <button className="px-3 py-1.5 text-sm text-slate-400 border border-slate-700/50 rounded hover:bg-slate-700/50 transition-colors">
              下一页
            </button>
          </div>
        </div>
      </motion.div>

      {/* 添加用户弹窗 */}
      {showAddModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white mb-6">添加用户</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">用户姓名</label>
                <input
                  type="text"
                  placeholder="请输入用户姓名"
                  className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">登录账号</label>
                <input
                  type="text"
                  placeholder="请输入登录账号"
                  className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">用户层级</label>
                  <select className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none">
                    <option>国家级</option>
                    <option>省级</option>
                    <option>市级</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">所属地区</label>
                  <select className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none">
                    <option>请选择</option>
                    <option>北京市</option>
                    <option>上海市</option>
                    <option>广东省</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">角色权限</label>
                <select className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none">
                  <option>管理员</option>
                  <option>舆情分析员</option>
                  <option>宣教中心</option>
                  <option>宣传部</option>
                  <option>值班员</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">初始密码</label>
                <input
                  type="password"
                  placeholder="请输入初始密码"
                  className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors"
              >
                取消
              </button>
              <button className="flex-1 px-4 py-2.5 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors">
                确认添加
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
