import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Heart, ShieldCheck, MessageCircle, AlertTriangle,
  ChevronRight, Loader2,
} from 'lucide-react';
import { useAppDispatch } from '../../store/hooks';
import { setUser } from '../../store/authSlice';
import { authApi } from '../../api/auth';
import { sponsorsApi } from '../../api/sponsors';
import Modal from '../ui/Modal';

const whatItMeans = [
  {
    icon: <Heart size={18} className="text-rose-500" />,
    title: 'You become a safe person',
    body: "Another student will be able to reach out to you privately when they're struggling. You're not a counsellor — you're just someone who listens and cares.",
  },
  {
    icon: <MessageCircle size={18} className="text-blue-500" />,
    title: 'One-on-one private messaging',
    body: "Once you accept a student's request, you'll both get access to a private chat. What's said there stays between the two of you.",
  },
  {
    icon: <ShieldCheck size={18} className="text-primary-600" />,
    title: 'Your identity is always visible',
    body: 'Because trust matters in this relationship, sponsors cannot use anonymous mode. Other students will see your name and profile when browsing for support.',
  },
  {
    icon: <AlertTriangle size={18} className="text-amber-500" />,
    title: 'You can step back any time',
    body: 'Life gets heavy sometimes. If you need to stop being a sponsor, you can opt out at any time from your dashboard. Any active connection will end, and the other student will be notified with care.',
  },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function BecomeSponsorModal({ open, onClose }: Props) {
  const dispatch = useAppDispatch();
  const qc = useQueryClient();

  const [step, setStep] = useState<'info' | 'form'>('info');
  const [whatIOffer, setWhatIOffer] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const becomeSponsor = useMutation({
    mutationFn: () => sponsorsApi.becomeSponsor(whatIOffer),
    onSuccess: async () => {
      const updated = await authApi.getProfile();
      dispatch(setUser(updated));
      qc.invalidateQueries({ queryKey: ['mySponsorStatus'] });
      handleClose();
    },
  });

  function handleClose() {
    onClose();
    // Reset after the modal has finished closing
    setTimeout(() => {
      setStep('info');
      setWhatIOffer('');
      setConfirmed(false);
      becomeSponsor.reset();
    }, 200);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={step === 'info' ? 'Become a Sponsor' : 'Set Up Your Sponsor Profile'}
      subtitle={
        step === 'info'
          ? 'Read through what this means before signing up'
          : 'Tell students what kind of support you can offer'
      }
      maxWidth="max-w-xl"
    >
      {step === 'info' ? (
        <div className="px-6 py-5 space-y-5">
          {/* What it means cards */}
          <div className="space-y-3">
            {whatItMeans.map((item, i) => (
              <div key={i} className="flex gap-3 bg-gray-50 rounded-xl p-4">
                <div className="h-9 w-9 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                  {item.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">{item.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Important notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs text-amber-800 leading-relaxed">
              <strong>Important reminder:</strong> Sponsorship is peer support, not professional
              counselling. If the student you are supporting discloses a crisis or mentions
              self-harm, please encourage them to speak with a professional counsellor or contact
              an emergency service. Your wellbeing matters too.
            </p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={handleClose}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Maybe later
            </button>
            <button
              onClick={() => setStep('form')}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              I understand — continue
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={e => { e.preventDefault(); if (confirmed && whatIOffer.trim()) becomeSponsor.mutate(); }}
          className="px-6 py-5 space-y-5"
        >
          {/* Back */}
          <button
            type="button"
            onClick={() => setStep('info')}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 -mt-1"
          >
            ← Back
          </button>

          {/* What I offer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              What kind of support can you offer?
              <span className="text-red-500 ml-0.5">*</span>
            </label>
            <textarea
              value={whatIOffer}
              onChange={e => setWhatIOffer(e.target.value)}
              rows={5}
              placeholder="e.g. I've dealt with academic pressure and loneliness in my first year. I'm happy to listen, share what helped me, and be a consistent presence for someone who needs it."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              maxLength={500}
            />
            <p className="text-xs text-gray-400 text-right mt-1">{whatIOffer.length}/500</p>
          </div>

          {/* Consent checkbox */}
          <div className="bg-gray-50 rounded-xl p-4">
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={e => setConfirmed(e.target.checked)}
                className="accent-primary-600 h-4 w-4 mt-0.5 shrink-0"
              />
              <span className="text-sm text-gray-600 leading-relaxed">
                I understand that becoming a sponsor makes my profile visible to other students,
                and that I can opt out at any time if I need to prioritise my own wellbeing.
              </span>
            </label>
          </div>

          {becomeSponsor.isError && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle size={14} /> {(becomeSponsor.error as Error)?.message}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!confirmed || !whatIOffer.trim() || becomeSponsor.isPending}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors"
            >
              {becomeSponsor.isPending && <Loader2 size={14} className="animate-spin" />}
              List me as a sponsor
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
