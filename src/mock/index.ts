
import Mock from 'mockjs';
import type {
  DashboardStats,
  ProvinceHeatData,
  EventItem,
  OpinionItem,
  Warning,
  KeyNode,
  KeywordItem,
  DailyEmotionData,
  RegionRankItem,
  WeeklyReport,
  Plan,
  RiskPrediction,
  SpeakerRec,
  ChannelRec,
  PlanKeyNode,
  ApprovalFlow,
} from '@/types';

const provinces = [
  '北京', '天津', '河北', '山西', '内蒙古', '辽宁', '吉林', '黑龙江',
  '上海', '江苏', '浙江', '安徽', '福建', '江西', '山东', '河南',
  '湖北', '湖南', '广东', '广西', '海南', '重庆', '四川', '贵州',
  '云南', '西藏', '陕西', '甘肃', '青海', '宁夏', '新疆', '台湾',
  '香港', '澳门'
];

const sources: Array<'weibo' | 'wechat' | 'news' | 'forum' | 'video'> = ['weibo', 'wechat', 'news', 'forum', 'video'];

const emotions: Array<'positive' | 'neutral' | 'negative'> = ['positive', 'neutral', 'negative'];

const eventCategories = ['社会民生', '公共安全', '经济金融', '教育医疗', '环境保护', '交通出行', '文化娱乐', '科技网络'];

export const generateDashboardStats = (): DashboardStats => {
  return {
    totalOpinions: Mock.Random.integer(800000, 1500000),
    todayOpinions: Mock.Random.integer(30000, 80000),
    negativeRatio: Mock.Random.float(15, 35, 1, 1),
    warningCount: Mock.Random.integer(3, 12),
    activeEvents: Mock.Random.integer(8, 20),
    avgResponseTime: Mock.Random.float(1.5, 4.5, 1, 1),
    todayChange: {
      opinions: Mock.Random.float(-10, 20, 1, 1),
      negative: Mock.Random.float(-5, 10, 1, 1),
      warnings: Mock.Random.float(-20, 30, 0, 0),
      response: Mock.Random.float(-15, 10, 1, 1),
    },
  };
};

export const generateProvinceHeatData = (): ProvinceHeatData[] => {
  return provinces.map(name => {
    const total = Mock.Random.integer(5000, 80000);
    const negative = Mock.Random.integer(Math.floor(total * 0.1), Math.floor(total * 0.4));
    const positive = Mock.Random.integer(Math.floor(total * 0.3), Math.floor(total * 0.6));
    const neutral = total - negative - positive;
    return {
      name,
      value: total,
      positive,
      neutral,
      negative,
    };
  });
};

export const generateEvents = (count: number = 10): EventItem[] => {
  return Array.from({ length: count }, (_, i) => {
    const heatIndex = Mock.Random.integer(1000, 10000);
    const negativeRatio = Mock.Random.float(10, 60, 1, 1);
    const statuses: Array<'active' | 'cooling' | 'resolved'> = ['active', 'cooling', 'resolved'];
    const trends: Array<'rising' | 'stable' | 'falling'> = ['rising', 'stable', 'falling'];
    return {
      id: `event-${i + 1}`,
      title: Mock.Random.ctitle(8, 20),
      description: Mock.Random.cparagraph(1, 3),
      category: Mock.Random.pick(eventCategories),
      level: Mock.Random.integer(1, 4) as 1 | 2 | 3 | 4,
      status: statuses[Mock.Random.integer(0, 2)],
      region: {
        provinces: Mock.Random.shuffle(provinces).slice(0, Mock.Random.integer(1, 5)),
      },
      startTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      peakTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      heatIndex,
      heatTrend: trends[Mock.Random.integer(0, 2)],
      emotionScore: Mock.Random.float(20, 80, 1, 1),
      negativeRatio,
      spreadSpeed: Mock.Random.float(1, 10, 1, 1),
      sourceCount: Mock.Random.integer(5, 50),
      opinionCount: Mock.Random.integer(1000, 50000),
      createdAt: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      updatedAt: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    };
  });
};

export const generateOpinionList = (count: number = 20): OpinionItem[] => {
  return Array.from({ length: count }, (_, i) => {
    const emotion = Mock.Random.pick(emotions);
    return {
      id: `opinion-${i + 1}`,
      title: Mock.Random.ctitle(10, 30),
      content: Mock.Random.cparagraph(1, 2),
      source: Mock.Random.pick(sources),
      sourceUrl: Mock.Random.url(),
      author: {
        id: `user-${Mock.Random.integer(1000, 99999)}`,
        name: Mock.Random.cname(),
        followers: Mock.Random.integer(100, 10000000),
      },
      publishTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      emotion,
      emotionScore: Mock.Random.float(0, 100, 1, 1),
      sensitiveWords: Mock.Random.boolean() ? [Mock.Random.cword(2, 4), Mock.Random.cword(2, 4)] : [],
      region: {
        province: Mock.Random.pick(provinces),
        city: Mock.Random.city(),
      },
      repostCount: Mock.Random.integer(0, 10000),
      commentCount: Mock.Random.integer(0, 5000),
      likeCount: Mock.Random.integer(0, 20000),
      heatIndex: Mock.Random.integer(100, 5000),
      eventId: Mock.Random.boolean() ? `event-${Mock.Random.integer(1, 10)}` : undefined,
    };
  });
};

