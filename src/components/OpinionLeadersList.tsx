
import { motion } from 'framer-motion';
import { Star, Users, Repeat2, MessageSquare } from 'lucide-react';
import type { KeyNode } from '@/types';
import { cn } from '@/lib/utils';

interface OpinionLeadersListProps {
  leaders: KeyNode[];
}

const sourceColors: Record<string, string> = {
  '微博': 'bg-red-500',
  '微信公众号': 'bg-green-500',
  '抖音': 'bg-black border border-white/20',
  'B站': 'bg-pink-500',
  '知乎': 'bg-blue-600',
};

export default function OpinionLeadersList({ leaders }: OpinionLeadersListProps) {
  const formatNumber = (num: number) => {
    if (num >= 10000000) return (num / 10000000).toFixed(1) + '千万';
    if (num >= 10000) return (num / 10000).toFixed(1) + '万';
    return num.toLocaleString();
  };

  return (
    <div className="space-y-3">
      {leaders.slice(0, 10).map((leader, index) => (
        <motion.div
          key={leader.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/40 border border-slate-700/50 hover:bg-slate-700/40 hover:border-slate-600/50 transition-all cursor-pointer group"
        >
          {/* 排名 */}
          <div className={cn(
            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
            index < 3
              ? 'bg-gradient-to-br from-yellow-500 to-orange-500 text-white'
              : 'bg-slate-700 text-slate-400'
          )}>
            {index + 1}
          </div>

          {/* 头像和信息 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-white font-medium text-sm truncate group-hover:text-blue-400 transition-colors">
                {leader.name}
              </span>
              {leader.isOpinionLeader && (
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              )}
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded text-white',
                sourceColors[leader.source] || 'bg-slate-600'
              )}>
                {leader.source}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {formatNumber(leader.followers)}
              </span>
              <span className="flex items-center gap-1">
                <Repeat2 className="w-3 h-3" />
                {formatNumber(leader.repostCount)}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {formatNumber(leader.commentCount)}
              </span>
            </div>
          </div>

          {/* 影响力指数 */}
          <div className="text-right flex-shrink-0">
            <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              {leader.influenceIndex.toFixed(1)}
            </div>
            <div className="text-xs text-slate-500">影响力</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
