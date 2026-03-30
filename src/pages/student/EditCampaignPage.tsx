import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, X, AlertTriangle, Paperclip } from 'lucide-react';
import { campaignsApi } from '../../api/campaigns';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Spinner from '../../components/ui/Spinner';
import type { CampaignAttachment } from '../../types';

const CATEGORIES = ['education', 'medical', 'emergency', 'mental health', 'other'];
const URGENCY_LEVELS = [
  { value: 'normal', label: 'Normal' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'critical', label: 'Critical' },
];
const PROOF_LABELS = [
  'Hospital Invoice',
  'Fee Statement',
  'Medical Report',
  "Doctor's Letter",
  'Acceptance Letter',
  'Bank Statement',
  'Other',
];

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: '',
    description: '',
    target_amount: '',
    category: 'education',
    is_anonymous: false,
    urgency_level: 'normal',
    beneficiary_type: 'self',
    beneficiary_name: '',
    verification_contact_name: '',
    verification_contact_info: '',
    attachment_label: PROOF_LABELS[0],
    attachments: [] as CampaignAttachment[],
  });
  const [error, setError] = useState('');
  const [attachError, setAttachError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: campaigns, isLoading } = useQuery({ queryKey: ['myCampaigns'], queryFn: campaignsApi.mine });

  useEffect(() => {
    const c = campaigns?.find(c => c.id === id);
    if (c) {
      setForm({
        title: c.title,
        description: c.description,
        target_amount: String(c.target_amount),
        category: c.category,
        is_anonymous: c.is_anonymous,
        urgency_level: c.urgency_level ?? 'normal',
        beneficiary_type: c.beneficiary_type ?? 'self',
        beneficiary_name: c.beneficiary_name ?? '',
        verification_contact_name: c.verification_contact_name ?? '',
        verification_contact_info: c.verification_contact_info ?? '',
        attachment_label: PROOF_LABELS[0],
        attachments: c.attachments ?? [],
      });
    }
  }, [campaigns, id]);

  const mutation = useMutation({
    mutationFn: () => campaignsApi.update(id!, {
      title: form.title,
      description: form.description,
      target_amount: Number(form.target_amount),
      category: form.category,
      is_anonymous: form.is_anonymous,
      urgency_level: form.urgency_level,
      beneficiary_type: form.beneficiary_type,
      beneficiary_name: form.beneficiary_type === 'other' ? form.beneficiary_name : '',
      verification_contact_name: form.verification_contact_name,
      verification_contact_info: form.verification_contact_info,
      attachments: form.attachments.map(({ url, label }) => ({ url, label })),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myCampaigns'] });
      navigate('/student/campaigns');
    },
    onError: (e: Error) => setError(e.message),
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const allowed = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats'];
    if (!allowed.some(t => file.type.startsWith(t))) {
      setAttachError('Only images, PDFs, or Word documents are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAttachError('File must be under 5 MB.');
      return;
    }
    setAttachError('');
    const reader = new FileReader();
    reader.onload = () => {
      setForm(f => ({
        ...f,
        attachments: [...f.attachments, { url: reader.result as string, label: f.attachment_label, name: file.name }],
      }));
    };
    reader.readAsDataURL(file);
  }

  const removeAttachment = (i: number) =>
    setForm(f => ({ ...f, attachments: f.attachments.filter((_, j) => j !== i) }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.beneficiary_type === 'other' && !form.beneficiary_name.trim()) {
      setError('Please enter the name of the person this campaign is for.');
      return;
    }
    mutation.mutate();
  };

  if (isLoading) return <div className="py-20 flex justify-center"><Spinner size="lg" /></div>;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 mb-6 cursor-pointer">
        <ArrowLeft size={16} /> Back
      </button>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Edit Campaign</h1>
        <p className="text-gray-500">Your campaign will be re-submitted for approval after editing.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-6">

        <Input label="Campaign Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
        <Textarea label="Description *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={5} required />
        <Input label="Target Amount (UGX) *" type="number" value={form.target_amount} onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))} min="10000" required />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Category *</label>
            <select
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Urgency Level *</label>
            <select
              value={form.urgency_level}
              onChange={e => setForm(f => ({ ...f, urgency_level: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {URGENCY_LEVELS.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
          </div>
        </div>

        {/* Who is this for */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Who is this campaign for? *</label>
          <div className="flex gap-4">
            {[{ value: 'self', label: 'Myself' }, { value: 'other', label: 'Someone else' }].map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="radio"
                  name="beneficiary_type"
                  value={opt.value}
                  checked={form.beneficiary_type === opt.value}
                  onChange={() => setForm(f => ({ ...f, beneficiary_type: opt.value, beneficiary_name: '' }))}
                  className="accent-primary-600 h-4 w-4"
                />
                <span className="text-sm text-gray-700">{opt.label}</span>
              </label>
            ))}
          </div>
          {form.beneficiary_type === 'other' && (
            <Input
              placeholder="Full name of the beneficiary"
              value={form.beneficiary_name}
              onChange={e => setForm(f => ({ ...f, beneficiary_name: e.target.value }))}
            />
          )}
        </div>

        {/* Proof of Need */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Proof of Need (optional)</label>
          <p className="text-xs text-gray-400">Attach labelled documents that support your campaign. Images, PDFs, and Word docs accepted · max 5 MB each.</p>
          <div className="flex gap-2">
            <select
              value={form.attachment_label}
              onChange={e => setForm(f => ({ ...f, attachment_label: e.target.value }))}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 shrink-0"
            >
              {PROOF_LABELS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-400 hover:border-primary-400 hover:text-primary-600 transition-colors"
            >
              <Paperclip size={14} />
              Choose file from device
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf,.doc,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          {attachError && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertTriangle size={12} /> {attachError}
            </p>
          )}
          {form.attachments.length > 0 && (
            <ul className="space-y-1.5">
              {form.attachments.map((att, i) => (
                <li key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
                  <Paperclip size={12} className="text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-700 shrink-0">{att.label}</span>
                  <span className="text-gray-400">·</span>
                  <span className="flex-1 truncate">{att.name ?? att.url}</span>
                  <button type="button" onClick={() => removeAttachment(i)}>
                    <X size={13} className="text-gray-400 hover:text-red-500 cursor-pointer" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Verification contact */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700">Verification Contact (optional)</label>
          <p className="text-xs text-gray-400">A person who can confirm the legitimacy of this campaign.</p>
          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Contact name"
              value={form.verification_contact_name}
              onChange={e => setForm(f => ({ ...f, verification_contact_name: e.target.value }))}
            />
            <Input
              placeholder="Phone or email"
              value={form.verification_contact_info}
              onChange={e => setForm(f => ({ ...f, verification_contact_info: e.target.value }))}
            />
          </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer select-none">
          <input type="checkbox" checked={form.is_anonymous} onChange={e => setForm(f => ({ ...f, is_anonymous: e.target.checked }))} className="accent-primary-600 h-4 w-4" />
          <span className="text-sm text-gray-700">Keep me anonymous on the public card</span>
        </label>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
            <AlertTriangle size={14} className="text-red-500 shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={mutation.isPending}>Save Changes</Button>
        </div>
      </form>
    </div>
  );
}