export const generateWarnings = (count: number = 8): Warning[] => {
  const triggerTypes: Array<'negative_ratio' | 'heat_threshold' | 'sensitive_word'> = ['negative_ratio', 'heat_threshold', 'sensitive_word'];
  const statuses: Array<'pending' | 'confirmed' | 'processing' | 'resolved' | 'dismissed'> = ['pending', 'confirmed', 'processing', 'resolved', 'dismissed'];
  
  return Array.from({ length: count }, (_, i) => {
    const triggerType = Mock.Random.pick(triggerTypes);
    const level = Mock.Random.integer(1, 3) as 1 | 2 | 3;
    return {
      id: `warning-${i + 1}`,
      eventId: `event-${Mock.Random.integer(1, 10)}`,
      eventTitle: Mock.Random.ctitle(8, 20),
      level,
      triggerType,
      triggerCondition: {
        type: triggerType,
        threshold: triggerType === 'negative_ratio' ? 70 : triggerType === 'heat_threshold' ? 8000 : 5,
        actualValue: triggerType === 'negative_ratio' ? Mock.Random.float(70, 90, 1, 1) : 
                     triggerType === 'heat_threshold' ? Mock.Random.integer(8000, 15000) :
                     Mock.Random.integer(5, 20),
        duration: Mock.Random.integer(30, 180),
      },
      status: statuses[Mock.Random.integer(0, 4)],
      region: Mock.Random.pick(provinces),
      pushTargets: ['值班员A', '舆情分析员B'],
      pushTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      confirmTime: Mock.Random.boolean() ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') : undefined,
      resolveTime: Mock.Random.boolean() ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') : undefined,
      handler: Mock.Random.boolean() ? Mock.Random.cname() : undefined,
      createdAt: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    };
  });
};

export const generateKeyNodes = (count: number = 20): KeyNode[] => {
  return Array.from({ length: count }, (_, i) => {
    const followers = Mock.Random.integer(10000, 10000000);
    return {
      id: `node-${i + 1}`,
      name: Mock.Random.cname(),
      source: Mock.Random.pick(['微博', '微信公众号', '抖音', 'B站', '知乎']),
      followers,
      influenceIndex: Mock.Random.float(50, 99, 1, 1),
      repostCount: Mock.Random.integer(1000, 100000),
      commentCount: Mock.Random.integer(500, 50000),
      isOpinionLeader: i < 5,
    };
  }).sort((a, b) => b.influenceIndex - a.influenceIndex);
};

export const generateKeywords = (count: number = 50): KeywordItem[] => {
  const words = [
    '政策', '经济', '教育', '医疗', '环境', '交通', '安全', '民生',
    '发展', '改革', '创新', '科技', '网络', '数据', '隐私', '风险',
    '治理', '服务', '保障', '质量', '效率', '公平', '正义', '法治',
    '社会', '群众', '基层', '社区', '城市', '乡村', '文化', '旅游',
    '就业', '收入', '住房', '养老', '健康', '食品', '药品', '疫情',
    '应急', '预警', '响应', '处置', '辟谣', '引导', '宣传', '舆情',
    '热点', '事件', '话题', '讨论', '观点', '评论', '转发', '点赞',
  ];
  
  return words.slice(0, count).map(word => ({
    word,
    count: Mock.Random.integer(100, 5000),
    emotion: Mock.Random.pick(emotions),
  }));
};

export const generateDailyEmotionData = (days: number = 30): DailyEmotionData[] => {
  const data: DailyEmotionData[] = [];
  const today = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const total = Mock.Random.integer(20000, 60000);
    const negative = Math.floor(total * Mock.Random.float(0.15, 0.35, 2, 2));
    const positive = Math.floor(total * Mock.Random.float(0.35, 0.55, 2, 2));
    const neutral = total - negative - positive;
    
    data.push({
      date: date.toISOString().split('T')[0],
      positive,
      neutral,
      negative,
    });
  }
  
  return data;
};

export const generateRegionRank = (): RegionRankItem[] => {
  return provinces.slice(0, 10).map((region, index) => ({
    region,
    spreadSpeed: Mock.Random.float(2, 8, 1, 1),
    responseSpeed: Mock.Random.float(1, 5, 1, 1),
    efficiencyScore: Mock.Random.float(60, 95, 1, 1),
    rank: index + 1,
    trend: Mock.Random.pick(['up', 'down', 'stable'] as const),
  })).sort((a, b) => a.rank - b.rank);
};

