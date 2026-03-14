import { memo } from 'react';
import Coffee from 'lucide-react/dist/esm/icons/coffee';
import { formatTime } from '@/utils/formatters';

interface TimelineFreeTimeCardProps {
  startTime: string;
  endTime: string;
}

export const TimelineFreeTimeCard = memo(function TimelineFreeTimeCard({
  startTime,
  endTime,
}: TimelineFreeTimeCardProps) {
  return (
    <div className="relative">
      <div
        className="absolute left-0 top-6 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2 border-white shadow z-20 -translate-x-1/2 bg-slate-300 dark:bg-slate-500"
        aria-hidden
      />
      <div
        data-testid="timeline-free-time-card"
        className="relative ml-4 md:ml-6 rounded-2xl shadow-lg overflow-hidden border-l-4 border-l-slate-400 dark:border-l-slate-500 bg-slate-100 dark:bg-slate-700/80 min-h-[100px] md:min-h-[120px] flex items-center"
      >
        <div className="flex items-center gap-4 pl-4 pr-5 py-4 w-full">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-600 flex items-center justify-center">
            <Coffee className="w-6 h-6 text-slate-600 dark:text-slate-300" />
          </div>
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-200 text-base md:text-lg">
              Tempo livre
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5 flex items-center gap-2">
              <span>{formatTime(startTime)}</span>
              <span>–</span>
              <span>{formatTime(endTime)}</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
              Período até o horário ideal da próxima atração
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
