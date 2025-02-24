'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../services/supabase';
import { User } from '../types';

export default function ProfileSettings() {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Partial<User>>({
    username: '',
    bio: '',
    avatar_url: null,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Get profile data
        const { data: profileData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }
      }
    };

    loadProfile();
  }, []);

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      setError(null);

      const { error: updateError } = await supabase
        .from('users')
        .update({
          username: profile.username,
          bio: profile.bio,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setIsUploading(true);
      setError(null);

      // Validate file size and type
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size too large. Please choose an image under 5MB.');
      }

      if (!file.type.startsWith('image/')) {
        throw new Error('Please select a valid image file.');
      }

      // Create a consistent filename based on user ID
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}/profile/avatar-${Date.now()}.${fileExt}`;

      // First try to delete any existing avatar
      if (profile.avatar_url) {
        const existingPath = profile.avatar_url.split('/').pop();
        if (existingPath) {
          await supabase.storage
            .from('meowmery-media')
            .remove([`${user.id}/profile/${existingPath}`])
            .then(({ error }) => {
              if (error) console.warn('Failed to remove old avatar:', error);
            });
        }
      }

      // Upload the new avatar
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('meowmery-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError.message);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }

      if (!uploadData?.path) {
        throw new Error('Upload failed: No path returned');
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('meowmery-media')
        .getPublicUrl(uploadData.path);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL');
      }

      // Update the user profile
      const { error: updateError } = await supabase
        .from('users')
        .update({
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw new Error('Failed to update profile with new avatar');
      }

      // Update local state
      setProfile(prev => ({ ...prev, avatar_url: urlData.publicUrl }));

      // Update the user metadata in the session
      await supabase.auth.updateUser({
        data: { avatar_url: urlData.publicUrl }
      });

      // Force a router refresh and reload profile data
      window.location.reload();
    } catch (err) {
      console.error('Avatar upload error:', err);
      setError(
        err instanceof Error 
          ? err.message 
          : 'An unexpected error occurred while uploading the avatar'
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div 
          className="relative w-20 h-20 rounded-full overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleAvatarClick}
        >
          <Image
            src={profile.avatar_url || '/default-avatar.png'}
            alt="Profile"
            fill
            className="object-cover"
          />
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Profile Picture</h3>
          <p className="text-sm text-gray-500">Click to update your profile picture</p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleAvatarChange}
        className="hidden"
      />

      <div className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            type="text"
            id="username"
            value={profile.username}
            onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            value={profile.bio || ''}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
            placeholder="Tell us about yourself..."
          />
        </div>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <button
          onClick={handleProfileUpdate}
          disabled={isSaving}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
} 