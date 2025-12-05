import React, { useState, useEffect } from 'react';
import { MessageSquare, Reply, Edit2, Trash2, Send, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/api';

interface Comment {
  id: string;
  article_id: string;
  author_id: string;
  content: string;
  parent_id?: string;
  status: string;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: string;
  };
  replies?: Comment[];
}

interface CommentSectionProps {
  articleId: string;
}

export const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/articles/${articleId}/comments`);
      setComments(response.data.comments || []);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      await apiClient.post('/comments', {
        article_id: articleId,
        content: newComment.trim()
      });
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!replyContent.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      await apiClient.post('/comments', {
        article_id: articleId,
        content: replyContent.trim(),
        parent_id: parentId
      });
      setReplyContent('');
      setReplyTo(null);
      await loadComments();
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      setSubmitting(true);
      await apiClient.put(`/comments/${commentId}`, {
        content: editContent.trim()
      });
      setEditingComment(null);
      setEditContent('');
      await loadComments();
    } catch (error) {
      console.error('Failed to edit comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await apiClient.delete(`/comments/${commentId}`);
      await loadComments();
    } catch (error) {
      console.error('Failed to delete comment:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const canEditComment = (comment: Comment) => {
    return isAuthenticated && (user?.id === comment.author_id || user?.role === 'admin');
  };

  const CommentItem: React.FC<{ comment: Comment; isReply?: boolean }> = ({ comment, isReply = false }) => (
    <div className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}>
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-accent">
                {comment.author.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <span className="font-medium text-dark">{comment.author.name}</span>
              {comment.author.role === 'admin' && (
                <span className="ml-2 text-xs bg-accent text-white px-2 py-1 rounded-full">
                  Admin
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-ash">
            <Clock className="w-4 h-4" />
            {formatDate(comment.created_at)}
          </div>
        </div>

        {editingComment === comment.id ? (
          <form onSubmit={(e) => { e.preventDefault(); handleEditComment(comment.id); }} className="mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              rows={3}
              maxLength={1000}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={submitting || !editContent.trim()}
                className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 text-sm"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditingComment(null);
                  setEditContent('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="text-dark mb-3 whitespace-pre-wrap">{comment.content}</p>
        )}

        <div className="flex items-center gap-4 text-sm">
          {isAuthenticated && !isReply && (
            <button
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="flex items-center gap-1 text-ash hover:text-accent transition-colors"
            >
              <Reply className="w-4 h-4" />
              Reply
            </button>
          )}
          
          {canEditComment(comment) && editingComment !== comment.id && (
            <>
              <button
                onClick={() => {
                  setEditingComment(comment.id);
                  setEditContent(comment.content);
                }}
                className="flex items-center gap-1 text-ash hover:text-blue-600 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="flex items-center gap-1 text-ash hover:text-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </>
          )}
        </div>

        {replyTo === comment.id && (
          <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write a reply..."
              className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
              rows={3}
              maxLength={1000}
            />
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                disabled={submitting || !replyContent.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 text-sm"
              >
                <Send className="w-4 h-4" />
                Reply
              </button>
              <button
                type="button"
                onClick={() => {
                  setReplyTo(null);
                  setReplyContent('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} isReply={true} />
          ))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/60">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-accent" />
          <h3 className="text-lg font-bold text-dark">Comments</h3>
        </div>
        <div className="text-center py-8 text-ash">Loading comments...</div>
      </div>
    );
  }

  return (
    <div className="bg-white/30 backdrop-blur-sm rounded-2xl p-6 border border-white/60">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-accent" />
        <h3 className="text-lg font-bold text-dark">
          Comments ({comments.length})
        </h3>
      </div>

      {/* New Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-sm font-bold text-accent">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
                rows={4}
                maxLength={1000}
              />
              <div className="flex justify-between items-center mt-3">
                <span className="text-sm text-ash">
                  {newComment.length}/1000 characters
                </span>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="flex items-center gap-2 px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-ash mb-2">Please log in to leave a comment</p>
          <button className="text-accent hover:underline">
            Sign in to comment
          </button>
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-ash">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </div>
  );
};
