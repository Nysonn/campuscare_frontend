import { useQuery } from '@tanstack/react-query';
import { UserCircle, Briefcase, FileText } from 'lucide-react';
import { counselorsApi } from '../../api/counselors';
import Modal from '../ui/Modal';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';

interface CounselorProfileModalProps {
  counselorId: string | null;
  onClose: () => void;
}

export default function CounselorProfileModal({ counselorId, onClose }: CounselorProfileModalProps) {
  const { data: counselor, isLoading, isError } = useQuery({
    queryKey: ['counselor', counselorId],
    queryFn: () => counselorsApi.getById(counselorId!),
    enabled: !!counselorId,
  });

  return (
    <Modal
      open={!!counselorId}
      onClose={onClose}
      title="Counsellor Profile"
      maxWidth="max-w-md"
    >
      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner />
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-500 text-center py-8">
          Could not load counsellor profile. Please try again.
        </p>
      )}

      {counselor && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col items-center text-center gap-3 pb-4 border-b border-gray-100">
            <Avatar src={counselor.avatar_url || undefined} name={counselor.full_name} size="xl" />
            <div>
              <h3 className="font-display text-xl font-bold text-gray-900">{counselor.full_name}</h3>
              {counselor.specialization && (
                <p className="text-sm text-primary-600 font-medium mt-0.5">{counselor.specialization}</p>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                <Briefcase size={15} className="text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Specialization</p>
                <p className="text-sm text-gray-700">
                  {counselor.specialization || <span className="text-gray-400 italic">Not specified</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                <FileText size={15} className="text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">About</p>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {counselor.bio || <span className="text-gray-400 italic">This counsellor has not added a bio yet.</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 h-8 w-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                <UserCircle size={15} className="text-primary-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Role</p>
                <p className="text-sm text-gray-700">Certified Campus Counsellor</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