export const generateWeeklyReport = (): WeeklyReport => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);
  
  return {
    id: 'report-1',
    week: '第24周',
    startDate: startDate.toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    region: '全国',
    summary: {
      totalOpinions: Mock.Random.integer(400000, 800000),
      weekOnWeek: Mock.Random.float(-10, 15, 1, 1),
      positiveRatio: Mock.Random.float(45, 65, 1, 1),
      positiveWoW: Mock.Random.float(-5, 8, 1, 1),
      negativeRatio: Mock.Random.float(15, 35, 1, 1),
      negativeWoW: Mock.Random.float(-8, 10, 1, 1),
      warningCount: Mock.Random.integer(20, 50),
      warningWoW: Mock.Random.float(-20, 25, 0, 0),
      avgResponseTime: Mock.Random.float(2, 5, 1, 1),
      responseTimeWoW: Mock.Random.float(-15, 10, 1, 1),
    },
    generatedAt: new Date().toISOString(),
  };
};

export const generatePlans = (count: number = 5): Plan[] => {
  return Array.from({ length: count }, (_, i) => {
    const statuses: Array<'draft' | 'active' | 'archived'> = ['active', 'active', 'draft', 'archived', 'active'];
    return {
      id: `plan-${i + 1}`,
      name: `${2024 - i}年度宣传引导预案`,
      year: 2024 - i,
      type: Mock.Random.pick(['年度总预案', '专项预案', '应急方案']),
      description: Mock.Random.cparagraph(1, 2),
      fileUrl: `/files/plan-${i + 1}.xlsx`,
      status: statuses[i],
      createdAt: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      createdBy: Mock.Random.cname(),
    };
  });
};

export const generatePlanKeyNodes = (count: number = 8): PlanKeyNode[] => {
  const types = ['重要会议', '重大节日', '敏感节点', '专项活动'];
  const riskLevels: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `node-${i + 1}`,
    title: Mock.Random.ctitle(6, 12),
    date: Mock.Random.datetime('yyyy-MM-dd'),
    type: types[Mock.Random.integer(0, 3)],
    description: Mock.Random.cparagraph(1),
    riskLevel: riskLevels[Mock.Random.integer(0, 2)],
  }));
};

export const generateRiskPredictions = (count: number = 6): RiskPrediction[] => {
  const riskLevels: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'medium', 'low'];
  const eventTypes = ['群体性事件', '网络谣言', '食品安全', '环境污染', '安全生产', '社会民生'];
  const titles = [
    '春季开学季校园安全风险', '网络电信诈骗高发预警', '食品药品安全舆情风险',
    '节假日旅游安全风险', '极端天气应急处置风险', '安全生产事故舆情风险',
    '网络群体性事件发酵风险', '公共卫生事件传播风险'
  ];
  const descriptions = [
    '近期相关话题讨论量呈上升趋势，需密切关注事态发展，提前做好应对准备',
    '监测到多个平台出现相关讨论，存在引发群体性舆情的风险，建议启动预案',
    '历史同期曾发生类似事件，建议提前部署监测力量，做好应急响应准备',
    '该类事件传播速度快，影响范围广，需加强舆情监测和引导力度',
    '涉及群众切身利益，容易引发负面情绪，建议主动发声，及时回应关切'
  ];
  const areas = [
    '东部沿海地区', '中西部省会城市', '京津冀地区', '长三角地区',
    '珠三角地区', '东北地区', '西南地区', '西北地区'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const predictedTime = Mock.Random.datetime('yyyy-MM-dd HH:mm:ss');
    return {
      id: `risk-${i + 1}`,
      eventType: eventTypes[i % eventTypes.length],
      title: titles[i % titles.length],
      description: descriptions[i % descriptions.length],
      affectedAreas: Mock.Random.shuffle(areas).slice(0, Mock.Random.integer(2, 4)),
      probability: Mock.Random.float(20, 85, 1, 1),
      riskLevel: riskLevels[Mock.Random.integer(0, 3)],
      predictedTime,
      predictTime: predictedTime,
      predictedRegion: Mock.Random.shuffle(provinces).slice(0, Mock.Random.integer(1, 3)),
      relatedHistoryEvents: [Mock.Random.ctitle(8, 15), Mock.Random.ctitle(8, 15)],
      suggestions: [Mock.Random.csentence(10, 20), Mock.Random.csentence(10, 20), Mock.Random.csentence(10, 20)],
    };
  });
};

