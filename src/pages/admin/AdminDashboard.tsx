import { useQuery } from '@tanstack/react-query';
import { Users, Heart, Calendar, TrendingUp, Wallet, ArrowDownLeft, ArrowUpRight, TrendingDown, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import Spinner from '../../components/ui/Spinner';
import SEO from '../../components/seo/SEO';

function WalletSummary() {
  const { data, isLoading } = useQuery({
    queryKey: ['walletBalance'],
    queryFn: adminApi.walletBalance,
  });

  const cards = [
    { label: 'Total Donated',     value: data?.total_donated   ?? 0, icon: <ArrowDownLeft size={18} className="text-emerald-600" />,  bg: 'bg-emerald-50 dark:bg-emerald-900/20'  },
    { label: 'Disbursed',         value: data?.total_disbursed ?? 0, icon: <ArrowUpRight  size={18} className="text-blue-600" />,      bg: 'bg-blue-50 dark:bg-blue-900/20'        },
    { label: 'Withdrawn',         value: data?.total_withdrawn ?? 0, icon: <TrendingDown  size={18} className="text-amber-600" />,     bg: 'bg-amber-50 dark:bg-amber-900/20'      },
    { label: 'Available Balance', value: data?.balance         ?? 0, icon: <Wallet        size={18} className="text-primary-600" />,   bg: 'bg-primary-50 dark:bg-primary-900/20', highlight: true },
  ];

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white">General Pool Wallet</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Summary of the platform donation pool.</p>
        </div>
        <Link
          to="/admin/wallet"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
        >
          Manage Wallet <ExternalLink size={14} />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-6"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map(c => (
            <div
              key={c.label}
              className={`rounded-xl border p-4 ${
                c.highlight
                  ? 'border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/40'
              }`}
            >
              <div className={`h-9 w-9 rounded-lg ${c.bg} flex items-center justify-center mb-3`}>
                {c.icon}
              </div>
              <p className="font-display text-lg font-bold text-gray-900 dark:text-white">
                UGX {c.value.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminApi.dashboard,
  });

  const stats = [
    { label: 'Total Users',       value: data?.users    ?? 0,                         icon: <Users      size={22} className="text-blue-600" />,     bg: 'bg-blue-50 dark:bg-blue-900/20'     },
    { label: 'Total Campaigns',   value: data?.campaigns ?? 0,                        icon: <Heart      size={22} className="text-primary-600" />,   bg: 'bg-primary-50 dark:bg-primary-900/20' },
    { label: 'Total Bookings',    value: data?.bookings  ?? 0,                        icon: <Calendar   size={22} className="text-yellow-600" />,    bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Total Funds Raised',value: `UGX ${(data?.total_raised ?? 0).toLocaleString()}`, icon: <TrendingUp size={22} className="text-green-600" />, bg: 'bg-green-50 dark:bg-green-900/20', wide: true },
  ];

  return (
    <div>
      <SEO title="Admin Dashboard" description="Manage users, campaigns, bookings, and platform statistics on CampusCare." noindex />
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400">Platform overview and statistics.</p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-5">
          {stats.map(s => (
            <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 flex items-center gap-4 flex-1">
              <div className={`h-14 w-14 rounded-2xl ${s.bg} flex items-center justify-center shrink-0`}>
                {s.icon}
              </div>
              <div className="shrink-0">
                <p className="font-display text-2xl font-bold text-gray-900 dark:text-white whitespace-nowrap">{s.value}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <WalletSummary />
    </div>
  );
}
