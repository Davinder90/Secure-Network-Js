'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  EyeIcon,
  CalendarDaysIcon,
  ShareIcon,
  CheckBadgeIcon,
  ArrowLeftIcon,
  PencilSquareIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import {
  handleGetArticleByIdOrSlug,
  handleCheckArticleLike,
  handleToggleArticleLike,
  handleGetArticles,
  handleDeleteArticle,
} from '@/src/requests/articles/articles';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/redux-store/store';
import ArticleBlockRenderer from '@/src/components/articles/ArticleBlockRenderer';
import ArticleComments from '@/src/components/articles/ArticleComments';
import AsyncBanner from '@/src/components/articles/AsyncImageBanner';
import { TrashIcon } from 'lucide-react';

interface ArticleData {
  id: string; // URL-safe encrypted ID token
  articleId: string; // Human-friendly slug
  title: string;
  description?: string;
  banner?: string;
  tags: string[];
  content: Array<{ blocks?: unknown[] }>;
  author: {
    _id: string;
    name: string;
    username: string;
    avatar: string;
    bio?: string;
    jobTitle?: string;
  };
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  activity: {
    totalLikes: number;
    totalComments: number;
    totalReads: number;
  };
  publishedAt: string;
}

export default function ArticleDetailsPage() {
  const params = useParams();
  const id = params?.id as string; // Encrypted ID token from dynamic route

  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isAuthor, setIsAuthor] = useState(false);
  const [recommendations, setRecommendations] = useState<ArticleData[]>([]);
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const user = useSelector((state: RootState) => state.user);
  const canEdit = user.role === 'administrator' || (isAuthor && user.productAccess?.articles);

  // Redux-based username selection
  const loggedInUsername = useSelector((state: RootState) => state.user.name);

  const onDeleteArticle = async () => {
    if (!article) return;

    const confirmed = window.confirm(
      'Are you sure you want to permanently delete this article? All attached comments and discussions will be removed.'
    );
    if (!confirmed) return;

    setIsDeleting(true);
    const toastId = toast.loading('Deleting article...');

    const res = await handleDeleteArticle(article.id || id);

    if (res?.success) {
      toast.success('Article deleted successfully!', { id: toastId });
      router.replace('/articles');
    } else {
      toast.error(res?.error || res?.message || 'Failed to delete article', { id: toastId });
      setIsDeleting(false);
    }
  };


  // 1. Fetch Relational Recommendations (Excludes active article)
  const fetchRecommendations = useCallback(async (categoryId?: string, currentDocId?: string) => {
    if (!categoryId) return;
    try {
      const res = await handleGetArticles({
        limit: 3,
        category: categoryId,
      });

      if (res?.success && Array.isArray(res.result?.articles)) {
        // Filter out current active article so it never shows inside recommendations
        const filtered = res.result.articles.filter(
          (a: ArticleData) => a.id !== currentDocId && a.articleId !== currentDocId
        );
        setRecommendations(filtered);
      }
    } catch (err) {
      console.error('Failed to load recommended articles:', err);
    }
  }, []);

  // 2. Fetch Main Article details
  const fetchArticleDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);

    try {
      const res = await handleGetArticleByIdOrSlug(id, 'view');
      if (res?.success && res.result) {
        const art = res.result as ArticleData;
        setArticle(art);
        setLikeCount(art.activity?.totalLikes || 0);

        // 🛡️ Match author strictly by comparing Redux username with article author username
        const isCreator = Boolean(
          loggedInUsername &&
          loggedInUsername.toLowerCase() === art.author.username.toLowerCase()
        );
        setIsAuthor(isCreator);

        // Check current like state
        const likeRes = await handleCheckArticleLike(art.id || id);
        setIsLiked(Boolean(likeRes?.result?.isLiked));

        // Fetch recommendations from matching category
        if (art.category?._id) {
          fetchRecommendations(art.category._id, art.id || id);
        }
      }
    } catch (err) {
      console.error('Failed to load article details:', err);
    } finally {
      setLoading(false);
    }
  }, [id, loggedInUsername, fetchRecommendations]);

  useEffect(() => {
    fetchArticleDetails();
  }, [fetchArticleDetails]);

  // Toggle appreciation handler
  const onToggleLike = async () => {
    if (!article) return;

    // Optimistic toggle
    const prevLiked = isLiked;
    setIsLiked(!prevLiked);
    setLikeCount((c) => (prevLiked ? c - 1 : c + 1));

    const res = await handleToggleArticleLike(article.id || id);
    if (!res?.success) {
      setIsLiked(prevLiked);
      setLikeCount((c) => (prevLiked ? c + 1 : c - 1));
      toast.error(res?.error || 'Failed to update appreciation');
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard!');
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-gray-500">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-red-600" />
        <p className="text-sm font-bold uppercase tracking-wider text-black">Loading Article...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 py-20 text-center">
        <h2 className="text-2xl font-black text-black">Article Not Found</h2>
        <p className="mt-2 text-sm text-gray-600">This article is unavailable or remains in draft state.</p>
        <Link
          href="/articles"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-red-700"
        >
          <ArrowLeftIcon className="h-4 w-4" /> Back to Articles
        </Link>
      </div>
    );
  }

  const blocks = (article.content?.[0] as { blocks?: unknown[] })?.blocks || (Array.isArray(article.content) ? article.content : []);

  return (
    <div className="min-h-screen bg-gray-100 pb-28 pt-8 text-black">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">

        {/* Navigation / Edit bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/articles"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500 transition hover:text-red-600"
          >
            <ArrowLeftIcon className="h-3.5 w-3.5" /> Back to Articles
          </Link>

          {canEdit && (
            <div className="flex items-center gap-2">
              <Link
                href={`/articles/${article.id || id}/edit`}
                className="inline-flex items-center gap-1.5 rounded-xl border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:border-black hover:text-black transition shadow-sm active:scale-95"
              >
                <PencilSquareIcon className="h-4 w-4 text-gray-500" /> Edit Article
              </Link>

              <button
                type="button"
                onClick={onDeleteArticle}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition shadow-sm active:scale-95 disabled:opacity-50"
              >
                <TrashIcon className="h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        {/* Main Card */}
        <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-10">
          
          {/* Header */}
          <header className="space-y-4 border-b border-gray-100 pb-8">
            <div className="flex flex-wrap gap-2">
              {article.tags.map((t) => (
                <span
                  key={t}
                  className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-red-700"
                >
                  #{t}
                </span>
              ))}
            </div>

            <h1 className="text-2xl font-black leading-tight tracking-tight text-black sm:text-4xl">
              {article.title}
            </h1>

            {article.description && (
              <p className="text-base font-normal leading-relaxed text-gray-600 sm:text-lg">
                {article.description}
              </p>
            )}

            <div className="flex flex-col items-start justify-between gap-4 pt-4 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <img
                  src={article.author.avatar || 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=User'}
                  alt={article.author.name}
                  className="h-11 w-11 rounded-full border border-gray-200 object-cover"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-black">{article.author.name}</span>
                    <CheckBadgeIcon className="h-4 w-4 text-blue-600" />
                  </div>
                  <p className="text-xs text-gray-500">
                    @{article.author.username} {article.author.jobTitle ? `• ${article.author.jobTitle}` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-semibold text-gray-500">
                <span className="inline-flex items-center gap-1">
                  <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                  {new Date(article.publishedAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <EyeIcon className="h-4 w-4 text-blue-600" />
                  {article.activity?.totalReads.toLocaleString()} reads
                </span>
              </div>
            </div>
          </header>

          {/* Banner */}
          {article.banner && (
            <div className="my-8 overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <AsyncBanner
                banner={article.banner}
                alt={article.title}
                className="h-72 sm:h-96 w-full object-cover"
              />
            </div>
          )}

          {/* Action Panel */}
          <div className="sticky top-20 z-10 my-6 flex items-center justify-between rounded-xl border border-gray-200 bg-white/95 px-5 py-3 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-6">
              <button
                onClick={onToggleLike}
                className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 transition hover:text-red-600"
              >
                {isLiked ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-600" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
                <span>{likeCount}</span>
              </button>

              <div className="inline-flex items-center gap-2 text-xs font-bold text-gray-700">
                <ChatBubbleLeftRightIcon className="h-5 w-5 text-gray-500" />
                <span>{article.activity?.totalComments || 0} Comments</span>
              </div>
            </div>

            <button
              onClick={handleShare}
              className="rounded-lg p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-black"
              title="Share Link"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Render content blocks parsed from EditorJS */}
          <div className="py-6">
            <ArticleBlockRenderer blocks={blocks as any} />
          </div>

          {/* 💡 2. Recommendations Section (Renders clean cards for relevant other articles) */}
          {recommendations.length > 0 && (
            <div className="mt-12 border-t border-gray-100 pt-8">
              <div className="flex items-center gap-2 mb-6">
                <SparklesIcon className="h-5 w-5 text-red-600 animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-black">
                  Recommended Reading
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recommendations.map((art) => (
                  <div
                    key={art.id || art.articleId}
                    className="flex flex-col justify-between rounded-xl border border-gray-200 bg-gray-50/50 p-4 transition-all hover:border-gray-300 hover:shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={art.author?.avatar}
                          alt={art.author?.name}
                          className="h-4 w-4 rounded-full"
                        />
                        <span className="text-[10px] font-bold text-gray-500">@{art.author?.username}</span>
                      </div>
                      <Link
                        href={`/articles/${art.articleId || art.id}`}
                        className="block text-sm font-bold leading-snug text-black hover:text-red-600 transition"
                      >
                        {art.title}
                      </Link>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-[10px] text-gray-400 font-bold border-t border-gray-100/60 pt-2">
                      <span>{new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span className="text-blue-600">{art.activity?.totalReads || 0} reads</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Discussion comments area */}
          <div className="mt-12 border-t border-gray-200 pt-8">
            <ArticleComments articleId={article.id || id} />
          </div>
        </article>
      </div>
    </div>
  );
}
