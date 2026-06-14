
import { create } from 'zustand';
import type { Warning, ApprovalFlow } from '@/types';
import { generateWarnings, generateApprovalFlows } from '@/mock';
import type { UserLevel } from '@/types';

interface WarningApprovalStore {
  warnings: Warning[];
  approvalTodos: ApprovalFlow[];
  approvalDones: ApprovalFlow[];
  
  initData: (level: UserLevel) => void;
  
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

export const useWarningApprovalStore = create<WarningApprovalStore>((set, get) => ({
  warnings: [],
  approvalTodos: [],
  approvalDones: [],

  initData: (level) => {
    let warnings = generateWarnings(12);
    let todos = generateApprovalFlows(5).filter(a => a.status.includes('pending'));
    let dones = generateApprovalFlows(8).filter(a => !a.status.includes('pending'));

    // 根据层级过滤
    if (level === 'provincial') {
      warnings = warnings.slice(0, 7);
      todos = todos.slice(0, 3);
      dones = dones.slice(0, 5);
    } else if (level === 'municipal') {
      warnings = warnings.slice(0, 4);
      todos = todos.slice(0, 1);
      dones = dones.slice(0, 3);
    }

    set({ warnings, approvalTodos: todos, approvalDones: dones });
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
}));
