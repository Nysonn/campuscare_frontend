import { Users, Wallet } from 'lucide-react';

interface Props {
  currentAmount: number;
  directAmount: number;
  poolAmount: number;
}

export default function FundingBreakdown({ currentAmount, directAmount, poolAmount }: Props) {
  const total = currentAmount > 0 ? currentAmount : 0;
  const directPct = total > 0 ? Math.round((directAmount / total) * 100) : 0;
  const poolPct = total > 0 ? Math.round((poolAmount / total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
        Funding Sources
      </p>

      {/* Stacked bar */}
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 mb-3">
        {directPct > 0 && (
          <div
            className="bg-blue-500 transition-all duration-500"
            style={{ width: `${directPct}%` }}
          />
        )}
        {poolPct > 0 && (
          <div
            className="bg-orange-500 transition-all duration-500"
            style={{ width: `${poolPct}%` }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500 shrink-0" />
          <Users size={12} className="text-gray-400 shrink-0" />
          <span className="text-xs text-gray-600">
            Regular Donors
          </span>
          <span className="text-xs font-semibold text-blue-700 ml-1">
            {directPct}%
          </span>
          <span className="text-xs text-gray-400">
            (UGX {directAmount.toLocaleString()})
          </span>
        </div>
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shrink-0" />
          <Wallet size={12} className="text-gray-400 shrink-0" />
          <span className="text-xs text-gray-600">
            General Pool
          </span>
          <span className="text-xs font-semibold text-orange-700 ml-1">
            {poolPct}%
          </span>
          <span className="text-xs text-gray-400">
            (UGX {poolAmount.toLocaleString()})
          </span>
        </div>
      </div>
    </div>
  );
}
