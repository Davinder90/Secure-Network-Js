'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FireIcon,
  HashtagIcon,
  PencilSquareIcon,
  ArrowPathIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ChevronDownIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  handleGetArticles,
  handleGetTrendingArticles,
  handleGetCategories,
} from '@/src/requests/articles/articles';
import { handleGetImage } from '@/src/requests/articles/image';
import AsyncBanner from '@/src/components/articles/AsyncImageBanner';

interface Author {
  name: string;
  username: string;
  avatar: string;
}

interface Article {
  _id: string;
  articleId: string;
  id?: string;
  title: string;
  description?: string;
  banner?: string;
  tags: string[];
  author: Author;
  activity: {
    totalLikes: number;
    totalComments: number;
    totalReads: number;
  };
  publishedAt: string;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  articleCount: number;
}

export default function ArticlesPage() {
  const [activeTab, setActiveTab] = useState<string>('latest');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [trendingArticles, setTrendingArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  // 1. Fetch Dynamic Categories
  const fetchCategories = useCallback(async () => {
    const res = await handleGetCategories();
    if (res?.success && Array.isArray(res.result)) {
      setCategories(res.result);
    }
  }, []);

  // 2. Fetch Trending Articles
  const fetchTrending = useCallback(async () => {
    const res = await handleGetTrendingArticles(5);
    if (res?.success && Array.isArray(res.result)) {
      setTrendingArticles(res.result);
    }
  }, []);

  // 3. Fetch Main Articles Feed
  const fetchFeed = useCallback(async (tagFilter: string | null, pageNum: number = 1, append: boolean = false) => {
    setLoading(true);
    const res = await handleGetArticles({
      page: pageNum,
      limit: 6,
      tag: tagFilter || undefined,
    });

    if (res?.success && res.result?.articles) {
      setArticles((prev) => (append ? [...prev, ...res.result.articles] : res.result.articles));
      setHasMore(Boolean(res.result.pagination?.hasMore));
    } else if (!append) {
      setArticles([]);
      setHasMore(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchTrending();
    fetchFeed(null, 1, false);
  }, [fetchCategories, fetchTrending, fetchFeed]);

  const handleTagClick = (categoryName: string) => {
    setPage(1);
    if (selectedTag === categoryName) {
      setSelectedTag(null);
      fetchFeed(null, 1, false);
    } else {
      setSelectedTag(categoryName);
      fetchFeed(categoryName, 1, false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchFeed(selectedTag, nextPage, true);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20 pt-6 text-black selection:bg-red-600 selection:text-white">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Hero Banner Strip */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-red-600 via-black to-blue-600" />

          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-red-600">
                <SparklesIcon className="h-3.5 w-3.5 text-red-600" />
                Network Knowledge & Engineering Hub
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight text-black sm:text-3xl">
                Articles, Deep-Dives & Protocols
              </h1>
              <p className="mt-1.5 max-w-2xl text-xs font-medium text-gray-600 sm:text-sm">
                Explore in-depth networking analyses, DNS diagnostic workflows, vulnerability audits, and API integration guides.
              </p>
            </div>

            <Link
              href="/articles/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-red-700 active:scale-95 self-start md:self-auto"
            >
              <PencilSquareIcon className="h-4 w-4" />
              Write an Article
            </Link>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          
          {/* LEFT: Feed (8 cols) */}
          <div className="lg:col-span-8">
            <div className="flex items-center justify-between border-b border-gray-300 pb-2">
              <div className="flex items-center gap-6 text-sm font-bold">
                <button
                  onClick={() => {
                    setActiveTab('latest');
                    setSelectedTag(null);
                    setPage(1);
                    fetchFeed(null, 1, false);
                  }}
                  className={`pb-2.5 text-xs sm:text-sm uppercase tracking-wider transition-all ${
                    activeTab === 'latest' && !selectedTag
                      ? 'border-b-2 border-red-600 font-extrabold text-red-600'
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  Latest Articles
                </button>

                {selectedTag && (
                  <button className="flex items-center gap-1.5 border-b-2 border-red-600 pb-2.5 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-red-600">
                    <span>Topic:</span>
                    <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 text-red-700">
                      {selectedTag}
                    </span>
                  </button>
                )}
              </div>

              {selectedTag && (
                <button
                  onClick={() => {
                    setSelectedTag(null);
                    setPage(1);
                    fetchFeed(null, 1, false);
                  }}
                  className="text-xs font-bold text-gray-500 hover:text-red-600"
                >
                  Clear filter
                </button>
              )}
            </div>

            {/* Articles List */}
            <div className="mt-6 space-y-4">
              {loading && articles.length === 0 ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white p-8">
                  <ArrowPathIcon className="h-8 w-8 animate-spin text-red-600" />
                  <p className="text-xs font-bold uppercase tracking-wide text-gray-600">Fetching Stories...</p>
                </div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {articles.length > 0 ? (
                    articles.map((art, index) => (
                      <motion.article
                        key={art._id || art.articleId || art.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.25, delay: index * 0.04 }}
                        className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-400 hover:shadow-md"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <img
                                src={art.author?.avatar || 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=User'}
                                alt={art.author?.name}
                                className="h-7 w-7 rounded-full border border-gray-200 bg-gray-50 object-cover"
                              />
                              <div>
                                <span className="text-xs font-bold text-black transition hover:text-blue-600">
                                  {art.author?.name}
                                </span>
                                <span className="ml-1.5 font-mono text-xs text-gray-400">
                                  @{art.author?.username}
                                </span>
                              </div>
                            </div>

                            <span className="text-[11px] font-semibold text-gray-400">
                              {new Date(art.publishedAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>

                          <div className="mt-3.5 flex flex-col-reverse items-start justify-between gap-4 sm:flex-row">
                            <div className="flex-1 space-y-1.5">
                              <Link href={`/articles/${art.articleId || art._id}`}>
                                <h2 className="line-clamp-2 text-base font-bold tracking-tight text-black transition-colors group-hover:text-red-600 sm:text-lg">
                                  {art.title}
                                </h2>
                              </Link>
                              {art.description && (
                                <p className="line-clamp-2 text-xs font-normal leading-relaxed text-gray-600">
                                  {art.description}
                                </p>
                              )}
                            </div>

                            {/* 💡 SIMPLE AND DIRECT: browser resolves the streaming URL natively */}
                            {art.banner && (
                              <AsyncBanner
                                banner={art.banner}
                                alt={art.title}
                                className="h-20 w-full sm:w-28 shrink-0 rounded-lg object-cover"
                              />
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {art.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                onClick={() => handleTagClick(t)}
                                className="cursor-pointer rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-[11px] font-semibold text-gray-700 transition hover:border-red-600 hover:text-red-600"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-3 font-bold text-gray-500">
                            <span className="inline-flex items-center gap-1">
                              <EyeIcon className="h-3.5 w-3.5 text-blue-600" />
                              {art.activity.totalReads.toLocaleString()}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <HeartIcon className="h-3.5 w-3.5 text-red-600" />
                              {art.activity.totalLikes}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <ChatBubbleLeftRightIcon className="h-3.5 w-3.5 text-gray-400" />
                              {art.activity.totalComments}
                            </span>
                          </div>
                        </div>
                      </motion.article>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
                      <p className="text-sm font-bold text-black">No articles found</p>
                      <p className="mt-1 text-xs text-gray-500">Be the first to publish under this topic.</p>
                      <Link
                        href="/articles/create"
                        className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-red-600 bg-white px-3.5 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                      >
                        <PencilSquareIcon className="h-4 w-4" /> Start Writing
                      </Link>
                    </div>
                  )}
                </AnimatePresence>
              )}
            </div>

            {/* Load More Pagination */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-2.5 text-xs font-bold text-black shadow-sm transition hover:bg-gray-50 active:scale-95"
                >
                  {loading ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin text-red-600" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4" />
                  )}
                  Load More Stories
                </button>
              </div>
            )}
          </div>

          {/* RIGHT: Dynamic Categories & Trending (4 cols) */}
          <div className="space-y-6 lg:col-span-4">
            
            {/* Dynamic Category Chips from Database */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <HashtagIcon className="h-4 w-4 text-red-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                  Topics of Interest
                </h3>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const isSelected = selectedTag === cat.name;
                  return (
                    <button
                      key={cat._id}
                      onClick={() => handleTagClick(cat.name)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm transition ${
                        isSelected
                          ? 'border border-red-600 bg-red-600 text-white'
                          : 'border border-gray-200 bg-gray-50 text-gray-700 hover:border-gray-300 hover:bg-white hover:text-black'
                      }`}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Trending Section */}
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <FireIcon className="h-4 w-4 text-red-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-black">
                    Trending Articles
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-blue-600">Top Rated</span>
              </div>

              <div className="mt-4 divide-y divide-gray-100">
                {trendingArticles.map((trend, idx) => (
                  <div key={trend._id || trend.articleId} className="flex items-start gap-4 py-3.5 first:pt-0 last:pb-0">
                    <span className="select-none text-2xl font-black text-gray-300">
                      0{idx + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={trend.author?.avatar}
                          alt={trend.author?.name}
                          className="h-4 w-4 rounded-full"
                        />
                        <span className="text-[11px] font-semibold text-gray-500">
                          {trend.author?.name}
                        </span>
                      </div>
                      <Link
                        href={`/articles/${trend.articleId || trend._id}`}
                        className="block text-xs font-bold leading-snug text-black transition hover:text-red-600"
                      >
                        {trend.title}
                      </Link>
                      <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-400">
                        <span>{new Date(trend.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        <span>•</span>
                        <span className="text-blue-600">{trend.activity.totalReads.toLocaleString()} reads</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
