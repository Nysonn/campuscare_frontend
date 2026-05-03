import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, BookOpen, X, ImagePlus, Loader2 } from 'lucide-react';
import SEO from '../../components/seo/SEO';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import { blogsApi } from '../../api/blogs';
import { uploadToCloudinary } from '../../api/cloudinary';
import type { Blog } from '../../types';

interface CreateForm {
  title: string;
  description: string;
  content: string;
  image_url: string;
}

const EMPTY_FORM: CreateForm = {
  title: '',
  description: '',
  content: '',
  image_url: '',
};

export default function AdminBlogsPage() {
  const qc = useQueryClient();

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState<CreateForm>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [formError, setFormError] = useState('');

  const [confirmDelete, setConfirmDelete] = useState<Blog | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: blogs, isLoading } = useQuery({
    queryKey: ['adminBlogs'],
    queryFn: blogsApi.list,
  });

  const createMutation = useMutation({
    mutationFn: blogsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminBlogs'] });
      qc.invalidateQueries({ queryKey: ['blogs'] });
      setShowCreate(false);
      setForm(EMPTY_FORM);
      setImageFile(null);
      setImagePreview('');
      setFormError('');
    },
    onError: () => setFormError('Failed to create blog post. Please try again.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['adminBlogs'] });
      qc.invalidateQueries({ queryKey: ['blogs'] });
      setConfirmDelete(null);
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError('');

    if (!form.title.trim() || !form.description.trim() || !form.content.trim()) {
      setFormError('Title, short description, and content are required.');
      return;
    }

    let imageUrl = form.image_url;
    if (imageFile) {
      setUploading(true);
      try {
        imageUrl = await uploadToCloudinary(imageFile);
      } catch {
        setFormError('Image upload failed. Please try again.');
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    createMutation.mutate({ ...form, image_url: imageUrl });
  }

  const isBusy = uploading || createMutation.isPending;

  return (
    <div className="space-y-6">
      <SEO title="Blog Management — Admin" description="" keywords="" url="" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Blog Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Publish and manage CampusCare blog articles
          </p>
        </div>
        <Button variant="primary" onClick={() => { setShowCreate(true); setForm(EMPTY_FORM); setImageFile(null); setImagePreview(''); setFormError(''); }}>
          <Plus size={15} className="mr-1" /> New Article
        </Button>
      </div>

      {/* Blog list */}
      {isLoading && (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      )}

      {!isLoading && (!blogs || blogs.length === 0) && (
        <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <BookOpen size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No articles yet. Create the first one!</p>
        </div>
      )}

      {!isLoading && blogs && blogs.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {blogs.map(blog => (
            <div
              key={blog.id}
              className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col"
            >
              {blog.image_url ? (
                <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img src={blog.image_url} alt={blog.title} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video w-full bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                  <BookOpen size={32} className="text-primary-300 dark:text-primary-600" />
                </div>
              )}
              <div className="p-4 flex flex-col flex-1">
                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">
                  {new Date(blog.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 flex-1">
                  {blog.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                  {blog.description}
                </p>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={() => setConfirmDelete(blog)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create modal ──────────────────────────────────────────── */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">New Article</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Cover image */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cover Image
                </label>
                {imagePreview ? (
                  <div className="relative rounded-xl overflow-hidden aspect-video bg-gray-100 dark:bg-gray-700 mb-2">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(''); }}
                      className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full aspect-video rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-600 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-primary-400 hover:text-primary-500 transition-colors"
                  >
                    <ImagePlus size={28} />
                    <span className="text-xs">Click to upload cover image</span>
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Article title"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              {/* Short description */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Short Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="A brief summary of the article (shown on cards)"
                  rows={2}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Full article content. Separate paragraphs with a blank line."
                  rows={10}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y font-mono"
                />
              </div>

              {formError && (
                <p className="text-xs text-red-500">{formError}</p>
              )}

              <div className="flex justify-end gap-3 pt-1">
                <Button variant="ghost" type="button" onClick={() => setShowCreate(false)} disabled={isBusy}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={isBusy}>
                  {isBusy ? (
                    <>
                      <Loader2 size={14} className="mr-1.5 animate-spin" />
                      {uploading ? 'Uploading…' : 'Publishing…'}
                    </>
                  ) : (
                    'Publish Article'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ──────────────────────────────── */}
      {confirmDelete && (
        <Modal
          open={!!confirmDelete}
          title="Delete Article"
          onClose={() => setConfirmDelete(null)}
        >
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
            Are you sure you want to permanently delete{' '}
            <span className="font-semibold">&ldquo;{confirmDelete.title}&rdquo;</span>?
            This cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => deleteMutation.mutate(confirmDelete.id)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : 'Delete'}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
