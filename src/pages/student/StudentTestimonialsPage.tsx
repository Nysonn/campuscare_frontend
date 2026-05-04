import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Quote, Loader2, CheckCircle, Clock, XCircle,
  Send, Star, Users, PlusCircle, CalendarClock,
} from 'lucide-react';
import { testimonialsApi } from '../../api/testimonials';
import type { Testimonial } from '../../types';
import SEO from '../../components/seo/SEO';
import Spinner from '../../components/ui/Spinner';

// ── helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  Testimonial['status'],
  { label: string; icon: React.ReactNode; card: string; badge: string }
> = {
  pending: {
    label: 'Under Review',
    icon: <Clock size={14} />,
    card: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700',
    badge: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  },
  approved: {
    label: 'Live on Homepage',
    icon: <CheckCircle size={14} />,
    card: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700',
    badge: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  },
  rejected: {
    label: 'Not Approved',
    icon: <XCircle size={14} />,
    card: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700',
    badge: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400',
  },
};

const AVATAR_COLORS = [
  'from-primary-400 to-primary-600',
  'from-violet-400 to-violet-600',
  'from-blue-400 to-blue-600',
  'from-rose-400 to-rose-600',
  'from-amber-400 to-amber-600',
  'from-teal-400 to-teal-600',
];

function getInitials(name: string) {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-UG', { dateStyle: 'medium' });
}

// ── My Testimonials section ───────────────────────────────────────────────────

