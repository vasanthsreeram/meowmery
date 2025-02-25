import { supabase } from './supabase';
import { Post, PostFormData, ApiResponse } from '../types';

export const postService = {
  async getPosts(): Promise<ApiResponse<Post[]>> {
    try {
      const { data, error } = await supabase
        .from('meowmery_posts')
        .select(`
          *,
          user:users(*),
          media(*),
          tags:post_tags(tag:tags(*)),
          comments(*, user:users(*))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  async getPostById(id: string): Promise<ApiResponse<Post>> {
    try {
      const { data, error } = await supabase
        .from('meowmery_posts')
        .select(`
          *,
          user:users(*),
          media(*),
          tags:post_tags(tag:tags(*)),
          comments(*, user:users(*))
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  async createPost(formData: PostFormData): Promise<ApiResponse<Post>> {
    try {
      // First, check if user is authenticated
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!session) throw new Error('Not authenticated');

      // Get user profile from users table
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single();

      if (userError) throw new Error('User profile not found. Please complete your profile first.');
      if (!userProfile) throw new Error('User profile not found');

      // 1. Create the post
      const { data: post, error: postError } = await supabase
        .from('meowmery_posts')
        .insert({
          user_id: userProfile.id,
          title: formData.cat_name, // Use cat's name as the title
          cat_name: formData.cat_name,
          story: formData.story || null,
          location: formData.location || null,
        })
        .select()
        .single();

      if (postError) throw postError;

      // 2. Upload media files if any
      if (formData.media?.length) {
        const mediaPromises = formData.media.map(async (file) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${userProfile.id}/${post.id}/${Date.now()}.${fileExt}`;

          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('meowmery-media')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('meowmery-media')
            .getPublicUrl(fileName);

          // Create media record
          return supabase.from('media').insert({
            post_id: post.id,
            url: publicUrl,
            type: file.type.startsWith('image/') ? 'image' : 
                  file.type.startsWith('video/') ? 'video' : 'gif',
          });
        });

        await Promise.all(mediaPromises);
      }

      // 3. Handle tags if any
      if (formData.tags?.length) {
        const tagPromises = formData.tags.map(async (tagName) => {
          // Get or create tag
          const { data: tag, error: tagError } = await supabase
            .from('tags')
            .select()
            .eq('name', tagName)
            .single();

          if (tagError) {
            // Tag doesn't exist, create it
            const { data: newTag, error: createTagError } = await supabase
              .from('tags')
              .insert({ name: tagName })
              .select()
              .single();

            if (createTagError) throw createTagError;
            return newTag;
          }

          return tag;
        });

        const tags = await Promise.all(tagPromises);

        // Create post_tags associations
        await Promise.all(
          tags.map((tag) =>
            supabase.from('post_tags').insert({
              post_id: post.id,
              tag_id: tag.id,
            })
          )
        );
      }

      return await this.getPostById(post.id);
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  async updatePost(id: string, formData: Partial<PostFormData>): Promise<ApiResponse<Post>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update post
      const { error: updateError } = await supabase
        .from('meowmery_posts')
        .update({
          title: formData.cat_name,  // Use cat_name instead of title to match the PostFormData type
          story: formData.story,
          location: formData.location,
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      return await this.getPostById(id);
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  async deletePost(id: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('meowmery_posts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return { data: null, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },
}; 