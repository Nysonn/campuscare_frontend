import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, Check, X, Video, MapPin } from 'lucide-react';
import { bookingsApi } from '../../api/bookings';
import type { CounselorBooking } from '../../types';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

type StatusFilter = '' | 'pending' | 'accepted' | 'declined';

export default function CounselorDashboard() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>('');
  const [selectedBooking, setSelectedBooking] = useState<CounselorBooking | null>(null);
  const [actionType, setActionType] = useState<'accepted' | 'declined' | null>(null);

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['counselorAppointments', filter],
    queryFn: () => bookingsApi.counselorAppointments(filter || undefined),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'accepted' | 'declined' }) =>
      bookingsApi.updateStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['counselorAppointments'] });
      setSelectedBooking(null);
      setActionType(null);
    },
  });

  const pending = (appointments ?? []).filter(a => a.status === 'pending').length;
  const accepted = (appointments ?? []).filter(a => a.status === 'accepted').length;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">My Appointments</h1>
        <p className="text-gray-500">Manage your counselling session requests.</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending Requests', value: pending, color: 'text-yellow-600', bg: 'bg-yellow-50' },
          { label: 'Confirmed Sessions', value: accepted, color: 'text-primary-700', bg: 'bg-primary-50' },
          { label: 'Total Appointments', value: appointments?.length ?? 0, color: 'text-gray-700', bg: 'bg-gray-100' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} rounded-2xl p-5`}>
            <p className={`font-display text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {([
          { value: '', label: 'All' },
          { value: 'pending', label: 'Pending' },
          { value: 'accepted', label: 'Accepted' },
          { value: 'declined', label: 'Declined' },
        ] as { value: StatusFilter; label: string }[]).map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer ${
              filter === f.value
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-primary-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
      ) : (appointments ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="font-display text-lg text-gray-600 mb-1">No appointments</h3>
          <p className="text-sm text-gray-400">
            {filter ? `No ${filter} appointments found.` : 'You have no appointments yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {(appointments ?? []).map(a => (
            <div key={a.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-12 w-12 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
                    {a.type === 'online' ? <Video size={20} className="text-primary-600" /> : <MapPin size={20} className="text-primary-600" />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{a.student_name || 'Student'}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(a.start_time).toLocaleDateString('en-UG', { dateStyle: 'long' })} ·{' '}
                      {new Date(a.start_time).toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' })} –{' '}
                      {new Date(a.end_time).toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <span className="text-xs text-gray-400 capitalize">{a.type} session</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={a.status === 'accepted' ? 'green' : a.status === 'declined' ? 'red' : 'yellow'}>
                    {a.status}
                  </Badge>
                  {a.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => { setSelectedBooking(a); setActionType('accepted'); }}
                      >
                        <Check size={14} /> Accept
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => { setSelectedBooking(a); setActionType('declined'); }}
                      >
                        <X size={14} /> Decline
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {a.type === 'online' && a.status === 'accepted' && (
                <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-primary-600">
                  Book a Google Meet and invite the student at their registered email. They have been notified via email.
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Confirm action modal */}
      <Modal
        open={!!selectedBooking && !!actionType}
        onClose={() => { setSelectedBooking(null); setActionType(null); }}
        title={actionType === 'accepted' ? 'Confirm Acceptance' : 'Decline Booking'}
      >
        <div className="text-center space-y-5">
          <div className={`h-14 w-14 rounded-full flex items-center justify-center mx-auto ${actionType === 'accepted' ? 'bg-primary-100' : 'bg-red-100'}`}>
            {actionType === 'accepted' ? <Check size={24} className="text-primary-600" /> : <X size={24} className="text-red-500" />}
          </div>
          <div>
            <p className="font-semibold text-gray-900 mb-1">
              {actionType === 'accepted' ? 'Accept this booking?' : 'Decline this booking?'}
            </p>
            <p className="text-sm text-gray-500">
              {actionType === 'accepted'
                ? 'The student will be notified via email. For online sessions, please book a Google Meet and invite the student.'
                : 'The student will be notified that their booking has been declined.'
              }
            </p>
          </div>
          {mutation.isError && <p className="text-sm text-red-500">{mutation.error?.message}</p>}
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => { setSelectedBooking(null); setActionType(null); }}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'accepted' ? 'primary' : 'danger'}
              className="flex-1"
              loading={mutation.isPending}
              onClick={() => selectedBooking && actionType && mutation.mutate({ id: selectedBooking.id, status: actionType })}
            >
              {actionType === 'accepted' ? 'Yes, Accept' : 'Yes, Decline'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
