'use client';

import React, { useState, useEffect } from 'react';
import { PhotoIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { handleGetImage } from '@/src/requests/articles/image';

interface AsyncBannerProps {
  banner?: string;
  alt: string;
  className?: string; // This can remain customizable, but we secure defaults
}

export const AsyncBanner: React.FC<AsyncBannerProps> = ({
  banner,
  alt,
  className = '',
}) => {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!banner || typeof banner !== 'string' || !banner.trim()) {
      setImageSrc('');
      return;
    }

    if (banner.startsWith('http://') || banner.startsWith('https://') || banner.startsWith('data:')) {
      setImageSrc(banner);
      return;
    }

    setLoading(true);
    const cleanFilename = banner.includes('filename=')
      ? new URLSearchParams(banner.split('?')[0]).get('filename') || banner
      : banner;

    handleGetImage(cleanFilename.trim())
      .then((res) => {
        if (res?.success && res.result?.base64Image) {
          setImageSrc(res.result.base64Image);
        } else {
          setImageSrc('');
        }
      })
      .catch(() => {
        setImageSrc('');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [banner]);

  // Combined responsive CSS definitions
  const containerClasses = `
    relative 
    w-full 
    max-w-full 
    overflow-hidden 
    rounded-2xl 
    border 
    border-gray-200 
    bg-gray-50 
    aspect-[16/9] 
    sm:aspect-[21/9] 
    md:max-h-[380px]
    flex 
    items-center 
    justify-center
    ${className}
  `.trim();

  if (loading) {
    return (
      <div className={`${containerClasses} animate-pulse text-gray-400`}>
        <ArrowPathIcon className="h-6 w-6 animate-spin text-red-600" />
      </div>
    );
  }

  if (!banner || !imageSrc) {
    return (
      <div className={`${containerClasses} text-gray-400`}>
        <PhotoIcon className="h-8 w-8 opacity-30" />
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <img
        src={imageSrc}
        alt={alt}
        className="w-full h-full object-cover object-center max-w-full block"
        loading="lazy"
      />
    </div>
  );
};

export default AsyncBanner;
