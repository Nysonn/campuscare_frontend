import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, AlertTriangle, Camera, Loader2 } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setUser } from '../../store/authSlice';
import { authApi } from '../../api/auth';
import { uploadToCloudinary } from '../../api/cloudinary';
import type { CounselorProfile } from '../../types';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Textarea from '../../components/ui/Textarea';
import Avatar from '../../components/ui/Avatar';
import SEO from '../../components/seo/SEO';

export default function CounselorProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(s => s.auth.user) as CounselorProfile | null;
  const [form, setForm] = useState({ full_name: '', specialization: '', bio: '', phone: '', avatar_url: '' });
  const [success, setSuccess] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setForm({
        full_name: user.full_name || '',
        specialization: user.specialization || '',
        bio: user.bio || '',
        phone: user.phone || '',
        avatar_url: user.avatar_url || '',
      });
    }
  }, [user]);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // reset input so the same file can be re-selected after an error
    e.target.value = '';
    if (!file.type.startsWith('image/')) {
      setAvatarError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError('Image must be under 5 MB.');
      return;
    }
    setAvatarError('');
    setAvatarLoading(true);
    try {
      const url = await uploadToCloudinary(file);
      setForm(f => ({ ...f, avatar_url: url }));
    } catch (err) {
      setAvatarError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    } finally {
      setAvatarLoading(false);
    }
  }

  const mutation = useMutation({
    mutationFn: () => authApi.updateProfile({
      full_name: form.full_name || user!.full_name || undefined,
      specialization: form.specialization || undefined,
      bio: form.bio || undefined,
      phone: form.phone || undefined,
      avatar_url: form.avatar_url || undefined,
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
      <SEO
        title="Counsellor Profile"
        description="Manage your CampusCare counsellor profile visible to students."
        noindex
      />
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">My Profile</h1>
      </div>

      <div className="space-y-6">
        {/* Preview card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4">
          <Avatar src={form.avatar_url || undefined} name={form.full_name || user.full_name} size="xl" />
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

          {/* Avatar upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => !avatarLoading && fileInputRef.current?.click()}
                disabled={avatarLoading}
                className="relative group shrink-0"
              >
                <Avatar src={form.avatar_url || undefined} name={form.full_name || user.full_name} size="xl" />
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  {avatarLoading
                    ? <Loader2 size={20} className="text-white animate-spin" />
                    : <Camera size={20} className="text-white" />}
                </span>
              </button>
              <div className="text-sm text-gray-500">
                {avatarLoading ? (
                  <span className="text-primary-600 font-medium flex items-center gap-1.5">
                    <Loader2 size={13} className="animate-spin" /> Uploading…
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-primary-600 font-medium hover:underline"
                  >
                    Choose photo
                  </button>
                )}
                {!avatarLoading && <>{' '}from your device</>}
                <p className="mt-0.5 text-xs text-gray-400">JPG, PNG or WebP · max 5 MB</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            {avatarError && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle size={12} /> {avatarError}
              </p>
            )}
          </div>

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
            <div className="bg-primary-50 border border-primary-100 rounded-xl px-4 py-3 text-sm text-primary-700 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-primary-600 shrink-0" />
              Profile updated successfully!
            </div>
          )}
          {mutation.isError && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600 flex items-center gap-2">
              <AlertTriangle size={14} className="text-red-500 shrink-0" />
              {mutation.error?.message}
            </div>
          )}

          <Button type="submit" loading={mutation.isPending}>Save Changes</Button>
        </form>
      </div>
    </div>
  );
}


