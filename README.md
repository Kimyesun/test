# StudyHub

Cloudflare Workers와 D1 데이터베이스를 기반으로 구축된 현대적인 학습 플랫폼입니다. 사용자 인증 및 실시간 학습 추적 기능을 제공합니다.

## 개요

StudyHub는 그룹, 챌린지, 랭킹을 통해 사용자들이 함께 공부할 수 있는 서버리스 웹 애플리케이션입니다. Cloudflare의 엣지 인프라를 기반으로 전 세계 어디서나 낮은 지연시간으로 접근할 수 있습니다.

## 기술 스택

**프론트엔드**
- HTML5, CSS3, Vanilla JavaScript
- 모바일 우선 반응형 디자인
- FontAwesome 아이콘

**백엔드**
- Cloudflare Workers (엣지 컴퓨팅)
- Cloudflare D1 (서버리스 SQL 데이터베이스)
- JWT 기반 인증
- SHA-256 비밀번호 해싱

**배포**
- Cloudflare Pages (GitHub 자동 배포)
- Wrangler CLI

## 주요 기능

### 인증 시스템
- ID 기반 계정 회원가입
- JWT 토큰을 이용한 안전한 로그인 (7일 만료)
- 비밀번호 강도 검증
- localStorage를 활용한 세션 유지
- 자동 로그인 상태 관리

### 사용자 인터페이스
- 기능 소개가 포함된 랜딩 페이지
- 스터디 그룹, 챌린지, 랭킹 미리보기
- 전용 회원가입 및 로그인 페이지
- 애니메이션 전환 및 로딩 상태
- 실시간 폼 유효성 검사

### 보안
- SHA-256 비밀번호 해싱
- JWT 토큰 인증
- API 엔드포인트 CORS 설정
- 입력값 검증 및 sanitization
- 사용자 ID 형식 제한 (4-20자, 영문 소문자, 숫자, 언더스코어)

## 프로젝트 구조

```
/workspaces/test/
├── public/                 # 정적 리소스
│   ├── index.html         # 랜딩 페이지
│   ├── styles.css         # 전역 스타일
│   ├── script.js          # 메인 JavaScript
│   ├── login/             # 로그인 페이지
│   │   ├── index.html
│   │   ├── styles.css
│   │   └── script.js
│   └── signup/            # 회원가입 페이지
│       ├── index.html
│       ├── styles.css
│       └── script.js
├── src/                   # Worker 소스 코드
│   ├── index.js          # 메인 요청 핸들러
│   └── auth.js           # 인증 유틸리티
├── migrations/            # 데이터베이스 마이그레이션
│   └── 0001_create_users_table.sql
├── wrangler.toml         # Cloudflare 설정
├── package.json          # Node.js 의존성
└── README.md             # 문서
```

## 데이터베이스 스키마

### users 테이블

| 컬럼명 | 타입 | 설명 |
|--------|------|-------------|
| id | INTEGER | 기본키 (자동 증가) |
| user_id | TEXT | 고유 사용자 ID (로그인 식별자) |
| password_hash | TEXT | 해시된 비밀번호 |
| username | TEXT | 표시 이름 |
| email | TEXT | 이메일 주소 (선택사항) |
| created_at | DATETIME | 계정 생성 시간 |
| updated_at | DATETIME | 마지막 업데이트 시간 |
| last_login | DATETIME | 마지막 로그인 시간 |
| is_active | INTEGER | 계정 상태 (0=비활성, 1=활성) |
| profile_image | TEXT | 프로필 이미지 URL |
| bio | TEXT | 사용자 소개 |

**인덱스:**
- `idx_users_user_id`: `user_id` 컬럼에 대한 빠른 조회용 인덱스

## API 엔드포인트

### 인증

**POST /api/auth/signup**
새로운 사용자 계정을 등록합니다.

요청:
```json
{
  "userId": "john_doe",
  "password": "SecurePass123",
  "username": "홍길동"
}
```

응답:
```json
{
  "success": true,
  "message": "회원가입이 완료되었습니다.",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userId": "john_doe",
    "username": "홍길동",
    "createdAt": "2025-12-02T00:00:00.000Z"
  }
}
```

**POST /api/auth/login**
사용자를 인증하고 JWT 토큰을 발급합니다.

요청:
```json
{
  "userId": "john_doe",
  "password": "SecurePass123"
}
```

응답:
```json
{
  "success": true,
  "message": "로그인 성공",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "userId": "john_doe",
    "username": "홍길동",
    "email": null,
    "profileImage": null,
    "bio": null,
    "createdAt": "2025-12-02T00:00:00.000Z",
    "lastLogin": "2025-12-02T01:00:00.000Z"
  }
}
```

**GET /api/auth/me**
현재 사용자 정보를 조회합니다 (인증 필요).

헤더:
```
Authorization: Bearer <token>
```

응답:
```json
{
  "success": true,
  "user": {
    "id": 1,
    "userId": "john_doe",
    "username": "홍길동",
    "email": null,
    "profileImage": null,
    "bio": null,
    "createdAt": "2025-12-02T00:00:00.000Z",
    "lastLogin": "2025-12-02T01:00:00.000Z"
  }
}
```

**POST /api/auth/logout**
사용자를 로그아웃합니다 (클라이언트 측 토큰 제거).

응답:
```json
{
  "success": true,
  "message": "로그아웃되었습니다."
}
```

## 설치 방법

### 사전 요구사항
- Node.js 18+ 또는 Bun
- Cloudflare 계정
- Wrangler CLI

