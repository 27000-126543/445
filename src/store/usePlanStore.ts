
import { create } from 'zustand';
import type { Plan, PlanKeyNode, RiskPrediction, SpeakerRec, ChannelRec } from '@/types';
import {
  generatePlans,
  generatePlanKeyNodes,
  generateRiskPredictions,
  generateSpeakerRecs,
  generateChannelRecs,
} from '@/mock';

interface PlanDetail {
  keyNodes: PlanKeyNode[];
  riskPredictions: RiskPrediction[];
  speakerRecs: SpeakerRec[];
  channelRecs: ChannelRec[];
}

interface PlanStore {
  plans: Plan[];
  planDetails: Record<string, PlanDetail>;
  
  initPlans: () => void;
  
  addPlan: (plan: Omit<Plan, 'id' | 'createdAt'>) => Plan;
  getPlanById: (id: string) => Plan | undefined;
  getPlanDetail: (id: string) => PlanDetail;
  generateDetailForPlan: (planId: string, planName: string) => PlanDetail;
}

export const usePlanStore = create<PlanStore>((set, get) => ({
  plans: [],
  planDetails: {},

  initPlans: () => {
    const plans = generatePlans(5);
    const planDetails: Record<string, PlanDetail> = {};

    plans.forEach((plan) => {
      planDetails[plan.id] = {
        keyNodes: generatePlanKeyNodes(6),
        riskPredictions: generateRiskPredictions(4),
        speakerRecs: generateSpeakerRecs(3),
        channelRecs: generateChannelRecs(4),
      };
    });

    set({ plans, planDetails });
  },

  addPlan: (planData) => {
    const newPlan: Plan = {
      ...planData,
      id: `plan-${Date.now()}`,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
    };

    // 生成详情占位数据
    const detail = get().generateDetailForPlan(newPlan.id, planData.name);

    set((state) => ({
      plans: [newPlan, ...state.plans],
      planDetails: {
        ...state.planDetails,
        [newPlan.id]: detail,
      },
    }));

    return newPlan;
  },

  getPlanById: (id) => {
    return get().plans.find(p => p.id === id);
  },

  getPlanDetail: (id) => {
    const existing = get().planDetails[id];
    if (existing) return existing;

    // 如果不存在，生成一份
    const plan = get().plans.find(p => p.id === id);
    const detail = get().generateDetailForPlan(id, plan?.name || '');
    set((state) => ({
      planDetails: { ...state.planDetails, [id]: detail },
    }));
    return detail;
  },

  generateDetailForPlan: (planId, planName) => {
    // 根据预案名称生成有针对性的占位数据
    const yearMatch = planName.match(/(\d{4})/);
    const year = yearMatch ? parseInt(yearMatch[1]) : 2024;

    const keyNodes: PlanKeyNode[] = [
      {
        id: `${planId}-kn-1`,
        title: `${year}年全国两会`,
        date: `${year}-03-05`,
        type: '重要会议',
        description: '全国人民代表大会和政治协商会议期间的舆情引导预案执行',
        riskLevel: 'high',
      },
      {
        id: `${planId}-kn-2`,
        title: '春节及春运期间',
        date: `${year}-01-28`,
        type: '重大节日',
        description: '春运交通、春节消费、节庆活动相关舆情监测重点',
        riskLevel: 'medium',
      },
      {
        id: `${planId}-kn-3`,
        title: '国庆黄金周',
        date: `${year}-10-01`,
        type: '重大节日',
        description: '假期出游、消费市场、社会治安等重点领域舆情',
        riskLevel: 'medium',
      },
      {
        id: `${planId}-kn-4`,
        title: '高考及升学季',
        date: `${year}-06-07`,
        type: '敏感节点',
        description: '教育公平、招生录取、就业形势等教育类舆情集中期',
        riskLevel: 'high',
      },
      {
        id: `${planId}-kn-5`,
        title: '消费者权益日',
        date: `${year}-03-15`,
        type: '专项活动',
        description: '315消费维权集中曝光期，重点关注产品质量、服务投诉舆情',
        riskLevel: 'high',
      },
      {
        id: `${planId}-kn-6`,
        title: '网络安全宣传周',
        date: `${year}-09-16`,
        type: '专项活动',
        description: '网络安全、数据隐私、电信诈骗等主题舆情引导',
        riskLevel: 'low',
      },
    ];

    return {
      keyNodes,
      riskPredictions: generateRiskPredictions(5),
      speakerRecs: generateSpeakerRecs(4),
      channelRecs: generateChannelRecs(5),
    };
  },
}));
