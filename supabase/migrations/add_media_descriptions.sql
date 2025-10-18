-- Add media_descriptions column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS media_descriptions JSONB DEFAULT '[]'::jsonb;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_posts_media_descriptions ON posts USING GIN(media_descriptions);

-- Update existing posts to have empty array
UPDATE posts SET media_descriptions = '[]'::jsonb WHERE media_descriptions IS NULL;
