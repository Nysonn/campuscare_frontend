import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { counselorsApi } from '../../api/counselors';
import { bookingsApi } from '../../api/bookings';
import type { Counselor } from '../../types';
import Button from '../../components/ui/Button';
import Textarea from '../../components/ui/Textarea';
import Avatar from '../../components/ui/Avatar';
import Spinner from '../../components/ui/Spinner';

export default function BookCounselorPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Counselor | null>(null);
  const [form, setForm] = useState({
    start_time: '', end_time: '', type: 'online' as 'online' | 'physical', notes: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { data: counselors, isLoading } = useQuery({
    queryKey: ['counselors'],
    queryFn: counselorsApi.list,
  });

  const mutation = useMutation({
    mutationFn: () => bookingsApi.create({
      counselor_id: selected!.id,
      start_time: new Date(form.start_time).toISOString(),
      end_time: new Date(form.end_time).toISOString(),
      notes: form.notes || undefined,
      type: form.type,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myBookings'] });
      setSuccess(true);
    },
    onError: (e: Error) => setError(e.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selected) { setError('Please select a counsellor.'); return; }
    if (!form.start_time || !form.end_time) { setError('Please set a start and end time.'); return; }
    if (new Date(form.end_time) <= new Date(form.start_time)) { setError('End time must be after start time.'); return; }
    mutation.mutate();
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center mb-5">
          <CheckCircle size={36} className="text-primary-600" />
        </div>
        <h2 className="font-display text-2xl font-bold text-gray-900 mb-2">Booking Submitted!</h2>
        <p className="text-gray-500 max-w-sm mb-6">
          Your session request has been sent to <strong>{selected?.full_name}</strong>. You'll receive an email once it's confirmed.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/student/bookings')}>View My Bookings</Button>
          <Button onClick={() => navigate('/student/dashboard')}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6 cursor-pointer">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Book a Counsellor</h1>
        <p className="text-gray-500">Select a counsellor and schedule a confidential session.</p>
      </div>

      <div className="space-y-6">
        {/* Counselor selection */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-display font-semibold text-gray-900 mb-4">Choose a Counsellor</h3>
          {isLoading ? (
            <div className="py-8 flex justify-center"><Spinner /></div>
          ) : (counselors ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No counsellors available at this time.</p>
          ) : (
            <div className="space-y-3">
              {(counselors ?? []).map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelected(c)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                    selected?.id === c.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={c.full_name} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{c.full_name}</p>
                      {c.specialization && <p className="text-xs text-primary-600 font-medium">{c.specialization}</p>}
                      {c.bio && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{c.bio}</p>}
                    </div>
                    {selected?.id === c.id && <CheckCircle size={18} className="text-primary-600 shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Session details */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h3 className="font-display font-semibold text-gray-900">Session Details</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Start Time *</label>
              <input
                type="datetime-local"
                value={form.start_time}
                onChange={e => setForm(f => ({ ...f, start_time: e.target.value }))}
                min={new Date().toISOString().slice(0, 16)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">End Time *</label>
              <input
                type="datetime-local"
                value={form.end_time}
                onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))}
                min={form.start_time || new Date().toISOString().slice(0, 16)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Session Type *</label>
            <div className="flex gap-3">
              {(['online', 'physical'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, type: t }))}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-sm font-medium capitalize transition-all cursor-pointer ${
                    form.type === t ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 text-gray-600 hover:border-primary-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            {form.type === 'online' && (
              <p className="text-xs text-gray-400">The counsellor will send a Google Meet link to your email after confirming.</p>
            )}
          </div>

          <Textarea
            label="Notes (optional)"
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            placeholder="Brief reason for the session or anything you'd like the counsellor to know beforehand."
            rows={3}
          />

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancel</Button>
            <Button type="submit" loading={mutation.isPending}>Confirm Booking</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
