
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Warning, ApprovalFlow } from '@/types';
import { generateWarnings, generateApprovalFlows } from '@/mock';
import type { UserLevel } from '@/types';

interface WarningApprovalStore {
  // 国家级完整原始数据（只初始化一次）
  rawWarnings: Warning[];
  rawApprovalTodos: ApprovalFlow[];
  rawApprovalDones: ApprovalFlow[];
  
  // 按当前层级过滤后的展示数据
  warnings: Warning[];
  approvalTodos: ApprovalFlow[];
  approvalDones: ApprovalFlow[];
  
  initialized: boolean;
  currentLevel: UserLevel;
  currentRegion: string;
  
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

// 过滤函数：从完整数据按层级和地区过滤
const filterByLevel = <T extends { region?: string }>(
  items: T[],
  level: UserLevel,
  regionName?: string
): T[] => {
  let result = [...items];
  
  // 先按数量比例过滤
  if (level === 'provincial') {
    result = result.slice(0, Math.max(5, Math.floor(result.length * 0.6)));
  } else if (level === 'municipal') {
    result = result.slice(0, Math.max(3, Math.floor(result.length * 0.35)));
  }
  
  // 再按地区真实过滤
  if (level !== 'national' && regionName) {
    result = result.filter(item => {
      if (typeof item.region === 'string') {
        return item.region.includes(regionName) || regionName.includes(item.region);
      }
      return true;
    });
  }
  
  return result;
};

// 审批流不需要按地区过滤，只按数量比例
const filterApprovals = <T extends ApprovalFlow>(
  items: T[],
  level: UserLevel,
): T[] => {
  let result = [...items];
  if (level === 'provincial') {
    result = result.slice(0, Math.max(3, Math.floor(result.length * 0.6)));
  } else if (level === 'municipal') {
    result = result.slice(0, Math.max(1, Math.floor(result.length * 0.35)));
  }
  return result;
};

export const useWarningApprovalStore = create<WarningApprovalStore>()(
  persist(
    (set, get) => ({
      rawWarnings: [],
      rawApprovalTodos: [],
      rawApprovalDones: [],
      
      warnings: [],
      approvalTodos: [],
      approvalDones: [],
      
      initialized: false,
      currentLevel: 'national',
      currentRegion: '',

      initData: (level, regionName) => {
        const curState = get();
        const region = regionName || '';
        
        // 只在首次初始化时生成 mock 原始数据
        if (!curState.initialized || curState.rawWarnings.length === 0) {
          const rawWarnings = generateWarnings(12);
          const rawTodos = generateApprovalFlows(5).filter(a => a.status.includes('pending'));
          const rawDones = generateApprovalFlows(8).filter(a => !a.status.includes('pending'));
          
          // 根据当前层级过滤出展示数据
          const warnings = filterByLevel(rawWarnings, level, region);
          const approvalTodos = filterApprovals(rawTodos, level);
          const approvalDones = filterApprovals(rawDones, level);
          
          set({
            rawWarnings,
            rawApprovalTodos: rawTodos,
            rawApprovalDones: rawDones,
            warnings,
            approvalTodos,
            approvalDones,
            initialized: true,
            currentLevel: level,
            currentRegion: region,
          });
        } else {
          // 已初始化，只从原始数据重新过滤展示数据，绝不修改原始数据
          const warnings = filterByLevel(curState.rawWarnings, level, region);
          const approvalTodos = filterApprovals(curState.rawApprovalTodos, level);
          const approvalDones = filterApprovals(curState.rawApprovalDones, level);
          
          set({
            warnings,
            approvalTodos,
            approvalDones,
            currentLevel: level,
            currentRegion: region,
          });
        }
      },

      setDataLevel: (level, regionName) => {
        get().initData(level, regionName);
      },

      resetInit: () => {
        set({
          initialized: false,
          currentLevel: 'national',
          currentRegion: '',
          rawWarnings: [],
          rawApprovalTodos: [],
          rawApprovalDones: [],
          warnings: [],
          approvalTodos: [],
          approvalDones: [],
        });
      },

      confirmWarning: (warningId) => {
        let newFlow: ApprovalFlow | null = null;

        set((state) => {
          const warning = state.rawWarnings.find(w => w.id === warningId);
          if (!warning) return state;

          const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
          
          // 修改原始数据（永久保存）
          const updatedRawWarnings = state.rawWarnings.map(w =>
            w.id === warningId
              ? { ...w, status: 'confirmed' as const, confirmTime: now }
              : w
          );

          // 创建审批单（同时保存到原始数据）
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
            createdAt: now,
            updatedAt: now,
          };

          const updatedRawTodos = [newFlow!, ...state.rawApprovalTodos];
          
          // 重新过滤展示数据（从新的原始数据按当前层级过滤）
          const warnings = filterByLevel(updatedRawWarnings, state.currentLevel, state.currentRegion);
          const approvalTodos = filterApprovals(updatedRawTodos, state.currentLevel);
          
          return {
            rawWarnings: updatedRawWarnings,
            rawApprovalTodos: updatedRawTodos,
            warnings,
            approvalTodos,
          };
        });

        return newFlow;
      },

      dismissWarning: (warningId) => {
        set((state) => {
          const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
          
          // 修改原始数据
          const updatedRawWarnings = state.rawWarnings.map(w =>
            w.id === warningId
              ? { ...w, status: 'dismissed' as const, resolveTime: now }
              : w
          );
          
          // 重新过滤展示数据
          const warnings = filterByLevel(updatedRawWarnings, state.currentLevel, state.currentRegion);
          
          return {
            rawWarnings: updatedRawWarnings,
            warnings,
          };
        });
      },

      getWarningById: (id) => {
        return get().warnings.find(w => w.id === id) || get().rawWarnings.find(w => w.id === id);
      },

      approveFlow: (flowId, opinion) => {
        set((state) => {
          const flow = state.rawApprovalTodos.find(f => f.id === flowId);
          if (!flow) return state;

          const newStep = flow.currentStep + 1;
          const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

          // 更新当前步骤
          const updatedSteps = flow.steps.map((s, i) =>
            i === flow.currentStep - 1
              ? { ...s, status: 'approved' as const, opinion, handler: '当前用户', handleTime: now }
              : s
          );

          let updatedRawTodos = state.rawApprovalTodos;
          let updatedRawDones = state.rawApprovalDones;
          
          // 判断是否完成审批
          if (newStep > 3) {
            // 完成，从 rawTodos 移到 rawDones
            const doneFlow: ApprovalFlow = {
              ...flow,
              status: 'approved',
              currentStep: 4,
              steps: updatedSteps,
              updatedAt: now,
            };
            updatedRawTodos = state.rawApprovalTodos.filter(f => f.id !== flowId);
            updatedRawDones = [doneFlow, ...state.rawApprovalDones];
          } else {
            // 继续下一步
            const statusMap: Record<number, ApprovalFlow['status']> = {
              2: 'pending_edu',
              3: 'pending_propaganda',
            };
            
            updatedRawTodos = state.rawApprovalTodos.map(f =>
              f.id === flowId
                ? {
                    ...f,
                    status: statusMap[newStep] || f.status,
                    currentStep: newStep,
                    steps: updatedSteps,
                    updatedAt: now,
                  }
                : f
            );
          }

          // 重新过滤展示数据
          const approvalTodos = filterApprovals(updatedRawTodos, state.currentLevel);
          const approvalDones = filterApprovals(updatedRawDones, state.currentLevel);
          
          return {
            rawApprovalTodos: updatedRawTodos,
            rawApprovalDones: updatedRawDones,
            approvalTodos,
            approvalDones,
          };
        });
      },

      rejectFlow: (flowId, opinion) => {
        set((state) => {
          const flow = state.rawApprovalTodos.find(f => f.id === flowId);
          if (!flow) return state;

          const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

          const updatedSteps = flow.steps.map((s, i) =>
            i === flow.currentStep - 1
              ? { ...s, status: 'rejected' as const, opinion, handler: '当前用户', handleTime: now }
              : s
          );

          // 从 rawTodos 移到 rawDones
          const doneFlow: ApprovalFlow = {
            ...flow,
            status: 'rejected',
            steps: updatedSteps,
            updatedAt: now,
          };
          
          const updatedRawTodos = state.rawApprovalTodos.filter(f => f.id !== flowId);
          const updatedRawDones = [doneFlow, ...state.rawApprovalDones];
          
          // 重新过滤展示数据
          const approvalTodos = filterApprovals(updatedRawTodos, state.currentLevel);
          const approvalDones = filterApprovals(updatedRawDones, state.currentLevel);
          
          return {
            rawApprovalTodos: updatedRawTodos,
            rawApprovalDones: updatedRawDones,
            approvalTodos,
            approvalDones,
          };
        });
      },

      getTodoById: (id) => {
        return get().approvalTodos.find(f => f.id === id) || get().rawApprovalTodos.find(f => f.id === id);
      },

      removeTodo: (flowId) => {
        set((state) => {
          const updatedRawTodos = state.rawApprovalTodos.filter(f => f.id !== flowId);
          const approvalTodos = filterApprovals(updatedRawTodos, state.currentLevel);
          return {
            rawApprovalTodos: updatedRawTodos,
            approvalTodos,
          };
        });
      },
    }),
    {
      name: 'warning-approval-storage-v2',
    }
  )
);
