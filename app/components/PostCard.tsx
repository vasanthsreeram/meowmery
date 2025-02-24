import Image from 'next/image';
import Link from 'next/link';
import { Post } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  // Get the first media item (if any) for the preview
  const previewMedia = post.media?.[0];
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Media Preview */}
      <div className="aspect-w-16 aspect-h-9 relative bg-gray-100">
        {previewMedia && (
          previewMedia.type === 'video' ? (
            <video
              src={previewMedia.url}
              className="object-cover w-full h-full"
              muted
              loop
              autoPlay
              playsInline
            />
          ) : (
            <Image
              src={previewMedia.url}
              alt={post.title}
              fill
              className="object-cover"
            />
          )
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center mb-3">
          <Link href={`/profile/${post.user?.username}`} className="flex items-center">
            <div className="w-8 h-8 relative rounded-full overflow-hidden mr-2">
              <Image
                src={post.user?.avatar_url || '/default-avatar.png'}
                alt={post.user?.username || 'User'}
                fill
                className="object-cover"
              />
            </div>
            <span className="font-medium text-gray-900">{post.user?.username}</span>
          </Link>
          <span className="mx-2 text-gray-300">•</span>
          <time className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </time>
        </div>

        {/* Title and Preview */}
        <Link href={`/meowmery/${post.id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {post.title}
          </h3>
          {post.story && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {post.story}
            </p>
          )}
        </Link>

        {/* Footer */}
        <div className="mt-4 flex items-center text-sm text-gray-500">
          {post.location && (
            <>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{post.location}</span>
            </>
          )}
          
          <div className="flex-1" />
          
          {/* Comment count */}
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{post.comments?.length || 0}</span>
          </div>
        </div>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.name}`}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 