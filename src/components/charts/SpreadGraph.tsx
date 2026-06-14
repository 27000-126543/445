
import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import type { KeyNode } from '@/types';

interface SpreadGraphProps {
  nodes: KeyNode[];
}

export default function SpreadGraph({ nodes }: SpreadGraphProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    chartInstance.current = echarts.init(chartRef.current, 'dark');

    const graphData = nodes.slice(0, 15).map((node, index) => ({
      id: node.id,
      name: node.name,
      symbolSize: Math.max(30, node.influenceIndex / 2),
      category: node.isOpinionLeader ? 0 : index < 5 ? 1 : 2,
      value: node.influenceIndex,
      itemStyle: {
        color: node.isOpinionLeader
          ? '#ef4444'
          : node.source === '微博'
          ? '#e11d48'
          : node.source === '微信公众号'
          ? '#22c55e'
          : node.source === '抖音'
          ? '#000000'
          : '#3b82f6',
      },
      label: {
        show: node.isOpinionLeader || index < 5,
        fontSize: 11,
      },
    }));

    const links: Array<{ source: string; target: string; value: number }> = [];
    for (let i = 1; i < graphData.length; i++) {
      const targetIndex = Math.floor(Math.random() * Math.min(i, 5));
      links.push({
        source: graphData[targetIndex].id,
        target: graphData[i].id,
        value: Math.random() * 50 + 10,
      });
    }

    const option: echarts.EChartsOption = {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        borderColor: 'rgba(71, 85, 105, 0.5)',
        textStyle: {
          color: '#e2e8f0',
        },
        formatter: (params: any) => {
          if (params.dataType === 'node') {
            const node = nodes.find(n => n.id === params.data.id);
            if (node) {
              return `
                <strong>${node.name}</strong><br/>
                来源: ${node.source}<br/>
                粉丝数: ${node.followers.toLocaleString()}<br/>
                影响力指数: ${node.influenceIndex.toFixed(1)}<br/>
                转发数: ${node.repostCount.toLocaleString()}
              `;
            }
          }
          return params.name;
        },
      },
      legend: [{
        data: ['意见领袖', '核心传播者', '一般节点'],
        textStyle: {
          color: '#94a3b8',
          fontSize: 11,
        },
        bottom: 0,
      }],
      animationDuration: 1500,
      animationEasingUpdate: 'quinticInOut',
      series: [{
        type: 'graph',
        layout: 'force',
        data: graphData,
        links: links,
        categories: [
          { name: '意见领袖', itemStyle: { color: '#ef4444' } },
          { name: '核心传播者', itemStyle: { color: '#f59e0b' } },
          { name: '一般节点', itemStyle: { color: '#3b82f6' } },
        ],
        roam: true,
        draggable: true,
        label: {
          position: 'right',
          color: '#cbd5e1',
        },
        lineStyle: {
          color: 'rgba(148, 163, 184, 0.3)',
          curveness: 0.2,
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 2,
            color: 'rgba(148, 163, 184, 0.6)',
          },
        },
        force: {
          repulsion: 300,
          gravity: 0.1,
          edgeLength: [80, 200],
        },
      }],
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
  }, [nodes]);

  return <div ref={chartRef} className="w-full h-full" />;
}
