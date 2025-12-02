# StudyHub - D1 데이터베이스 기반 회원가입/로그인 구축 가이드

## 📋 프로젝트 개요

StudyHub에 Cloudflare D1 데이터베이스를 사용한 완전한 회원가입/로그인 시스템을 구축했습니다.

### 주요 기능
- ✅ 사용자 회원가입 (이메일, 비밀번호, 사용자명)
- ✅ 로그인 및 JWT 토큰 기반 인증
- ✅ 비밀번호 해싱 (SHA-256)
- ✅ 비밀번호 강도 체크
- ✅ 반응형 UI/UX
- ✅ D1 데이터베이스 연동

## 🗂️ 프로젝트 구조

```
/workspaces/test/
├── src/
│   ├── index.js          # Cloudflare Worker 메인 핸들러
│   └── auth.js           # 인증 유틸리티 (해싱, JWT, 검증)
├── migrations/
│   └── 0001_create_users_table.sql  # D1 스키마
├── signup/
│   ├── index.html        # 회원가입 페이지
│   ├── script.js         # 회원가입 로직
│   └── styles.css        # 회원가입 스타일
├── login/
│   ├── index.html        # 로그인 페이지
│   ├── script.js         # 로그인 로직
│   └── styles.css        # 로그인 스타일
├── index.html            # 메인 랜딩 페이지
├── wrangler.toml         # Cloudflare 설정
└── package.json          # npm 스크립트
```

## 🚀 설치 및 배포 가이드

### 1. 사전 준비

```bash
# Wrangler CLI 설치 (글로벌)
npm install -g wrangler

# Cloudflare 로그인
wrangler login

# 프로젝트 의존성 설치
npm install
```

### 2. D1 데이터베이스 생성

```bash
# D1 데이터베이스 생성
wrangler d1 create studyhub-db
```

**출력 예시:**
```
✅ Successfully created DB 'studyhub-db'!
Created your database using D1's new storage backend.

[[d1_databases]]
binding = "DB"
database_name = "studyhub-db"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

**중요:** 출력된 `database_id`를 복사하여 `wrangler.toml` 파일의 `database_id` 항목에 붙여넣으세요.

### 3. wrangler.toml 업데이트

`wrangler.toml` 파일을 열고 실제 database_id로 변경:

```toml
[[d1_databases]]
binding = "DB"
database_name = "studyhub-db"
database_id = "실제-database-id-여기에-붙여넣기"
```

### 4. 데이터베이스 마이그레이션

**로컬 테스트용:**
```bash
npm run d1:migrate:local
```

**프로덕션 배포용:**
```bash
npm run d1:migrate:remote
```

### 5. JWT 시크릿 설정

보안을 위해 JWT 시크릿을 Wrangler Secret으로 설정:

```bash
npm run secret:jwt
# 또는
wrangler secret put JWT_SECRET
```

프롬프트가 나오면 강력한 랜덤 문자열 입력 (예: `openssl rand -base64 32` 사용)

### 6. 로컬 개발 서버 실행

```bash
npm run dev
# 또는
wrangler dev
```

브라우저에서 `http://localhost:8787` 접속

### 7. 프로덕션 배포

```bash
npm run deploy
# 또는
wrangler deploy
```

배포 완료 후 출력되는 URL로 접속하여 테스트하세요.

## 🧪 테스트 방법

### 로컬 테스트

1. **회원가입 테스트**
   - `/signup/` 페이지 접속
   - 이메일, 사용자명, 비밀번호 입력
   - 회원가입 버튼 클릭

2. **로그인 테스트**
   - `/login/` 페이지 접속
   - 등록한 이메일과 비밀번호로 로그인

3. **데이터베이스 확인**
   ```bash
   wrangler d1 execute studyhub-db --local --command "SELECT * FROM users"
   ```

### API 엔드포인트 직접 테스트

**회원가입:**
```bash
curl -X POST http://localhost:8787/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!",
    "username": "테스트유저"
  }'
```

**로그인:**
```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234!"
  }'
```