function MyTestimonialsSection() {
  const qc = useQueryClient();
  const [draft, setDraft] = useState('');
  const [composing, setComposing] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['myTestimonials'],
    queryFn: testimonialsApi.mine,
  });

  const testimonials = data?.testimonials ?? [];
  const canSubmit = data?.can_submit ?? true;
  const nextAllowedAt = data?.next_allowed_at ?? null;

  const submitMutation = useMutation({
    mutationFn: () => testimonialsApi.submit(draft.trim()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myTestimonials'] });
      setComposing(false);
      setDraft('');
    },
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
            <Quote size={18} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-gray-900 dark:text-white">Your Testimonials</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Approved testimonials appear publicly on the CampusCare homepage.
            </p>
          </div>
        </div>

        {/* Submit button or cooldown badge */}
        {!isLoading && !composing && (
          canSubmit ? (
            <button
              onClick={() => { setDraft(''); setComposing(true); }}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors shrink-0"
            >
              <PlusCircle size={14} />
              New Testimonial
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-xl shrink-0">
              <CalendarClock size={13} />
              Available {nextAllowedAt ? formatDate(nextAllowedAt) : ''}
            </div>
          )
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-28">
          <Spinner size="md" />
        </div>
      )}

      {/* Composer */}
      {!isLoading && composing && (
        <div className="space-y-4">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Tell us how CampusCare has helped you. Be honest and specific — your words can encourage another student to seek support."
            rows={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {draft.trim().length} / 800 characters · Must be at least 10 characters
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Reviewed before going live.
            </p>
          </div>

          {submitMutation.isError && (
            <p className="text-xs text-red-500 dark:text-red-400">
              Something went wrong. Please try again.
            </p>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setComposing(false)}
              disabled={submitMutation.isPending}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => submitMutation.mutate()}
              disabled={submitMutation.isPending || draft.trim().length < 10 || draft.trim().length > 800}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitMutation.isPending && <Loader2 size={14} className="animate-spin" />}
              <Send size={14} />
              {submitMutation.isPending ? 'Submitting…' : 'Submit for Review'}
            </button>
          </div>
        </div>
      )}

      {/* Empty state — no testimonials yet */}
      {!isLoading && !composing && testimonials.length === 0 && (
        <div
          className="border-2 border-dashed border-primary-200 dark:border-primary-700 rounded-xl p-8 text-center hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all cursor-pointer group"
          onClick={() => setComposing(true)}
        >
          <Quote size={28} className="mx-auto mb-3 text-primary-300 dark:text-primary-600 group-hover:text-primary-500 transition-colors" />
          <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:text-primary-800 dark:group-hover:text-primary-300 mb-1">
            Share your CampusCare experience
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Tell other students how CampusCare helped you. Approved stories appear on our public homepage.
          </p>
        </div>
      )}

      {/* Testimonials list */}
      {!isLoading && !composing && testimonials.length > 0 && (
        <div className="space-y-3">
          {testimonials.map(t => {
            const cfg = STATUS_CONFIG[t.status];
            return (
              <div key={t.id} className={`rounded-xl border p-4 space-y-3 ${cfg.card}`}>
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${cfg.badge}`}>
                    {cfg.icon}
                    {cfg.label}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(t.created_at)}</span>
                </div>

                <blockquote className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  &ldquo;{t.content}&rdquo;
                </blockquote>

                {t.status === 'pending' && (
                  <p className="text-xs text-yellow-600 dark:text-yellow-400">
                    Our team is reviewing this testimonial. It usually takes 1–2 business days.
                  </p>
                )}
                {t.status === 'approved' && (
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1.5">
                    <CheckCircle size={13} />
                    Live on the homepage. Thank you for sharing your story!
                  </p>
                )}
                {t.status === 'rejected' && (
                  <p className="text-xs text-red-500 dark:text-red-400">
                    This testimonial wasn&apos;t approved. Submit a new one when the cooldown ends.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Public testimonials preview ───────────────────────────────────────────────

function PublicTestimonialsPreview() {
  const { data, isLoading } = useQuery({
    queryKey: ['testimonials'],
    queryFn: testimonialsApi.list,
  });

  const testimonials = data ?? [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
          <Star size={18} className="text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-gray-900 dark:text-white">What Others Are Saying</h2>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            These stories are live on the CampusCare homepage.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-28">
          <Spinner size="md" />
        </div>
      )}

      {!isLoading && testimonials.length === 0 && (
        <div className="text-center py-10">
          <Users size={32} className="mx-auto mb-3 text-gray-200 dark:text-gray-700" />
          <p className="text-sm text-gray-400 dark:text-gray-500">
            No approved testimonials yet. Yours could be the first!
          </p>
        </div>
      )}

      {!isLoading && testimonials.length > 0 && (
        <div className="space-y-4">
          {testimonials.map(t => {
            const initials = getInitials(t.display_name);
            const colorClass = AVATAR_COLORS[t.display_name.charCodeAt(0) % AVATAR_COLORS.length];
            return (
              <div
                key={t.id}
                className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
              >
                {t.avatar_url ? (
                  <img
                    src={t.avatar_url}
                    alt={t.display_name}
                    className="h-10 w-10 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className={`h-10 w-10 rounded-full bg-linear-to-br ${colorClass} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {initials}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{t.display_name}</p>
                    {t.university && (
                      <span className="text-[11px] text-gray-400 dark:text-gray-500 ml-2 shrink-0 hidden sm:inline">
                        {t.university}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
                    &ldquo;{t.content}&rdquo;
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function StudentTestimonialsPage() {
  return (
    <div>
      <SEO
        title="Share Your Experience"
        description="Share your CampusCare experience and help inspire other students."
        noindex
      />

      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 dark:text-white mb-1">
          Testimonials
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Share your story and read what other students are saying about CampusCare.
        </p>
      </div>

      <div className="mb-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-2xl p-5">
        <div className="flex flex-wrap gap-6">
          {[
            { step: '1', text: 'Write your experience in the box below' },
            { step: '2', text: 'Submit for review by our team' },
            { step: '3', text: 'Once approved, it appears on the public homepage' },
          ].map(s => (
            <div key={s.step} className="flex items-center gap-3">
              <span className="h-7 w-7 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center shrink-0">
                {s.step}
              </span>
              <p className="text-sm text-primary-800 dark:text-primary-300">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MyTestimonialsSection />
        <PublicTestimonialsPreview />
      </div>
    </div>
  );
}
