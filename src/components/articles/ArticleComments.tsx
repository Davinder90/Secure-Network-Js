'use client';

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  ChatBubbleLeftEllipsisIcon,
  ArrowUturnLeftIcon,
  TrashIcon,
  PaperAirplaneIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import {
  handleGetArticleComments,
  handleAddArticleComment,
  handleDeleteArticleComment,
  handleGetCommentReplies,
} from '@/src/requests/articles/articles';

interface CommentUser {
  _id: string;
  name: string;
  username: string;
  avatar: string;
}

export interface CommentType {
  _id: string;
  comment: string;
  commentedAt: string;
  commentedBy: CommentUser;
  children: string[];
  isReply: boolean;
  childrenLevel: number;
}

/* -------------------------------------------------------------------------- */
/*                 RECURSIVE COMMENT NODE (Handles Any Depth)                 */
/* -------------------------------------------------------------------------- */

interface CommentNodeProps {
  item: CommentType;
  articleId: string;
  onPostComment: (text: string, parentCommentId: string) => Promise<CommentType | null>;
  onDeleteComment: (commentId: string, parentCommentId?: string) => Promise<boolean>;
  parentCommentId?: string;
  depth?: number;
}

const CommentNode: React.FC<CommentNodeProps> = ({
  item,
  articleId,
  onPostComment,
  onDeleteComment,
  parentCommentId,
  depth = 0,
}) => {
  const [replies, setReplies] = useState<CommentType[]>([]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState<boolean>(false);
  const [replyInputOpen, setReplyInputOpen] = useState<boolean>(false);
  const [replyText, setReplyText] = useState<string>('');
  const [submittingReply, setSubmittingReply] = useState<boolean>(false);

  const replyCount = item.children?.length || 0;

  // Toggle fetch or collapse for this comment's replies
  const handleToggleReplies = async () => {
    if (isExpanded) {
      setIsExpanded(false);
      return;
    }

    setIsExpanded(true);

    // Only fetch if not already loaded into local state
    if (replies.length > 0) return;

    setIsLoadingReplies(true);
    try {
      const res = await handleGetCommentReplies(item._id, { skip: 0, limit: 30 });
      if (res?.success && Array.isArray(res.result)) {
        setReplies(res.result);
      } else {
        setReplies([]);
      }
    } catch {
      toast.error('Failed to load replies');
    } finally {
      setIsLoadingReplies(false);
    }
  };

  const submitReply = async () => {
    if (!replyText.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    setSubmittingReply(true);
    const newReply = await onPostComment(replyText.trim(), item._id);

    if (newReply) {
      setReplyText('');
      setReplyInputOpen(false);
      // Append the new reply immediately to this node's branch
      setReplies((prev) => [...prev, newReply]);
      setIsExpanded(true);
      // Update this comment's children count
      item.children = [...(item.children || []), newReply._id];
    }
    setSubmittingReply(false);
  };

  const handleDeleteChild = async (childId: string) => {
    const success = await onDeleteComment(childId, item._id);
    if (success) {
      setReplies((prev) => prev.filter((r) => r._id !== childId));
      item.children = (item.children || []).filter((id) => id !== childId);
    }
    return success;
  };

  // Indentation class capped at depth 3 so deeply nested trees don't collapse off-screen
  const indentClass = depth > 0 ? (depth > 3 ? 'ml-3 pl-3' : 'ml-4 sm:ml-6 pl-3 sm:pl-4') : '';

  return (
    <div className={`relative pt-4 first:pt-0 ${depth > 0 ? 'border-l-2 border-red-200' : ''} ${indentClass}`}>
      {/* Comment Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src={item.commentedBy?.avatar || 'https://api.dicebear.com/7.x/notionists-neutral/svg?seed=User'}
            alt={item.commentedBy?.name || 'User'}
            className="h-7 w-7 rounded-full border border-gray-200 object-cover"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-black">{item.commentedBy?.name || 'User'}</span>
              <span className="text-[10px] font-mono text-gray-400">@{item.commentedBy?.username}</span>
            </div>
            <p className="text-[10px] font-medium text-gray-400">
              {new Date(item.commentedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Comment Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setReplyInputOpen(!replyInputOpen)}
            className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-500 transition hover:text-blue-600"
          >
            <ArrowUturnLeftIcon className="h-3.5 w-3.5" /> Reply
          </button>
          <button
            onClick={() => onDeleteComment(item._id, parentCommentId)}
            className="p-1 text-gray-400 transition hover:text-red-600"
            title="Delete comment"
          >
            <TrashIcon className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Comment Body */}
      <p className="mt-2 text-xs sm:text-sm leading-relaxed text-gray-800">
        {item.comment}
      </p>

      {/* Expand / Collapse Replies Button */}
      {replyCount > 0 && (
        <div className="mt-2">
          <button
            onClick={handleToggleReplies}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 transition"
          >
            {isExpanded ? (
              <>
                <ChevronUpIcon className="h-3.5 w-3.5" /> Hide {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-3.5 w-3.5" /> View {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}
              </>
            )}
          </button>
        </div>
      )}

      {/* Inline Reply Input Box */}
      {replyInputOpen && (
        <div className="mt-3 space-y-2">
          <textarea
            rows={2}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={`Replying to @${item.commentedBy?.username || 'user'}...`}
            className="w-full rounded-lg border border-gray-300 p-2.5 text-xs text-black focus:border-red-600 focus:outline-none"
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setReplyInputOpen(false);
                setReplyText('');
              }}
              className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={submitReply}
              disabled={submittingReply}
              className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white hover:bg-blue-700 active:scale-95 transition"
            >
              {submittingReply ? 'Posting...' : 'Reply'}
            </button>
          </div>
        </div>
      )}

      {/* Recursive Nested Replies Rendering */}
      {isExpanded && (
        <div className="mt-3 space-y-3">
          {isLoadingReplies ? (
            <div className="flex items-center gap-2 py-2 text-xs font-semibold text-gray-400">
              <ArrowPathIcon className="h-3.5 w-3.5 animate-spin text-red-600" />
              <span>Loading thread...</span>
            </div>
          ) : replies.length > 0 ? (
            replies.map((childReply) => (
              <CommentNode
                key={childReply._id}
                item={childReply}
                articleId={articleId}
                onPostComment={onPostComment}
                onDeleteComment={handleDeleteChild}
                parentCommentId={item._id}
                depth={depth + 1} // 👈 Increments depth recursively
              />
            ))
          ) : (
            <p className="text-xs text-gray-400 py-1">No replies found.</p>
          )}
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                            MAIN COMMENTS ROOT                              */
/* -------------------------------------------------------------------------- */

export default function ArticleComments({ articleId }: { articleId: string }) {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch Top-Level Comments
  const fetchComments = useCallback(async () => {
    if (!articleId) return;
    setLoading(true);

    const res = await handleGetArticleComments(articleId, { skip: 0, limit: 30 });
    if (res?.success && Array.isArray(res.result)) {
      setComments(res.result);
    } else {
      setComments([]);
    }
    setLoading(false);
  }, [articleId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // 2. Add Top-Level Comment or Pass down to Reply Tree
  const onPostComment = async (text: string, parentCommentId?: string): Promise<CommentType | null> => {
    const res = await handleAddArticleComment(articleId, {
      comment: text,
      parentCommentId,
    });

    if (res?.success && res.result) {
      toast.success(parentCommentId ? 'Reply posted!' : 'Comment posted!');
      return res.result as CommentType;
    } else {
      toast.error(res?.error || res?.message || 'Failed to post comment');
      return null;
    }
  };

  const handleRootSubmit = async () => {
    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    setSubmitting(true);
    const newComment = await onPostComment(commentText.trim());
    if (newComment) {
      setCommentText('');
      setComments((prev) => [newComment, ...prev]);
    }
    setSubmitting(false);
  };

  // 3. Delete Root Comment
  const onDeleteComment = async (commentId: string): Promise<boolean> => {
    if (!commentId) return false;

    const res = await handleDeleteArticleComment(articleId, commentId);
    if (res?.success) {
      toast.success('Comment deleted');
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      return true;
    } else {
      toast.error(res?.error || 'Failed to delete comment');
      return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <ChatBubbleLeftEllipsisIcon className="h-6 w-6 text-red-600" />
        <h3 className="text-lg font-black text-black">
          Discussion ({comments.length})
        </h3>
      </div>

      {/* Main Comment Input */}
      <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4 shadow-inner">
        <textarea
          rows={3}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="Share your technical observations, questions, or diagnostic notes..."
          className="w-full rounded-xl border border-gray-300 bg-white p-3 text-xs sm:text-sm text-black focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={handleRootSubmit}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-red-700 active:scale-95"
          >
            <PaperAirplaneIcon className="h-3.5 w-3.5" />
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </div>
      </div>

      {/* Recursive Comments Thread Tree */}
      {loading && comments.length === 0 ? (
        <div className="flex justify-center py-8">
          <ArrowPathIcon className="h-6 w-6 animate-spin text-red-600" />
        </div>
      ) : (
        <div className="space-y-4 divide-y divide-gray-100 pt-2">
          {comments.map((comment) => (
            <CommentNode
              key={comment._id}
              item={comment}
              articleId={articleId}
              onPostComment={onPostComment}
              onDeleteComment={onDeleteComment}
              depth={0}
            />
          ))}

          {comments.length === 0 && !loading && (
            <p className="py-6 text-center text-xs font-medium text-gray-400">
              No discussion comments yet. Be the first to start the conversation!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
