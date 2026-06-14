
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  DashboardStats,
  ProvinceHeatData,
  EventItem,
  OpinionItem,
  DailyEmotionData,
  UserLevel,
  DashboardMetric,
} from '@/types';
import {
  generateDashboardStats,
  generateProvinceHeatData,
  generateEvents,
  generateOpinionList,
  generateDailyEmotionData,
} from '@/mock';

interface DashboardStore {
  rawStats: DashboardStats | null;
  rawHeatData: ProvinceHeatData[];
  rawEvents: EventItem[];
  rawOpinions: OpinionItem[];
  rawEmotionTrend: DailyEmotionData[];

  currentMetric: DashboardMetric;
  initialized: boolean;

  initDashboardData: () => void;
  setMetric: (metric: DashboardMetric) => void;
  resetInit: () => void;

  getScopedStats: (level: UserLevel, regionName?: string) => DashboardStats;
  getScopedHeatData: (level: UserLevel, regionName?: string) => ProvinceHeatData[];
  getScopedEvents: (level: UserLevel, regionName?: string) => EventItem[];
  getScopedOpinions: (level: UserLevel, regionName?: string) => OpinionItem[];
  getScopedTrend: (level: UserLevel, regionName?: string) => DailyEmotionData[];
}

const scaleNumber = (n: number, r: number) => Math.max(1, Math.round(n * r));
const LEVEL_RATIO: Record<UserLevel, number> = { national: 1, provincial: 0.6, municipal: 0.35 };

const provinceToCities: Record<string, string[]> = {
  '北京': ['东城区', '西城区', '朝阳区', '海淀区', '丰台区', '石景山区', '通州区', '昌平区'],
  '上海': ['黄浦区', '徐汇区', '长宁区', '静安区', '普陀区', '虹口区', '杨浦区', '浦东新区', '闵行区', '宝山区'],
  '广东': ['广州市', '深圳市', '珠海市', '佛山市', '东莞市', '中山市', '惠州市', '江门市', '肇庆市', '汕头市'],
  '江苏': ['南京市', '苏州市', '无锡市', '常州市', '镇江市', '南通市', '扬州市', '徐州市', '连云港市', '淮安市'],
  '浙江': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市'],
  '四川': ['成都市', '绵阳市', '德阳市', '宜宾市', '泸州市', '乐山市', '南充市', '达州市', '内江市', '自贡市'],
  '山东': ['济南市', '青岛市', '烟台市', '潍坊市', '淄博市', '济宁市', '威海市', '临沂市', '泰安市', '日照市'],
  '湖北': ['武汉市', '宜昌市', '襄阳市', '荆州市', '黄冈市', '孝感市', '十堰市', '咸宁市', '黄石市', '恩施'],
  '河南': ['郑州市', '洛阳市', '开封市', '新乡市', '焦作市', '安阳市', '南阳市', '商丘市', '许昌市', '周口市'],
  '福建': ['福州市', '厦门市', '泉州市', '漳州市', '莆田市', '龙岩市', '三明市', '南平市', '宁德市'],
  '河北': ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '保定市', '张家口市', '承德市', '沧州市', '廊坊市', '衡水市'],
  '山西': ['太原市', '大同市', '运城市', '临汾市', '晋中市', '长治市', '晋城市', '忻州市', '朔州市', '阳泉市'],
  '辽宁': ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '辽阳市', '盘锦市'],
  '吉林': ['长春市', '吉林市', '四平市', '通化市', '白山市', '辽源市', '松原市', '白城市'],
  '黑龙江': ['哈尔滨市', '齐齐哈尔市', '牡丹江市', '佳木斯市', '大庆市', '伊春市', '鸡西市', '鹤岗市', '双鸭山市', '绥化市'],
  '安徽': ['合肥市', '芜湖市', '蚌埠市', '马鞍山市', '淮南市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市'],
  '江西': ['南昌市', '九江市', '赣州市', '上饶市', '宜春市', '吉安市', '抚州市', '景德镇市', '萍乡市', '新余市'],
  '湖南': ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市'],
  '广西': ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市'],
  '云南': ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市'],
  '贵州': ['贵阳市', '遵义市', '六盘水市', '安顺市', '毕节市', '铜仁市'],
  '陕西': ['西安市', '宝鸡市', '咸阳市', '渭南市', '铜川市', '延安市', '榆林市', '汉中市', '安康市', '商洛市'],
  '甘肃': ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '酒泉市', '张掖市', '武威市', '定西市', '陇南市'],
  '内蒙古': ['呼和浩特市', '包头市', '鄂尔多斯市', '赤峰市', '通辽市', '呼伦贝尔市', '乌兰察布市', '巴彦淖尔市', '乌海市', '阿拉善盟'],
  '新疆': ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉', '巴音郭楞', '伊犁', '阿克苏', '喀什', '和田'],
  '西藏': ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市', '阿里地区'],
  '青海': ['西宁市', '海东市', '海北', '黄南', '海南州', '果洛', '玉树', '海西'],
  '宁夏': ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
  '海南': ['海口市', '三亚市', '三沙市', '儋州市'],
  '重庆': ['渝中区', '江北区', '南岸区', '九龙坡区', '沙坪坝区', '渝北区', '巴南区', '北碚区', '万州区', '涪陵区'],
  '天津': ['和平区', '河东区', '河西区', '南开区', '河北区', '红桥区', '东丽区', '西青区', '津南区', '北辰区'],
};

