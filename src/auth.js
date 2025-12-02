/**
 * 인증 관련 유틸리티 함수들
 * Cloudflare Workers 환경에서 bcrypt와 JWT 처리
 */

// 비밀번호 해싱 (Web Crypto API 사용)
export async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
}

// 비밀번호 검증
export async function verifyPassword(password, hashedPassword) {
  const hashedInput = await hashPassword(password);
  return hashedInput === hashedPassword;
}

// JWT 토큰 생성 (간단한 구현 - 실제 프로덕션에서는 jose 라이브러리 사용 권장)
export async function generateToken(payload, secret, expiresIn = 86400) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = {
    ...payload,
    iat: now,
    exp: now + expiresIn
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(tokenPayload));
  
  const signature = await sign(`${encodedHeader}.${encodedPayload}`, secret);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// JWT 토큰 검증
export async function verifyToken(token, secret) {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    
    if (!encodedHeader || !encodedPayload || !signature) {
      return null;
    }

    // 서명 검증
    const expectedSignature = await sign(`${encodedHeader}.${encodedPayload}`, secret);
    if (signature !== expectedSignature) {
      return null;
    }

    // 페이로드 디코딩
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    
    // 만료 시간 확인
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// HMAC-SHA256 서명 생성
async function sign(data, secret) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  );
  
  return base64UrlEncode(signature);
}

// Base64 URL 인코딩
function base64UrlEncode(data) {
  let base64;
  if (typeof data === 'string') {
    base64 = btoa(data);
  } else if (data instanceof ArrayBuffer) {
    base64 = btoa(String.fromCharCode(...new Uint8Array(data)));
  } else {
    base64 = btoa(data);
  }
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// Base64 URL 디코딩
function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return atob(str);
}

// 사용자 ID 유효성 검사
export function isValidUserId(userId) {
  // 4-20자, 영문 소문자, 숫자, 언더스코어만 허용
  const userIdRegex = /^[a-z0-9_]{4,20}$/;
  return userIdRegex.test(userId);
}

// 비밀번호 강도 검사
export function isStrongPassword(password) {
  // 최소 8자, 대문자, 소문자, 숫자 포함
  return password.length >= 8 &&
         /[a-z]/.test(password) &&
         /[A-Z]/.test(password) &&
         /[0-9]/.test(password);
}

// 사용자 세션 토큰 생성 (랜덤)
export function generateSessionToken() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
