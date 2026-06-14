
import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  change: number;
  changeLabel?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  delay?: number;
}

const colorMap = {
  blue: 'from-blue-500 to-cyan-400',
  green: 'from-green-500 to-emerald-400',
  red: 'from-red-500 to-orange-400',
  yellow: 'from-yellow-500 to-amber-400',
  purple: 'from-purple-500 to-pink-400',
};

export default function StatCard({
  title,
  value,
  unit,
  change,
  changeLabel = '较昨日',
  icon,
  color,
  delay = 0,
}: StatCardProps) {
  const isPositive = change >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-xl border border-slate-700/50" />
      <div className="relative p-5 rounded-xl backdrop-blur-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-sm mb-1">{title}</p>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white tabular-nums">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </span>
              {unit && <span className="text-slate-400 text-sm">{unit}</span>}
            </div>
          </div>
          <div
            className={cn(
              'w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center text-white',
              colorMap[color]
            )}
          >
            {icon}
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium',
              isPositive ? 'text-red-400' : 'text-green-400'
            )}
          >
            {isPositive ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{Math.abs(change)}%</span>
          </div>
          <span className="text-slate-500 text-sm">{changeLabel}</span>
        </div>

        {/* 底部装饰线 */}
        <div
          className={cn(
            'absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition-opacity',
            colorMap[color]
          )}
        />
      </div>
    </motion.div>
  );
}
