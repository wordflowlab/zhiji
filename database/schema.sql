-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('user', 'vip', 'admin')),
  credits INTEGER DEFAULT 10,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 评估记录表
CREATE TABLE IF NOT EXISTS evaluations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  project_name TEXT NOT NULL,
  description TEXT,
  target_users TEXT,
  features TEXT,
  constraints TEXT,
  model_id TEXT DEFAULT 'gpt-5',
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
  total_score INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 评估指标表
CREATE TABLE IF NOT EXISTS evaluation_metrics (
  id TEXT PRIMARY KEY,
  evaluation_id TEXT NOT NULL,
  clarity_score INTEGER,
  capability_score INTEGER,
  objectivity_score INTEGER,
  data_score INTEGER,
  tolerance_score INTEGER,
  matrix_x INTEGER,
  matrix_y INTEGER,
  zone TEXT CHECK(zone IN ('optimal', 'easy', 'challenge', 'infeasible', 'over-investment')),
  suggestions TEXT,
  risks TEXT,
  reasoning TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id) ON DELETE CASCADE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_evaluations_user_id ON evaluations(user_id);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);
CREATE INDEX IF NOT EXISTS idx_evaluations_created_at ON evaluations(created_at);
CREATE INDEX IF NOT EXISTS idx_evaluation_metrics_evaluation_id ON evaluation_metrics(evaluation_id);