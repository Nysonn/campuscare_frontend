import { useQuery } from '@tanstack/react-query';
import { Users, Heart, Calendar, TrendingUp } from 'lucide-react';
import { adminApi } from '../../api/admin';
import Spinner from '../../components/ui/Spinner';

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminApi.dashboard,
  });

  const stats = [
    { label: 'Total Users', value: data?.users ?? 0, icon: <Users size={22} className="text-blue-600" />, bg: 'bg-blue-50' },
    { label: 'Total Campaigns', value: data?.campaigns ?? 0, icon: <Heart size={22} className="text-primary-600" />, bg: 'bg-primary-50' },
    { label: 'Total Bookings', value: data?.bookings ?? 0, icon: <Calendar size={22} className="text-yellow-600" />, bg: 'bg-yellow-50' },
    {
      label: 'Total Funds Raised',
      value: `UGX ${(data?.total_raised ?? 0).toLocaleString()}`,
      icon: <TrendingUp size={22} className="text-green-600" />,
      bg: 'bg-green-50',
      wide: true,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
        <p className="text-gray-500">Platform overview and statistics.</p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map(s => (
            <div key={s.label} className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 ${s.wide ? 'lg:col-span-1' : ''}`}>
              <div className={`h-14 w-14 rounded-2xl ${s.bg} flex items-center justify-center shrink-0`}>
                {s.icon}
              </div>
              <div>
                <p className="font-display text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-sm text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-10 bg-primary-50 rounded-2xl p-6 border border-primary-100">
        <h3 className="font-display font-semibold text-primary-800 mb-2">Admin Quick Guide</h3>
        <ul className="text-sm text-primary-700 space-y-1">
          <li>· <strong>Users</strong> — View and suspend/reactivate student, counsellor, and admin accounts.</li>
          <li>· <strong>Campaigns</strong> — Review and approve or reject student fundraising campaigns.</li>
          <li>· <strong>Bookings</strong> — Monitor all counselling session bookings across the platform.</li>
          <li>· <strong>Contributions</strong> — View all donations and export a CSV report.</li>
        </ul>
      </div>
    </div>
  );
}
