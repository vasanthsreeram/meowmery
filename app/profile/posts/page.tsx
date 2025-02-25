'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { supabase } from '../../services/supabase';

interface Post {
  id: string;
  title: string;
  story?: string;
  location?: string;
  created_at: string;
  media: { url: string; type: string }[];
}

export default function ManagePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      // Fetch posts with their associated media
      const { data: postsData, error: postsError } = await supabase
        .from('meowmery_posts')
        .select(`
          *,
          media (
            url,
            type
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err instanceof Error ? err.message : 'Error loading posts');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleDelete = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      setError(null);
      const { error: deleteError } = await supabase
        .from('meowmery_posts')
        .delete()
        .eq('id', postId);

      if (deleteError) throw deleteError;
      setPosts(posts.filter(post => post.id !== postId));
    } catch (err) {
      console.error('Error deleting post:', err);
      setError(err instanceof Error ? err.message : 'Error deleting post');
    }
  };

  const handleEdit = (postId: string) => {
    router.push(`/profile/posts/${postId}/edit`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">My Posts</h1>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
              {error}
            </div>
          )}

          {posts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">You haven't created any posts yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  {post.media && post.media[0] && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={post.media[0].url}
                        alt={post.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-medium text-gray-900">{post.title}</h3>
                    {post.location && (
                      <p className="mt-1 text-sm text-gray-500">{post.location}</p>
                    )}
                    {post.story && (
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.story}</p>
                    )}
                    <div className="mt-4 flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(post.id)}
                        className="px-3 py-1 text-sm font-medium text-gray-700 hover:text-gray-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 