'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/redux-store/store';
import toast from 'react-hot-toast';

export const useProductAccess = (
  requiredProduct?: 'networking' | 'security' | 'api' | 'articles' | 'cloud',
  allowReadOnlyForArticles: boolean = false
) => {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state: RootState) => state.user);

  const isAdmin = user.role === 'administrator';
  const productAccess = user.productAccess;

  useEffect(() => {
    if (!requiredProduct) return;
    if (isAdmin) return; // Admins bypass all module checks

    const hasAccess = productAccess?.[requiredProduct] ?? false;

    // Rule for Articles: Read-only paths are allowed unless entering write/edit paths
    if (requiredProduct === 'articles' && allowReadOnlyForArticles) {
      const isRestrictedWritingPath =
        pathname === '/articles/create' || pathname.endsWith('/edit');

      if (!hasAccess && isRestrictedWritingPath) {
        toast.error('You do not have permission to create or edit articles.');
        router.replace('/articles');
      }
      return;
    }

    // Standard Rule for operational tools (networking, security, api)
    if (!hasAccess) {
      toast.error(`You are not authorized to access the ${requiredProduct} module.`);
      router.replace('/');
    }
  }, [requiredProduct, allowReadOnlyForArticles, isAdmin, productAccess, pathname, router]);

  return {
    canWriteArticles: isAdmin || (productAccess?.articles ?? false),
    hasAccess: isAdmin || (requiredProduct ? (productAccess?.[requiredProduct] ?? false) : true),
  };
};
