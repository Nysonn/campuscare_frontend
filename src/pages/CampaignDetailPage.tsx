import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Calendar, Tag, Heart, AlertTriangle } from 'lucide-react';
import { campaignsApi } from '../api/campaigns';
import { contributionsApi } from '../api/contributions';
import Avatar from '../components/ui/Avatar';
import ProgressBar from '../components/ui/ProgressBar';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Spinner from '../components/ui/Spinner';

const PAYMENT_METHODS = [
  { value: 'mobile_money', label: 'MTN Mobile Money' },
  { value: 'airtel_money', label: 'Airtel Money' },
  { value: 'visa', label: 'Visa Card' },
];

export default function CampaignDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [donateOpen, setDonateOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'simulate' | 'done'>('form');
  const [contributionId, setContributionId] = useState('');
  const [form, setForm] = useState({
    donor_name: '', donor_email: '', donor_phone: '', message: '',
    amount: '', payment_method: 'mobile_money', is_anonymous: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-open modal when navigating with #donate hash
  useEffect(() => {
    if (location.hash === '#donate') {
      setDonateOpen(true);
    }
  }, [location.hash]);

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: campaignsApi.list,
  });

  const campaign = campaigns?.find(c => c.id === id);

  const handleDonate = async () => {
    setError('');
    if (!form.donor_name || !form.donor_email || !form.donor_phone || !form.amount) {
      setError('Please fill in all required fields.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await contributionsApi.create({
        campaign_id: id!,
        donor_name: form.donor_name,
        donor_email: form.donor_email,
        donor_phone: form.donor_phone,
        message: form.message || undefined,
        is_anonymous: form.is_anonymous,
        payment_method: form.payment_method,
        amount: Number(form.amount),
      });
      setContributionId(res.contribution_id);
      setStep('simulate');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulate = async (success: boolean) => {
    setSubmitting(true);
    try {
      await contributionsApi.simulate(contributionId, success);
      setStep('done');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Payment simulation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetDonate = () => {
    setStep('form');
    setForm({ donor_name: '', donor_email: '', donor_phone: '', message: '', amount: '', payment_method: 'mobile_money', is_anonymous: false });
    setContributionId('');
    setError('');
    setDonateOpen(false);
  };

  if (isLoading) return <div className="pt-24 flex justify-center"><Spinner size="lg" /></div>;

  if (!campaign) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
        <Heart size={48} className="text-gray-300" />
        <h2 className="font-display text-2xl text-gray-700">Campaign not found</h2>
        <Link to="/campaigns"><Button variant="outline">Browse Campaigns</Button></Link>
      </div>
    );
  }

  const authorName = campaign.is_anonymous ? 'Anonymous' : (campaign.author || 'Student');
  const pct = Math.min(100, Math.round((campaign.current_amount / campaign.target_amount) * 100));

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/campaigns" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to campaigns
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="h-2 bg-linear-to-r from-primary-400 to-primary-600" />

          <div className="p-8">
            {/* Author + meta */}
            <div className="flex items-center gap-3 mb-6">
              <Avatar
                src={campaign.is_anonymous ? undefined : campaign.avatar_url || undefined}
                name={authorName}
                size="lg"
              />
              <div>
                <p className="font-semibold text-gray-900">{authorName}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Calendar size={11} /> {new Date(campaign.created_at).toLocaleDateString('en-UG', { dateStyle: 'long' })}
                  </span>
                  {campaign.category && (
                    <span className="flex items-center gap-1 text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full capitalize">
                      <Tag size={10} /> {campaign.category}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Title */}
            <h1 className="font-display text-3xl font-bold text-gray-900 mb-4">{campaign.title}</h1>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap mb-8">{campaign.description}</p>

            {/* Progress */}
            <div className="bg-primary-50 rounded-2xl p-6 mb-8">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-display text-2xl font-bold text-primary-700">
                    UGX {campaign.current_amount.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">raised of UGX {campaign.target_amount.toLocaleString()} goal</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl font-bold text-gray-900">{pct}%</p>
                  <p className="text-xs text-gray-400">funded</p>
                </div>
              </div>
              <ProgressBar current={campaign.current_amount} target={campaign.target_amount} />
            </div>

            {/* CTA */}
            <div id="donate">
              <Button size="lg" className="w-full sm:w-auto" onClick={() => setDonateOpen(true)}>
                <Heart size={18} /> Donate to this Campaign
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Donation Modal */}
      <Modal
        open={donateOpen}
        onClose={resetDonate}
        title="Make a Donation"
        subtitle={campaign.title}
        maxWidth="max-w-lg"
      >
        {step === 'form' && (
          <div className="space-y-3">
            {/* Row 1: Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Full Name *" value={form.donor_name} onChange={e => setForm(f => ({ ...f, donor_name: e.target.value }))} placeholder="Jane Smith" />
              <Input label="Email Address *" type="email" value={form.donor_email} onChange={e => setForm(f => ({ ...f, donor_email: e.target.value }))} placeholder="jane@example.com" />
            </div>

            {/* Row 2: Phone + Amount */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input label="Phone Number *" value={form.donor_phone} onChange={e => setForm(f => ({ ...f, donor_phone: e.target.value }))} placeholder="+256 700 000 000" />
              <Input label="Amount (UGX) *" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="50000" min="1000" />
            </div>

            {/* Payment method */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Payment Method *</label>
              <select
                value={form.payment_method}
                onChange={e => setForm(f => ({ ...f, payment_method: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Message <span className="text-gray-400 font-normal">(optional)</span></label>
              <textarea
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                placeholder="Leave a heartfelt message..."
                rows={2}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Anonymous toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
              <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm(f => ({ ...f, is_anonymous: e.target.checked }))} className="accent-primary-600 h-4 w-4" />
              <div>
                <p className="text-sm font-medium text-gray-700">Donate anonymously</p>
                <p className="text-xs text-gray-400">Your name won't appear on the campaign</p>
              </div>
            </label>

            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-500 shrink-0" />
                {error}
              </div>
            )}

            <Button onClick={handleDonate} loading={submitting} className="w-full">
              <Heart size={16} /> Proceed to Payment
            </Button>
          </div>
        )}

        {step === 'simulate' && (
          <div className="text-center space-y-6">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <Heart size={28} className="text-primary-600" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">Simulate Payment</h3>
              <p className="text-sm text-gray-500">
                This is a demo payment. Choose to simulate a successful or failed transaction.
              </p>
            </div>
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
                <AlertTriangle size={14} className="text-red-500 shrink-0" />
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <Button onClick={() => handleSimulate(true)} loading={submitting} className="flex-1">
                ✓ Payment Success
              </Button>
              <Button onClick={() => handleSimulate(false)} variant="danger" loading={submitting} className="flex-1">
                ✗ Payment Fail
              </Button>
            </div>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center space-y-5 py-4">
            <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
              <Heart size={28} className="text-primary-600 fill-primary-300" />
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold text-gray-900 mb-2">Thank You!</h3>
              <p className="text-sm text-gray-500">
                Your donation has been recorded. You'll receive a confirmation email shortly.
              </p>
            </div>
            <Button onClick={resetDonate} className="w-full">Close</Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
