
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  X,
  CheckCircle2,
  AlertCircle,
  UserX,
  UserCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useUserManageStore, type SystemUser } from '@/store/useUserManageStore';
import { cn } from '@/lib/utils';

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

const levelMapForSelect: Record<string, SystemUser['level']> = {
  '国家级': 'national',
  '省级': 'provincial',
  '市级': 'municipal',
};

const levelReverseMap: Record<string, string> = {
  national: '国家级',
  provincial: '省级',
  municipal: '市级',
};

export default function SystemUsers() {
  const { users, initUsers, addUser, updateUser, deleteUser, toggleStatus } = useUserManageStore();
  const [searchText, setSearchText] = useState('');
  const [levelFilter, setLevelFilter] = useState('全部层级');
  const [statusFilter, setStatusFilter] = useState('全部状态');
  const [roleFilter, setRoleFilter] = useState('全部角色');

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // 表单状态
  type FormStatus = 'active' | 'disabled';
  const [formData, setFormData] = useState<{
    name: string;
    username: string;
    level: '国家级' | '省级' | '市级';
    region: string;
    role: string;
    status: FormStatus;
    password: string;
    showPwd: boolean;
  }>({
    name: '', username: '', level: '国家级',
    region: '全国', role: '舆情分析员',
    status: 'active', password: '', showPwd: false,
  });

  useEffect(() => {
    initUsers();
  }, [initUsers]);

  // 筛选
  const filteredUsers = users.filter(u => {
    if (searchText) {
      const t = searchText.toLowerCase();
      if (!u.name.includes(searchText) && !u.username.toLowerCase().includes(t) && !u.role.includes(searchText)) return false;
    }
    if (levelFilter !== '全部层级') {
      const lv = levelMapForSelect[levelFilter];
      if (u.level !== lv) return false;
    }
    if (statusFilter === '正常' && u.status !== 'active') return false;
    if (statusFilter === '禁用' && u.status !== 'disabled') return false;
    if (roleFilter !== '全部角色' && !u.role.includes(roleFilter.replace('员', '').replace('部', ''))) return false;
    return true;
  });

  const activeCount = users.filter(u => u.status === 'active').length;
  const disabledCount = users.filter(u => u.status === 'disabled').length;

  const resetForm = () => {
    setFormData({ name: '', username: '', level: '国家级', region: '全国', role: '舆情分析员', status: 'active', password: '', showPwd: false });
  };

  const openAdd = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEdit = (u: SystemUser) => {
    setEditingUser(u);
    const lvStr = levelReverseMap[u.level] as '国家级' | '省级' | '市级';
    setFormData({
      name: u.name,
      username: u.username,
      level: lvStr,
      region: u.region,
      role: u.role,
      status: u.status,
      password: '',
      showPwd: false,
    });
    setShowEditModal(true);
  };

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 2500);
  };

  const handleAdd = () => {
    if (!formData.name.trim()) { showToast('error', '请填写用户姓名'); return; }
    if (!formData.username.trim()) { showToast('error', '请填写登录账号'); return; }
    if (!formData.password.trim()) { showToast('error', '请设置初始密码'); return; }

    // 检查账号重复
    if (users.some(u => u.username === formData.username)) {
      showToast('error', '该登录账号已存在');
      return;
    }

    const lvKey = levelMapForSelect[formData.level];
    addUser({
      name: formData.name.trim(),
      username: formData.username.trim(),
      level: lvKey,
      region: formData.region,
      role: formData.role,
      status: formData.status,
    });
    showToast('success', `用户「${formData.name}」添加成功`);
    setShowAddModal(false);
    resetForm();
    // 自动搜索这个新用户
    setSearchText(formData.name);
  };

  const handleEdit = () => {
    if (!editingUser) return;
    if (!formData.name.trim()) { showToast('error', '请填写用户姓名'); return; }
    if (!formData.username.trim()) { showToast('error', '请填写登录账号'); return; }

    const lvKey = levelMapForSelect[formData.level];
    updateUser(editingUser.id, {
      name: formData.name.trim(),
      username: formData.username.trim(),
      level: lvKey,
      region: formData.region,
      role: formData.role,
      status: formData.status,
    });
    showToast('success', '用户信息已更新');
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleDelete = (id: string) => {
    const user = users.find(u => u.id === id);
    if (user) {
      deleteUser(id);
      showToast('success', `已删除用户「${user.name}」`);
    }
    setDeleteConfirmId(null);
  };

  const handleToggleStatus = (u: SystemUser) => {
    toggleStatus(u.id);
    showToast('success', `已${u.status === 'active' ? '禁用' : '启用'}用户「${u.name}」`);
  };

  const regionOptions = (lv: string) => {
    if (lv === '国家级') return ['全国'];
    if (lv === '省级') return ['北京市', '上海市', '广东省', '江苏省', '浙江省', '四川省', '山东省', '湖北省', '河南省', '福建省'];
    return ['深圳市', '广州市', '杭州市', '南京市', '成都市', '青岛市', '武汉市', '苏州市', '宁波市', '厦门市'];
  };

  return (
    <div className="p-6 relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={cn(
              'fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 backdrop-blur-sm',
              toast.type === 'success' ? 'bg-green-500/20 border border-green-500/40' : 'bg-red-500/20 border border-red-500/40'
            )}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
            <span className={cn('text-sm font-medium', toast.type === 'success' ? 'text-green-300' : 'text-red-300')}>
              {toast.msg}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

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
          <p className="text-slate-400 text-sm mt-1">
            管理系统用户账号和权限分配 · 共 <span className="text-white">{users.length}</span> 个用户
            <span className="mx-2 text-slate-600">|</span>
            <span className="text-green-400">正常 {activeCount}</span>
            <span className="mx-1 text-slate-600">·</span>
            <span className="text-red-400">禁用 {disabledCount}</span>
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all shadow-lg shadow-blue-500/20 font-medium"
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
              placeholder="搜索用户姓名、账号、角色..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full h-9 pl-10 pr-4 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
            />
          </div>
          <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} className="h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none">
            <option>全部层级</option><option>国家级</option><option>省级</option><option>市级</option>
          </select>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none">
            <option>全部角色</option><option>管理员</option><option>舆情分析</option><option>宣教</option><option>宣传</option><option>值班</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-9 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none">
            <option>全部状态</option><option>正常</option><option>禁用</option>
          </select>
          {(searchText || levelFilter !== '全部层级' || statusFilter !== '全部状态' || roleFilter !== '全部角色') && (
            <button
              onClick={() => { setSearchText(''); setLevelFilter('全部层级'); setStatusFilter('全部状态'); setRoleFilter('全部角色'); }}
              className="px-3 h-9 text-xs text-slate-400 border border-slate-700/50 rounded-lg hover:bg-slate-700/50 hover:text-white transition-colors"
            >
              清除筛选
            </button>
          )}
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
              {filteredUsers.length > 0 ? filteredUsers.map((user, index) => {
                const LevelIcon = levelIconMap[user.level];
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 + index * 0.02 }}
                    className="hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold',
                          user.status === 'active' ? 'bg-gradient-to-br from-blue-500 to-purple-500' : 'bg-gradient-to-br from-slate-600 to-slate-700 opacity-60'
                        )}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className={cn('font-medium', user.status === 'active' ? 'text-white' : 'text-slate-500')}>{user.name}</p>
                          <p className="text-slate-500 text-sm">{user.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-sm text-slate-300">
                        <LevelIcon className={cn('w-4 h-4', user.level === 'national' ? 'text-purple-400' : user.level === 'provincial' ? 'text-blue-400' : 'text-green-400')} />
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
                      <button
                        onClick={() => handleToggleStatus(user)}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium transition-all border cursor-pointer',
                          user.status === 'active'
                            ? 'bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20'
                        )}
                      >
                        <span className={cn('w-1.5 h-1.5 rounded-full', user.status === 'active' ? 'bg-green-400' : 'bg-red-400')} />
                        {user.status === 'active' ? '正常' : '禁用'}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{user.lastLogin}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(user)}
                          title={user.status === 'active' ? '禁用用户' : '启用用户'}
                          className={cn(
                            'p-1.5 rounded transition-colors',
                            user.status === 'active'
                              ? 'text-slate-400 hover:text-yellow-400 hover:bg-yellow-500/10'
                              : 'text-slate-400 hover:text-green-400 hover:bg-green-500/10'
                          )}
                        >
                          {user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => openEdit(user)}
                          className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded transition-colors"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(user.id)}
                          className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-5 py-20">
                    <div className="flex flex-col items-center justify-center text-center">
                      <Users className="w-12 h-12 text-slate-600 mb-3" />
                      <p className="text-slate-400 mb-1">没有找到匹配的用户</p>
                      <p className="text-xs text-slate-500">
                        {users.length === 0 ? '还没有用户，点击右上角「添加用户」开始' : '试试调整筛选条件或清除筛选'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-4 border-t border-slate-700/50 flex items-center justify-between">
          <p className="text-sm text-slate-400">
            共 <span className="text-white font-medium">{filteredUsers.length}</span> 条记录
            {filteredUsers.length !== users.length && <span className="ml-2 text-xs text-slate-500">（总 {users.length} 条，已筛选）</span>}
          </p>
        </div>
      </motion.div>

      {/* 删除确认弹窗 */}
      <AnimatePresence>
        {deleteConfirmId && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setDeleteConfirmId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-red-500/15 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-1">确认删除用户？</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    用户「{users.find(u => u.id === deleteConfirmId)?.name}」将被永久删除，此操作无法撤销。
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2.5 text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirmId)}
                  className="flex-1 px-4 py-2.5 text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-lg hover:from-red-600 hover:to-rose-700 transition-all shadow-lg shadow-red-500/20 font-medium"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 添加/编辑用户弹窗 - 共用组件 */}
      {(showAddModal || showEditModal) && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => { setShowAddModal(false); setShowEditModal(false); setEditingUser(null); }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-white">{showAddModal ? '添加用户' : '编辑用户'}</h3>
                <p className="text-slate-400 text-sm mt-1">{showAddModal ? '创建一个新的系统用户账号' : '修改现有用户信息和权限'}</p>
              </div>
              <button
                onClick={() => { setShowAddModal(false); setShowEditModal(false); setEditingUser(null); }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">用户姓名 <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="请输入用户姓名"
                  value={formData.name}
                  onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))}
                  className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">登录账号 <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="请输入登录账号（唯一）"
                  value={formData.username}
                  onChange={(e) => setFormData(p => ({ ...p, username: e.target.value }))}
                  className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">用户层级</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData(p => ({
                      ...p,
                      level: e.target.value as '国家级',
                      region: e.target.value === '国家级' ? '全国' : regionOptions(e.target.value)[0],
                    }))}
                    className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option>国家级</option><option>省级</option><option>市级</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">所属地区</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData(p => ({ ...p, region: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                    {regionOptions(formData.level).map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">角色权限</label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData(p => ({ ...p, role: e.target.value }))}
                    className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option>国家级管理员</option>
                    <option>省级管理员</option>
                    <option>市级管理员</option>
                    <option>舆情分析员</option>
                    <option>宣教中心</option>
                    <option>宣传部</option>
                    <option>值班员</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1.5">账号状态</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(p => ({ ...p, status: e.target.value as SystemUser['status'] }))}
                    className="w-full h-10 px-3 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 transition-colors"
                  >
                    <option value="active">正常启用</option>
                    <option value="disabled">禁用</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1.5">
                  {showAddModal ? '初始密码 <span className="text-red-400">*</span>' : '重置密码（留空则不修改）'}
                </label>
                <div className="relative">
                  <input
                    type={formData.showPwd ? 'text' : 'password'}
                    placeholder={showAddModal ? '请设置初始密码（至少6位）' : '输入新密码以重置'}
                    value={formData.password}
                    onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                    className="w-full h-10 px-3 pr-10 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, showPwd: !p.showPwd }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {formData.showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-slate-700/50">
              <button
                onClick={() => { setShowAddModal(false); setShowEditModal(false); setEditingUser(null); }}
                className="flex-1 px-4 py-2.5 text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={showAddModal ? handleAdd : handleEdit}
                className="flex-1 px-4 py-2.5 text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/20 font-medium"
              >
                {showAddModal ? '确认添加' : '保存修改'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

type _UserRef = SystemUser;
