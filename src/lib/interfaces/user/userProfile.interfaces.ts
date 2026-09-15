export interface ArticleItem {
  _id?: string;
  articleId?: string;
  title: string;
  description?: string;
  banner?: string;
  publishedAt?: string;
  activity?: {
    totalLikes?: number;
    totalReads?: number;
    totalComments?: number;
  };
}

export interface UserProfileData {
  id?: string;
  name: string;
  username: string;
  email: string;
  avatar: string;
  bio?: string;
  jobTitle?: string;
  department?: string;
  phone?: string;
  role: 'user' | 'administrator';
  isAllowed: boolean;
  isEmailVerified: boolean;
  productAccess: {
    networking: boolean;
    security: boolean;
    api: boolean;
    articles: boolean;
    cloud: boolean;
  };
  socialLinks: {
    github?: string;
    twitter?: string;
    linkedin?: string;
    website?: string;
  };
  articleStats: {
    totalArticles: number;
    totalReads: number;
    totalLikes: number;
  };
  articles?: ArticleItem[];
  createdAt: string;
}
