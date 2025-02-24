'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Post, PostFormData } from '../types';
import { postService } from '../services/posts';
import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues
const Map = dynamic(() => import('./Map'), { ssr: false });

interface PostFormProps {
  initialData?: Post;
  onSuccess?: (post: Post) => void;
}

export default function PostForm({ initialData, onSuccess }: PostFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<PostFormData>({
    cat_name: initialData?.cat_name || '',
    story: initialData?.story || '',
    location: initialData?.location || '',
    media: [],
    tags: initialData?.tags?.map(tag => tag.name) || [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showMap, setShowMap] = useState(false);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cat_name.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const { data, error } = initialData
        ? await postService.updatePost(initialData.id, formData)
        : await postService.createPost(formData);

      if (error) throw new Error(error);
      
      if (data) {
        if (onSuccess) {
          onSuccess(data);
        } else {
          router.push(`/meowmery/${data.id}`);
        }
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      media: [...prev.media || [], ...files],
    }));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !formData.tags?.includes(tag)) {
        setFormData(prev => ({
          ...prev,
          tags: [...(prev.tags || []), tag],
        }));
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove),
    }));
  };

  const removeMedia = (index: number) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media?.filter((_, i) => i !== index),
    }));
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setCoordinates({ lat, lng });
    setFormData(prev => ({
      ...prev,
      location: address,
    }));
    setShowMap(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Cat's Name */}
      <div>
        <label htmlFor="cat_name" className="block text-sm font-medium text-gray-700">
          Cat's Name *
        </label>
        <input
          type="text"
          id="cat_name"
          value={formData.cat_name}
          onChange={(e) => setFormData(prev => ({ ...prev, cat_name: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          placeholder="Enter your cat's name"
          required
        />
      </div>

      {/* Story */}
      <div>
        <label htmlFor="story" className="block text-sm font-medium text-gray-700">
          Story
        </label>
        <textarea
          id="story"
          rows={4}
          value={formData.story}
          onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          placeholder="Share your cat's story..."
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <div className="mt-1 flex space-x-2">
          <input
            type="text"
            value={formData.location}
            readOnly
            placeholder="Select location from map"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm bg-gray-50"
          />
          <button
            type="button"
            onClick={() => setShowMap(!showMap)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {showMap ? 'Close Map' : 'Open Map'}
          </button>
        </div>
        {showMap && (
          <div className="mt-2 h-[400px] rounded-lg overflow-hidden border border-gray-300">
            <Map onLocationSelect={handleLocationSelect} />
          </div>
        )}
      </div>

      {/* Media Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Media
        </label>
        <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400"
             onClick={() => document.getElementById('media-upload')?.click()}>
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-gray-900 hover:text-gray-700">
                Click to upload
              </span>
              {' '}or drag and drop
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, GIF, or MP4 up to 10MB
            </p>
          </div>
          <input
            id="media-upload"
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={handleMediaChange}
            className="hidden"
          />
        </div>

        {/* Media Preview */}
        {formData.media && formData.media.length > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            {formData.media.map((file, index) => (
              <div key={index} className="relative">
                {file.type.startsWith('image/') ? (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index + 1}`}
                    className="h-24 w-full object-cover rounded-md"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(file)}
                    className="h-24 w-full object-cover rounded-md"
                    muted
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(index)}
                  className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <button
            type="button"
            onClick={() => setShowTagInput(!showTagInput)}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {showTagInput ? 'Hide' : 'Add Tags'}
          </button>
        </div>
        
        {showTagInput && (
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="Add tags (press Enter or comma to add)"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          />
        )}
        
        {formData.tags && formData.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {formData.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !formData.cat_name.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
} 