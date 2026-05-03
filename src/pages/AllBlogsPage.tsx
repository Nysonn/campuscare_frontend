import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, BookOpen, ArrowRight, RefreshCw } from 'lucide-react';
import SEO from '../components/seo/SEO';
import Footer from '../components/layout/Footer';
import { blogsApi } from '../api/blogs';
import type { Blog } from '../types';

function BlogCard({ blog }: { blog: Blog }) {
  return (
    <Link
      to={`/blogs/${blog.id}`}
      className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
    >
      {blog.image_url ? (
        <div className="aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={blog.image_url}
            alt={blog.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      ) : (
        <div className="aspect-video w-full bg-linear-to-br from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
          <BookOpen size={40} className="text-primary-300 dark:text-primary-600" />
        </div>
      )}

      <div className="p-5 flex flex-col flex-1">
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
          {new Date(blog.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
          {' · '}
          {blog.author}
        </p>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {blog.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 flex-1">
          {blog.description}
        </p>
        <div className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400">
          Read article <ArrowRight size={13} />
        </div>
      </div>
    </Link>
  );
}

function BlogCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden animate-pulse">
      <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-32" />
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-5/6" />
      </div>
    </div>
  );
}

export default function AllBlogsPage() {
  const [search, setSearch] = useState('');

  const { data: blogs, isLoading, isError, refetch } = useQuery({
    queryKey: ['blogs'],
    queryFn: blogsApi.list,
  });

  const filtered = (blogs ?? []).filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.description.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO
        title="Blog — CampusCare"
        description="Mental health insights, student wellness tips, and campus wellbeing resources from the CampusCare Team."
        keywords="mental health blog, student wellness, campus wellbeing, CampusCare"
        url="https://campuscare.me/blogs"
      />

      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="relative pt-16 bg-linear-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 border-b border-primary-100 dark:border-gray-700 overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 w-72 h-72 bg-primary-100 dark:bg-primary-900 rounded-full blur-3xl opacity-50" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 w-56 h-56 bg-primary-200 dark:bg-primary-800 rounded-full blur-3xl opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-14 sm:py-16">
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 border border-primary-200 dark:border-gray-600 text-primary-700 dark:text-primary-400 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-sm mb-5">
            <BookOpen size={13} />
            CampusCare Blog
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Insights &amp; Wellness Resources
          </h1>
          <p className="text-base text-gray-500 dark:text-gray-400 max-w-xl mb-8">
            Articles, guides, and stories to support your mental health journey on campus.
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search articles…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* ── Blog Grid ────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <BlogCardSkeleton key={i} />)}
          </div>
        )}

        {isError && (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 mb-4">Failed to load articles.</p>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              <RefreshCw size={14} /> Try again
            </button>
          </div>
        )}

        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center py-20">
            <BookOpen size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {search ? 'No articles match your search.' : 'No articles published yet.'}
            </p>
          </div>
        )}

        {!isLoading && !isError && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(blog => <BlogCard key={blog.id} blog={blog} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
