import { useState, useMemo } from 'react';
import { formatCurrency } from '@/utils/formatters';
import type { BudgetByOrigin } from '@/types/Dashboard';

const BAR_COLORS = { budget: '#3B82F6', spent: '#EF4444' };
const MARGIN = { top: 24, right: 16, bottom: 40, left: 44 };
const CHART_WIDTH = 400;
const CHART_HEIGHT = 220;
const INNER_WIDTH = CHART_WIDTH - MARGIN.left - MARGIN.right;
const INNER_HEIGHT = CHART_HEIGHT - MARGIN.top - MARGIN.bottom;
const BAR_GROUP_GAP = 8;
const BAR_WIDTH = 24;

function formatTick(val: number) {
  if (val >= 1_000_000) return `R$${val / 1_000_000}M`;
  if (val >= 1000) return `R$${val / 1000}k`;
  return `R$${val}`;
}

export default function BudgetByOriginChart({ data }: { data: BudgetByOrigin[] }) {
  const [hoverBar, setHoverBar] = useState<{ index: number; key: 'totalBudget' | 'spent' } | null>(null);

  const { maxVal, yTicks } = useMemo(() => {
    const max = data.length
      ? Math.max(...data.flatMap((d) => [d.totalBudget, d.spent]), 1)
      : 1;
    const step = max <= 4 ? 1 : Math.ceil(max / 4);
    const ticks = [0];
    for (let v = step; v <= max; v += step) ticks.push(v);
    return { maxVal: max, yTicks: ticks };
  }, [data]);

  const groupWidth = INNER_WIDTH / data.length;
  const yScale = (val: number) => INNER_HEIGHT - (val / maxVal) * INNER_HEIGHT;

  const handleMouseEnter = (index: number, key: 'totalBudget' | 'spent') => {
    setHoverBar({ index, key });
  };

  const handleMouseLeave = () => {
    setHoverBar(null);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-300">
      <h2 className="text-gray-700 dark:text-gray-200 font-bold text-lg mb-6 flex items-center gap-2">
        <span className="p-2 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-lg text-sm">💳</span>
        Orçamento vs. Realizado
      </h2>

      <div className="chart-container w-full relative" style={{ height: CHART_HEIGHT }}>
        <svg viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet" aria-label="Gráfico orçamento por origem">
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {/* Y axis ticks */}
            {yTicks.map((tick) => (
              <g key={tick}>
                <line
                  x1={0}
                  y1={yScale(tick)}
                  x2={INNER_WIDTH}
                  y2={yScale(tick)}
                  stroke="#E5E7EB"
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
                <text
                  x={-6}
                  y={yScale(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="text-[10px] fill-gray-500 dark:fill-gray-400"
                >
                  {formatTick(tick)}
                </text>
              </g>
            ))}
            {/* Bars */}
            {data.map((d, i) => {
              const gx = i * groupWidth + (groupWidth - BAR_GROUP_GAP - BAR_WIDTH * 2) / 2;
              const budgetH = (d.totalBudget / maxVal) * INNER_HEIGHT;
              const spentH = (d.spent / maxVal) * INNER_HEIGHT;
              const isBudgetHover = hoverBar?.index === i && hoverBar?.key === 'totalBudget';
              const isSpentHover = hoverBar?.index === i && hoverBar?.key === 'spent';
              return (
                <g key={d.origin} onMouseLeave={handleMouseLeave}>
                  <rect
                    x={gx}
                    y={yScale(d.totalBudget)}
                    width={BAR_WIDTH}
                    height={Math.max(budgetH, 2)}
                    rx={4}
                    fill={BAR_COLORS.budget}
                    className="cursor-pointer transition-opacity"
                    opacity={isBudgetHover ? 0.9 : 1}
                    onMouseEnter={() => handleMouseEnter(i, 'totalBudget')}
                  />
                  <rect
                    x={gx + BAR_WIDTH + BAR_GROUP_GAP}
                    y={yScale(d.spent)}
                    width={BAR_WIDTH}
                    height={Math.max(spentH, 2)}
                    rx={4}
                    fill={BAR_COLORS.spent}
                    className="cursor-pointer transition-opacity"
                    opacity={isSpentHover ? 0.9 : 1}
                    onMouseEnter={() => handleMouseEnter(i, 'spent')}
                  />
                  <text
                    x={gx + (BAR_GROUP_GAP + BAR_WIDTH * 2) / 2 + BAR_WIDTH / 2}
                    y={INNER_HEIGHT + 14}
                    textAnchor="middle"
                    className="text-[10px] fill-gray-600 dark:fill-gray-400"
                  >
                    {d.origin}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
        {hoverBar !== null && data[hoverBar.index] && (
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 px-3 py-2 text-sm font-medium text-gray-900 bg-white dark:bg-gray-700 dark:text-gray-100 rounded-lg shadow-md border border-gray-200 dark:border-gray-600"
          >
            {`${data[hoverBar.index].origin} — ${hoverBar.key === 'totalBudget'
              ? `Orçado: ${formatCurrency(data[hoverBar.index].totalBudget)}`
              : `Gasto: ${formatCurrency(data[hoverBar.index].spent)}`}`}
          </div>
        )}
        <div className="flex justify-end gap-4 mt-1 text-xs text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B82F6]" aria-hidden /> Orçado
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" aria-hidden /> Gasto
          </span>
        </div>
      </div>
    </div>
  );
}
