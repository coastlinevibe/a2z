-- Add slugs to existing posts that don't have them
-- This migration generates slugs from existing post titles

DO $$
DECLARE
  post_record RECORD;
  new_slug TEXT;
  base_slug TEXT;
  counter INT;
BEGIN
  -- Loop through all posts without slugs
  FOR post_record IN 
    SELECT id, title 
    FROM posts 
    WHERE slug IS NULL OR slug = ''
  LOOP
    -- Generate base slug from title
    base_slug := lower(regexp_replace(post_record.title, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := trim(both '-' from base_slug);
    base_slug := substring(base_slug from 1 for 50);
    
    -- Check if slug exists, if so add counter
    new_slug := base_slug;
    counter := 1;
    
    WHILE EXISTS (SELECT 1 FROM posts WHERE slug = new_slug AND id != post_record.id) LOOP
      new_slug := base_slug || '-' || counter;
      counter := counter + 1;
    END LOOP;
    
    -- Update the post with the new slug
    UPDATE posts 
    SET slug = new_slug 
    WHERE id = post_record.id;
    
    RAISE NOTICE 'Updated post % with slug: %', post_record.id, new_slug;
  END LOOP;
END $$;

-- Make slug required going forward
ALTER TABLE posts ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'posts_slug_key'
  ) THEN
    ALTER TABLE posts ADD CONSTRAINT posts_slug_key UNIQUE (slug);
  END IF;
END $$;
