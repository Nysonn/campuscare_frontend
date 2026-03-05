import { useQuery } from '@tanstack/react-query';
import { Calendar } from 'lucide-react';
import { adminApi } from '../../api/admin';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

export default function AdminBookingsPage() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: adminApi.bookings,
  });

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">All Bookings</h1>
        <p className="text-gray-500">All counselling session bookings across the platform.</p>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
      ) : (bookings ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-sm text-gray-400">No bookings found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Student', 'Counsellor', 'Date', 'Time', 'Status'].map(h => (
                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(bookings ?? []).map(b => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{b.student_name || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{b.counselor_name || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {new Date(b.start_time).toLocaleDateString('en-UG', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-500">
                      {new Date(b.start_time).toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' })} –{' '}
                      {new Date(b.end_time).toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={b.status === 'accepted' ? 'green' : b.status === 'declined' ? 'red' : 'yellow'}>
                        {b.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
