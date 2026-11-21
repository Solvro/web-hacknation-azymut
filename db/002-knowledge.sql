CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS knowledge_chunk (
  id text PRIMARY KEY,
  digest text NOT NULL,
  model text NOT NULL,
  embedding vector(1024) NOT NULL
);
