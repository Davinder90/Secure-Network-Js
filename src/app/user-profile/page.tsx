'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  GlobeAltIcon,
  ShieldCheckIcon,
  CommandLineIcon,
  DocumentTextIcon,
  PencilSquareIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  CheckBadgeIcon,
  KeyIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  XMarkIcon,
  CheckIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
  PlusIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { getLocalStorage } from '@/src/lib/helpers/localStorage';
import { handleGetUserProfile, handleChangeProfilePassword, handleUpdateUserProfile } from '@requests/user/auth';
import { UserProfileData} from "@interfaces/user/userProfile.interfaces"

const DEFAULT_USER: UserProfileData = {
  name: '',
  username: '',
  email: '',
  avatar: 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=Felix',
  bio: '',
  jobTitle: '',
  department: '',
  phone: '',
  role: 'user',
  isAllowed: false,
  isEmailVerified: false,
  productAccess: {
    networking: false,
    security: false,
    api: false,
    articles: false,
    cloud: false,
  },
  socialLinks: {},
  articleStats: {
    totalArticles: 0,
    totalReads: 0,
    totalLikes: 0,
  },
  articles: [],
  createdAt: new Date().toISOString(),
};

export default function UserProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'articles' | 'security'>('overview');
  const [user, setUser] = useState<UserProfileData>(DEFAULT_USER);

  // In-place Profile Edit Form State
  const [editFormData, setEditFormData] = useState({
    name: '',
    bio: '',
    jobTitle: '',
    department: '',
    phone: '',
    avatar: '',
    github: '',
    linkedin: '',
    website: '',
  });

  // Change Password Form State
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const stored = getLocalStorage('sn-userInfo');
    const token = stored?.access_token;

    try {
      const response = await handleGetUserProfile();
      if (response?.success && response?.result) {
        const profile = response.result;
        setUser({
          ...DEFAULT_USER,
          ...profile,
          productAccess: {
            ...DEFAULT_USER.productAccess,
            ...(profile.productAccess || {}),
          },
          socialLinks: {
            ...(profile.socialLinks || {}),
          },
          articleStats: {
            ...DEFAULT_USER.articleStats,
            ...(profile.articleStats || {}),
          },
          articles: profile.articles || [],
        });

        // Initialize Edit Form
        setEditFormData({
          name: profile.name || '',
          bio: profile.bio || '',
          jobTitle: profile.jobTitle || '',
          department: profile.department || '',
          phone: profile.phone || '',
          avatar: profile.avatar || DEFAULT_USER.avatar,
          github: profile.socialLinks?.github || '',
          linkedin: profile.socialLinks?.linkedin || '',
          website: profile.socialLinks?.website || '',
        });
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Roll new avatar seed
  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    const newAvatarUrl = `https://api.dicebear.com/7.x/notionists-neutral/svg?seed=${randomSeed}`;
    setEditFormData((prev) => ({ ...prev, avatar: newAvatarUrl }));
  };

  // Save Profile Handler (in-place)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
          name: editFormData.name,
          bio: editFormData.bio,
          jobTitle: editFormData.jobTitle,
          department: editFormData.department,
          phone: editFormData.phone,
          avatar: editFormData.avatar,
          socialLinks: {
            github: editFormData.github,
            linkedin: editFormData.linkedin,
            website: editFormData.website,
          },
        }
    const result = await handleUpdateUserProfile(data)

    if(result.success){
      return toast.success(result.message)
    }
    return toast.error(result.error)
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordState.currentPassword.length < 6) {
      toast.error('Current password must be at least 6 characters long');
      return;
    }
    
    if (passwordState.newPassword === passwordState.currentPassword) {
      toast.error("New password cannot be the same as the current password");
      return;
    }
    
    
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwordState.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    
    setPassLoading(true);
    const result = await handleChangeProfilePassword({currentPassword: passwordState.currentPassword, newPassword: passwordState.newPassword});
    setPassLoading(false);
    if(result.success){
      return toast.success(result.message)
    }
    return toast.error(result.error)
  };

  const productModules = [
    {
      key: 'networking',
      name: 'Networking Suite',
      badge: 'Diagnostics',
      desc: 'Real-time DNS lookups, traceroute probes, and IPv4/IPv6 subnet calculators.',
      path: '/networking',
      icon: GlobeAltIcon,
      enabled: user.productAccess.networking,
      accentBorder: 'border-blue-200 hover:border-blue-500',
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      key: 'security',
      name: 'Security Auditing',
      badge: 'Audit & TLS',
      desc: 'Inspect TLS certificates, evaluate open ports, and test HTTP security headers.',
      path: '/security',
      icon: ShieldCheckIcon,
      enabled: user.productAccess.security,
      accentBorder: 'border-red-200 hover:border-red-500',
      iconColor: 'text-red-600 bg-red-50 border-red-200',
    },
    {
      key: 'api',
      name: 'API Testing Client',
      badge: 'HTTP Suite',
      desc: 'Execute HTTP requests, inspect headers, validate payloads, and test endpoints.',
      path: '/api-client',
      icon: CommandLineIcon,
      enabled: user.productAccess.api,
      accentBorder: 'border-blue-200 hover:border-blue-500',
      iconColor: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      key: 'articles',
      name: 'Articles & Docs',
      badge: 'Knowledge',
      desc: 'Read and publish technical architecture articles and network protocol references.',
      path: '/articles',
      icon: DocumentTextIcon,
      enabled: user.productAccess.articles,
      accentBorder: 'border-gray-300 hover:border-gray-600',
      iconColor: 'text-black bg-gray-100 border-gray-300',
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[65vh] flex-col items-center justify-center gap-3 text-gray-500">
        <ArrowPathIcon className="h-7 w-7 animate-spin text-red-600" />
        <p className="text-sm font-semibold tracking-wide text-black">Loading User Profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-20 pt-6 text-black">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">

        {/* Top Profile Summary Card */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          {/* Header Accent Band */}
          <div className="h-16 w-full bg-gradient-to-r from-red-600 via-black to-blue-700" />

          <div className="px-6 pb-6 pt-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-8">
              {/* Avatar + Main Info */}
              <div className="flex items-end gap-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-xl border-4 border-white bg-gray-50 shadow-md">
                  <img
                    src={user.avatar || DEFAULT_USER.avatar}
                    alt={user.name || 'User'}
                    className="h-full w-full object-cover"
                  />
                  {user.isAllowed && (
                    <span
                      title="Account Active"
                      className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full bg-blue-600 ring-2 ring-white"
                    />
                  )}
                </div>

                <div className="mb-0.5">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold tracking-tight text-black">
                      {user.name || 'User Profile'}
                    </h1>
                    {user.isEmailVerified && (
                      <CheckBadgeIcon className="h-5 w-5 text-blue-600" title="Verified Account" />
                    )}
                  </div>
                  <p className="text-xs font-semibold text-gray-500">@{user.username || 'username'}</p>
                </div>
              </div>

              {/* In-Place Edit / Cancel Toggle Button */}
              <div className="flex items-center gap-2 self-stretch sm:self-auto mb-0.5">
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-bold transition shadow-sm ${
                    isEditing
                      ? 'border-gray-400 bg-gray-100 text-black hover:bg-gray-200'
                      : 'border-red-600 bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isEditing ? (
                    <>
                      <XMarkIcon className="h-4 w-4" /> Cancel Edit
                    </>
                  ) : (
                    <>
                      <PencilSquareIcon className="h-4 w-4" /> Edit Profile
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Metadata Strip */}
            <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-5 border-t border-gray-100 pt-3 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1 font-bold text-black">
                <span className="h-2 w-2 rounded-full bg-red-600" />
                ROLE: <span className="uppercase text-red-600">{user.role}</span>
              </span>
              {user.jobTitle && (
                <span className="flex items-center gap-1 font-medium">
                  <BriefcaseIcon className="h-4 w-4 text-gray-400" />
                  {user.jobTitle}
                </span>
              )}
              {user.department && (
                <span className="flex items-center gap-1 font-medium">
                  <BuildingOffice2Icon className="h-4 w-4 text-gray-400" />
                  {user.department}
                </span>
              )}
              <span className="flex items-center gap-1 font-medium text-gray-500">
                <CalendarDaysIcon className="h-4 w-4 text-gray-400" />
                Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Banner */}
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Articles</p>
            <p className="mt-1 text-2xl font-black text-black">
              {user.articleStats.totalArticles}
            </p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Total Reads</p>
            <div className="mt-1 flex items-center gap-1.5">
              <EyeIcon className="h-4 w-4 text-blue-600" />
              <p className="text-2xl font-black text-black">
                {user.articleStats.totalReads.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Appreciations</p>
            <div className="mt-1 flex items-center gap-1.5">
              <HeartIcon className="h-4 w-4 text-red-600" />
              <p className="text-2xl font-black text-black">
                {user.articleStats.totalLikes.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Authorization</p>
            <p
              className={`mt-1 text-sm font-bold uppercase ${
                user.isAllowed ? 'text-blue-600' : 'text-red-600'
              }`}
            >
              {user.isAllowed ? 'Active' : 'Restricted'}
            </p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="mt-6 flex border-b border-gray-300 text-sm font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`border-b-2 pb-3 px-5 transition-all ${
              activeTab === 'overview'
                ? 'border-red-600 text-red-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            {isEditing ? 'Edit Profile' : 'Overview'}
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`border-b-2 pb-3 px-5 transition-all ${
              activeTab === 'products'
                ? 'border-red-600 text-red-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            Product Access ({productModules.filter((p) => p.enabled).length})
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`border-b-2 pb-3 px-5 transition-all ${
              activeTab === 'articles'
                ? 'border-red-600 text-red-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            My Articles ({user.articles?.length || user.articleStats.totalArticles})
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`border-b-2 pb-3 px-5 transition-all ${
              activeTab === 'security'
                ? 'border-red-600 text-red-600 font-bold'
                : 'border-transparent text-gray-600 hover:text-black'
            }`}
          >
            Security
          </button>
        </div>

        {/* Tab Panels */}
        <div className="mt-5">

          {/* TAB 1: OVERVIEW & IN-PLACE EDITOR */}
          {activeTab === 'overview' && (
            <div>
              {isEditing ? (
                /* IN-PLACE EDIT FORM */
                <form onSubmit={handleSaveProfile} className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h2 className="text-sm font-bold text-black uppercase tracking-wide">Edit Profile Data</h2>
                    <button
                      type="button"
                      onClick={handleRandomizeAvatar}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1 text-xs font-bold text-black hover:bg-gray-100 transition"
                    >
                      <ArrowPathIcon className="h-3.5 w-3.5 text-blue-600" /> Randomize Avatar
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        required
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                        placeholder="+1 (555) 000-0000"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Job Title</label>
                      <input
                        type="text"
                        value={editFormData.jobTitle}
                        onChange={(e) => setEditFormData({ ...editFormData, jobTitle: e.target.value })}
                        placeholder="e.g. Lead Network Engineer"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-black mb-1">Department</label>
                      <input
                        type="text"
                        value={editFormData.department}
                        onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                        placeholder="e.g. Infrastructure Security"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-black mb-1">Bio / Profile Summary</label>
                    <textarea
                      rows={3}
                      value={editFormData.bio}
                      onChange={(e) => setEditFormData({ ...editFormData, bio: e.target.value })}
                      placeholder="Brief summary of your role or network expertise..."
                      className="w-full rounded-lg border border-gray-300 p-3 text-xs text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                    />
                  </div>

                  {/* Social Handles */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs font-bold text-black mb-2 uppercase tracking-wide">Social & External Links</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        type="url"
                        placeholder="GitHub URL"
                        value={editFormData.github}
                        onChange={(e) => setEditFormData({ ...editFormData, github: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                      <input
                        type="url"
                        placeholder="LinkedIn URL"
                        value={editFormData.linkedin}
                        onChange={(e) => setEditFormData({ ...editFormData, linkedin: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                      <input
                        type="url"
                        placeholder="Personal Website"
                        value={editFormData.website}
                        onChange={(e) => setEditFormData({ ...editFormData, website: e.target.value })}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-black focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition"
                    >
                      <CheckIcon className="h-4 w-4" /> Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                /* STATIC VIEW CARDS */
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-600">
                      Contact & Details
                    </h3>
                    <div className="mt-4 space-y-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-3">
                        <EnvelopeIcon className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-[11px] font-bold text-gray-500">Email Address</p>
                          <p className="font-mono font-semibold text-black">{user.email || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <PhoneIcon className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-[11px] font-bold text-gray-500">Contact Phone</p>
                          <p className="font-medium text-black">{user.phone || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-red-600">
                      Organizational Role
                    </h3>
                    <div className="mt-4 space-y-3 text-xs sm:text-sm">
                      <div className="flex items-center gap-3">
                        <BriefcaseIcon className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-[11px] font-bold text-gray-500">Title / Position</p>
                          <p className="font-semibold text-black">{user.jobTitle || 'Unassigned'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <BuildingOffice2Icon className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-[11px] font-bold text-gray-500">Department</p>
                          <p className="font-semibold text-black">{user.department || 'Unassigned'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {user.bio && (
                    <div className="sm:col-span-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-red-600">
                        About User
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-gray-800 sm:text-sm">
                        {user.bio}
                      </p>
                    </div>
                  )}

                  {/* Social links row */}
                  {Object.values(user.socialLinks).some(Boolean) && (
                    <div className="sm:col-span-2 flex flex-wrap gap-2">
                      {Object.entries(user.socialLinks).map(([platform, link]) =>
                        link ? (
                          <a
                            key={platform}
                            href={link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-bold text-black shadow-sm transition hover:border-red-600 hover:text-red-600"
                          >
                            <span className="capitalize">{platform}</span>
                            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 text-blue-600" />
                          </a>
                        ) : null
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRODUCT CATALOG */}
          {activeTab === 'products' && (
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3.5 text-xs text-blue-950 font-medium">
                <span className="font-bold">Product Permissions:</span> Click on any authorized workspace module to launch diagnostics directly.
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {productModules.map((prod) => {
                  const Icon = prod.icon;
                  return (
                    <div
                      key={prod.key}
                      className={`relative flex flex-col justify-between rounded-xl border bg-white p-5 transition-all shadow-sm ${
                        prod.enabled
                          ? `${prod.accentBorder} hover:shadow-md`
                          : 'border-gray-200 opacity-60'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${prod.iconColor}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                              prod.enabled
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {prod.enabled ? 'Authorized' : 'Locked'}
                          </span>
                        </div>

                        <h3 className="mt-4 text-sm font-bold text-black">{prod.name}</h3>
                        <p className="mt-1 text-xs leading-relaxed text-gray-600">{prod.desc}</p>
                      </div>

                      <div className="mt-5 border-t border-gray-100 pt-3">
                        {prod.enabled ? (
                          <Link
                            href={prod.path}
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-red-600 transition"
                          >
                            Launch Workspace
                            <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <span className="text-[11px] font-semibold text-gray-400">
                            Requires Administrator Approval
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: ARTICLES UI */}
          {activeTab === 'articles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div>
                  <h2 className="text-sm font-bold text-black">Published Articles & Guides</h2>
                  <p className="text-xs text-gray-500">Manage, read, and write technical network write-ups.</p>
                </div>
                <Link
                  href="/articles/create"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition"
                >
                  <PlusIcon className="h-4 w-4" /> Write Article
                </Link>
              </div>

              {user.articles && user.articles.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {user.articles.map((art, idx) => (
                    <div
                      key={art._id || art.articleId || idx}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-400 transition"
                    >
                      <div className="space-y-1">
                        <Link
                          href={`/articles/${art.articleId || art._id}`}
                          className="text-sm font-bold text-black hover:text-red-600 transition line-clamp-1"
                        >
                          {art.title}
                        </Link>
                        {art.description && (
                          <p className="text-xs text-gray-600 line-clamp-2 max-w-xl">
                            {art.description}
                          </p>
                        )}
                        <p className="text-[11px] font-medium text-gray-400">
                          Published: {art.publishedAt ? new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-bold text-gray-600 border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto justify-end">
                        <span className="inline-flex items-center gap-1">
                          <EyeIcon className="h-4 w-4 text-blue-600" /> {art.activity?.totalReads || 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <HeartIcon className="h-4 w-4 text-red-600" /> {art.activity?.totalLikes || 0}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <ChatBubbleLeftRightIcon className="h-4 w-4 text-gray-400" /> {art.activity?.totalComments || 0}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Fallback Article Feed */
                <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                  <DocumentTextIcon className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-xs font-bold text-black">No articles published yet</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">Share technical networking tips or tutorials with the platform community.</p>
                  <Link
                    href="/articles/create"
                    className="mt-4 inline-flex items-center gap-1 rounded-lg border border-red-600 bg-white px-3 py-1.5 text-xs font-bold text-red-600 hover:bg-red-50 transition"
                  >
                    <PlusIcon className="h-3.5 w-3.5" /> Start First Draft
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SECURITY & CHANGE PASSWORD */}
          {activeTab === 'security' && (
            <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-600 border border-red-200">
                  <KeyIcon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-black">Change Account Password</h2>
                  <p className="text-xs text-gray-500">Keep your network platform account protected.</p>
                </div>
              </div>

              <form onSubmit={handleChangePassword} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-black mb-1">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      value={passwordState.currentPassword}
                      onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-2 text-gray-400 hover:text-black"
                    >
                      {showPass ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">New Password</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwordState.newPassword}
                    onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                  <p className="mt-1 text-[11px] font-semibold text-gray-500">Must be at least 6 characters long.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-black mb-1">Confirm New Password</label>
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwordState.confirmPassword}
                    onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passLoading}
                    className={`inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-gray-800 active:scale-95 ${
                      passLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <LockClosedIcon className="h-4 w-4 text-red-500" />
                    {passLoading ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
