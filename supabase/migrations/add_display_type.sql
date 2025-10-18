-- Add display_type column to posts table
ALTER TABLE posts ADD COLUMN IF NOT EXISTS display_type TEXT DEFAULT 'hover';

-- Add check constraint to ensure valid display types
ALTER TABLE posts ADD CONSTRAINT posts_display_type_check 
  CHECK (display_type IN ('hover', 'slider', 'vertical', 'premium'));

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_posts_display_type ON posts(display_type);

-- Update existing posts to have default display_type
UPDATE posts SET display_type = 'hover' WHERE display_type IS NULL;
