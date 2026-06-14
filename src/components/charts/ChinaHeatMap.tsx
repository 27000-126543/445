
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ProvinceHeatData, DashboardMetric, UserLevel } from '@/types';

interface ChinaHeatMapProps {
  data: ProvinceHeatData[];
  metric?: DashboardMetric;
  level?: UserLevel;
  scopeName?: string;
  onProvinceClick?: (province: ProvinceHeatData) => void;
}

const provincePositions: Record<string, { x: number; y: number; w: number; h: number }> = {
  '黑龙江': { x: 75, y: 5, w: 70, h: 50 },
  '吉林': { x: 85, y: 55, w: 45, h: 30 },
  '辽宁': { x: 75, y: 82, w: 55, h: 30 },
  '内蒙古': { x: 30, y: 30, w: 100, h: 55 },
  '新疆': { x: 5, y: 45, w: 60, h: 80 },
  '西藏': { x: 10, y: 100, w: 55, h: 55 },
  '青海': { x: 55, y: 90, w: 40, h: 35 },
  '甘肃': { x: 65, y: 70, w: 45, h: 40 },
  '宁夏': { x: 85, y: 75, w: 15, h: 20 },
  '陕西': { x: 95, y: 70, w: 25, h: 40 },
  '山西': { x: 110, y: 65, w: 25, h: 35 },
  '河北': { x: 105, y: 50, w: 35, h: 30 },
  '北京': { x: 120, y: 48, w: 10, h: 10 },
  '天津': { x: 130, y: 52, w: 8, h: 8 },
  '山东': { x: 115, y: 80, w: 35, h: 25 },
  '河南': { x: 100, y: 100, w: 35, h: 30 },
  '江苏': { x: 125, y: 90, w: 30, h: 25 },
  '安徽': { x: 120, y: 108, w: 30, h: 28 },
  '上海': { x: 150, y: 95, w: 10, h: 10 },
  '浙江': { x: 140, y: 110, w: 25, h: 25 },
  '福建': { x: 145, y: 130, w: 22, h: 28 },
  '台湾': { x: 165, y: 135, w: 12, h: 25 },
  '广东': { x: 120, y: 145, w: 40, h: 25 },
  '广西': { x: 95, y: 140, w: 30, h: 30 },
  '海南': { x: 105, y: 175, w: 15, h: 18 },
  '香港': { x: 145, y: 168, w: 6, h: 6 },
  '澳门': { x: 138, y: 170, w: 5, h: 5 },
  '江西': { x: 130, y: 125, w: 25, h: 30 },
  '湖北': { x: 100, y: 115, w: 35, h: 25 },
  '湖南': { x: 105, y: 132, w: 30, h: 30 },
  '四川': { x: 60, y: 115, w: 50, h: 50 },
  '重庆': { x: 90, y: 120, w: 20, h: 20 },
  '贵州': { x: 85, y: 140, w: 28, h: 25 },
  '云南': { x: 60, y: 145, w: 35, h: 45 },
};

const metricLabelMap: Record<DashboardMetric, string> = {
  total: '舆情总量',
  negative: '负面占比',
  speed: '传播速度',
  warning: '预警数量',
};
const metricUnitMap: Record<DashboardMetric, string> = {
  total: '条',
  negative: '%',
  speed: '级',
  warning: '条',
};

const getMetricValue = (d: ProvinceHeatData, metric: DashboardMetric): number => {
  switch (metric) {
    case 'total': return d.value || 0;
    case 'negative': return d.negativeRatio || 0;
    case 'speed': return d.spreadSpeed || 0;
    case 'warning': return d.warningCount || 0;
  }
};

