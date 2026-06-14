
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Warning, ApprovalFlow } from '@/types';
import { generateWarnings, generateApprovalFlows } from '@/mock';
import type { UserLevel } from '@/types';

interface WarningApprovalStore {
  warnings: Warning[];
  approvalTodos: ApprovalFlow[];
  approvalDones: ApprovalFlow[];
  initialized: boolean;
  currentLevel: UserLevel;
  
  initData: (level: UserLevel, regionName?: string) => void;
  setDataLevel: (level: UserLevel, regionName?: string) => void;
  resetInit: () => void;
  
  // 预警操作
  confirmWarning: (warningId: string) => ApprovalFlow | null;
  dismissWarning: (warningId: string) => void;
  getWarningById: (id: string) => Warning | undefined;
  
  // 审批操作
  approveFlow: (flowId: string, opinion: string) => void;
  rejectFlow: (flowId: string, opinion: string) => void;
  getTodoById: (id: string) => ApprovalFlow | undefined;
  removeTodo: (flowId: string) => void;
}

const filterByRegion = (items: any[], level: UserLevel, regionName?: string) => {
  if (level === 'national' || !regionName) return items;
  
  // 简单的 region 是字符串
  return items.filter(item => {
    if (typeof item.region === 'string') {
      return item.region.includes(regionName) || regionName.includes(item.region);
    }
    return true;
  });
};

