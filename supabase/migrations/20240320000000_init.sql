-- ===========================================================================
-- 1. EXTENSIONS & STORAGE BUCKET SETUP
-- ===========================================================================

-- Enable the uuid-ossp extension (for generating UUIDs)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Insert the storage buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('meowmery-media', 'meowmery-media', true),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- ===========================================================================
-- 2. STORAGE POLICIES
-- ===========================================================================

-- Policy: Allow authenticated users to upload media.
DROP POLICY IF EXISTS "Allow authenticated users to upload media" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'meowmery-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Allow public (unauthenticated) read access to media.
DROP POLICY IF EXISTS "Allow public access to media" ON storage.objects;
CREATE POLICY "Allow public access to media"
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'meowmery-media'
  );

-- Policy: Allow authenticated users to upload avatars
DROP POLICY IF EXISTS "Allow authenticated users to upload avatars" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Allow users to replace their own avatars
DROP POLICY IF EXISTS "Allow users to replace their own avatars" ON storage.objects;
CREATE POLICY "Allow users to replace their own avatars"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Allow users to delete their own avatars
DROP POLICY IF EXISTS "Allow users to delete their own avatars" ON storage.objects;
CREATE POLICY "Allow users to delete their own avatars"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy: Allow public access to avatars
DROP POLICY IF EXISTS "Allow public access to avatars" ON storage.objects;
CREATE POLICY "Allow public access to avatars"
  ON storage.objects
  FOR SELECT
  TO public
  USING (
    bucket_id = 'avatars'
  );

-- ===========================================================================
-- 3. USERS TABLE & POLICIES
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  bio text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to profiles.
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.users;
CREATE POLICY "Allow public read access to profiles"
  ON public.users
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow users to update only their own profile.
DROP POLICY IF EXISTS "Allow users to update their own profile" ON public.users;
CREATE POLICY "Allow users to update their own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ===========================================================================
-- 4. MEOWMERY POSTS TABLE & POLICIES
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.meowmery_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  story text,
  location text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS meowmery_posts_user_id_idx ON public.meowmery_posts(user_id);
CREATE INDEX IF NOT EXISTS meowmery_posts_created_at_idx ON public.meowmery_posts(created_at DESC);

ALTER TABLE public.meowmery_posts ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to posts.
DROP POLICY IF EXISTS "Allow public read access to posts" ON public.meowmery_posts;
CREATE POLICY "Allow public read access to posts"
  ON public.meowmery_posts
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow authenticated users to create posts (must match their own user_id).
DROP POLICY IF EXISTS "Allow authenticated users to create posts" ON public.meowmery_posts;
CREATE POLICY "Allow authenticated users to create posts"
  ON public.meowmery_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own posts.
DROP POLICY IF EXISTS "Allow users to update their own posts" ON public.meowmery_posts;
CREATE POLICY "Allow users to update their own posts"
  ON public.meowmery_posts
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to delete their own posts.
DROP POLICY IF EXISTS "Allow users to delete their own posts" ON public.meowmery_posts;
CREATE POLICY "Allow users to delete their own posts"
  ON public.meowmery_posts
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ===========================================================================
-- 5. MEDIA TABLE & POLICIES
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.media (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES public.meowmery_posts(id) ON DELETE CASCADE,
  url text NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'gif', 'video')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS media_post_id_idx ON public.media(post_id);

ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to media.
DROP POLICY IF EXISTS "Allow public read access to media" ON public.media;
CREATE POLICY "Allow public read access to media"
  ON public.media
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow authenticated users to create media (only for their own posts).
DROP POLICY IF EXISTS "Allow authenticated users to create media" ON public.media;
CREATE POLICY "Allow authenticated users to create media"
  ON public.media
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meowmery_posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- Policy: Allow users to delete their own media.
DROP POLICY IF EXISTS "Allow users to delete their own media" ON public.media;
CREATE POLICY "Allow users to delete their own media"
  ON public.media
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meowmery_posts
      WHERE id = post_id AND user_id = auth.uid()
    )
  );

-- ===========================================================================
-- 6. COMMENTS TABLE & POLICIES
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id uuid NOT NULL REFERENCES public.meowmery_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_post_id_idx ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS comments_user_id_idx ON public.comments(user_id);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to comments.
DROP POLICY IF EXISTS "Allow public read access to comments" ON public.comments;
CREATE POLICY "Allow public read access to comments"
  ON public.comments
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow authenticated users to create comments.
DROP POLICY IF EXISTS "Allow authenticated users to create comments" ON public.comments;
CREATE POLICY "Allow authenticated users to create comments"
  ON public.comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to update their own comments.
DROP POLICY IF EXISTS "Allow users to update their own comments" ON public.comments;
CREATE POLICY "Allow users to update their own comments"
  ON public.comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Allow users to delete their own comments.
DROP POLICY IF EXISTS "Allow users to delete their own comments" ON public.comments;
CREATE POLICY "Allow users to delete their own comments"
  ON public.comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ===========================================================================
-- 7. TAGS TABLE & POLICIES
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.tags (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to tags.
DROP POLICY IF EXISTS "Allow public read access to tags" ON public.tags;
CREATE POLICY "Allow public read access to tags"
  ON public.tags
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow authenticated users to create tags.
DROP POLICY IF EXISTS "Allow authenticated users to create tags" ON public.tags;
CREATE POLICY "Allow authenticated users to create tags"
  ON public.tags
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ===========================================================================
-- 8. POST_TAGS TABLE (JOIN TABLE) & POLICIES
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id uuid NOT NULL REFERENCES public.meowmery_posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS post_tags_post_id_idx ON public.post_tags(post_id);
CREATE INDEX IF NOT EXISTS post_tags_tag_id_idx ON public.post_tags(tag_id);

ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access to post_tags.
DROP POLICY IF EXISTS "Allow public read access to post_tags" ON public.post_tags;
CREATE POLICY "Allow public read access to post_tags"
  ON public.post_tags
  FOR SELECT
  TO public
  USING (true);

-- Policy: Allow the post owner to link tags.
DROP POLICY IF EXISTS "Allow post owner to link tags" ON public.post_tags;
CREATE POLICY "Allow post owner to link tags"
  ON public.post_tags
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meowmery_posts
      WHERE id = post_tags.post_id AND user_id = auth.uid()
    )
  );

-- Policy: Allow the post owner to unlink tags.
DROP POLICY IF EXISTS "Allow post owner to unlink tags" ON public.post_tags;
CREATE POLICY "Allow post owner to unlink tags"
  ON public.post_tags
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.meowmery_posts
      WHERE id = post_tags.post_id AND user_id = auth.uid()
    )
  );

-- ===========================================================================
-- 9. TRIGGER FUNCTION & TRIGGERS FOR updated_at
-- ===========================================================================

-- Create a function to automatically update the updated_at column on row updates.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers on each table that has an updated_at column.

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_meowmery_posts_updated_at ON public.meowmery_posts;
CREATE TRIGGER update_meowmery_posts_updated_at
  BEFORE UPDATE ON public.meowmery_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_updated_at ON public.media;
CREATE TRIGGER update_media_updated_at
  BEFORE UPDATE ON public.media
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tags_updated_at ON public.tags;
CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ===========================================================================
-- 10. TRIGGER FOR AUTO-CREATING USER PROFILES
-- ===========================================================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, username, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create a user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===========================================================================
-- END OF SCHEMA SETUP
-- ===========================================================================
