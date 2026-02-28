CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

DO $$ BEGIN CREATE TYPE content_type AS ENUM ('article','pdf','video','tweet','epub','rss','note','highlight'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE review_status AS ENUM ('new','learning','review','relearning','graduated'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE highlight_color AS ENUM ('yellow','green','blue','pink','orange','purple'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
