'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import {
  UsersIcon,
  DocumentTextIcon,
  HashtagIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  PencilSquareIcon,
  ClockIcon,
  SparklesIcon,
  GlobeAltIcon,
  CommandLineIcon,
  CloudIcon,
  MagnifyingGlassIcon,
  TagIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import {
  handleGetAdminMetrics,
  handleGetAdminUsers,
  handleUpdateUserAccess,
  handleGetAdminAuditLogs,
} from '@/src/requests/admin/admin.requests';
import {
  handleGetCategories,
  handleCreateCategory,
  handleDeleteCategory,
  handleUpdateCategory,
} from '@/src/requests/articles/articles';

/* -------------------------------------------------------------------------- */
/*                                INTERFACES                                  */
/* -------------------------------------------------------------------------- */

interface AdminMetrics {
  totalUsers: number;
  pendingApprovals: number;
  totalArticles: number;
  totalCategories: number;
  totalComments: number;
  totalReads: number;
}

interface UserAccount {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'user' | 'administrator';
  status: 'pending' | 'active' | 'suspended';
  isAllowed: boolean;
  jobTitle?: string;
  department?: string;
  productAccess: {
    networking: boolean;
    security: boolean;
    api: boolean;
    articles: boolean;
    cloud: boolean;
  };
  articleStats?: {
    totalArticles: number;
    totalReads: number;
  };
  createdAt: string;
}

interface CategoryItem {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  isFeatured: boolean;
  isActive: boolean;
  articleCount: number;
}

interface AuditLogItem {
  id: string;
  actor?: {
    name: string;
    username: string;
    avatar: string;
  };
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, any>;
  createdAt: string;
}

/* ========================================================================== */
/*                   SUBCOMPONENT 1: OVERVIEW & ANALYTICS                     */
/* ========================================================================== */

const AdminOverviewTab = ({
  metrics,
  onNavigateTab,
}: {
  metrics: AdminMetrics;
  onNavigateTab: (tab: 'users' | 'categories' | 'audit') => void;
}) => (
  <div className="space-y-8">
    {/* KPI Cards Grid */}
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Users</p>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-black">{metrics.totalUsers}</span>
          <UsersIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50/50 p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-red-700">Pending Review</p>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-red-600">{metrics.pendingApprovals}</span>
          <span className="h-2.5 w-2.5 rounded-full bg-red-600 animate-pulse" />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Articles</p>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-black">{metrics.totalArticles}</span>
          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Reads</p>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-blue-600">{metrics.totalReads.toLocaleString()}</span>
          <EyeIcon className="h-5 w-5 text-blue-600" />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Categories</p>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-black">{metrics.totalCategories}</span>
          <HashtagIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Comments</p>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-black text-black">{metrics.totalComments}</span>
          <SparklesIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
    </div>

    {/* Pending Approvals Callout */}
    {metrics.pendingApprovals > 0 && (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 font-bold">
            !
          </div>
          <div>
            <h3 className="text-sm font-black text-black sm:text-base">
              {metrics.pendingApprovals} User Account(s) Awaiting Review
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              New team members have registered and cannot access diagnostic tools until authorized.
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateTab('users')}
          className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-red-700 active:scale-95 transition whitespace-nowrap"
        >
          Review Pending
        </button>
      </div>
    )}

    {/* Quick Shortcuts */}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <button
        onClick={() => onNavigateTab('users')}
        className="flex flex-col items-start rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-gray-400"
      >
        <UsersIcon className="h-6 w-6 text-black" />
        <h4 className="mt-3 text-sm font-bold text-black">Manage User Allowances</h4>
        <p className="mt-1 text-xs text-gray-500">Enable modules or change system roles</p>
      </button>

      <button
        onClick={() => onNavigateTab('categories')}
        className="flex flex-col items-start rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-gray-400"
      >
        <HashtagIcon className="h-6 w-6 text-red-600" />
        <h4 className="mt-3 text-sm font-bold text-black">Manage Categories & Tags</h4>
        <p className="mt-1 text-xs text-gray-500">Edit taxonomies, feature topics, and inspect articles</p>
      </button>

      <button
        onClick={() => onNavigateTab('audit')}
        className="flex flex-col items-start rounded-2xl border border-gray-200 bg-white p-5 text-left shadow-sm transition hover:border-gray-400"
      >
        <ClockIcon className="h-6 w-6 text-blue-600" />
        <h4 className="mt-3 text-sm font-bold text-black">Review Security Traces</h4>
        <p className="mt-1 text-xs text-gray-500">Inspect immutable administrative action history</p>
      </button>
    </div>
  </div>
);

