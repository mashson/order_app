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

### 데이터베이스 초기화
```bash
npm run init-db
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
- **PostgreSQL** - 관계형 데이터베이스
- **pg** - PostgreSQL Node.js 클라이언트
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - 환경 변수 관리
- **nodemon** - 개발용 자동 재시작

## 🗄️ 데이터베이스

PostgreSQL 데이터베이스를 사용합니다.

### 스키마
- `menus` - 메뉴 정보
- `options` - 메뉴 옵션
- `orders` - 주문 정보
- `order_items` - 주문 상세 항목

자세한 스키마 정보는 [DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md)를 참조하세요.

### 환경 변수
```env
# 로컬 개발 환경
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cozy_coffee
DB_USER=postgres
DB_PASSWORD=password

# Render 프로덕션 환경
DATABASE_URL=postgres://user:password@host:port/database
NODE_ENV=production
```

### 초기 데이터
데이터베이스 초기화 시 다음 데이터가 자동으로 삽입됩니다:
- 아메리카노(ICE) - 4,000원
- 아메리카노(HOT) - 4,000원
- 카페라떼 - 5,000원 (품절)

## 📝 개발 상태

### 완료된 기능
- ✅ Express 서버 설정
- ✅ CORS 설정
- ✅ PostgreSQL 데이터베이스 연동
- ✅ 데이터베이스 스키마 및 초기화
- ✅ 기본 API 라우트 구조
- ✅ 메뉴 조회 API (DB 연동)
- ✅ 주문 생성 API (DB 연동, 재고 관리)
- ✅ 관리자 API (DB 연동, 재고 관리)

### 향후 개발 예정
- 🔄 데이터 검증 미들웨어
- 🔄 에러 처리 고도화
- 🔄 로깅 시스템
- 🔄 인증/인가 시스템
