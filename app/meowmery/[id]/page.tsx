import { Metadata, ResolvingMetadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { postService } from '../../services/posts';
import { MediaGalleryWrapper, CommentSectionWrapper } from './ClientComponents';

// For Next.js 15 type compatibility, match the PageProps interface exactly
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  try {
    const resolvedParams = await params;
    const { data: post } = await postService.getPostById(resolvedParams.id);
    
    if (!post) {
      return {
        title: 'Memory Not Found - Meowmery',
      };
    }

    return {
      title: `${post.title} - Meowmery`,
      description: post.story || `A memory shared by ${post.user?.username}`,
    };
  } catch (error) {
    return {
      title: 'Error - Meowmery',
    };
  }
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  try {
    const resolvedParams = await params;
    const { data: post, error } = await postService.getPostById(resolvedParams.id);

    if (error || !post) {
      notFound();
    }

    return (
      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center mb-4">
            <Link href={`/profile/${post.user?.username}`} className="flex items-center">
              <div className="w-10 h-10 relative rounded-full overflow-hidden mr-3">
                <Image
                  src={post.user?.avatar_url || '/default-avatar.png'}
                  alt={post.user?.username || 'User'}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="font-medium text-gray-900">
                  {post.user?.username}
                </h2>
                <time className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </time>
              </div>
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {post.title}
          </h1>

          {post.location && (
            <div className="flex items-center text-gray-500 mb-4">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{post.location}</span>
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/tags/${tag.name}`}
                  className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors"
                >
                  #{tag.name}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Media Gallery */}
        {post.media && post.media.length > 0 && (
          <div className="mb-8">
            <MediaGalleryWrapper media={post.media} />
          </div>
        )}

        {/* Story */}
        {post.story && (
          <div className="prose prose-gray max-w-none mb-12">
            {post.story.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>
        )}

        {/* Comments */}
        <div className="border-t pt-8">
          <CommentSectionWrapper
            postId={post.id}
            initialComments={post.comments || []}
          />
        </div>
      </article>
    );
  } catch (error) {
    notFound();
  }
} 