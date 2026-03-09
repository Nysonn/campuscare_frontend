import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, X, AlertTriangle } from 'lucide-react';
import { campaignsApi } from '../../api/campaigns';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Spinner from '../../components/ui/Spinner';

const CATEGORIES = ['education', 'medical', 'emergency', 'mental health', 'other'];

export default function EditCampaignPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [form, setForm] = useState({
    title: '', description: '', target_amount: '', category: 'education',
    is_anonymous: false, attachment_input: '', attachments: [] as string[],
  });
  const [error, setError] = useState('');

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
        attachment_input: '',
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
      attachments: form.attachments,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['myCampaigns'] });
      navigate('/student/campaigns');
    },
    onError: (e: Error) => setError(e.message),
  });

  const addAttachment = () => {
    const url = form.attachment_input.trim();
    if (!url) return;
    setForm(f => ({ ...f, attachments: [...f.attachments, url], attachment_input: '' }));
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

      <div className="max-w-2xl">
        <form onSubmit={e => { e.preventDefault(); setError(''); mutation.mutate(); }} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-5">
          <Input label="Campaign Title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
          <Textarea label="Description *" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={5} required />
          <Input label="Target Amount (UGX) *" type="number" value={form.target_amount} onChange={e => setForm(f => ({ ...f, target_amount: e.target.value }))} min="10000" required />

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Category *</label>
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700">Supporting Documents</label>
            <div className="flex gap-2">
              <input type="url" value={form.attachment_input} onChange={e => setForm(f => ({ ...f, attachment_input: e.target.value }))} placeholder="Paste a URL" className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
              <Button type="button" variant="outline" size="sm" onClick={addAttachment}><Plus size={14} /> Add</Button>
            </div>
            {form.attachments.length > 0 && (
              <ul className="space-y-1.5">
                {form.attachments.map((url, i) => (
                  <li key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
                    <span className="flex-1 truncate">{url}</span>
                    <button type="button" onClick={() => setForm(f => ({ ...f, attachments: f.attachments.filter((_, j) => j !== i) }))}>
                      <X size={13} className="text-gray-400 hover:text-red-500 cursor-pointer" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
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
    </div>
  );
}