export const useWarningApprovalStore = create<WarningApprovalStore>()(
  persist(
    (set, get) => ({
      warnings: [],
      approvalTodos: [],
      approvalDones: [],
      initialized: false,
      currentLevel: 'national',

      initData: (level, regionName) => {
        // 只在首次初始化时生成 mock 数据
        // 已初始化时只按层级过滤，不覆盖已有操作结果
        const curState = get();
        const existingHasData = curState.warnings.length > 0
          || curState.approvalTodos.length > 0
          || curState.approvalDones.length > 0;

        let warnings: Warning[];
        let todos: ApprovalFlow[];
        let dones: ApprovalFlow[];

        if (!curState.initialized || !existingHasData) {
          // 首次初始化，生成 mock 数据
          warnings = generateWarnings(12);
          const allTodos = generateApprovalFlows(5).filter(a => a.status.includes('pending'));
          const allDones = generateApprovalFlows(8).filter(a => !a.status.includes('pending'));

          // 按层级数量过滤
          if (level === 'provincial') {
            warnings = warnings.slice(0, 8);
            todos = allTodos.slice(0, 4);
            dones = allDones.slice(0, 6);
          } else if (level === 'municipal') {
            warnings = warnings.slice(0, 5);
            todos = allTodos.slice(0, 2);
            dones = allDones.slice(0, 4);
          } else {
            todos = allTodos;
            dones = allDones;
          }

          // 按地区过滤（如果有地区名）
          if (level !== 'national' && regionName) {
            warnings = filterByRegion(warnings, level, regionName);
          }
        } else {
          // 已初始化，只按新层级过滤已有数据
          warnings = curState.warnings;
          todos = curState.approvalTodos;
          dones = curState.approvalDones;

          // 切换层级时按比例过滤已有数据，保留用户操作结果
          if (level !== curState.currentLevel) {
            if (level === 'provincial') {
              warnings = warnings.slice(0, Math.max(5, Math.floor(warnings.length * 0.6)));
              todos = todos.slice(0, Math.max(2, Math.floor(todos.length * 0.6)));
              dones = dones.slice(0, Math.max(3, Math.floor(dones.length * 0.6)));
            } else if (level === 'municipal') {
              warnings = warnings.slice(0, Math.max(3, Math.floor(warnings.length * 0.35)));
              todos = todos.slice(0, Math.max(1, Math.floor(todos.length * 0.35)));
              dones = dones.slice(0, Math.max(2, Math.floor(dones.length * 0.35)));
            }
          }

          // 按地区过滤
          if (level !== 'national' && regionName) {
            warnings = filterByRegion(warnings, level, regionName);
          }
        }

        set({
          warnings,
          approvalTodos: todos,
          approvalDones: dones,
          initialized: true,
          currentLevel: level,
        });
      },

      setDataLevel: (level, regionName) => {
        get().initData(level, regionName);
      },

      resetInit: () => {
        set({ initialized: false, currentLevel: 'national' });
      },

      confirmWarning: (warningId) => {
        let newFlow: ApprovalFlow | null = null;

        set((state) => {
          const warning = state.warnings.find(w => w.id === warningId);
          if (!warning) return state;

          // 更新预警状态
          const updatedWarnings = state.warnings.map(w =>
            w.id === warningId
              ? { ...w, status: 'confirmed' as const, confirmTime: new Date().toISOString().replace('T', ' ').slice(0, 19) }
              : w
          );

          // 创建审批单
          newFlow = {
            id: `approval-flow-${Date.now()}`,
            warningId: warning.id,
            eventId: warning.eventId,
            eventTitle: warning.eventTitle,
            type: warning.level >= 2 ? 'cooling_strategy' : 'official_response',
            status: 'pending_analyst',
            currentStep: 1,
            steps: [
              { step: 1, role: '舆情分析员', status: 'pending' },
              { step: 2, role: '宣教中心', status: 'pending' },
              { step: 3, role: '宣传部', status: 'pending' },
            ],
            initiator: '系统自动发起',
            initiatorDept: '预警中心',
            createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
            updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
          };

          return {
            warnings: updatedWarnings,
            approvalTodos: [newFlow!, ...state.approvalTodos],
          };
        });

        return newFlow;
      },

      dismissWarning: (warningId) => {
        set((state) => ({
          warnings: state.warnings.map(w =>
            w.id === warningId
              ? { ...w, status: 'dismissed' as const, resolveTime: new Date().toISOString().replace('T', ' ').slice(0, 19) }
              : w
          ),
        }));
      },

      getWarningById: (id) => {
        return get().warnings.find(w => w.id === id);
      },

      approveFlow: (flowId, opinion) => {
        set((state) => {
          const flow = state.approvalTodos.find(f => f.id === flowId);
          if (!flow) return state;

          const newStep = flow.currentStep + 1;
          const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

          // 更新当前步骤
          const updatedSteps = flow.steps.map((s, i) =>
            i === flow.currentStep - 1
              ? { ...s, status: 'approved' as const, opinion, handler: '当前用户', handleTime: now }
              : s
          );

          // 判断是否完成审批
          if (newStep > 3) {
            // 完成，移到已办
            const doneFlow: ApprovalFlow = {
              ...flow,
              status: 'approved',
              currentStep: 4,
              steps: updatedSteps,
              updatedAt: now,
            };
            return {
              approvalTodos: state.approvalTodos.filter(f => f.id !== flowId),
              approvalDones: [doneFlow, ...state.approvalDones],
            };
          }

          // 继续下一步
          const statusMap: Record<number, ApprovalFlow['status']> = {
            2: 'pending_edu',
            3: 'pending_propaganda',
          };

          return {
            approvalTodos: state.approvalTodos.map(f =>
              f.id === flowId
                ? {
                    ...f,
                    status: statusMap[newStep] || f.status,
                    currentStep: newStep,
                    steps: updatedSteps,
                    updatedAt: now,
                  }
                : f
            ),
          };
        });
      },

      rejectFlow: (flowId, opinion) => {
        set((state) => {
          const flow = state.approvalTodos.find(f => f.id === flowId);
          if (!flow) return state;

          const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

          const updatedSteps = flow.steps.map((s, i) =>
            i === flow.currentStep - 1
              ? { ...s, status: 'rejected' as const, opinion, handler: '当前用户', handleTime: now }
              : s
          );

          const doneFlow: ApprovalFlow = {
            ...flow,
            status: 'rejected',
            steps: updatedSteps,
            updatedAt: now,
          };

          return {
            approvalTodos: state.approvalTodos.filter(f => f.id !== flowId),
            approvalDones: [doneFlow, ...state.approvalDones],
          };
        });
      },

      getTodoById: (id) => {
        return get().approvalTodos.find(f => f.id === id);
      },

      removeTodo: (flowId) => {
        set((state) => ({
          approvalTodos: state.approvalTodos.filter(f => f.id !== flowId),
        }));
      },
    }),
    {
      name: 'warning-approval-storage',
    }
  )
);