export default function ChinaHeatMap({
  data,
  metric = 'total',
  level = 'national',
  scopeName,
  onProvinceClick,
}: ChinaHeatMapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const showNationalMap = level === 'national';
  const displayData = showNationalMap ? data : data;

  const { maxValue, minValue } = useMemo(() => {
    const values = displayData.map(d => getMetricValue(d, metric));
    if (values.length === 0) return { maxValue: 1, minValue: 0 };
    return {
      maxValue: Math.max(...values, 1),
      minValue: Math.min(...values, 0),
    };
  }, [displayData, metric]);

  const getColor = (value: number) => {
    if (maxValue === minValue) {
      return metric === 'negative' ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)';
    }
    const ratio = (value - minValue) / (maxValue - minValue);
    if (metric === 'negative') {
      const r = Math.round(120 + ratio * 120);
      const g = Math.round(200 - ratio * 150);
      const b = Math.round(200 - ratio * 150);
      return `rgb(${r}, ${g}, ${b})`;
    }
    if (metric === 'speed') {
      const r = Math.round(200 + ratio * 40);
      const g = Math.round(150 - ratio * 80);
      const b = Math.round(100 - ratio * 60);
      return `rgb(${r}, ${g}, ${b})`;
    }
    if (metric === 'warning') {
      const r = Math.round(240 - ratio * 40);
      const g = Math.round(180 - ratio * 120);
      const b = Math.round(80 + ratio * 30);
      return `rgb(${r}, ${g}, ${b})`;
    }
    const r = Math.round(30 + ratio * 200);
    const g = Math.round(80 - ratio * 40);
    const b = Math.round(150 - ratio * 100);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getProvinceData = (name: string) => data.find(d => d.name === name);
  const getRegionName = (s: string) => s.replace(/(省|市|自治区|特别行政区)$/g, '');
  const hoveredData = hoveredProvince
    ? data.find(d => {
        const dn = getRegionName(d.name);
        const hn = getRegionName(hoveredProvince);
        return dn === hn || dn.includes(hn) || hn.includes(dn);
      })
    : null;

  if (!showNationalMap && data.length <= 1) {
    return null;
  }

  if (!showNationalMap) {
    const sorted = [...data].sort((a, b) => getMetricValue(b, metric) - getMetricValue(a, metric));
    const totalMetric = data.reduce((sum, d) => sum + getMetricValue(d, metric), 0);
    return (
      <div className="relative w-full h-full flex flex-col">
        <div className="text-xs text-slate-500 mb-3">
          {scopeName} · 共 {data.length} 个区域，{metricLabelMap[metric]}合计 {totalMetric.toLocaleString()}{metricUnitMap[metric]}
        </div>
        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
          {sorted.map((item, idx) => {
            const val = getMetricValue(item, metric);
            const pct = sorted.length > 0 ? (val / Math.max(1, getMetricValue(sorted[0], metric))) * 100 : 0;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => onProvinceClick?.(item)}
                className="group p-3 rounded-lg bg-slate-800/50 border border-slate-700/30 hover:border-blue-500/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded bg-slate-700/50 text-xs text-slate-300 flex items-center justify-center font-medium">
                      {idx + 1}
                    </span>
                    <span className="text-white text-sm font-medium">{item.name}</span>
                  </div>
                  <span className="text-right">
                    <span className="text-lg font-bold tabular-nums" style={{ color: getColor(val) }}>
                      {metric === 'negative' || metric === 'speed' ? val.toFixed(1) : val.toLocaleString()}
                    </span>
                    <span className="text-xs text-slate-500 ml-1">{metricUnitMap[metric]}</span>
                  </span>
                </div>
                <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${Math.max(5, pct)}%`, backgroundColor: getColor(val) }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                  <span>舆情 {item.value.toLocaleString()}</span>
                  <span>负面 {Math.round(item.negativeRatio || 0)}%</span>
                  <span>预警 {item.warningCount || 0}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  const visibleProvinceNames = new Set(data.map(d => {
    const dn = getRegionName(d.name);
    for (const k of Object.keys(provincePositions)) {
      if (getRegionName(k) === dn || getRegionName(k).includes(dn) || dn.includes(getRegionName(k))) {
        return k;
      }
    }
    return d.name;
  }));

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 180 200" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {Object.entries(provincePositions).map(([name, pos]) => {
          const provinceData = getProvinceData(name);
          const hasData = visibleProvinceNames.has(name);
          const value = getMetricValue(provinceData || { name, value: 0, positive: 0, neutral: 0, negative: 0 }, metric);
          const color = provinceData ? getColor(value) : 'rgba(100, 116, 139, 0.15)';
          const isHovered = hoveredProvince === name;

          return (
            <motion.g
              key={name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              onMouseEnter={() => setHoveredProvince(name)}
              onMouseLeave={() => setHoveredProvince(null)}
              onClick={() => provinceData && onProvinceClick?.(provinceData)}
              className={provinceData ? 'cursor-pointer' : 'cursor-default'}
            >
              <rect
                x={pos.x}
                y={pos.y}
                width={pos.w}
                height={pos.h}
                rx={pos.w > 15 ? 2 : 1}
                fill={color}
                stroke={isHovered ? '#60A5FA' : hasData ? 'rgba(96, 165, 250, 0.3)' : 'rgba(100, 116, 139, 0.2)'}
                strokeWidth={isHovered ? 0.8 : 0.3}
                filter={isHovered ? 'url(#glow)' : undefined}
                className="transition-all duration-200"
                opacity={isHovered ? 1 : (provinceData ? 0.85 : 0.4)}
              />
              {pos.w > 20 && pos.h > 15 && (
                <text
                  x={pos.x + pos.w / 2}
                  y={pos.y + pos.h / 2 + 2}
                  textAnchor="middle"
                  fontSize={pos.w > 30 ? 4 : 3}
                  fill={provinceData ? 'rgba(255,255,255,0.9)' : 'rgba(100,116,139,0.5)'}
                  className="pointer-events-none select-none"
                >
                  {name.length > 3 ? name.slice(0, 2) : name}
                </text>
              )}
            </motion.g>
          );
        })}
      </svg>

      {/* 悬浮提示 */}
      {hoveredData && hoveredProvince && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-4 right-4 bg-slate-800/95 backdrop-blur-sm border border-slate-600/50 rounded-xl p-4 min-w-[180px] shadow-2xl z-10"
        >
          <h4 className="text-white font-semibold text-base mb-3">{hoveredProvince}</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400 text-sm">{metricLabelMap[metric]}</span>
              <span className="text-white text-sm font-bold tabular-nums">
                {metric === 'negative' || metric === 'speed'
                  ? getMetricValue(hoveredData, metric).toFixed(1)
                  : getMetricValue(hoveredData, metric).toLocaleString()}
                <span className="text-slate-500 ml-1 font-normal">{metricUnitMap[metric]}</span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">舆情总量</span>
              <span className="text-white text-sm font-medium">
                {hoveredData.value.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">负面</span>
              <span className="text-red-400 text-sm">
                {hoveredData.negative.toLocaleString()} ({Math.round(hoveredData.negativeRatio || 0)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">中性</span>
              <span className="text-blue-400 text-sm">
                {hoveredData.neutral.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">正面</span>
              <span className="text-green-400 text-sm">
                {hoveredData.positive.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between pt-1 border-t border-slate-700/50">
              <span className="text-slate-400 text-sm">传播速度</span>
              <span className="text-orange-400 text-sm">{hoveredData.spreadSpeed || 0} 级</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">预警数量</span>
              <span className="text-yellow-400 text-sm">{hoveredData.warningCount || 0} 条</span>
            </div>
          </div>
          {onProvinceClick && (
            <div className="mt-3 pt-3 border-t border-slate-700/50 text-xs text-blue-400 text-center">
              点击进入{hoveredProvince}视角 →
            </div>
          )}
        </motion.div>
      )}

      {/* 图例 */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <span className="text-slate-400 text-xs">低</span>
        <div
          className="w-24 h-2 rounded-full"
          style={{
            background: metric === 'negative'
              ? 'linear-gradient(to right, rgb(120, 200, 200), rgb(239, 68, 68))'
              : metric === 'speed'
                ? 'linear-gradient(to right, rgb(200, 150, 100), rgb(240, 70, 40))'
                : metric === 'warning'
                  ? 'linear-gradient(to right, rgb(240, 180, 80), rgb(200, 60, 110))'
                  : 'linear-gradient(to right, rgb(30, 80, 150), rgb(230, 40, 50))',
          }}
        />
        <span className="text-slate-400 text-xs">高</span>
        <span className="text-slate-500 text-xs ml-2">{metricLabelMap[metric]}</span>
      </div>
    </div>
  );
}
