import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  X, Heart, Calendar, Tag, CheckCircle, AlertTriangle,
  CreditCard, Building2,
} from 'lucide-react';
import { campaignsApi } from '../../api/campaigns';
import { contributionsApi } from '../../api/contributions';
import type { PaymentMethod } from '../../types';
import Avatar from '../ui/Avatar';
import ProgressBar from '../ui/ProgressBar';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';
import Toast from '../ui/Toast';

const PAYMENT_METHODS = [
  { value: 'mtn_momo', label: 'MTN Mobile Money' },
  { value: 'airtel_money', label: 'Airtel Money' },
  { value: 'visa', label: 'Visa Card' },
];

interface Props {
  campaignId: string | null;
  open: boolean;
  initialTab?: 'details' | 'donate';
  onClose: () => void;
}

export default function CampaignDetailModal({ campaignId, open, initialTab = 'details', onClose }: Props) {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'details' | 'donate'>(initialTab);
  const [showToast, setShowToast] = useState(false);

  const [form, setForm] = useState({
    donor_name: '', donor_email: '', donor_phone: '', message: '',
    amount: '', payment_method: 'mtn_momo' as PaymentMethod, is_anonymous: false,
  });
  const [visaForm, setVisaForm] = useState({
    card_holder_name: '', card_number: '', expiry: '', cvc: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Sync tab when prop changes (e.g. card "Donate" vs "View Details")
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, initialTab]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['campaign', campaignId],
    queryFn: () => campaignsApi.get(campaignId!),
    enabled: !!campaignId && open,
    staleTime: 60_000,
  });

  const isCompleted = campaign?.status === 'completed' ||
    (campaign ? campaign.current_amount >= campaign.target_amount : false);

  const resetForm = () => {
    setForm({ donor_name: '', donor_email: '', donor_phone: '', message: '', amount: '', payment_method: 'mtn_momo', is_anonymous: false });
    setVisaForm({ card_holder_name: '', card_number: '', expiry: '', cvc: '' });
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleDonate = async () => {
    setError('');
    if (!form.donor_name || !form.donor_email || !form.donor_phone || !form.amount) {
      setError('Please fill in all required fields.');
      return;
    }
    if (Number(form.amount) <= 0) {
      setError('Donation amount must be greater than zero.');
      return;
    }
    if (form.payment_method === 'visa') {
      if (!visaForm.card_holder_name.trim()) { setError('Please enter the cardholder name.'); return; }
      const digits = visaForm.card_number.replace(/\s/g, '');
      if (!/^\d{16}$/.test(digits)) { setError('Card number must be 16 digits.'); return; }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(visaForm.expiry)) { setError('Expiry date must be MM/YY.'); return; }
      if (!/^\d{3}$/.test(visaForm.cvc)) { setError('CVC must be 3 digits.'); return; }
    }

    setSubmitting(true);
    try {
      await contributionsApi.create({
        campaign_id: campaignId!,
        donor_name: form.donor_name,
        donor_email: form.donor_email,
        donor_phone: form.donor_phone,
        message: form.message || undefined,
        is_anonymous: form.is_anonymous,
        payment_method: form.payment_method,
        amount: Number(form.amount),
      });
      await qc.invalidateQueries({ queryKey: ['campaign', campaignId] });
      await qc.invalidateQueries({ queryKey: ['campaigns'] });
      resetForm();
      setTab('details');
      setShowToast(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCardNumberChange = (val: string) => {
    const d = val.replace(/\D/g, '').slice(0, 16);
    setVisaForm(v => ({ ...v, card_number: d.replace(/(.{4})/g, '$1 ').trim() }));
  };

  const handleExpiryChange = (val: string) => {
    const d = val.replace(/\D/g, '').slice(0, 4);
    setVisaForm(v => ({ ...v, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }));
  };

  if (!open) return null;

  const authorName = campaign?.is_anonymous ? 'Anonymous' : (campaign?.author || 'Student');
  const avatarSrc = campaign?.is_anonymous ? undefined : campaign?.avatar_url || undefined;
  const pct = campaign ? Math.min(100, Math.round((campaign.current_amount / campaign.target_amount) * 100)) : 0;
  const hasAccount = campaign && (campaign.bank_name || campaign.account_number || campaign.account_holder_name);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-2xl bg-white rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-6 pb-4 shrink-0">
            <div className="flex-1 min-w-0 pr-4">
              <h2 className="font-display text-xl font-bold text-gray-900 leading-snug line-clamp-2">
                {isLoading ? <span className="inline-block h-5 w-48 bg-gray-100 rounded animate-pulse" /> : campaign?.title}
              </h2>
              {campaign && !isLoading && (
                <p className="text-xs text-gray-400 mt-1">Campaign for student support</p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-100 px-6 shrink-0">
            {(['details', 'donate'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors capitalize -mb-px ${
                  tab === t
                    ? 'border-primary-600 text-primary-700'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {t === 'details' ? 'Campaign Details' : 'Make a Donation'}
              </button>
            ))}
          </div>

          {/* Body */}
          <div className="overflow-y-auto flex-1 px-6 py-5">
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Spinner size="lg" />
              </div>
            ) : !campaign ? (
              <div className="text-center py-16 text-gray-500">Campaign not found.</div>
            ) : tab === 'details' ? (
              <div className="space-y-5">
                {/* Author row */}
                <div className="flex items-center gap-3">
                  <Avatar src={avatarSrc} name={authorName} size="md" />
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{authorName}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(campaign.created_at).toLocaleDateString('en-UG', { dateStyle: 'long' })}
                      </span>
                      {campaign.category && (
                        <span className="flex items-center gap-1 text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full capitalize">
                          <Tag size={10} /> {campaign.category}
                        </span>
                      )}
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                          <CheckCircle size={10} /> Fully Funded
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {campaign.description}
                </p>

                {/* Progress */}
                <div className="bg-primary-50 rounded-2xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <p className="font-display text-xl font-bold text-primary-700">
                        UGX {campaign.current_amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">raised of UGX {campaign.target_amount.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl font-bold text-gray-900">{pct}%</p>
                      <p className="text-xs text-gray-400">funded</p>
                    </div>
                  </div>
                  <ProgressBar current={campaign.current_amount} target={campaign.target_amount} />
                </div>

                {/* Account info */}
                {hasAccount && (
                  <div className="flex flex-col gap-2 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary-800">
                      <Building2 size={14} /> Payment Account
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                      {campaign.account_holder_name && (
                        <div>
                          <p className="text-xs text-primary-500 font-medium">Account Holder</p>
                          <p className="text-gray-800 font-semibold">{campaign.account_holder_name}</p>
                        </div>
                      )}
                      {campaign.bank_name && (
                        <div>
                          <p className="text-xs text-primary-500 font-medium">Bank / Provider</p>
                          <p className="text-gray-800 font-semibold">{campaign.bank_name}</p>
                        </div>
                      )}
                      {campaign.account_number && (
                        <div>
                          <p className="text-xs text-primary-500 font-medium">Account Number</p>
                          <p className="text-gray-800 font-semibold tracking-wide">{campaign.account_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* CTA */}
                {!isCompleted ? (
                  <Button className="w-full" onClick={() => setTab('donate')}>
                    <Heart size={16} /> Donate to this Campaign
                  </Button>
                ) : (
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                    <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                    <p className="text-sm text-emerald-700 font-medium">This campaign has been fully funded!</p>
                  </div>
                )}
              </div>
            ) : (
              /* Donate tab */
              <div className="space-y-3">
                {/* Account info banner */}
                {hasAccount && (
                  <div className="flex flex-col gap-1.5 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary-800">
                      <Building2 size={14} className="shrink-0" />
                      Send your payment to this account
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 text-sm">
                      {campaign.account_holder_name && (
                        <div>
                          <p className="text-xs text-primary-500 font-medium">Account Holder</p>
                          <p className="text-gray-800 font-semibold">{campaign.account_holder_name}</p>
                        </div>
                      )}
                      {campaign.bank_name && (
                        <div>
                          <p className="text-xs text-primary-500 font-medium">Bank / Provider</p>
                          <p className="text-gray-800 font-semibold">{campaign.bank_name}</p>
                        </div>
                      )}
                      {campaign.account_number && (
                        <div>
                          <p className="text-xs text-primary-500 font-medium">Account Number</p>
                          <p className="text-gray-800 font-semibold tracking-wide">{campaign.account_number}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {isCompleted ? (
                  <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
                    <CheckCircle size={18} className="text-emerald-600 shrink-0" />
                    <p className="text-sm text-emerald-700 font-medium">This campaign is fully funded — no contributions needed.</p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input label="Full Name *" value={form.donor_name} onChange={e => setForm(f => ({ ...f, donor_name: e.target.value }))} placeholder="Jane Smith" />
                      <Input label="Email Address *" type="email" value={form.donor_email} onChange={e => setForm(f => ({ ...f, donor_email: e.target.value }))} placeholder="jane@example.com" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <Input label="Phone Number *" value={form.donor_phone} onChange={e => setForm(f => ({ ...f, donor_phone: e.target.value }))} placeholder="+256 700 000 000" />
                      <Input label="Amount (UGX) *" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="50000" min="1000" />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Payment Method *</label>
                      <select
                        value={form.payment_method}
                        onChange={e => setForm(f => ({ ...f, payment_method: e.target.value as PaymentMethod }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                      >
                        {PAYMENT_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                      </select>
                    </div>

                    {form.payment_method === 'visa' && (
                      <div className="flex flex-col gap-3 p-4 rounded-xl bg-gray-50 border border-gray-200">
                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <CreditCard size={15} className="text-primary-600" /> Card Details
                        </div>
                        <Input
                          label="Cardholder Name *"
                          value={visaForm.card_holder_name}
                          onChange={e => setVisaForm(v => ({ ...v, card_holder_name: e.target.value }))}
                          placeholder="Name as it appears on card"
                        />
                        <Input
                          label="Card Number *"
                          value={visaForm.card_number}
                          onChange={e => handleCardNumberChange(e.target.value)}
                          placeholder="0000 0000 0000 0000"
                          maxLength={19}
                        />
                        <div className="grid grid-cols-2 gap-3">
                          <Input label="Expiry *" value={visaForm.expiry} onChange={e => handleExpiryChange(e.target.value)} placeholder="MM/YY" maxLength={5} />
                          <Input label="CVC *" value={visaForm.cvc} onChange={e => setVisaForm(v => ({ ...v, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) }))} placeholder="123" maxLength={3} />
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">
                        Message <span className="text-gray-400 font-normal">(optional)</span>
                      </label>
                      <textarea
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Leave a heartfelt message..."
                        rows={2}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

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
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showToast && (
        <Toast message="Thank you! Your donation has been received." onClose={() => setShowToast(false)} />
      )}
    </>
  );
}
