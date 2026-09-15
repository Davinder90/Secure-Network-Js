'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  PhotoIcon,
  TrashIcon,
  ArrowPathIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { BannerImageUploadProps } from '@/src/lib/interfaces/article/Image.Interface';
import {
  handleUploadImage,
  handleReplaceImage,
  handleDeleteImage,
  handleGetImage,
} from '@/src/requests/articles/image';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/redux-store/store';

export const BannerImageUpload: React.FC<BannerImageUploadProps> = ({
  value,
  imgObj,
  setImgObj,
  onChange,
  onDelete,
  label = 'Article Header Banner',
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [urlInputMode, setUrlInputMode] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>('');
  const [previewSrc, setPreviewSrc] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const username = useSelector((state: RootState) => state.user.name) as string;

  // 💡 Resolve preview based on value (Handles Edit Mode vs Empty State)
  useEffect(() => {
    // 1. If value is empty or null, clear preview and do NOT make an API call
    if (!value || typeof value !== 'string' || !value.trim()) {
      setPreviewSrc('');
      return;
    }

    // 2. If value is already a direct URL or local Base64 string, set immediately
    if (value.startsWith('data:') || value.startsWith('http://') || value.startsWith('https://')) {
      setPreviewSrc(value);
      return;
    }

    // 3. Otherwise, value is a stored filename (Edit Mode) -> Fetch Base64 from backend
    const fetchExistingImage = async () => {
      console.log(value);
      setIsLoadingPreview(true);
      const cleanFilename = value.includes('filename=')
        ? new URLSearchParams(value.split('?')[0]).get('filename') || value
        : value;

      const res = await handleGetImage(cleanFilename);

      if (res?.success && res.result?.base64Image) {
        setPreviewSrc(res.result.base64Image);

        if (typeof setImgObj === 'function' && !imgObj?.filename) {
          setImgObj((prev) => ({
            ...prev,
            filename: cleanFilename,
            base64Image: res.result.base64Image,
          }));
        }
      } else {
        setPreviewSrc('');
      }
      setIsLoadingPreview(false);
    };

    fetchExistingImage();
  }, [value, setImgObj, imgObj?.filename]);

  // Upload & Replace file handler
  const handleFileChange = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file (PNG, JPG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB');
      return;
    }

    setIsUploading(true);
    const isReplacing = Boolean(imgObj?.filename);
    const toastId = toast.loading(isReplacing ? 'Replacing banner...' : 'Uploading banner...');

    try {
      // Local instant preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewSrc(reader.result as string);
      };
      reader.readAsDataURL(file);

      const formData = new FormData();
      formData.append('file', file);

      // Call dedicated replace or upload API
      const res = isReplacing
        ? await handleReplaceImage(formData, username, imgObj?.filename || '')
        : await handleUploadImage(formData, username);

      if (res?.success && res.result?.files?.[0]) {
        const resfile = res.result.files[0];

        if (typeof setImgObj === 'function') {
          setImgObj((prev) => ({
            ...prev,
            filename: resfile.filename,
            url: resfile.url,
            base64Image: resfile.base64Image,
          }));
        }

        // Pass clean filename to parent form state
        onChange(resfile.filename);
        setPreviewSrc(resfile.base64Image || resfile.url);
        toast.success(isReplacing ? 'Banner replaced!' : 'Banner uploaded!', { id: toastId });
      } else {
        toast.error(res?.message || 'Failed to upload image', { id: toastId });
      }
    } catch {
      toast.error('Failed to process banner image', { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Delete Action
  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || isUploading) return;

    const toastId = toast.loading('Removing banner...');
    try {
      const filename = imgObj?.filename || value;
      if (filename && !filename.startsWith('data:') && !filename.startsWith('http')) {
        await handleDeleteImage(filename);
      }

      if (onDelete) {
        await onDelete();
      }

      onChange('');
      setPreviewSrc('');
      if (typeof setImgObj === 'function') {
        setImgObj({});
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Banner removed', { id: toastId });
    } catch {
      toast.error('Error removing banner', { id: toastId });
    }
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    onChange(customUrl.trim());
    setPreviewSrc(customUrl.trim());
    setCustomUrl('');
    setUrlInputMode(false);
    toast.success('Image link attached');
  };

  return (
    <div className="w-full space-y-2">
      {/* Label and Mode Switcher */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-black">
          {label}
        </label>
        {!previewSrc && (
          <button
            type="button"
            onClick={() => setUrlInputMode(!urlInputMode)}
            className="text-[11px] font-bold text-red-600 hover:text-red-700 underline"
          >
            {urlInputMode ? 'Upload from device' : 'Paste image URL'}
          </button>
        )}
      </div>

      {/* Manual URL Input */}
      {!previewSrc && urlInputMode ? (
        <form onSubmit={handleApplyUrl} className="flex gap-2 rounded-xl border border-gray-300 bg-white p-2 shadow-sm">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
            className="flex-1 bg-transparent px-2 text-xs font-semibold text-black placeholder:text-gray-400 focus:outline-none"
            autoFocus
          />
          <button
            type="submit"
            className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition"
          >
            Attach
          </button>
        </form>
      ) : isLoadingPreview ? (
        /* Loading Skeleton while fetching from backend */
        <div className="flex h-64 sm:h-80 w-full items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
          <ArrowPathIcon className="h-7 w-7 animate-spin text-red-600" />
        </div>
      ) : previewSrc ? (
        /* Image Preview Box */
        <div className="relative group overflow-hidden rounded-2xl border border-gray-300 bg-gray-50 shadow-sm transition-all hover:border-gray-400">
          <img
            src={previewSrc}
            alt={label}
            className="h-64 sm:h-80 w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
          />

          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isUploading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black shadow-lg hover:bg-gray-100 active:scale-95 transition"
            >
              <ArrowUpTrayIcon className="h-4 w-4 text-black" />
              Replace Image
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={disabled || isUploading}
              className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-lg hover:bg-red-700 active:scale-95 transition"
            >
              <TrashIcon className="h-4 w-4" />
              Delete
            </button>
          </div>

          <span className="absolute top-3 left-3 rounded-md bg-black/75 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
            Active Banner
          </span>
        </div>
      ) : (
        /* Empty Upload Dropzone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-red-600 bg-red-50/60 scale-[0.99]'
              : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50/50'
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <ArrowPathIcon className="h-8 w-8 animate-spin text-red-600" />
              <p className="text-xs font-bold text-black uppercase tracking-wide">Processing Banner...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-red-200 bg-red-50 text-red-600 mb-3 shadow-inner">
                <PhotoIcon className="h-6 w-6" />
              </div>
              <p className="text-xs font-bold text-black sm:text-sm">
                Click to upload <span className="text-gray-500 font-normal">or drag & drop banner</span>
              </p>
              <p className="mt-1 text-[11px] font-medium text-gray-400">
                PNG, JPG, JPEG, or WebP (Max 5MB)
              </p>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/webp"
        hidden
        disabled={disabled || isUploading}
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileChange(e.target.files[0]);
          }
        }}
      />
    </div>
  );
};

export default BannerImageUpload;
