'use client';

import MediaGallery from '../../components/MediaGallery';
import CommentSection from '../../components/CommentSection';
import { Media, Comment } from '../../types';

export function MediaGalleryWrapper({ media }: { media: Media[] }) {
  return <MediaGallery media={media} />;
}

export function CommentSectionWrapper({ 
  postId, 
  initialComments 
}: { 
  postId: string; 
  initialComments: Comment[] 
}) {
  return <CommentSection postId={postId} initialComments={initialComments} />;
} 