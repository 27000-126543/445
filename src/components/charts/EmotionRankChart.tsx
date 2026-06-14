
import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { ProvinceHeatData, DashboardMetric } from '@/types';

interface EmotionRankChartProps {
  data: ProvinceHeatData[];
  metric?: DashboardMetric;
}

const metricLabelMap: Record<DashboardMetric, string> = {
  total: '舆情总量',
  negative: '负面占比',
  speed: '传播速度',
  warning: '预警数量',
};

const getMetricValue = (d: ProvinceHeatData, metric: DashboardMetric): number => {
  switch (metric) {
    case 'total': return d.value || 0;
    case 'negative': return d.negativeRatio || 0;
    case 'speed': return d.spreadSpeed || 0;
    case 'warning': return d.warningCount || 0;
  }
};

export default function EmotionRankChart({ data, metric = 'total' }: EmotionRankChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current, 'dark');
    }

    const sortedData = [...data]
      .sort((a, b) => getMetricValue(b, metric) - getMetricValue(a, metric))
      .slice(0, 10);

    const isSingleMetric = metric !== 'total';

    let option: echarts.EChartsOption;

    if (isSingleMetric) {
      const colorMap: Record<DashboardMetric, string> = {
        total: '#60A5FA',
        negative: '#ef4444',
        speed: '#f97316',
        warning: '#eab308',
      };
      option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: 'rgba(71, 85, 105, 0.5)',
          textStyle: { color: '#e2e8f0' },
          formatter: (params: any) => {
            const p = Array.isArray(params) ? params[0] : params;
            const item = sortedData[sortedData.length - 1 - p.dataIndex];
            if (!item) return '';
            return `${item.name}<br/>${metricLabelMap[metric]}: <b>${p.value}${metric === 'negative' ? '%' : metric === 'speed' ? '级' : '条'}</b><br/>舆情: ${item.value.toLocaleString()}<br/>负面: ${Math.round(item.negativeRatio || 0)}%<br/>预警: ${item.warningCount || 0}条`;
          },
        },
        grid: {
          left: '3%', right: '8%', bottom: '3%', top: '8%', containLabel: true,
        },
        xAxis: {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#64748b', fontSize: 10 },
          splitLine: { lineStyle: { color: 'rgba(71, 85, 105, 0.2)', type: 'dashed' } },
        },
        yAxis: {
          type: 'category',
          data: sortedData.map(d => d.name).reverse(),
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#94a3b8', fontSize: 11 },
        },
        series: [{
          name: metricLabelMap[metric],
          type: 'bar',
          barWidth: 14,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: colorMap[metric] + '66' },
              { offset: 1, color: colorMap[metric] },
            ]),
            borderRadius: [0, 4, 4, 0],
          },
          label: {
            show: true,
            position: 'right',
            color: '#cbd5e1',
            fontSize: 10,
            formatter: (p: any) => {
              if (metric === 'negative' || metric === 'speed') {
                return p.value.toFixed(1) + (metric === 'negative' ? '%' : '级');
              }
              return p.value.toLocaleString();
            },
          },
          data: sortedData.map(d => getMetricValue(d, metric)).reverse(),
        }],
      };
    } else {
      option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'shadow' },
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: 'rgba(71, 85, 105, 0.5)',
          textStyle: { color: '#e2e8f0' },
        },
        legend: {
          data: ['正面', '中性', '负面'],
          textStyle: { color: '#94a3b8', fontSize: 11 },
          itemWidth: 10, itemHeight: 10, top: 0, right: 0,
        },
        grid: {
          left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true,
        },
        xAxis: {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#64748b', fontSize: 10 },
          splitLine: { lineStyle: { color: 'rgba(71, 85, 105, 0.2)', type: 'dashed' } },
        },
        yAxis: {
          type: 'category',
          data: sortedData.map(d => d.name).reverse(),
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#94a3b8', fontSize: 11 },
        },
        series: [
          { name: '正面', type: 'bar', stack: 'total', barWidth: 12, itemStyle: { color: '#22c55e', borderRadius: [0, 0, 0, 0] }, data: sortedData.map(d => d.positive).reverse() },
          { name: '中性', type: 'bar', stack: 'total', itemStyle: { color: '#3b82f6' }, data: sortedData.map(d => d.neutral).reverse() },
          { name: '负面', type: 'bar', stack: 'total', itemStyle: { color: '#ef4444', borderRadius: [0, 3, 3, 0] }, data: sortedData.map(d => d.negative).reverse() },
        ],
      };
    }

    chartInstance.current.setOption(option, true);

    const handleResize = () => { chartInstance.current?.resize(); };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, metric]);

  useEffect(() => {
    return () => {
      chartInstance.current?.dispose();
      chartInstance.current = null;
    };
  }, []);

  return <div ref={chartRef} className="w-full h-full" />;
}
