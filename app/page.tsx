import Link from 'next/link';
import { postService } from './services/posts';
import PostCard from './components/PostCard';

export const revalidate = 60; // Revalidate this page every 60 seconds

async function getPosts() {
  const { data: posts, error } = await postService.getPosts();
  if (error) throw new Error(error);
  return posts || [];
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <div className="space-y-8">
      <section className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          In Loving Memory
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A sacred space dedicated to honoring and remembering our beloved cats who have crossed the rainbow bridge. 
          Share their precious memories, cherished photos, and the eternal love they brought to our lives.
        </p>
      </section>

      <section>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <h2 className="text-2xl font-semibold text-gray-900">Cherished Memories</h2>
            <select 
              className="rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500"
              defaultValue=""
            >
              <option value="">All Locations</option>
              <option value="chua-chu-kang">Chua Chu Kang</option>
              <option value="woodlands">Woodlands</option>
              <option value="yishun">Yishun</option>
              {/* Add more locations as needed */}
            </select>
          </div>
          <Link
            href="/meowmery/create"
            className="bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            Share a Memory
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
          {posts.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              No memories shared yet. Be the first to honor your beloved cat.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
