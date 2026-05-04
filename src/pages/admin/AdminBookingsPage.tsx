import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, FileDown } from 'lucide-react';
import { adminApi } from '../../api/admin';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import SEO from '../../components/seo/SEO';
import { exportToPdf } from '../../utils/exportToPdf';
import { exportToCsv } from '../../utils/exportToCsv';

export default function AdminBookingsPage() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['adminBookings'],
    queryFn: adminApi.bookings,
  });

  const [exporting, setExporting] = useState(false);
  const handleExportPdf = async () => {
    setExporting(true);
    await exportToPdf('bookings-pdf-content', 'Bookings Report');
    setExporting(false);
  };

  const handleExportCsv = () => {
    exportToCsv(
      bookings ?? [],
      [
        { key: 'student_name',  label: 'Student' },
        { key: 'counselor_name', label: 'Counsellor' },
        { key: 'start_time',    label: 'Start Time' },
        { key: 'end_time',      label: 'End Time' },
        { key: 'status',        label: 'Status' },
      ],
      'Bookings Report',
    );
  };

  return (
    <div>
      <SEO
        title="Manage Bookings"
        description="View all counselling session bookings across the CampusCare platform."
        noindex
      />
      <div className="mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">All Bookings</h1>
            <p className="text-gray-500">All counselling session bookings across the platform.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExportCsv}>
              <FileDown size={16} /> Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportPdf} loading={exporting}>
              <FileDown size={16} /> Export PDF
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
      ) : (bookings ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-sm text-gray-400">No bookings found.</p>
        </div>
      ) : (
        <div id="bookings-pdf-content" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-150">
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