**사용자 정보 조회 (토큰 필요):**
```bash
curl -X GET http://localhost:8787/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 📊 데이터베이스 스키마

### users 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|------|
| id | INTEGER | 기본키 (자동증가) |
| email | TEXT | 이메일 (고유) |
| password_hash | TEXT | 해시된 비밀번호 |
| username | TEXT | 사용자명 |
| created_at | DATETIME | 생성일시 |
| updated_at | DATETIME | 수정일시 |
| last_login | DATETIME | 마지막 로그인 |
| is_active | INTEGER | 활성 상태 (0/1) |
| profile_image | TEXT | 프로필 이미지 URL |
| bio | TEXT | 자기소개 |

## 🔒 보안 고려사항

1. **비밀번호 해싱**: SHA-256 사용 (프로덕션에서는 bcrypt 권장)
2. **JWT 토큰**: 7일 만료, 시크릿 키는 환경변수로 관리
3. **CORS**: 모든 origin 허용 (필요시 특정 도메인으로 제한)
4. **입력 검증**: 
   - 이메일 형식 검증
   - 비밀번호 강도 체크 (8자 이상, 대소문자+숫자)
   - 사용자명 길이 제한 (2-20자)

## 🛠️ 유용한 명령어

### D1 데이터베이스 쿼리

```bash
# 로컬: 모든 사용자 조회
wrangler d1 execute studyhub-db --local --command "SELECT id, email, username, created_at FROM users"

# 원격: 모든 사용자 조회
wrangler d1 execute studyhub-db --remote --command "SELECT id, email, username, created_at FROM users"

# 특정 사용자 삭제
wrangler d1 execute studyhub-db --local --command "DELETE FROM users WHERE email='test@example.com'"

# 테이블 초기화
wrangler d1 execute studyhub-db --local --command "DROP TABLE users"
npm run d1:migrate:local
```

### 로그 확인

```bash
# 실시간 로그 확인
wrangler tail

# 특정 배포 버전 확인
wrangler deployments list
```

## 🔄 메인 페이지에 인증 상태 통합

메인 페이지(`index.html`)의 `script.js`에 다음 코드를 추가하여 로그인 상태를 반영할 수 있습니다:

```javascript
// 로그인 상태 확인
const token = localStorage.getItem('authToken');
const user = JSON.parse(localStorage.getItem('user') || '{}');

if (token && user.username) {
  // 로그인 상태 - 네비게이션 변경
  const navAuth = document.querySelector('.nav-auth');
  navAuth.innerHTML = `
    <span class="user-name">👋 ${user.username}님</span>
    <button class="btn btn-outline" id="logoutBtn">로그아웃</button>
  `;
  
  document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    window.location.reload();
  });
}
```

## 🎯 다음 단계 (선택사항)

1. **소셜 로그인 연동**: Google, GitHub OAuth
2. **이메일 인증**: Cloudflare Workers + Resend/SendGrid
3. **비밀번호 재설정**: 토큰 기반 리셋 플로우
4. **프로필 수정**: 사용자 정보 업데이트 API
5. **세션 관리**: Refresh Token 구현
6. **Rate Limiting**: API 요청 제한
7. **로그 시스템**: Cloudflare Analytics 연동

## 🐛 문제 해결

### "Database not found" 오류
- `wrangler.toml`의 `database_id`가 올바른지 확인
- D1 데이터베이스가 생성되었는지 확인: `wrangler d1 list`

### JWT 토큰 오류
- JWT_SECRET이 설정되었는지 확인: `wrangler secret list`
- 토큰 만료 시간 확인

### CORS 오류
- `src/index.js`의 `corsHeaders` 확인
- 필요시 특정 도메인만 허용하도록 수정

## 📞 지원

문제가 있거나 질문이 있으시면:
- GitHub Issues 생성
- Cloudflare Discord 커뮤니티 참여
- Cloudflare Workers 공식 문서 참조

---

**축하합니다! 🎉** StudyHub에 완전한 회원가입/로그인 시스템이 구축되었습니다.
