import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Wallet from 'lucide-react/dist/esm/icons/wallet';
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right';
import { useCountry } from '@/contexts/CountryContext'
import { formatCurrency } from '@/utils/formatters'

function toYYYYMMDD(dateStr: string): string {
  if (!dateStr) return '';

  if (dateStr.includes('/')) {
    const [d, m, y] = dateStr.split('/');

    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  return dateStr.split('T')[0];
}

export default function TodayExpensesCard() {
  const { expenses } = useCountry();

  const todaySummary = useMemo(() => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayExpenses = expenses.filter(e => toYYYYMMDD(e.date) === todayStr);
    const total = todayExpenses.reduce((sum, e) => sum + e.amountInBRL, 0);

    return { total, count: todayExpenses.length };
  }, [expenses]);

  return (
    <Link
      to="/expenses"
      className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-2xl shadow-md p-4 hover:shadow-lg transition-shadow focus:ring-2 focus:ring-blue-500 focus:outline-none"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
          <Wallet className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            Gastos de hoje
          </p>
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
            {formatCurrency(todaySummary.total, 'BRL')}
          </p>
          {todaySummary.count > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {todaySummary.count} {todaySummary.count === 1 ? 'registro' : 'registros'}
            </p>
          )}
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-gray-400" />
    </Link>
  );
}