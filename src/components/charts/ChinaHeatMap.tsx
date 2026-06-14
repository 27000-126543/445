
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { ProvinceHeatData } from '@/types';

interface ChinaHeatMapProps {
  data: ProvinceHeatData[];
  onProvinceClick?: (province: ProvinceHeatData) => void;
}

// 简化版中国省份位置（相对坐标）
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

export default function ChinaHeatMap({ data, onProvinceClick }: ChinaHeatMapProps) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  const { maxValue, minValue } = useMemo(() => {
    const values = data.map(d => d.value);
    return {
      maxValue: Math.max(...values),
      minValue: Math.min(...values),
    };
  }, [data]);

  const getColor = (value: number) => {
    const ratio = (value - minValue) / (maxValue - minValue);
    const r = Math.round(30 + ratio * 200);
    const g = Math.round(80 - ratio * 40);
    const b = Math.round(150 - ratio * 100);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const getProvinceData = (name: string) => {
    return data.find(d => d.name === name);
  };

  const hoveredData = hoveredProvince ? getProvinceData(hoveredProvince) : null;

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
          const value = provinceData?.value || 0;
          const color = getColor(value);
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
              className="cursor-pointer"
            >
              <rect
                x={pos.x}
                y={pos.y}
                width={pos.w}
                height={pos.h}
                rx={pos.w > 15 ? 2 : 1}
                fill={color}
                stroke={isHovered ? '#60A5FA' : 'rgba(255,255,255,0.1)'}
                strokeWidth={isHovered ? 0.8 : 0.3}
                filter={isHovered ? 'url(#glow)' : undefined}
                className="transition-all duration-200"
                opacity={isHovered ? 1 : 0.85}
              />
              {pos.w > 20 && pos.h > 15 && (
                <text
                  x={pos.x + pos.w / 2}
                  y={pos.y + pos.h / 2 + 2}
                  textAnchor="middle"
                  fontSize={pos.w > 30 ? 4 : 3}
                  fill="rgba(255,255,255,0.9)"
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
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">舆情总量</span>
              <span className="text-white text-sm font-medium">
                {hoveredData.value.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">正面</span>
              <span className="text-green-400 text-sm">
                {hoveredData.positive.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">中性</span>
              <span className="text-blue-400 text-sm">
                {hoveredData.neutral.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-sm">负面</span>
              <span className="text-red-400 text-sm">
                {hoveredData.negative.toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>
      )}

      {/* 图例 */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2">
        <span className="text-slate-400 text-xs">低</span>
        <div className="w-24 h-2 rounded-full bg-gradient-to-r from-blue-600 via-purple-500 to-red-500" />
        <span className="text-slate-400 text-xs">高</span>
      </div>
    </div>
  );
}
