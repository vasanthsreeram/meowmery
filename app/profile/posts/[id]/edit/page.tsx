'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../../services/supabase';
import PostForm from '../../../../components/PostForm';

interface Props {
  params: {
    id: string;
  };
}

export default function EditPost({ params }: Props) {
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadPost();
  }, [params.id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth');
        return;
      }

      const { data: post, error: postError } = await supabase
        .from('meowmery_posts')
        .select(`
          *,
          media (
            url,
            type
          ),
          tags:post_tags(
            tag:tags(*)
          )
        `)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .single();

      if (postError) throw postError;
      if (!post) {
        router.push('/profile/posts');
        return;
      }

      setPost(post);
    } catch (err) {
      console.error('Error loading post:', err);
      setError(err instanceof Error ? err.message : 'Error loading post');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-md p-4 text-red-600">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Edit Post</h1>
            <p className="mt-1 text-sm text-gray-500">
              Update your post details below.
            </p>
          </div>

          <PostForm
            initialData={post}
            onSuccess={() => router.push('/profile/posts')}
          />
        </div>
      </div>
    </div>
  );
} 