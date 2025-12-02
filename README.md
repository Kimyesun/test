# 🎓 StudyHub

함께 공부하는 즐거움을 경험하는 학습 플랫폼

## ✨ 주요 기능

- 📝 **회원가입/로그인**: Cloudflare D1 데이터베이스 기반 인증 시스템
- 🔒 **보안**: JWT 토큰 기반 인증, SHA-256 비밀번호 해싱
- 🎨 **반응형 디자인**: 모바일, 태블릿, 데스크톱 완벽 지원
- ⚡ **Cloudflare Workers**: 엣지 컴퓨팅으로 빠른 응답 속도
- 🗄️ **D1 Database**: 서버리스 SQL 데이터베이스

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. D1 데이터베이스 생성

```bash
wrangler d1 create studyhub-db
```

출력된 `database_id`를 `wrangler.toml`에 추가하세요.

### 3. 마이그레이션 실행

```bash
npm run d1:migrate:local    # 로컬 개발용
npm run d1:migrate:remote   # 프로덕션용
```

### 4. JWT 시크릿 설정

```bash
npm run secret:jwt
```

### 5. 로컬 개발 서버 실행

```bash
npm run dev
```

`http://localhost:8787` 접속

### 6. 배포

```bash
npm run deploy
```

## 📖 상세 가이드

전체 설치 및 배포 가이드는 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)를 참조하세요.

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: JWT
- **Deployment**: Wrangler CLI

## 📁 프로젝트 구조

```
/
├── src/                  # Cloudflare Worker 코드
│   ├── index.js         # 메인 핸들러 (API 라우팅)
│   └── auth.js          # 인증 유틸리티
├── migrations/          # D1 데이터베이스 스키마
├── signup/              # 회원가입 페이지
├── login/               # 로그인 페이지
├── index.html           # 메인 랜딩 페이지
├── wrangler.toml        # Cloudflare 설정
└── package.json         # npm 스크립트
```

## 🔐 API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| POST | `/api/auth/signup` | 회원가입 |
| POST | `/api/auth/login` | 로그인 |
| GET | `/api/auth/me` | 사용자 정보 조회 (인증 필요) |
| POST | `/api/auth/logout` | 로그아웃 |

## 🧪 테스트

### 회원가입 테스트

```bash
curl -X POST http://localhost:8787/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!","username":"테스트"}'
```

### 로그인 테스트

```bash
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234!"}'
```

## 📊 데이터베이스 관리

```bash
# 사용자 목록 조회
wrangler d1 execute studyhub-db --local \
  --command "SELECT id, email, username FROM users"

# 사용자 삭제
wrangler d1 execute studyhub-db --local \
  --command "DELETE FROM users WHERE email='test@example.com'"
```

## 🎯 향후 계획

- [ ] 소셜 로그인 (Google, GitHub)
- [ ] 이메일 인증
- [ ] 비밀번호 재설정
- [ ] 프로필 수정
- [ ] 스터디 그룹 기능
- [ ] 챌린지 시스템
- [ ] 랭킹 시스템

## 📄 라이선스

MIT License

## 🤝 기여

기여는 언제나 환영합니다! Pull Request를 보내주세요.

---

Made with ❤️ by StudyHub Team
