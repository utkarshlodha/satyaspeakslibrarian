-- Create shared table
CREATE TABLE IF NOT EXISTS shared (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question TEXT NOT NULL,
    summary TEXT NOT NULL,
    video JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE shared ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to insert
CREATE POLICY "Allow authenticated users to insert shared content"
ON shared FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create policy to allow anyone to read shared content
CREATE POLICY "Allow anyone to read shared content"
ON shared FOR SELECT
TO public
USING (true); 