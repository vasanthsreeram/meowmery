export interface User {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  title: string;
  cat_name: string;
  story: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
  media?: Media[];
  tags?: Tag[];
  comments?: Comment[];
}

export interface Media {
  id: string;
  post_id: string;
  url: string;
  type: 'image' | 'gif' | 'video';
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Tag {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PostTag {
  post_id: string;
  tag_id: string;
}

// Form Data Types
export interface PostFormData {
  cat_name: string;
  story?: string;
  location?: string;
  media?: File[];
  tags?: string[];
}

export interface CommentFormData {
  content: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
} 