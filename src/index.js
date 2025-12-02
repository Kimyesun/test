/**
 * Cloudflare Workers - StudyHub API
 * 회원가입, 로그인, 인증 처리
 */

import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  verifyToken,
  isValidUserId,
  isStrongPassword 
} from './auth.js';

// CORS 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS preflight 요청 처리
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: corsHeaders
      });
    }

    // 라우팅
    try {
      // API 엔드포인트
      if (url.pathname.startsWith('/api/')) {
        // 회원가입
        if (url.pathname === '/api/auth/signup' && request.method === 'POST') {
          return await handleSignup(request, env);
        }
        
        // 로그인
        if (url.pathname === '/api/auth/login' && request.method === 'POST') {
          return await handleLogin(request, env);
        }
        
        // 토큰 검증 (사용자 정보 조회)
        if (url.pathname === '/api/auth/me' && request.method === 'GET') {
          return await handleGetUser(request, env);
        }
        
        // 로그아웃
        if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
          return await handleLogout(request, env);
        }

        return jsonResponse({ error: 'Not found' }, 404);
      }

      // 정적 파일은 Assets로 처리
      return env.ASSETS.fetch(request);
      
    } catch (error) {
      console.error('Error:', error);
      return jsonResponse({ 
        error: 'Internal server error',
        message: error.message 
      }, 500);
    }
  }
};

// ===== 회원가입 처리 =====
async function handleSignup(request, env) {
  try {
    const body = await request.json();
    const { userId, password, username } = body;

    // 입력값 검증
    if (!userId || !password || !username) {
      return jsonResponse({ 
        error: '아이디, 비밀번호, 사용자명을 모두 입력해주세요.' 
      }, 400);
    }

    if (!isValidUserId(userId)) {
      return jsonResponse({ 
        error: '아이디는 4-20자의 영문 소문자, 숫자, 언더스코어(_)만 사용 가능합니다.' 
      }, 400);
    }

    if (!isStrongPassword(password)) {
      return jsonResponse({ 
        error: '비밀번호는 최소 8자 이상이며, 대문자, 소문자, 숫자를 포함해야 합니다.' 
      }, 400);
    }

    if (username.length < 2 || username.length > 20) {
      return jsonResponse({ 
        error: '사용자명은 2자 이상 20자 이하여야 합니다.' 
      }, 400);
    }

    // 아이디 중복 확인
    const existingUser = await env.DB.prepare(
      'SELECT id FROM users WHERE user_id = ?'
    ).bind(userId).first();

    if (existingUser) {
      return jsonResponse({ 
        error: '이미 사용 중인 아이디입니다.' 
      }, 409);
    }

    // 비밀번호 해싱
    const passwordHash = await hashPassword(password);

    // 사용자 생성
    const result = await env.DB.prepare(
      `INSERT INTO users (user_id, password_hash, username, created_at, updated_at)
       VALUES (?, ?, ?, datetime('now'), datetime('now'))`
    ).bind(userId, passwordHash, username).run();

    if (!result.success) {
      throw new Error('Failed to create user');
    }

    // 생성된 사용자 정보 조회
    const newUser = await env.DB.prepare(
      'SELECT id, user_id, username, created_at FROM users WHERE user_id = ?'
    ).bind(userId).first();

    // JWT 토큰 생성
    const token = await generateToken(
      { 
        id: newUser.id, 
        userId: newUser.user_id,
        username: newUser.username
      },
      env.JWT_SECRET || 'your-secret-key-change-in-production',
      86400 * 7 // 7일
    );

    return jsonResponse({
      success: true,
      message: '회원가입이 완료되었습니다.',
      token,
      user: {
        id: newUser.id,
        userId: newUser.user_id,
        username: newUser.username,
        createdAt: newUser.created_at
      }
    }, 201);

  } catch (error) {
    console.error('Signup error:', error);
    return jsonResponse({ 
      error: '회원가입 처리 중 오류가 발생했습니다.',
      message: error.message 
    }, 500);
  }
}

// ===== 로그인 처리 =====
async function handleLogin(request, env) {
  try {
    const body = await request.json();
    const { userId, password } = body;

    // 입력값 검증
    if (!userId || !password) {
      return jsonResponse({ 
        error: '아이디와 비밀번호를 입력해주세요.' 
      }, 400);
    }

    // 사용자 조회
    const user = await env.DB.prepare(
      'SELECT * FROM users WHERE user_id = ? AND is_active = 1'
    ).bind(userId).first();

    if (!user) {
      return jsonResponse({ 
        error: '아이디 또는 비밀번호가 올바르지 않습니다.' 
      }, 401);
    }

    // 비밀번호 검증
    const isValid = await verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      return jsonResponse({ 
        error: '아이디 또는 비밀번호가 올바르지 않습니다.' 
      }, 401);
    }

    // 마지막 로그인 시간 업데이트
    await env.DB.prepare(
      `UPDATE users SET last_login = datetime('now') WHERE id = ?`
    ).bind(user.id).run();

    // JWT 토큰 생성
    const token = await generateToken(
      { 
        id: user.id, 
        userId: user.user_id,
        username: user.username
      },
      env.JWT_SECRET || 'your-secret-key-change-in-production',
      86400 * 7 // 7일
    );

    return jsonResponse({
      success: true,
      message: '로그인 성공',
      token,
      user: {
        id: user.id,
        userId: user.user_id,
        username: user.username,
        email: user.email,
        profileImage: user.profile_image,
        bio: user.bio,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return jsonResponse({ 
      error: '로그인 처리 중 오류가 발생했습니다.',
      message: error.message 
    }, 500);
  }
}

// ===== 사용자 정보 조회 (토큰 검증) =====
async function handleGetUser(request, env) {
  try {
    // Authorization 헤더에서 토큰 추출
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return jsonResponse({ 
        error: '인증 토큰이 필요합니다.' 
      }, 401);
    }

    const token = authHeader.substring(7);
    const payload = await verifyToken(
      token, 
      env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    if (!payload) {
      return jsonResponse({ 
        error: '유효하지 않거나 만료된 토큰입니다.' 
      }, 401);
    }

    // 사용자 정보 조회
    const user = await env.DB.prepare(
      'SELECT id, user_id, username, email, profile_image, bio, created_at, last_login FROM users WHERE id = ? AND is_active = 1'
    ).bind(payload.id).first();

    if (!user) {
      return jsonResponse({ 
        error: '사용자를 찾을 수 없습니다.' 
      }, 404);
    }

    return jsonResponse({
      success: true,
      user: {
        id: user.id,
        userId: user.user_id,
        username: user.username,
        email: user.email,
        profileImage: user.profile_image,
        bio: user.bio,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return jsonResponse({ 
      error: '사용자 정보 조회 중 오류가 발생했습니다.' 
    }, 500);
  }
}

// ===== 로그아웃 처리 =====
async function handleLogout(request, env) {
  // JWT는 서버 측에서 무효화할 수 없으므로 클라이언트에서 토큰 삭제
  // 세션 기반을 사용한다면 여기서 DB의 세션 삭제
  return jsonResponse({
    success: true,
    message: '로그아웃되었습니다.'
  });
}

// ===== JSON 응답 헬퍼 함수 =====
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}
