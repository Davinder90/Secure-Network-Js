'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import {
  ArrowPathIcon,
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
  TagIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import {
  handleGetArticleByIdOrSlug,
  handleUpdateArticle,
  handleGetCategories,
} from '@/src/requests/articles/articles';
import BannerImageUpload from '@/src/components/articles/BannerImage';
import ArticleEditor, { ArticleEditorRef } from '@/src/components/articles/Editor';
import { IBannerSnap } from '@/src/lib/interfaces/article/Image.Interface';

interface CategoryOption {
  _id: string;
  name: string;
  slug: string;
}

export default function ArticleEditPage() {
  const params = useParams();
  const id = params?.id as string; // 🛡️ URL-safe encrypted ID token
  const router = useRouter();
  const editorRef = useRef<ArticleEditorRef>(null);

  // States
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [banner, setBanner] = useState('');
  const [imgObj, setImgObj] = useState<IBannerSnap>({});
  const [category, setCategory] = useState<string>('');
  const [availableCategories, setAvailableCategories] = useState<CategoryOption[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [initialBlocks, setInitialBlocks] = useState<{ blocks: any[] }>({ blocks: [] });
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Categories for Dropdown
  const fetchCategoryList = useCallback(async () => {
    try {
      const res = await handleGetCategories();
      if (res?.success && Array.isArray(res.result)) {
        setAvailableCategories(res.result);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  }, []);

  // 2. Fetch Article Data
  const fetchArticle = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    await fetchCategoryList();

    // Sends the encrypted ID directly to the secure backend endpoint
    const res = await handleGetArticleByIdOrSlug(id, 'edit');
    if (res?.success && res.result) {
      const art = res.result;
      setTitle(art.title || '');
      setDescription(art.description || '');
      setBanner(art.banner || '');
      setTags(art.tags || []);
      
      // Handle category ID whether populated or raw string
      const resolvedCategoryId = art.category?._id || art.category || '';
      setCategory(resolvedCategoryId);
      
      // If there is an existing banner filename on the model, initialize imgObj
      if (art.banner && !art.banner.startsWith('data:') && !art.banner.startsWith('http')) {
        setImgObj({ filename: art.banner });
      }

      const blocksData =
        Array.isArray(art.content) && art.content[0]?.blocks
          ? art.content[0]
          : { blocks: art.content || [] };
      setInitialBlocks(blocksData);
    } else {
      toast.error('Failed to load article for editing');
    }
    setLoading(false);
  }, [id, fetchCategoryList]);

  useEffect(() => {
    fetchArticle();
  }, [fetchArticle]);

  // Tags Handlers
  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/[^a-zA-Z0-9- ]/g, '');
      if (tags.length >= 6) {
        toast.error('Maximum 6 tags allowed');
        return;
      }
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  // Submit Handler
  const onUpdateArticle = async () => {
    if (!title.trim() || title.length < 3) {
      toast.error('Article title is required (min 3 characters)');
      return;
    }

    const editorData = editorRef.current ? await editorRef.current.handleSave() : { blocks: [] };

    if (!editorData.blocks || editorData.blocks.length === 0) {
      toast.error('Write article content before updating');
      return;
    }

    setSubmitting(true);
    const res = await handleUpdateArticle(id, {
      title: title.trim(),
      description: description.trim(),
      banner: banner.trim(),
      category: category || undefined, // Sends Mongoose Category reference ID
      tags,
      content: [editorData],
      draft: false, // Set to false since we are editing/publishing
    });

    if (res?.success) {
      toast.success('Article updated successfully!');
      router.push(`/articles/${id}`);
    } else {
      toast.error(res?.error || 'Failed to update article');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-red-600" />
        <p className="text-xs font-bold text-black uppercase">Loading Article Studio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-black">
      <Toaster position="top-right" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3.5 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href={`/articles/${id}`}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-700 hover:border-gray-400 hover:text-black transition"
          >
            <ArrowLeftIcon className="h-4 w-4" /> Cancel
          </Link>
          <div className="h-4 w-[1px] bg-gray-300" />
          <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-red-600">
            <SparklesIcon className="h-4 w-4 text-red-600" /> Edit Article
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsPublishOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition"
          >
            <DocumentArrowUpIcon className="h-4 w-4" /> Save Settings & Update
          </button>
        </div>
      </header>

      {/* Main Left-Aligned Workspace */}
      <main className="mx-auto max-w-5xl px-6 pt-8">
        {/* Banner Upload */}
        <div className="mb-6">
          <BannerImageUpload
            value={banner}
            onChange={(url) => setBanner(url)}
            onDelete={() => setBanner('')}
            label="Article Header Banner"
            imgObj={imgObj}
            setImgObj={setImgObj}
          />
        </div>

        {/* Title Input Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm mb-6">
          <textarea
            rows={2}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article Title..."
            className="w-full resize-none text-2xl sm:text-4xl font-black tracking-tight text-black placeholder:text-gray-300 focus:outline-none"
          />
        </div>

        {/* Reusable Editor Component Canvas */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm min-h-[500px]">
          <ArticleEditor ref={editorRef} initialData={initialBlocks} />
        </div>
      </main>

      {/* Settings Modal Drawer */}
      {isPublishOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg space-y-4 rounded-2xl border border-gray-300 bg-white p-6 shadow-2xl animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-black">
                Article Settings & SEO
              </h3>
              <button
                type="button"
                onClick={() => setIsPublishOpen(false)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-black"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Description (max 300 in schema) */}
            <div>
              <label className="mb-1 block text-xs font-bold text-black uppercase tracking-wide">
                Short Description (Max 300 Characters)
              </label>
              <textarea
                rows={3}
                maxLength={300}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a 2-sentence summary for previews and search results..."
                className="w-full rounded-xl border border-gray-300 p-3 text-xs font-medium text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
              />
            </div>

            {/* Category Selection Dropdown */}
            <div>
              <label className="mb-1 block text-xs font-bold text-black uppercase tracking-wide">
                Primary Category
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs font-semibold text-black focus:border-red-600 focus:outline-none appearance-none"
                >
                  <option value="">Select a category...</option>
                  {availableCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                  <TagIcon className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Tag Management */}
            <div>
              <label className="mb-1 block text-xs font-bold text-black uppercase tracking-wide">
                Tags & Topics (Press Enter to Add, Max 6)
              </label>
              <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-gray-300 bg-gray-50 p-2.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-bold text-red-800 shadow-sm"
                  >
                    #{t}
                    <button type="button" onClick={() => handleRemoveTag(t)}>
                      <XMarkIcon className="h-3 w-3 hover:text-black" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Add keyword (e.g. DNS, BGP)..."
                  className="min-w-[120px] flex-1 bg-transparent p-1 text-xs font-semibold text-black placeholder:text-gray-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setIsPublishOpen(false)}
                className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-gray-700 hover:bg-gray-100"
              >
                Back to Canvas
              </button>
              <button
                type="button"
                onClick={onUpdateArticle}
                disabled={submitting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition"
              >
                <DocumentArrowUpIcon className="h-4 w-4" />
                {submitting ? 'Saving Changes...' : 'Update Article'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
