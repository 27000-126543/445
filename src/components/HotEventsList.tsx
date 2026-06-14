
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Flame } from 'lucide-react';
import type { EventItem } from '@/types';
import { cn } from '@/lib/utils';

interface HotEventsListProps {
  events: EventItem[];
  onEventClick?: (event: EventItem) => void;
}

const trendIconMap = {
  rising: TrendingUp,
  stable: Minus,
  falling: TrendingDown,
};

const trendColorMap = {
  rising: 'text-red-400',
  stable: 'text-slate-400',
  falling: 'text-green-400',
};

const levelColorMap: Record<number, string> = {
  1: 'bg-red-500',
  2: 'bg-orange-500',
  3: 'bg-yellow-500',
  4: 'bg-blue-500',
};

export default function HotEventsList({ events, onEventClick }: HotEventsListProps) {
  const formatHeatIndex = (value: number) => {
    if (value >= 10000) {
      return (value / 10000).toFixed(1) + '万';
    }
    return value.toLocaleString();
  };

  return (
    <div className="space-y-2">
      {events.slice(0, 8).map((event, index) => {
        const TrendIcon = trendIconMap[event.heatTrend];
        
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            onClick={() => onEventClick?.(event)}
            className="flex items-center gap-3 p-3 rounded-lg border border-slate-700/50 bg-slate-800/30 hover:bg-slate-700/40 hover:border-slate-600/50 cursor-pointer transition-all group"
          >
            <div className={cn(
              'w-6 h-6 rounded flex items-center justify-center text-xs font-bold flex-shrink-0',
              index < 3 ? 'bg-gradient-to-br from-red-500 to-orange-500 text-white' : 'bg-slate-700 text-slate-400'
            )}>
              {index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn('w-1.5 h-1.5 rounded-full', levelColorMap[event.level])} />
                <h4 className="text-sm text-slate-200 font-medium truncate group-hover:text-white transition-colors">
                  {event.title}
                </h4>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-slate-500">{event.category}</span>
                <span className="text-xs text-slate-500">
                  {event.opinionCount.toLocaleString()}条
                </span>
                <div className={cn('flex items-center gap-0.5 text-xs', trendColorMap[event.heatTrend])}>
                  <TrendIcon className="w-3 h-3" />
                </div>
              </div>
            </div>
            
            <div className="text-right flex-shrink-0">
              <div className="flex items-center gap-1">
                <Flame className={cn('w-4 h-4', event.heatIndex > 5000 ? 'text-red-400' : 'text-orange-400')} />
                <span className={cn(
                  'text-sm font-bold tabular-nums',
                  event.heatIndex > 5000 ? 'text-red-400' : 'text-orange-400'
                )}>
                  {formatHeatIndex(event.heatIndex)}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">热度指数</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
