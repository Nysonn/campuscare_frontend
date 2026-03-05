import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser } from '../../store/authSlice';
import { authApi } from '../../api/auth';
import type { StudentProfile } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Avatar from '../../components/ui/Avatar';

export default function StudentProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user) as StudentProfile | null;
  const [form, setForm] = useState({
    display_name: '', bio: '', university: '', course: '', year: '',
    location: '', avatar_url: '', is_anonymous: false,
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        display_name: user.display_name || '',
        bio: user.bio || '',
        university: user.university || '',
        course: user.course || '',
        year: user.year || '',
        location: user.location || '',
        avatar_url: user.avatar_url || '',
        is_anonymous: user.is_anonymous || false,
      });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: () => authApi.updateProfile({
      display_name: form.display_name || undefined,
      bio: form.bio || undefined,
      university: form.university || undefined,
      course: form.course || undefined,
      year: form.year || undefined,
      location: form.location || undefined,
      avatar_url: form.avatar_url || undefined,
      is_anonymous: form.is_anonymous,
    }),
    onSuccess: async () => {
      const updated = await authApi.getProfile();
      dispatch(setUser(updated));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  if (!user) return null;

  const displayName = form.display_name || `${user.first_name} ${user.last_name}`;

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">My Profile</h1>
        <p className="text-gray-500">Manage your public profile and privacy settings.</p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Avatar preview */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-4">
            <Avatar src={form.is_anonymous ? undefined : (form.avatar_url || undefined)} name={displayName} size="xl" />
            <div>
              <p className="font-semibold text-gray-900">{displayName}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              {form.is_anonymous && (
                <span className="inline-block mt-1 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                  Anonymous on campaigns
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={e => { e.preventDefault(); mutation.mutate(); }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5"
        >
          <h3 className="font-display font-semibold text-gray-900">Profile Information</h3>

          <Input
            label="Display Name"
            value={form.display_name}
            onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
            placeholder={`${user.first_name} ${user.last_name}`}
          />
          <Input
            label="Avatar URL"
            type="url"
            value={form.avatar_url}
            onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))}
            placeholder="https://example.com/your-photo.jpg"
          />
          <Textarea
            label="Bio"
            value={form.bio}
            onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
            placeholder="Tell the community a little about yourself."
            rows={3}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="University" value={form.university} onChange={e => setForm(f => ({ ...f, university: e.target.value }))} placeholder="Makerere University" />
            <Input label="Course" value={form.course} onChange={e => setForm(f => ({ ...f, course: e.target.value }))} placeholder="Computer Science" />
            <Input label="Year of Study" value={form.year} onChange={e => setForm(f => ({ ...f, year: e.target.value }))} placeholder="Year 3" />
            <Input label="Location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Kampala" />
          </div>

          <div className="pt-2 border-t border-gray-100">
            <h3 className="font-display font-semibold text-gray-900 mb-3">Privacy Settings</h3>
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.is_anonymous}
                onChange={e => setForm(f => ({ ...f, is_anonymous: e.target.checked }))}
                className="accent-primary-600 h-4 w-4 mt-0.5 shrink-0"
              />
              <span className="text-sm text-gray-700">
                <strong>Anonymous mode</strong> — hide my name and profile photo on public campaign cards. Other students can still see my profile when logged in unless I set this on individual campaigns.
              </span>
            </label>
          </div>

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
