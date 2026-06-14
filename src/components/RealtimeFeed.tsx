
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Repeat2, Heart, AlertTriangle } from 'lucide-react';
import type { OpinionItem } from '@/types';
import { cn } from '@/lib/utils';

interface RealtimeFeedProps {
  data: OpinionItem[];
}

const sourceMap: Record<string, { label: string; color: string }> = {
  weibo: { label: '微博', color: 'bg-red-500' },
  wechat: { label: '微信', color: 'bg-green-500' },
  news: { label: '新闻', color: 'bg-blue-500' },
  forum: { label: '论坛', color: 'bg-purple-500' },
  video: { label: '短视频', color: 'bg-pink-500' },
};

const emotionMap: Record<string, { label: string; color: string; bg: string }> = {
  positive: { label: '正面', color: 'text-green-400', bg: 'bg-green-500/10' },
  neutral: { label: '中性', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  negative: { label: '负面', color: 'text-red-400', bg: 'bg-red-500/10' },
};

export default function RealtimeFeed({ data }: RealtimeFeedProps) {
  const [items, setItems] = useState<OpinionItem[]>(data);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(data);
  }, [data]);

  useEffect(() => {
    const interval = setInterval(() => {
      setItems((prev) => {
        const newItems = [...prev];
        if (newItems.length > 0) {
          const first = newItems.shift()!;
          newItems.push({ ...first, publishTime: new Date().toISOString() });
        }
        return newItems;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return `${diff}秒前`;
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    return `${Math.floor(diff / 86400)}天前`;
  };

  return (
    <div ref={scrollRef} className="h-full overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-slate-800/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-800/90 to-transparent z-10 pointer-events-none" />
      
      <div className="space-y-2 py-2 animate-scroll">
        <AnimatePresence>
          {items.slice(0, 8).map((item, index) => {
            const source = sourceMap[item.source];
            const emotion = emotionMap[item.emotion];
            
            return (
              <motion.div
                key={item.id + index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={cn(
                  'p-3 rounded-lg border transition-all cursor-pointer',
                  'hover:bg-slate-700/50 hover:border-slate-600/50',
                  item.emotion === 'negative' && item.sensitiveWords.length > 0
                    ? 'border-red-500/30 bg-red-500/5'
                    : 'border-slate-700/50 bg-slate-800/30'
                )}
              >
                <div className="flex items-start gap-2">
                  <div className={cn('w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0', emotion.color.replace('text-', 'bg-'))} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed">
                      {item.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn('text-xs px-1.5 py-0.5 rounded', source.color + ' text-white')}>
                        {source.label}
                      </span>
                      <span className={cn('text-xs px-1.5 py-0.5 rounded', emotion.bg, emotion.color)}>
                        {emotion.label}
                      </span>
                      {item.sensitiveWords.length > 0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          敏感
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                      <span>{formatTime(item.publishTime)}</span>
                      <span className="flex items-center gap-1">
                        <Repeat2 className="w-3 h-3" />
                        {item.repostCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {item.commentCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        {item.likeCount}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
