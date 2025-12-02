-- 사용자 테이블 생성
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  username TEXT NOT NULL,
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active INTEGER DEFAULT 1,
  profile_image TEXT,
  bio TEXT
);

-- 사용자 ID 인덱스 생성 (빠른 조회)
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);

-- 사용자 세션 테이블 (선택적 - JWT 대신 세션 사용 시)
CREATE TABLE IF NOT EXISTS user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 세션 토큰 인덱스
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
