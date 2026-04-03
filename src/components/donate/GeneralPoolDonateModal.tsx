import { useState } from 'react';
import { Heart, AlertTriangle, CreditCard, CheckCircle } from 'lucide-react';
import { generalPoolApi } from '../../api/generalPool';
import type { PaymentMethod } from '../../types';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';

const PAYMENT_METHODS = [
  { value: 'mtn_momo', label: 'MTN Mobile Money' },
  { value: 'airtel_money', label: 'Airtel Money' },
  { value: 'visa', label: 'Visa Card' },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function GeneralPoolDonateModal({ open, onClose }: Props) {
  const [form, setForm] = useState({
    donor_name: '', donor_email: '', donor_phone: '', message: '',
    amount: '', payment_method: 'mtn_momo' as PaymentMethod, is_anonymous: false,
  });
  const [visaForm, setVisaForm] = useState({ card_holder_name: '', card_number: '', expiry: '', cvc: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const reset = () => {
    setForm({ donor_name: '', donor_email: '', donor_phone: '', message: '', amount: '', payment_method: 'mtn_momo', is_anonymous: false });
    setVisaForm({ card_holder_name: '', card_number: '', expiry: '', cvc: '' });
    setError('');
    setSuccess(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, '$1 ').trim();
    setVisaForm(v => ({ ...v, card_number: formatted }));
  };

  const handleExpiryChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    const formatted = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    setVisaForm(v => ({ ...v, expiry: formatted }));
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
      if (!/^\d{16}$/.test(visaForm.card_number.replace(/\s/g, ''))) { setError('Card number must be 16 digits.'); return; }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(visaForm.expiry)) { setError('Expiry must be MM/YY.'); return; }
      if (!/^\d{3}$/.test(visaForm.cvc)) { setError('CVC must be 3 digits.'); return; }
    }
    setSubmitting(true);
    try {
      await generalPoolApi.donate({
        donor_name: form.donor_name,
        donor_email: form.donor_email,
        donor_phone: form.donor_phone,
        amount: Number(form.amount),
        message: form.message,
        payment_method: form.payment_method,
        is_anonymous: form.is_anonymous,
      });
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={handleClose} title="Donate to General Pool" subtitle="Support student wellbeing on CampusCare" maxWidth="max-w-lg">
      {success ? (
        <div className="flex flex-col items-center text-center py-6 gap-4">
          <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
            <CheckCircle size={32} className="text-primary-600" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-gray-900 mb-1">Thank you, {form.donor_name.split(' ')[0]}!</h3>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Your donation of <strong>UGX {Number(form.amount).toLocaleString()}</strong> has been received.
              The admin team will allocate it where it's needed most.
            </p>
          </div>
          <Button onClick={handleClose} className="mt-2">Done</Button>
        </div>
      ) : (
        <div className="space-y-3">
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
              <Input label="Cardholder Name *" value={visaForm.card_holder_name} onChange={e => setVisaForm(v => ({ ...v, card_holder_name: e.target.value }))} placeholder="Name as it appears on card" />
              <Input label="Card Number *" value={visaForm.card_number} onChange={e => handleCardNumberChange(e.target.value)} placeholder="0000 0000 0000 0000" maxLength={19} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Expiry *" value={visaForm.expiry} onChange={e => handleExpiryChange(e.target.value)} placeholder="MM/YY" maxLength={5} />
                <Input label="CVC *" value={visaForm.cvc} onChange={e => setVisaForm(v => ({ ...v, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) }))} placeholder="123" maxLength={3} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Message <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              placeholder="A note of encouragement for students..."
              rows={2}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer select-none p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm(f => ({ ...f, is_anonymous: e.target.checked }))} className="accent-primary-600 h-4 w-4" />
            <div>
              <p className="text-sm font-medium text-gray-700">Donate anonymously</p>
              <p className="text-xs text-gray-400">Your name won't be shared publicly</p>
            </div>
          </label>

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500 shrink-0" /> {error}
            </div>
          )}

          <Button onClick={handleDonate} loading={submitting} className="w-full">
            <Heart size={16} /> Proceed to Payment
          </Button>
        </div>
      )}
    </Modal>
  );
}
