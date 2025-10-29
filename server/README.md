# COZY Coffee Server

COZY 커피 주문 앱의 백엔드 API 서버입니다.

## 🚀 시작하기

### 설치
```bash
npm install
```

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 서버 실행
```bash
npm start
```

## 📡 API 엔드포인트

### 기본 정보
- **Base URL**: `http://localhost:3001/api`
- **Health Check**: `GET /api/health`

### 메뉴 API
- `GET /api/menus` - 전체 메뉴 목록 조회
- `GET /api/menus/:id` - 특정 메뉴 상세 정보 조회

### 주문 API
- `POST /api/orders` - 새 주문 생성
- `GET /api/orders/:id` - 특정 주문 정보 조회

### 관리자 API
- `GET /api/admin/dashboard` - 관리자 대시보드 통계
- `GET /api/admin/inventory` - 재고 현황 조회
- `PATCH /api/admin/inventory/:id` - 재고 수량 수정
- `GET /api/admin/orders` - 주문 목록 조회 (관리자용)
- `PATCH /api/admin/orders/:id` - 주문 상태 변경

## 🗂️ 프로젝트 구조

```
server/
├── config/          # 설정 파일
├── controllers/     # 컨트롤러 (향후 추가)
├── middleware/      # 미들웨어 (향후 추가)
├── models/          # 데이터 모델 (향후 추가)
├── routes/          # API 라우트
├── utils/           # 유틸리티 함수 (향후 추가)
├── server.js        # 메인 서버 파일
└── package.json     # 프로젝트 설정
```

## 🛠️ 기술 스택

- **Node.js** - JavaScript 런타임
- **Express.js** - 웹 프레임워크
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - 환경 변수 관리
- **nodemon** - 개발용 자동 재시작

## 📝 개발 상태

현재 메모리 기반의 임시 데이터를 사용하고 있습니다. 향후 데이터베이스 연동 예정입니다.

### 완료된 기능
- ✅ Express 서버 설정
- ✅ CORS 설정
- ✅ 기본 API 라우트 구조
- ✅ 메뉴 조회 API
- ✅ 주문 생성 API
- ✅ 관리자 API (기본)

### 향후 개발 예정
- 🔄 데이터베이스 연동 (PostgreSQL)
- 🔄 데이터 검증 미들웨어
- 🔄 에러 처리 고도화
- 🔄 로깅 시스템
- 🔄 인증/인가 시스템