### 설정

1. 저장소 클론
```bash
git clone https://github.com/Kimyesun/test.git
cd test
```

2. 의존성 설치
```bash
npm install
```

3. D1 데이터베이스 생성
```bash
wrangler d1 create studyhub-db
```

출력된 `database_id`를 복사하여 `wrangler.toml`을 업데이트:
```toml
[[d1_databases]]
binding = "DB"
database_name = "studyhub-db"
database_id = "여기에-database-id-입력"
```

4. 데이터베이스 마이그레이션 실행
```bash
wrangler d1 migrations apply studyhub-db --remote
```

또는 Cloudflare 대시보드에서 직접 실행:
- Workers & Pages > D1 > studyhub-db > Console로 이동
- `migrations/0001_create_users_table.sql`의 SQL 실행

5. JWT 시크릿 설정
```bash
wrangler secret put JWT_SECRET
# 프롬프트가 나오면 강력한 랜덤 문자열 입력
```

6. Cloudflare에 배포
```bash
npm run deploy
```

## 로컬 개발

로컬 개발 서버 실행:
```bash
npm run dev
```

`http://localhost:8787`에서 애플리케이션에 접근할 수 있습니다.

로컬 D1 데이터베이스 사용:
```bash
npm run d1:migrate:local
```

## 테스트

### 수동 API 테스트

**회원가입:**
```bash
curl -X POST http://localhost:8787/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"userId":"testuser","password":"Test1234!","username":"테스트유저"}'
```

**로그인:**
```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userId":"testuser","password":"Test1234!"}'
```

**사용자 정보 조회:**
```bash
curl -X GET http://localhost:8787/api/auth/me \
  -H "Authorization: Bearer 여기에_토큰_입력"
```

### 데이터베이스 쿼리

모든 사용자 목록 조회:
```bash
wrangler d1 execute studyhub-db --remote \
  --command "SELECT id, user_id, username, created_at FROM users"
```

사용자 삭제:
```bash
wrangler d1 execute studyhub-db --remote \
  --command "DELETE FROM users WHERE user_id='testuser'"
```

## 설정

### 환경 변수

Wrangler secrets를 통해 설정:
```bash
wrangler secret put JWT_SECRET
```

### wrangler.toml

주요 설정 항목:
- `name`: Worker 이름
- `main`: 진입점 파일
- `compatibility_date`: Cloudflare Workers 호환성 날짜
- `[assets]`: 정적 파일 디렉토리
- `[[d1_databases]]`: D1 데이터베이스 바인딩

## 배포

### 자동 배포
GitHub의 main 브랜치에 푸시하면 Cloudflare Pages를 통해 자동으로 배포됩니다.

### 수동 배포
```bash
npm run deploy
```

### 커스텀 도메인 설정
1. Cloudflare에 도메인 추가
2. Workers & Pages 설정에서 커스텀 도메인 추가
3. 안내에 따라 DNS 레코드 설정

## 유효성 검사 규칙

### 사용자 ID
- 길이: 4-20자
- 허용 문자: 영문 소문자(a-z), 숫자(0-9), 언더스코어(_)
- 정규식: `^[a-z0-9_]{4,20}$`

### 비밀번호
- 최소 8자
- 대문자 포함 필수
- 소문자 포함 필수
- 숫자 포함 필수

### 사용자명
- 길이: 2-20자
- 모든 문자 허용

## 보안 고려사항

1. **비밀번호 저장**: SHA-256 해싱 사용 (프로덕션에서는 bcrypt 권장)
2. **JWT 토큰**: 7일 만료, localStorage에 저장
3. **CORS**: 현재 모든 origin 허용 (프로덕션에서는 제한 권장)
4. **입력 검증**: 모든 입력에 대한 서버 측 검증
5. **Rate Limiting**: 미구현 (프로덕션에서 추가 고려)

## 브라우저 지원

- ES6+ 지원하는 모던 브라우저
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 성능

- Cloudflare Workers를 통한 엣지 컴퓨팅
- 전역 CDN 분산
- 50ms 이하의 API 응답 시간
- 콜드 스타트 없음

## 향후 개선 사항

- 이메일 인증
- 비밀번호 재설정 기능
- OAuth 소셜 로그인 (Google, GitHub)
- 프로필 수정
- 스터디 그룹 기능
- 챌린지 시스템
- 랭킹 리더보드
- 실시간 알림

## 문제 해결

**"회원가입 처리 중 오류가 발생했습니다"**
- D1 데이터베이스 마이그레이션이 실행되었는지 확인
- wrangler.toml의 데이터베이스 바인딩 확인
- JWT_SECRET이 설정되었는지 확인

**"Database not found"**
- wrangler.toml의 database_id가 D1 데이터베이스와 일치하는지 확인
- `wrangler d1 list`로 데이터베이스 존재 여부 확인

**CORS 에러**
- src/index.js의 CORS 헤더 확인
- API 요청에 적절한 Content-Type 헤더가 포함되었는지 확인

## 라이선스

MIT License

## 기여

1. 저장소 포크
2. 기능 브랜치 생성
3. 변경사항 커밋
4. 브랜치에 푸시
5. Pull Request 오픈

## 지원

문제 및 질문사항:
- GitHub에 이슈 등록
- Cloudflare Workers 문서 확인
- Cloudflare 대시보드에서 배포 로그 확인

---

Cloudflare Workers로 구축 | StudyHub Team 유지관리
