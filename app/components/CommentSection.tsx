'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Comment, CommentFormData } from '../types';
import { commentService } from '../services/comments';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '../services/supabase';
import { useEffect } from 'react';

interface CommentSectionProps {
  postId: string;
  initialComments: Comment[];
}

export default function CommentSection({ postId, initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    setError(null);

    const formData: CommentFormData = {
      content: newComment.trim(),
    };

    const { data, error } = await commentService.addComment(postId, formData);
    
    setIsSubmitting(false);
    
    if (error) {
      setError(error);
      return;
    }

    if (data) {
      setComments((prev) => [...prev, data]);
      setNewComment('');
    }
  };

  const handleDelete = async (commentId: string) => {
    const { error } = await commentService.deleteComment(commentId);
    
    if (error) {
      setError(error);
      return;
    }

    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-900">
        Comments ({comments.length})
      </h3>

      {/* Comment List */}
      <div className="space-y-4">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 relative rounded-full overflow-hidden">
                <Image
                  src={comment.user?.avatar_url || '/default-avatar.png'}
                  alt={comment.user?.username || 'User'}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {comment.user?.username}
                  </span>
                  <span className="text-gray-500 text-sm">
                    {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                  </span>
                </div>
                {user?.id === comment.user_id && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
              <p className="text-gray-600">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mt-6">
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 relative rounded-full overflow-hidden">
                <Image
                  src={user.user_metadata.avatar_url || '/default-avatar.png'}
                  alt={user.user_metadata.username || 'User'}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={2}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm resize-none"
                disabled={isSubmitting}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
              <div className="mt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !newComment.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <p className="text-center text-gray-500 py-4">
          Please sign in to leave a comment.
        </p>
      )}
    </div>
  );
} 