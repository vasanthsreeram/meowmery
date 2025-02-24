'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Media } from '../types';

interface MediaGalleryProps {
  media: Media[];
}

export default function MediaGallery({ media }: MediaGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMedia = media[activeIndex];

  if (!media.length) return null;

  return (
    <div className="space-y-4">
      {/* Main Display */}
      <div className="aspect-w-16 aspect-h-9 relative bg-gray-100 rounded-lg overflow-hidden">
        {activeMedia.type === 'video' ? (
          <video
            src={activeMedia.url}
            className="object-contain w-full h-full"
            controls
            playsInline
          />
        ) : (
          <Image
            src={activeMedia.url}
            alt=""
            fill
            className="object-contain"
            priority={activeIndex === 0}
          />
        )}
      </div>

      {/* Thumbnails */}
      {media.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => setActiveIndex(index)}
              className={`aspect-w-16 aspect-h-9 relative rounded-md overflow-hidden ${
                index === activeIndex ? 'ring-2 ring-gray-900' : 'hover:opacity-75'
              }`}
            >
              {item.type === 'video' ? (
                <video
                  src={item.url}
                  className="object-cover w-full h-full"
                  muted
                />
              ) : (
                <Image
                  src={item.url}
                  alt=""
                  fill
                  className="object-cover"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 