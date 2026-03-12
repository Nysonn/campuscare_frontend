import { useQuery } from '@tanstack/react-query';
import { Download, TrendingUp } from 'lucide-react';
import { adminApi } from '../../api/admin';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

export default function AdminContributionsPage() {
  const { data: contributions, isLoading } = useQuery({
    queryKey: ['adminContributions'],
    queryFn: adminApi.contributions,
  });

  const handleExport = async () => {
    try {
      const blob = await adminApi.exportContributions();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `campuscare-contributions-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  const totalRaised = (contributions ?? [])
    .filter(c => c.status === 'success')
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Contributions</h1>
          <p className="text-gray-500">All donation contributions across the platform.</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download size={16} /> Export CSV
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Contributions', value: (contributions ?? []).length, icon: <TrendingUp size={20} className="text-primary-600" /> },
          { label: 'Successful', value: (contributions ?? []).filter(c => c.status === 'success').length, icon: <TrendingUp size={20} className="text-green-600" /> },
          { label: 'Total Raised (UGX)', value: `${totalRaised.toLocaleString()}`, icon: <TrendingUp size={20} className="text-blue-600" /> },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-3">
            <div className="h-11 w-11 bg-gray-50 rounded-xl flex items-center justify-center">{s.icon}</div>
            <div>
              <p className="font-display text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-150">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Donor', 'Email', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(contributions ?? []).map(c => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{c.donor_name}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">{c.donor_email}</td>
                    <td className="px-5 py-3.5 text-sm font-semibold text-primary-700">
                      UGX {c.amount.toLocaleString()}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={c.status === 'success' ? 'green' : 'red'}>{c.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {new Date(c.created_at).toLocaleDateString('en-UG', { dateStyle: 'medium' })}
                    </td>
                  </tr>
                ))}
                {(contributions ?? []).length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-sm text-gray-400">No contributions yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
