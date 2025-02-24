import { supabase } from './supabase';
import { Comment, CommentFormData, ApiResponse } from '../types';

export const commentService = {
  async getComments(postId: string): Promise<ApiResponse<Comment[]>> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:users(*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  async addComment(postId: string, formData: CommentFormData): Promise<ApiResponse<Comment>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: formData.content,
        })
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  async updateComment(id: string, formData: CommentFormData): Promise<ApiResponse<Comment>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .update({ content: formData.content })
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          user:users(*)
        `)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      return { data: null, error: (error as Error).message };
    }
  },

  async deleteComment(id: string): Promise<ApiResponse<void>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('comments')
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