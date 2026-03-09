import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser } from '../../store/authSlice';
import { authApi } from '../../api/auth';
import type { CounselorProfile } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Avatar from '../../components/ui/Avatar';

export default function CounselorProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user) as CounselorProfile | null;
  const [form, setForm] = useState({ full_name: '', specialization: '', bio: '', phone: '' });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        specialization: user.specialization || '',
        bio: user.bio || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: () => authApi.updateProfile({
      full_name: form.full_name || undefined,
      specialization: form.specialization || undefined,
      bio: form.bio || undefined,
      phone: form.phone || undefined,
    }),
    onSuccess: async () => {
      const updated = await authApi.getProfile();
      dispatch(setUser(updated));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  if (!user) return null;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">My Profile</h1>
        <p className="text-gray-500">Manage your professional profile visible to students.</p>
      </div>

      <div className="space-y-6">
        {/* Preview card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
          <Avatar name={form.full_name || user.full_name} size="xl" />
          <div>
            <p className="font-display font-bold text-gray-900 text-lg">{form.full_name || user.full_name}</p>
            {form.specialization && <p className="text-sm text-primary-600 font-medium">{form.specialization}</p>}
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
          </div>
        </div>

        <form
          onSubmit={e => { e.preventDefault(); mutation.mutate(); }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
        >
          <h3 className="font-display font-semibold text-gray-900">Professional Information</h3>

          <Input
            label="Full Name"
            value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
            placeholder="Dr. Dev Kapoor"
          />
          <Input
            label="Specialization"
            value={form.specialization}
            onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))}
            placeholder="Anxiety & Depression, Student Wellbeing..."
          />
          <Textarea
            label="Professional Bio"
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Brief description of your background and approach to counselling."
            rows={4}
          />
          <Input
            label="Phone Number"
            value={form.phone}
            onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            placeholder="+256 700 000 000"
          />

          {success && (
            <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sm text-primary-700">
              Profile updated successfully!
            </div>
          )}
          {mutation.isError && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
              {mutation.error?.message}
            </div>
          )}

          <Button type="submit" loading={mutation.isPending}>Save Changes</Button>
        </form>
      </div>
    </div>
  );
}
