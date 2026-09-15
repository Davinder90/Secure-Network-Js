'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  MagnifyingGlassIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  EyeIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
import { handleGetArticles } from '@/src/requests/articles/articles';

export default function ArticleSearchPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runSearch = useCallback(async (queryStr: string) => {
    if (!queryStr.trim()) return;
    setLoading(true);

    const res = await handleGetArticles({ query: queryStr.trim(), limit: 15 });
    if (res?.success && res.result?.articles) {
      setArticles(res.result.articles);
    } else {
      setArticles([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (initialQuery) runSearch(initialQuery);
  }, [initialQuery, runSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(searchTerm);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20 pt-8 text-black">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="relative mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by topic, keyword, protocol, or author..."
            className="w-full rounded-2xl border border-gray-300 bg-white py-4 pl-12 pr-28 text-sm font-semibold text-black shadow-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
          />
          <MagnifyingGlassIcon className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <button
            type="submit"
            className="absolute right-2.5 top-2.5 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700"
          >
            Search
          </button>
        </form>

        {/* Results */}
        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
            <ArrowPathIcon className="h-7 w-7 animate-spin text-red-600" />
            <p className="text-xs font-bold uppercase text-black">Searching database...</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Matched Stories ({articles.length})
            </h2>

            {articles.map((art) => (
              <div
                key={art._id || art.articleId}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-400"
              >
                <div className="mb-2 flex items-center gap-2">
                  <img
                    src={art.author?.avatar}
                    alt={art.author?.name}
                    className="h-5 w-5 rounded-full object-cover"
                  />
                  <span className="text-xs font-bold text-black">{art.author?.name}</span>
                </div>
                <Link
                  href={`/articles/${art.articleId || art._id}`}
                  className="text-base font-bold text-black transition hover:text-red-600"
                >
                  {art.title}
                </Link>
                {art.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-600">{art.description}</p>
                )}
                <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-gray-400">
                  <span className="flex items-center gap-1 text-blue-600">
                    <EyeIcon className="h-3.5 w-3.5" /> {art.activity?.totalReads || 0}
                  </span>
                  <span className="flex items-center gap-1 text-red-600">
                    <HeartIcon className="h-3.5 w-3.5" /> {art.activity?.totalLikes || 0}
                  </span>
                </div>
              </div>
            ))}

            {articles.length === 0 && !loading && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center">
                <DocumentTextIcon className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-xs font-bold text-black">No matching stories found</p>
                <p className="mt-0.5 text-[11px] text-gray-500">Try searching for broader terms like "DNS", "Traceroute", or "Subnet".</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
