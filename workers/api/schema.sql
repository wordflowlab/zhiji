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
  features TEXT, -- JSON string
  constraints TEXT, -- JSON string
  model_id TEXT,
  status TEXT DEFAULT 'pending',
  total_score REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
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
  matrix_x REAL,
  matrix_y REAL,
  zone TEXT,
  suggestions TEXT, -- JSON string
  risks TEXT, -- JSON string
  reasoning TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evaluation_id) REFERENCES evaluations(id)
);

-- 插入演示用户
INSERT OR IGNORE INTO users (id, email, name, password_hash) 
VALUES ('user_demo', 'demo@zhiji.ai', '演示用户', 'demo_password_hash');