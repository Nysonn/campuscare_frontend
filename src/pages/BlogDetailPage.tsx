import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, BookOpen, Calendar, User } from 'lucide-react';
import SEO from '../components/seo/SEO';
import Footer from '../components/layout/Footer';
import { blogsApi } from '../api/blogs';

export default function BlogDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: blog, isLoading, isError } = useQuery({
    queryKey: ['blog', id],
    queryFn: () => blogsApi.getById(id!),
    enabled: !!id,
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {blog && (
        <SEO
          title={`${blog.title} — CampusCare Blog`}
          description={blog.description}
          keywords="mental health, student wellness, CampusCare"
          url={`https://campuscare.me/blogs/${blog.id}`}
        />
      )}

      {/* ── Topbar ─────────────────────────────────────────────────── */}
      <div className="pt-16 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <ArrowLeft size={15} />
            Back to Blog
          </Link>
        </div>
      </div>

      {/* ── Loading state ─────────────────────────────────────────── */}
      {isLoading && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-48" />
          <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          ))}
        </div>
      )}

      {/* ── Error state ──────────────────────────────────────────────*/}
      {isError && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-24 text-center">
          <BookOpen size={44} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Article not found</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
            This article may have been removed or the link is incorrect.
          </p>
          <Link
            to="/blogs"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft size={14} />
            Browse all articles
          </Link>
        </div>
      )}

      {/* ── Article ──────────────────────────────────────────────── */}
      {blog && (
        <article className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          {/* Cover image */}
          {blog.image_url && (
            <div className="w-full overflow-hidden rounded-2xl mb-8 shadow-sm">
              <img
                src={blog.image_url}
                alt={blog.title}
                className="w-full object-cover max-h-105"
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 dark:text-gray-500 mb-5">
            <span className="inline-flex items-center gap-1">
              <User size={12} />
              {blog.author}
            </span>
            <span className="inline-flex items-center gap-1">
              <Calendar size={12} />
              {new Date(blog.created_at).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
            {blog.title}
          </h1>

          {/* Short description */}
          <p className="text-lg text-gray-500 dark:text-gray-400 mb-10 leading-relaxed border-l-4 border-primary-400 pl-4">
            {blog.description}
          </p>

          {/* Content — rendered as plain text preserving newlines */}
          <div className="prose prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
            {blog.content.split('\n').map((para, i) =>
              para.trim() ? (
                <p key={i} className="mb-5 last:mb-0">
                  {para}
                </p>
              ) : (
                <br key={i} />
              ),
            )}
          </div>

          {/* Footer link */}
          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-700">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              <ArrowLeft size={14} />
              Back to all articles
            </Link>
          </div>
        </article>
      )}

      <Footer />
    </div>
  );
}