const getCitiesByProvince = (provinceName: string): string[] => {
  const clean = provinceName.replace(/(省|市|自治区|特别行政区)$/g, '');
  for (const k of Object.keys(provinceToCities)) {
    if (k.includes(clean) || clean.includes(k)) {
      return provinceToCities[k];
    }
  }
  return ['城区1', '城区2', '城区3', '城区4', '城区5'];
};

const fuzzyMatchRegion = (target: string, candidates: string[]): boolean => {
  const clean = (s: string) => s.replace(/(省|市|自治区|特别行政区|区)$/g, '');
  const ct = clean(target);
  return candidates.some(c => {
    const cc = clean(c);
    return cc.includes(ct) || ct.includes(cc);
  });
};

const scaleProvince = (p: ProvinceHeatData, ratio: number): ProvinceHeatData => {
  const neg = scaleNumber(p.negative, ratio);
  const pos = scaleNumber(p.positive, ratio);
  const neu = scaleNumber(p.neutral, ratio);
  const total = pos + neu + neg;
  return {
    ...p,
    value: total,
    positive: pos,
    neutral: neu,
    negative: neg,
    negativeRatio: Math.min(100, Math.max(0, Math.round((neg / Math.max(1, total)) * 100))),
    spreadSpeed: Math.max(0.5, Number((((p.spreadSpeed || 3) * (0.6 + ratio * 0.6))).toFixed(1))),
    warningCount: Math.max(0, Math.round((p.warningCount || Math.floor(total / 20000)) * ratio)),
  };
};

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      rawStats: null,
      rawHeatData: [],
      rawEvents: [],
      rawOpinions: [],
      rawEmotionTrend: [],
      currentMetric: 'total',
      initialized: false,

      initDashboardData: () => {
        if (get().initialized) return;
        const rawHeat = generateProvinceHeatData().map(p => {
          const cities = getCitiesByProvince(p.name);
          const cityData: ProvinceHeatData[] = cities.map(cname => {
            const t = Math.max(1000, Math.floor(p.value / cities.length * (0.5 + Math.random() * 1.2)));
            const n = Math.floor(t * (0.1 + Math.random() * 0.3));
            const po = Math.floor(t * (0.3 + Math.random() * 0.3));
            const ne = t - n - po;
            return {
              name: cname,
              value: t,
              positive: po,
              neutral: ne,
              negative: n,
              negativeRatio: Math.round((n / Math.max(1, t)) * 100),
              spreadSpeed: Number((1 + Math.random() * 7).toFixed(1)),
              warningCount: Math.floor(t / 15000),
            };
          });
          return {
            ...p,
            negativeRatio: Math.round((p.negative / Math.max(1, p.value)) * 100),
            spreadSpeed: Number((1 + Math.random() * 7).toFixed(1)),
            warningCount: Math.floor(p.value / 25000),
            cityData,
          };
        });

        set({
          rawStats: generateDashboardStats(),
          rawHeatData: rawHeat,
          rawEvents: generateEvents(50),
          rawOpinions: generateOpinionList(60),
          rawEmotionTrend: generateDailyEmotionData(30),
          initialized: true,
        });
      },

      setMetric: (metric) => set({ currentMetric: metric }),

      resetInit: () => set({
        rawStats: null,
        rawHeatData: [],
        rawEvents: [],
        rawOpinions: [],
        rawEmotionTrend: [],
        initialized: false,
      }),

      getScopedStats: (level, regionName) => {
        const raw = get().rawStats;
        if (!raw) return generateDashboardStats();
        const r = LEVEL_RATIO[level];
        return {
          ...raw,
          todayOpinions: scaleNumber(raw.todayOpinions, r),
          warningCount: scaleNumber(raw.warningCount, r),
          totalEvents: scaleNumber(raw.totalEvents || 0, r),
          activeEvents: scaleNumber(raw.activeEvents, r),
          todayChange: {
            opinions: Number((raw.todayChange.opinions * r).toFixed(1)),
            negative: Number((raw.todayChange.negative * r).toFixed(1)),
            warnings: Math.round(raw.todayChange.warnings * r),
            response: Number((raw.todayChange.response * (0.8 + r * 0.4)).toFixed(1)),
          },
        };
      },

      getScopedHeatData: (level, regionName) => {
        const raw = get().rawHeatData;
        if (raw.length === 0) return [];
        const r = LEVEL_RATIO[level];

        if (level === 'national') {
          return raw.map(p => scaleProvince(p, r));
        }

        if (level === 'provincial') {
          const matched = raw.filter(p =>
            fuzzyMatchRegion(regionName || '', [p.name])
          );
          let result: ProvinceHeatData[] = [];
          if (matched.length > 0 && matched[0].cityData && matched[0].cityData.length > 0) {
            result = matched[0].cityData!.map(c => scaleProvince(c, r));
          } else if (matched.length > 0) {
            result = [scaleProvince(matched[0], r)];
          } else {
            result = raw.slice(0, 5).map((p, i) => scaleProvince({
              ...p,
              name: `${regionName?.slice(0, 2)}区域${i + 1}`,
            }, r));
          }
          return result;
        }

        if (level === 'municipal') {
          const clean = (s: string) => s.replace(/(省|市|自治区|特别行政区|区)$/g, '');
          const ct = clean(regionName || '');
          for (const p of raw) {
            if (p.cityData && p.cityData.length > 0) {
              const cityMatch = p.cityData.find(c => {
                const cc = clean(c.name);
                return cc.includes(ct) || ct.includes(cc);
              });
              if (cityMatch) {
                return [scaleProvince(cityMatch, r)];
              }
            }
            if (fuzzyMatchRegion(regionName || '', [p.name])) {
              if (p.cityData && p.cityData.length > 0) {
                return [scaleProvince({ ...p.cityData[0], name: regionName || p.cityData[0].name }, r)];
              }
              return [scaleProvince({ ...p, name: regionName || p.name }, r)];
            }
          }
          return [scaleProvince({
            name: regionName || '当前市',
            value: 15000,
            positive: 7500,
            neutral: 5000,
            negative: 2500,
            negativeRatio: 22,
            spreadSpeed: 3.2,
            warningCount: 2,
          }, r)];
        }
        return [];
      },

      getScopedEvents: (level, regionName) => {
        const raw = get().rawEvents;
        if (raw.length === 0) return [];
        const r = LEVEL_RATIO[level];
        let result = [...raw];

        if (level !== 'national' && regionName) {
          const matched = result.filter(e =>
            e.region.provinces.some(p => fuzzyMatchRegion(regionName, [p]))
          );
          if (matched.length > 0) {
            result = matched;
          } else {
            result = result.slice(0, 8).map(e => ({
              ...e,
              id: `${e.id}-local-${regionName}`,
              region: { ...e.region, provinces: [regionName] },
            }));
          }
        }
        const count = Math.max(3, Math.floor(result.length * (level === 'national' ? 0.4 : r)));
        return result.slice(0, count).map(e => ({
          ...e,
          heatIndex: scaleNumber(e.heatIndex, r),
          heat: scaleNumber(e.heatIndex, r),
          commentCount: scaleNumber(e.commentCount || 0, r),
          repostCount: scaleNumber(e.repostCount || 0, r),
        }));
      },

      getScopedOpinions: (level, regionName) => {
        const raw = get().rawOpinions;
        if (raw.length === 0) return [];
        const r = LEVEL_RATIO[level];
        let result = [...raw];

        if (level !== 'national' && regionName) {
          const matched = result.filter(o => {
            const regions = [o.region?.province || '', o.region?.city || ''];
            return regions.some(p => fuzzyMatchRegion(regionName, [p]));
          });
          if (matched.length > 0) {
            result = matched;
          }
        }
        const count = Math.max(5, Math.floor(result.length * (level === 'national' ? 0.5 : r)));
        return result.slice(0, count);
      },

      getScopedTrend: (level, regionName) => {
        const raw = get().rawEmotionTrend;
        if (raw.length === 0) return [];
        const r = LEVEL_RATIO[level];
        const daysCount = level === 'national' ? 30 : level === 'provincial' ? 21 : 14;
        return raw.slice(0, daysCount).map(d => ({
          ...d,
          count: scaleNumber(d.count || 0, r),
          positive: scaleNumber(d.positive, r),
          neutral: scaleNumber(d.neutral, r),
          negative: scaleNumber(d.negative, r),
        }));
      },
    }),
    {
      name: 'dashboard-storage-v1',
    }
  )
);
