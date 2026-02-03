-- Joc QR Interactiu - Supabase Schema
-- Execute this SQL in your Supabase SQL Editor

-- Create question_type enum
CREATE TYPE question_type AS ENUM ('text', 'video', 'photo', 'true_false', 'multiple_choice');

-- Teams table
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  device_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questions table
CREATE TABLE questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  qr_code TEXT UNIQUE NOT NULL,
  type question_type NOT NULL DEFAULT 'text',
  title TEXT NOT NULL,
  description TEXT,
  options JSONB,
  correct_answer TEXT,
  points INTEGER NOT NULL DEFAULT 10,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Answers table
CREATE TABLE answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  answer_file_url TEXT,
  is_correct BOOLEAN,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, question_id)
);

-- Create indexes for better performance
CREATE INDEX idx_teams_device_id ON teams(device_id);
CREATE INDEX idx_questions_qr_code ON questions(qr_code);
CREATE INDEX idx_questions_active ON questions(active);
CREATE INDEX idx_answers_team_id ON answers(team_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- Enable Row Level Security (RLS)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teams
CREATE POLICY "Teams are viewable by everyone" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Teams can be created by anyone" ON teams
  FOR INSERT WITH CHECK (true);

-- RLS Policies for questions
CREATE POLICY "Questions are viewable by everyone" ON questions
  FOR SELECT USING (true);

CREATE POLICY "Questions can be created by anyone" ON questions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Questions can be updated by anyone" ON questions
  FOR UPDATE USING (true);

CREATE POLICY "Questions can be deleted by anyone" ON questions
  FOR DELETE USING (true);

-- RLS Policies for answers
CREATE POLICY "Answers are viewable by everyone" ON answers
  FOR SELECT USING (true);

CREATE POLICY "Answers can be created by anyone" ON answers
  FOR INSERT WITH CHECK (true);

-- Create storage bucket for answers (photos/videos)
-- Run this separately in Supabase Storage settings or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('answers', 'answers', true);

-- Storage policy for the answers bucket (run in SQL Editor):
-- CREATE POLICY "Anyone can upload to answers bucket" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'answers');
-- 
-- CREATE POLICY "Anyone can view answers bucket" ON storage.objects
--   FOR SELECT USING (bucket_id = 'answers');
