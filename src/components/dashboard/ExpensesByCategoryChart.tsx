import { useState, useMemo } from 'react';
import { formatCurrency } from '@/utils/formatters';
import type { ExpenseByCategory } from '@/types/Dashboard';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];

const capitalize = (s?: string) => {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
};

function pieSegmentPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const x1 = cx + r * Math.cos(startAngle);
  const y1 = cy + r * Math.sin(startAngle);
  const x2 = cx + r * Math.cos(endAngle);
  const y2 = cy + r * Math.sin(endAngle);
  const large = endAngle - startAngle > Math.PI ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

export default function ExpensesByCategoryChart({ data }: { data: ExpenseByCategory[] }) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const { segments } = useMemo(() => {
    const sum = data.reduce((acc, d) => acc + d.total, 0);
    let angle = -Math.PI / 2; // start from top
    const segs = data.map((d, i) => {
      const sliceAngle = sum > 0 ? (d.total / sum) * 2 * Math.PI : 0;
      const start = angle;
      angle += sliceAngle;
      return {
        category: d.category,
        total: d.total,
        startAngle: start,
        endAngle: angle,
        color: COLORS[i % COLORS.length],
      };
    });
    return { segments: segs };
  }, [data]);

  const cx = 100;
  const cy = 95;
  const r = 75;

  const handleMouseMove = (e: React.MouseEvent<SVGElement>, index: number) => {
    setHoverIndex(index);
    const rect = e.currentTarget.closest('.chart-container')?.getBoundingClientRect();
    if (rect) setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300 overflow-hidden">
      <h2 className="text-gray-700 dark:text-gray-200 font-bold text-lg mb-6 flex items-center gap-2">
        <span className="p-2 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm">📊</span>
        Gastos por Categoria
      </h2>

      <div className="chart-container w-full relative flex flex-col min-h-0">
        <div className="flex-1 min-h-[200px] max-h-[240px] flex items-center justify-center">
          <svg viewBox="0 0 200 180" className="w-full h-full max-h-[220px]" preserveAspectRatio="xMidYMid meet" aria-label="Gráfico de gastos por categoria">
          {segments.map((seg, i) => (
            <path
              key={`segment-${i}`}
              d={pieSegmentPath(cx, cy, r, seg.startAngle, seg.endAngle)}
              fill={seg.color}
              className="hover:opacity-80 transition-opacity outline-none cursor-pointer"
              onMouseEnter={(e) => handleMouseMove(e, i)}
              onMouseMove={(e) => handleMouseMove(e, i)}
              onMouseLeave={() => setHoverIndex(null)}
              aria-hidden
            />
          ))}
          {hoverIndex !== null && segments[hoverIndex] && (
            <g>
              <title>
                {capitalize(segments[hoverIndex].category)}: {formatCurrency(segments[hoverIndex].total)}
              </title>
            </g>
          )}
          </svg>
        </div>
        {hoverIndex !== null && segments[hoverIndex] && (
          <div
            className="pointer-events-none absolute z-10 px-3 py-2 text-sm font-medium text-gray-900 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg shadow-md border border-gray-200 dark:border-gray-600"
            style={{
              left: tooltipPos.x + 12,
              top: tooltipPos.y + 8,
            }}
          >
            {capitalize(segments[hoverIndex].category)}: {formatCurrency(segments[hoverIndex].total)}
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2 flex-shrink-0" role="list" aria-label="Legenda">
          {segments.map((seg) => (
            <span key={seg.category} className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300" role="listitem">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: seg.color }}
                aria-hidden
              />
              {capitalize(seg.category)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
