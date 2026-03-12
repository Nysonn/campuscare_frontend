import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Calendar, Plus, Clock, CheckCircle, XCircle, Video, MapPin } from 'lucide-react';
import { bookingsApi } from '../../api/bookings';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

const statusIcon = {
  pending: <Clock size={14} className="text-yellow-500" />,
  accepted: <CheckCircle size={14} className="text-green-500" />,
  declined: <XCircle size={14} className="text-red-500" />,
};

export default function MyBookingsPage() {
  const { data: bookings, isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: bookingsApi.myBookings,
  });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">My Bookings</h1>
          <p className="text-gray-500">Your counselling session bookings.</p>
        </div>
        <Link to="/student/bookings/new">
          <Button><Plus size={16} /> Book Session</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : (bookings ?? []).length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="font-display text-lg text-gray-600 mb-2">No sessions booked</h3>
          <p className="text-sm text-gray-400 mb-5">Book a confidential counselling session with one of our professional counsellors.</p>
          <Link to="/student/bookings/new">
            <Button><Plus size={16} /> Book a Counsellor</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {(bookings ?? []).map(b => (
            <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-12 w-12 rounded-2xl bg-primary-100 flex items-center justify-center shrink-0">
                    {b.type === 'online' ? <Video size={20} className="text-primary-600" /> : <MapPin size={20} className="text-primary-600" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-semibold text-gray-900 truncate">{b.counselor_name}</p>
                      {statusIcon[b.status]}
                    </div>
                    <p className="text-sm text-gray-500">
                      {new Date(b.start_time).toLocaleDateString('en-UG', { dateStyle: 'long' })} ·{' '}
                      {new Date(b.start_time).toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' })} –{' '}
                      {new Date(b.end_time).toLocaleTimeString('en-UG', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-xs text-gray-400 capitalize mt-0.5">
                      {b.type} session{b.location ? ` · ${b.location}` : ''}
                    </p>
                  </div>
                </div>
                <Badge variant={b.status === 'accepted' ? 'green' : b.status === 'declined' ? 'red' : 'yellow'}>
                  {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                </Badge>
              </div>

              {b.status === 'accepted' && b.type === 'online' && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-primary-600">
                  <Video size={13} />
                  <span>Your counsellor will send a Google Meet link to your registered email.</span>
                </div>
              )}
              {b.status === 'accepted' && b.type === 'physical' && b.location && (
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-primary-600">
                  <MapPin size={13} />
                  <span>Location: {b.location}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
