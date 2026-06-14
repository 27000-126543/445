
import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { ProvinceHeatData } from '@/types';

interface EmotionRankChartProps {
  data: ProvinceHeatData[];
}

export default function EmotionRankChart({ data }: EmotionRankChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current, 'dark');

    const sortedData = [...data]
      .sort((a, b) => b.value - a.value)
      .slice(0, 10);

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(71, 85, 105, 0.5)',
        textStyle: {
          color: '#e2e8f0',
        },
      },
      legend: {
        data: ['正面', '中性', '负面'],
        textStyle: {
          color: '#94a3b8',
          fontSize: 11,
        },
        itemWidth: 10,
        itemHeight: 10,
        top: 0,
        right: 0,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#64748b',
          fontSize: 10,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(71, 85, 105, 0.2)',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: sortedData.map(d => d.name).reverse(),
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#94a3b8',
          fontSize: 11,
        },
      },
      series: [
        {
          name: '正面',
          type: 'bar',
          stack: 'total',
          barWidth: 12,
          itemStyle: {
            color: '#22c55e',
            borderRadius: [0, 0, 0, 0],
          },
          data: sortedData.map(d => d.positive).reverse(),
        },
        {
          name: '中性',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: '#3b82f6',
          },
          data: sortedData.map(d => d.neutral).reverse(),
        },
        {
          name: '负面',
          type: 'bar',
          stack: 'total',
          itemStyle: {
            color: '#ef4444',
            borderRadius: [0, 3, 3, 0],
          },
          data: sortedData.map(d => d.negative).reverse(),
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => {
      chartInstance.current?.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [data]);

  return <div ref={chartRef} className="w-full h-full" />;
}
