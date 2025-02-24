'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { supabase } from '@/lib/supabase/config';

type MeowmeryPost = {
  id: string;
  title: string;
  story: string;
  location: string;
  created_at: string;
};

export default function Dashboard() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<MeowmeryPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUserPosts() {
      try {
        const { data, error } = await supabase
          .from('meowmery_posts')
          .select('*')
          .eq('user_id', user?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      fetchUserPosts();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-600">Loading your memories...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Your Meowmeries</h1>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">You haven't created any memories yet.</p>
          <a
            href="/meowmery/create"
            className="mt-4 inline-block bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Create Your First Memory
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-3">{post.story}</p>
                {post.location && (
                  <p className="text-gray-500 text-sm mt-2">📍 {post.location}</p>
                )}
                <p className="text-gray-400 text-xs mt-2">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 