/* ========================================================================== */
/*                   SUBCOMPONENT 2: USER GOVERNANCE                          */
/* ========================================================================== */

const UserGovernanceTab = ({
  users,
  userSearchTerm,
  setUserSearchTerm,
  userStatusFilter,
  setUserStatusFilter,
  onToggleAllowance,
  onSelectUserForModal,
}: {
  users: UserAccount[];
  userSearchTerm: string;
  setUserSearchTerm: (s: string) => void;
  userStatusFilter: string;
  setUserStatusFilter: (s: string) => void;
  onToggleAllowance: (u: UserAccount) => void;
  onSelectUserForModal: (u: UserAccount) => void;
}) => (
  <div className="space-y-4">
    {/* Filter Toolbar */}
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Filter by name, username, or email..."
          value={userSearchTerm}
          onChange={(e) => setUserSearchTerm(e.target.value)}
          className="w-72 rounded-xl border border-gray-300 bg-white px-3.5 py-2 text-xs font-semibold text-black placeholder:text-gray-400 focus:border-red-600 focus:outline-none"
        />

        <div className="flex rounded-xl border border-gray-300 bg-white p-1 text-xs font-bold">
          {['all', 'pending', 'active', 'suspended'].map((status) => (
            <button
              key={status}
              onClick={() => setUserStatusFilter(status)}
              className={`rounded-lg px-3 py-1 capitalize transition ${
                userStatusFilter === status ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <span className="text-xs font-bold text-gray-500">
        Showing {users.length} accounts
      </span>
    </div>

    {/* Users Table */}
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-5 py-3.5">User Identity</th>
            <th className="px-4 py-3.5">Role</th>
            <th className="px-4 py-3.5">Status</th>
            <th className="px-4 py-3.5">Department / Title</th>
            <th className="px-4 py-3.5">Modules Granted</th>
            <th className="px-4 py-3.5 text-center">Platform Access</th>
            <th className="px-4 py-3.5 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-medium">
          {users.map((user) => (
            <tr key={user.id} className="transition hover:bg-gray-50/60">
              <td className="px-5 py-4">
                <div className="font-bold text-black">{user.name}</div>
                <div className="font-mono text-[11px] text-gray-400">@{user.username}</div>
                <div className="font-mono text-[10px] text-gray-500 truncate max-w-xs">{user.email}</div>
              </td>

              <td className="px-4 py-4">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    user.role === 'administrator'
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {user.role}
                </span>
              </td>

              <td className="px-4 py-4">
                <span
                  className={`rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                    user.status === 'active'
                      ? 'bg-blue-100 text-blue-800'
                      : user.status === 'pending'
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {user.status || (user.isAllowed ? 'active' : 'pending')}
                </span>
              </td>

              <td className="px-4 py-4 text-gray-600">
                <div>{user.jobTitle || '—'}</div>
                <div className="text-[10px] text-gray-400">{user.department || '—'}</div>
              </td>

              <td className="px-4 py-4">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <span
                    title="Networking Suite"
                    className={`rounded p-1 ${user.productAccess?.networking ? 'bg-blue-100 text-blue-700' : 'opacity-20'}`}
                  >
                    <GlobeAltIcon className="h-3.5 w-3.5" />
                  </span>
                  <span
                    title="Security Tools"
                    className={`rounded p-1 ${user.productAccess?.security ? 'bg-red-100 text-red-700' : 'opacity-20'}`}
                  >
                    <ShieldCheckIcon className="h-3.5 w-3.5" />
                  </span>
                  <span
                    title="API Testing"
                    className={`rounded p-1 ${user.productAccess?.api ? 'bg-purple-100 text-purple-700' : 'opacity-20'}`}
                  >
                    <CommandLineIcon className="h-3.5 w-3.5" />
                  </span>
                  <span
                    title="Articles & Publishing"
                    className={`rounded p-1 ${user.productAccess?.articles ? 'bg-amber-100 text-amber-700' : 'opacity-20'}`}
                  >
                    <DocumentTextIcon className="h-3.5 w-3.5" />
                  </span>
                </div>
              </td>

              <td className="px-4 py-4 text-center">
                <button
                  type="button"
                  onClick={() => onToggleAllowance(user)}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-sm transition active:scale-95 ${
                    user.isAllowed
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'border border-red-300 bg-red-50 text-red-700 hover:bg-red-100'
                  }`}
                >
                  {user.isAllowed ? (
                    <>
                      <CheckCircleIcon className="h-3.5 w-3.5" /> Granted
                    </>
                  ) : (
                    <>
                      <XCircleIcon className="h-3.5 w-3.5" /> Restricted
                    </>
                  )}
                </button>
              </td>

              <td className="px-4 py-4 text-right">
                <button
                  onClick={() => onSelectUserForModal(JSON.parse(JSON.stringify(user)))}
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-black transition"
                  title="Edit user entitlements"
                >
                  <PencilSquareIcon className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan={7} className="py-12 text-center text-xs font-bold text-gray-400">
                No users found matching query
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

/* ========================================================================== */
/*             SUBCOMPONENT 3: CATEGORIES & TAXONOMY DASHBOARD                */
/* ========================================================================== */

const CategoryManagementTab = ({
  categories,
  categorySearch,
  setCategorySearch,
  categoryFilter,
  setCategoryFilter,
  onOpenCreateModal,
  onOpenEditModal,
  onToggleFeatured,
  onToggleActive,
  onDeleteCategory,
}: {
  categories: CategoryItem[];
  categorySearch: string;
  setCategorySearch: (s: string) => void;
  categoryFilter: 'all' | 'featured' | 'active' | 'disabled';
  setCategoryFilter: (f: 'all' | 'featured' | 'active' | 'disabled') => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (cat: CategoryItem) => void;
  onToggleFeatured: (cat: CategoryItem) => void;
  onToggleActive: (cat: CategoryItem) => void;
  onDeleteCategory: (id: string) => void;
}) => {
  // Filter categories by search and status
  const filteredCategories = categories.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
      c.slug.toLowerCase().includes(categorySearch.toLowerCase()) ||
      c.description?.toLowerCase().includes(categorySearch.toLowerCase());

    if (!matchesSearch) return false;
    if (categoryFilter === 'featured') return c.isFeatured;
    if (categoryFilter === 'active') return c.isActive;
    if (categoryFilter === 'disabled') return !c.isActive;
    return true;
  });

  const featuredCount = categories.filter((c) => c.isFeatured).length;
  const activeCount = categories.filter((c) => c.isActive).length;

  return (
    <div className="space-y-4">
      {/* Category Stats Strip */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Topics</p>
          <p className="mt-1 text-xl font-black text-black">{categories.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Pinned / Featured</p>
          <p className="mt-1 text-xl font-black text-amber-600">{featuredCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Active Tags</p>
          <p className="mt-1 text-xl font-black text-blue-600">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Disabled Tags</p>
          <p className="mt-1 text-xl font-black text-gray-500">{categories.length - activeCount}</p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center pt-2">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by topic name or slug..."
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              className="w-64 rounded-xl border border-gray-300 bg-white pl-9 pr-3 py-2 text-xs font-semibold text-black placeholder:text-gray-400 focus:border-red-600 focus:outline-none"
            />
            <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-2.5 text-gray-400" />
          </div>

          <div className="flex rounded-xl border border-gray-300 bg-white p-1 text-xs font-bold">
            {(['all', 'featured', 'active', 'disabled'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setCategoryFilter(filterKey)}
                className={`rounded-lg px-3 py-1 capitalize transition ${
                  categoryFilter === filterKey ? 'bg-black text-white' : 'text-gray-600 hover:text-black'
                }`}
              >
                {filterKey}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition self-start sm:self-auto"
        >
          <PlusIcon className="h-4 w-4" /> Add Topic Category
        </button>
      </div>

      {/* Categories Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-5 py-3.5">Category Name</th>
              <th className="px-4 py-3.5">URL Slug</th>
              <th className="px-4 py-3.5">Description</th>
              <th className="px-4 py-3.5 text-center">Articles Tagged</th>
              <th className="px-4 py-3.5 text-center">Featured Status</th>
              <th className="px-4 py-3.5 text-center">Visibility</th>
              <th className="px-4 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 font-medium">
            {filteredCategories.map((cat) => (
              <tr key={cat.id || cat._id} className="transition hover:bg-gray-50/60">
                <td className="px-5 py-3.5">
                  <div className="font-bold text-black flex items-center gap-1.5">
                    <TagIcon className="h-3.5 w-3.5 text-red-600" />
                    {cat.name}
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-gray-400">/{cat.slug}</td>
                <td className="px-4 py-3.5 text-gray-500 truncate max-w-xs">{cat.description || '—'}</td>
                <td className="px-4 py-3.5 text-center font-bold text-black">{cat.articleCount || 0}</td>

                {/* Instant Featured Toggle Button */}
                <td className="px-4 py-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleFeatured(cat)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition shadow-sm active:scale-95 ${
                      cat.isFeatured
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    <StarIcon className={`h-3 w-3 ${cat.isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                    {cat.isFeatured ? 'Pinned' : 'Normal'}
                  </button>
                </td>

                {/* Instant Active Toggle Button */}
                <td className="px-4 py-3.5 text-center">
                  <button
                    type="button"
                    onClick={() => onToggleActive(cat)}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold transition shadow-sm active:scale-95 ${
                      cat.isActive
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-red-100 text-red-700 border border-red-200'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${cat.isActive ? 'bg-blue-600' : 'bg-red-500'}`} />
                    {cat.isActive ? 'Active' : 'Disabled'}
                  </button>
                </td>

                {/* Actions: Edit & Delete */}
                <td className="px-4 py-3.5 text-right space-x-1">
                  <button
                    onClick={() => onOpenEditModal(cat)}
                    className="rounded p-1 text-gray-400 hover:text-black transition"
                    title="Edit category"
                  >
                    <PencilSquareIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteCategory(cat.id || (cat._id as string))}
                    className="rounded p-1 text-gray-400 hover:text-red-600 transition"
                    title="Delete category"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}

            {filteredCategories.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-xs font-bold text-gray-400">
                  No topic categories match your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ========================================================================== */
/*                   SUBCOMPONENT 4: SECURITY AUDIT TRAIL                     */
/* ========================================================================== */

const SecurityAuditTab = ({
  auditLogs,
  auditPage,
  auditTotalPages,
  setAuditPage,
}: {
  auditLogs: AuditLogItem[];
  auditPage: number;
  auditTotalPages: number;
  setAuditPage: React.Dispatch<React.SetStateAction<number>>;
}) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-sm font-bold text-black uppercase tracking-wide">
          Immutable Security Event Log
        </h3>
        <p className="text-xs text-gray-500">Every administrative permission change or deletion is logged here.</p>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
        <button
          disabled={auditPage <= 1}
          onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 shadow-sm disabled:opacity-40"
        >
          Prev
        </button>
        <span>
          Page {auditPage} of {auditTotalPages}
        </span>
        <button
          disabled={auditPage >= auditTotalPages}
          onClick={() => setAuditPage((p) => p + 1)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 shadow-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>

    {/* Audit Table */}
    <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
          <tr>
            <th className="px-5 py-3.5">Admin Actor</th>
            <th className="px-4 py-3.5">Action Executed</th>
            <th className="px-4 py-3.5">Target Type</th>
            <th className="px-4 py-3.5">Details</th>
            <th className="px-4 py-3.5 text-right">Timestamp</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 font-medium">
          {auditLogs.map((log) => (
            <tr key={log.id} className="transition hover:bg-gray-50/60">
              <td className="px-5 py-3.5">
                <div className="font-bold text-black">{log.actor?.name || 'Root Administrator'}</div>
                <div className="font-mono text-[10px] text-gray-400">@{log.actor?.username || 'system'}</div>
              </td>
              <td className="px-4 py-3.5">
                <span className="rounded border border-red-200 bg-red-50 px-2 py-0.5 font-mono text-[10px] font-bold text-red-700">
                  {log.action}
                </span>
              </td>
              <td className="px-4 py-3.5 font-bold uppercase text-gray-600">{log.targetType}</td>
              <td className="px-4 py-3.5 font-mono text-[11px] text-gray-500">
                {log.details ? JSON.stringify(log.details) : '—'}
              </td>
              <td className="px-4 py-3.5 text-right font-mono text-[11px] text-gray-400">
                {new Date(log.createdAt).toLocaleString()}
              </td>
            </tr>
          ))}

          {auditLogs.length === 0 && (
            <tr>
              <td colSpan={5} className="py-12 text-center text-xs font-bold text-gray-400">
                No security audit logs recorded yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

/* ========================================================================== */
/*                MODAL 1: USER ENTITLEMENTS & ROLES DRAWER                   */
/* ========================================================================== */

const UserEntitlementsModal = ({
  user,
  onClose,
  onSave,
}: {
  user: UserAccount;
  onClose: () => void;
  onSave: (u: UserAccount) => void;
}) => {
  const [formData, setFormData] = useState<UserAccount>({ ...user });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wide text-black">
              User Permissions & Role
            </h3>
            <p className="text-xs text-gray-500">@{formData.username}</p>
          </div>
          <button onClick={onClose}>
            <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-black" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-black mb-1">Account Role</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as 'user' | 'administrator',
                })
              }
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-semibold text-black focus:outline-none"
            >
              <option value="user">User (Standard)</option>
              <option value="administrator">Administrator</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-black mb-1">Account Status</label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as 'pending' | 'active' | 'suspended',
                  isAllowed: e.target.value === 'active',
                })
              }
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-semibold text-black focus:outline-none"
            >
              <option value="active">Active (Authorized)</option>
              <option value="pending">Pending Review</option>
              <option value="suspended">Suspended (Blocked)</option>
            </select>
          </div>
        </div>

        {/* Granular Module Checkboxes */}
        <div className="border-t border-gray-100 pt-3">
          <label className="block text-xs font-bold text-black mb-2 uppercase tracking-wide">
            Module Entitlements
          </label>

          <div className="space-y-2">
            {[
              { key: 'networking', label: 'Networking Suite (DNS, Ping, Traceroute)' },
              { key: 'security', label: 'Security Tools (TLS inspection, Port probe)' },
              { key: 'api', label: 'API Testing Client & Runner' },
              { key: 'articles', label: 'Technical Publishing & Knowledge Base' },
              { key: 'cloud', label: 'Cloud Topology & Orchestration' },
            ].map((mod) => (
              <label key={mod.key} className="flex items-center gap-2 text-xs font-medium text-gray-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(formData.productAccess?.[mod.key as keyof typeof formData.productAccess])}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      productAccess: {
                        ...formData.productAccess,
                        [mod.key]: e.target.checked,
                      },
                    })
                  }
                  className="rounded text-red-600 focus:ring-red-500"
                />
                <span>{mod.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(formData)}
            className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition"
          >
            Save Entitlements
          </button>
        </div>
      </div>
    </div>
  );
};

/* ========================================================================== */
/*                MODAL 2: CATEGORY CREATE & EDIT DRAWER                      */
/* ========================================================================== */

interface CategoryModalProps {
  initialData?: CategoryItem | null;
  onClose: () => void;
  onSubmit: (data: { id?: string; name: string; slug?: string; description?: string; isFeatured: boolean; isActive?: boolean }) => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  initialData,
  onClose,
  onSubmit,
}) => {
  const isEditing = Boolean(initialData);

  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured ?? false);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Category name is required');
      return;
    }
    onSubmit({
      id: initialData?.id || initialData?._id,
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim(),
      isFeatured,
      isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-sm font-black uppercase tracking-wide text-black">
            {isEditing ? 'Edit Topic Category' : 'New Topic Category'}
          </h3>
          <button type="button" onClick={onClose}>
            <XCircleIcon className="h-5 w-5 text-gray-400 hover:text-black" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-bold text-black mb-1">Category Title</label>
          <input
            type="text"
            required
            placeholder="e.g. Zero-Trust Architecture"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-semibold text-black focus:border-red-600 focus:outline-none"
          />
        </div>

        {isEditing && (
          <div>
            <label className="block text-xs font-bold text-black mb-1">Custom URL Slug</label>
            <input
              type="text"
              placeholder="e.g. zero-trust-architecture"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-mono text-gray-600 focus:border-red-600 focus:outline-none"
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-black mb-1">Summary / Context</label>
          <textarea
            rows={3}
            placeholder="Short description of what articles belong here..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-gray-300 p-2.5 text-xs font-medium text-black focus:border-red-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-gray-100">
          <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded text-red-600 focus:ring-red-500"
            />
            <span>Pin as Featured / Priority Topic</span>
          </label>

          {isEditing && (
            <label className="flex items-center gap-2 text-xs font-bold text-gray-800 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Active</span>
            </label>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 transition"
          >
            {isEditing ? 'Save Changes' : 'Create Topic'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ========================================================================== */
/*                   MAIN COMPONENT: ADMIN CONSOLE CONTAINER                  */
/* ========================================================================== */

export default function AdminConsolePage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'categories' | 'audit'>('overview');
  const [loading, setLoading] = useState<boolean>(true);

  // Overview State
  const [metrics, setMetrics] = useState<AdminMetrics>({
    totalUsers: 0,
    pendingApprovals: 0,
    totalArticles: 0,
    totalCategories: 0,
    totalComments: 0,
    totalReads: 0,
  });

  // Users State
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [userStatusFilter, setUserStatusFilter] = useState<string>('all');
  const [userSearchTerm, setUserSearchTerm] = useState<string>('');
  const [selectedUserForModal, setSelectedUserForModal] = useState<UserAccount | null>(null);

  // Categories State
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categorySearch, setCategorySearch] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'featured' | 'active' | 'disabled'>('all');
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditPage, setAuditPage] = useState<number>(1);
  const [auditTotalPages, setAuditTotalPages] = useState<number>(1);

  /* ------------------------- DATA FETCHING -------------------------------- */

  const fetchMetrics = useCallback(async () => {
    const res = await handleGetAdminMetrics();
    if (res?.success && res.result) {
      setMetrics(res.result);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    const filter = userStatusFilter === 'all' ? undefined : userStatusFilter;
    const res = await handleGetAdminUsers(filter);
    if (res?.success && Array.isArray(res.result)) {
      setUsers(res.result);
    }
  }, [userStatusFilter]);

  const fetchCategories = useCallback(async () => {
    const res = await handleGetCategories(true);
    if (res?.success && Array.isArray(res.result)) {
      setCategories(res.result);
    }
  }, []);

  const fetchAuditLogs = useCallback(async (page: number = 1) => {
    const res = await handleGetAdminAuditLogs(page, 15);
    if (res?.success && res.result?.logs) {
      setAuditLogs(res.result.logs);
      setAuditTotalPages(res.result.pagination?.totalPages || 1);
    }
  }, []);

  const refreshCurrentTab = useCallback(async () => {
    setLoading(true);
    if (activeTab === 'overview') {
      await Promise.all([fetchMetrics(), fetchUsers()]);
    } else if (activeTab === 'users') {
      await fetchUsers();
    } else if (activeTab === 'categories') {
      await fetchCategories();
    } else if (activeTab === 'audit') {
      await fetchAuditLogs(auditPage);
    }
    setLoading(false);
  }, [activeTab, fetchMetrics, fetchUsers, fetchCategories, fetchAuditLogs, auditPage]);

  useEffect(() => {
    refreshCurrentTab();
  }, [refreshCurrentTab]);

  /* ------------------------- USER ACTIONS --------------------------------- */

  const handleToggleUserAllowance = async (user: UserAccount) => {
    const nextAllowed = !user.isAllowed;
    const nextStatus = nextAllowed ? 'active' : 'suspended';
    const toastId = toast.loading(`${nextAllowed ? 'Approving' : 'Restricting'} user...`);

    const res = await handleUpdateUserAccess(user.id, {
      isAllowed: nextAllowed,
      status: nextStatus,
    });

    if (res?.success) {
      toast.success(`User ${nextAllowed ? 'approved' : 'restricted'} successfully`, { id: toastId });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isAllowed: nextAllowed, status: nextStatus } : u))
      );
      fetchMetrics();
    } else {
      toast.error(res?.error || res?.message || 'Failed to update user', { id: toastId });
    }
  };

  const handleSaveUserPermissions = async (updatedUser: UserAccount) => {
    const toastId = toast.loading('Updating user entitlements...');
    const res = await handleUpdateUserAccess(updatedUser.id, {
      role: updatedUser.role,
      status: updatedUser.status,
      isAllowed: updatedUser.isAllowed,
      productAccess: updatedUser.productAccess,
    });

    if (res?.success) {
      toast.success('Permissions updated', { id: toastId });
      setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
      setSelectedUserForModal(null);
    } else {
      toast.error(res?.error || 'Failed to update permissions', { id: toastId });
    }
  };

  /* ----------------------- CATEGORY ACTIONS ------------------------------- */

  const handleSaveCategory = async (data: {
    id?: string;
    name: string;
    slug?: string;
    description?: string;
    isFeatured: boolean;
    isActive?: boolean;
  }) => {
    const toastId = toast.loading(data.id ? 'Updating category...' : 'Creating category...');

    const res = data.id
      ? await handleUpdateCategory(data.id, {
          name: data.name,
          slug: data.slug,
          description: data.description,
          isFeatured: data.isFeatured,
          isActive: data.isActive,
        })
      : await handleCreateCategory({
          name: data.name,
          description: data.description,
          isFeatured: data.isFeatured,
        });

    if (res?.success) {
      toast.success(data.id ? 'Category updated!' : 'Category created!', { id: toastId });
      setIsCategoryModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
      fetchMetrics();
    } else {
      toast.error(res?.error || res?.message || 'Operation failed', { id: toastId });
    }
  };

  const handleToggleCategoryFeatured = async (cat: CategoryItem) => {
    const targetId = cat.id || (cat._id as string);
    const nextVal = !cat.isFeatured;
    const res = await handleUpdateCategory(targetId, { isFeatured: nextVal });
    if (res?.success) {
      toast.success(nextVal ? 'Category pinned to featured' : 'Category unpinned');
      setCategories((prev) =>
        prev.map((c) => ((c.id || c._id) === targetId ? { ...c, isFeatured: nextVal } : c))
      );
    }
  };

  const handleToggleCategoryActive = async (cat: CategoryItem) => {
    const targetId = cat.id || (cat._id as string);
    const nextVal = !cat.isActive;
    const res = await handleUpdateCategory(targetId, { isActive: nextVal });
    if (res?.success) {
      toast.success(nextVal ? 'Category activated' : 'Category deactivated');
      setCategories((prev) =>
        prev.map((c) => ((c.id || c._id) === targetId ? { ...c, isActive: nextVal } : c))
      );
    }
  };

  const handleDeleteCat = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    const toastId = toast.loading('Deleting category...');
    const res = await handleDeleteCategory(categoryId);
    if (res?.success) {
      toast.success('Category deleted', { id: toastId });
      setCategories((prev) => prev.filter((c) => (c.id || c._id) !== categoryId));
      fetchMetrics();
    } else {
      toast.error(res?.error || 'Failed to delete category (verify no articles are tagged with it)', { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24 text-black">
      <Toaster position="top-right" />

      {/* Admin Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-5 shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-white shadow-sm">
              <ShieldCheckIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-black sm:text-2xl">
                System Administration
              </h1>
              <p className="text-xs font-semibold text-gray-500">
                Governance, account approvals, taxonomy, and operational traces
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshCurrentTab()}
              disabled={loading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 active:scale-95"
            >
              <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin text-red-600' : 'text-gray-500'}`} />
              Refresh
            </button>
            <Link
              href="/articles"
              className="inline-flex items-center gap-1.5 rounded-lg bg-black px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-gray-800 active:scale-95"
            >
              Exit to Portal
            </Link>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="mx-auto mt-6 flex max-w-7xl border-b border-gray-200 text-sm font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`border-b-2 px-5 pb-3 transition-all ${
              activeTab === 'overview'
                ? 'border-red-600 text-red-600 font-black'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            Overview & Metrics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 border-b-2 px-5 pb-3 transition-all ${
              activeTab === 'users'
                ? 'border-red-600 text-red-600 font-black'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            User Governance
            {metrics.pendingApprovals > 0 && (
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-black text-white">
                {metrics.pendingApprovals}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`border-b-2 px-5 pb-3 transition-all ${
              activeTab === 'categories'
                ? 'border-red-600 text-red-600 font-black'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            Categories & Taxonomy
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`border-b-2 px-5 pb-3 transition-all ${
              activeTab === 'audit'
                ? 'border-red-600 text-red-600 font-black'
                : 'border-transparent text-gray-500 hover:text-black'
            }`}
          >
            Security Audit Trail
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 pt-8 sm:px-6">
        {activeTab === 'overview' && (
          <AdminOverviewTab
            metrics={metrics}
            onNavigateTab={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'users' && (
          <UserGovernanceTab
            users={users.filter(
              (u) =>
                u.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                u.username?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                u.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
            )}
            userSearchTerm={userSearchTerm}
            setUserSearchTerm={setUserSearchTerm}
            userStatusFilter={userStatusFilter}
            setUserStatusFilter={setUserStatusFilter}
            onToggleAllowance={handleToggleUserAllowance}
            onSelectUserForModal={(u) => setSelectedUserForModal(u)}
          />
        )}

        {activeTab === 'categories' && (
          <CategoryManagementTab
            categories={categories}
            categorySearch={categorySearch}
            setCategorySearch={setCategorySearch}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            onOpenCreateModal={() => {
              setEditingCategory(null);
              setIsCategoryModalOpen(true);
            }}
            onOpenEditModal={(cat) => {
              setEditingCategory(cat);
              setIsCategoryModalOpen(true);
            }}
            onToggleFeatured={handleToggleCategoryFeatured}
            onToggleActive={handleToggleCategoryActive}
            onDeleteCategory={handleDeleteCat}
          />
        )}

        {activeTab === 'audit' && (
          <SecurityAuditTab
            auditLogs={auditLogs}
            auditPage={auditPage}
            auditTotalPages={auditTotalPages}
            setAuditPage={setAuditPage}
          />
        )}
      </main>

      {/* User Modal */}
      {selectedUserForModal && (
        <UserEntitlementsModal
          user={selectedUserForModal}
          onClose={() => setSelectedUserForModal(null)}
          onSave={handleSaveUserPermissions}
        />
      )}

      {/* Category Modal (Create & Edit) */}
      {isCategoryModalOpen && (
        <CategoryModal
          initialData={editingCategory}
          onClose={() => {
            setIsCategoryModalOpen(false);
            setEditingCategory(null);
          }}
          onSubmit={handleSaveCategory}
        />
      )}
    </div>
  );
}