export const generateSpeakerRecs = (count: number = 4): SpeakerRec[] => {
  const departments = ['宣传部', '网信办', '卫健委', '公安局', '环保局', '教育局'];
  const expertise = ['新闻发布', '危机公关', '政策解读', '专业技术', '舆情应对'];
  
  return Array.from({ length: count }, (_, i) => {
    const score = Mock.Random.float(75, 95, 1, 1);
    return {
      id: `speaker-${i + 1}`,
      name: Mock.Random.cname(),
      title: Mock.Random.pick(['新闻发言人', '副主任', '处长', '专家顾问']),
      department: departments[i % departments.length],
      expertise: Mock.Random.shuffle(expertise).slice(0, 3),
      suitabilityScore: score,
      matchScore: Math.round(score * 1.1),
      reason: Mock.Random.cparagraph(1),
    };
  }).sort((a, b) => b.suitabilityScore - a.suitabilityScore);
};

export const generateChannelRecs = (count: number = 6): ChannelRec[] => {
  const channels = ['官方微博', '官方微信公众号', '官方抖音', '新闻发布会', '主流媒体专访', '网络问答平台'];
  const types = ['社交媒体', '社交媒体', '短视频', '线下活动', '传统媒体', '网络社区'];
  const descriptions = [
    '覆盖年轻用户群体，传播速度快，互动性强，适合快速发布权威信息',
    '触达中年群体，公信力强，适合发布深度解读和政策说明',
    '短视频形式生动直观，传播范围广，适合科普和案例展示',
    '权威性最高，适合重大事件的官方表态和信息发布',
    '深度报道形式，影响意见领袖，适合专业性较强的话题',
    '精准触达提问用户，适合答疑解惑和针对性回应'
  ];
  const weights = [0.25, 0.30, 0.20, 0.15, 0.06, 0.04];
  
  return Array.from({ length: count }, (_, i) => {
    const coverage = Mock.Random.integer(100000, 5000000);
    return {
      id: `channel-${i + 1}`,
      channel: channels[i],
      channelType: types[i],
      name: channels[i],
      type: types[i],
      weight: weights[i],
      description: descriptions[i],
      reach: coverage,
      audienceCoverage: coverage,
      effectivenessScore: Mock.Random.float(60, 90, 1, 1),
      recommendedTime: Mock.Random.pick(['上午9-10点', '中午12-13点', '下午15-17点', '晚上19-21点']),
      reason: Mock.Random.cparagraph(1),
    };
  });
};

export const generateApprovalFlows = (count: number = 6): ApprovalFlow[] => {
  const types: Array<'official_response' | 'cooling_strategy' | 'rumor_refutation'> = ['official_response', 'cooling_strategy', 'rumor_refutation'];
  const statuses: Array<'pending_analyst' | 'pending_edu' | 'pending_propaganda' | 'approved' | 'rejected'> = [
    'pending_analyst', 'pending_edu', 'pending_propaganda', 'approved', 'rejected', 'pending_edu'
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const status = statuses[i % statuses.length];
    let currentStep = 0;
    if (status === 'pending_analyst') currentStep = 1;
    else if (status === 'pending_edu') currentStep = 2;
    else if (status === 'pending_propaganda') currentStep = 3;
    else if (status === 'approved' || status === 'rejected') currentStep = 4;
    
    return {
      id: `approval-${i + 1}`,
      warningId: `warning-${i + 1}`,
      eventId: `event-${i + 1}`,
      eventTitle: Mock.Random.ctitle(8, 20),
      type: types[i % types.length],
      status,
      currentStep,
      steps: [
        { step: 1, role: '舆情分析员', status: currentStep > 1 ? 'approved' : status === 'rejected' && currentStep === 1 ? 'rejected' : 'pending', handler: currentStep > 1 ? Mock.Random.cname() : undefined, opinion: currentStep > 1 ? '舆情属实，建议启动应急响应' : undefined, handleTime: currentStep > 1 ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') : undefined },
        { step: 2, role: '宣教中心', status: currentStep > 2 ? 'approved' : currentStep === 2 ? 'pending' : 'pending', handler: currentStep > 2 ? Mock.Random.cname() : undefined, opinion: currentStep > 2 ? '同意启动官方回应，建议发布通稿' : undefined, handleTime: currentStep > 2 ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') : undefined },
        { step: 3, role: '宣传部', status: currentStep > 3 ? (status === 'approved' ? 'approved' : 'rejected') : currentStep === 3 ? 'pending' : 'pending', handler: currentStep > 3 ? Mock.Random.cname() : undefined, opinion: currentStep > 3 ? (status === 'approved' ? '批准执行，注意引导方式' : '暂不执行，再观察') : undefined, handleTime: currentStep > 3 ? Mock.Random.datetime('yyyy-MM-dd HH:mm:ss') : undefined },
      ],
      initiator: Mock.Random.cname(),
      initiatorDept: '舆情监测中心',
      createdAt: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
      updatedAt: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    };
  });
};
