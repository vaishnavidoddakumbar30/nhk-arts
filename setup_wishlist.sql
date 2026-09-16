-- Run this in the Supabase SQL Editor

CREATE TABLE wishlists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, artwork_id)
);

-- Enable RLS
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own wishlists
CREATE POLICY "Users can view their own wishlists"
ON wishlists FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own wishlists
CREATE POLICY "Users can insert their own wishlists"
ON wishlists FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own wishlists
CREATE POLICY "Users can delete their own wishlists"
ON wishlists FOR DELETE
USING (auth.uid() = user_id);
