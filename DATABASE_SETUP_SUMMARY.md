# 데이터베이스 설정 완료 요약

## 📋 작업 완료 내역

### 1. 데이터베이스 초기화 스크립트 생성
- **파일**: `server/scripts/init-db.js`
- **기능**: 
  - 데이터베이스 연결 테스트
  - 테이블 자동 생성
  - 초기 데이터 자동 삽입
- **사용법**: `npm run init-db`

### 2. 문서 업데이트
- **RENDER_DEPLOY.md**: 데이터베이스 스키마 초기화 단계 추가
- **server/README.md**: 데이터베이스 관련 정보 업데이트
- **DATABASE_SCHEMA.md** (신규): 상세한 데이터베이스 스키마 문서

### 3. package.json 업데이트
- **npm script 추가**: `init-db` - 데이터베이스 초기화 명령

## 🗄️ 데이터베이스 스키마

### 테이블 구성
1. **menus** - 메뉴 정보
2. **options** - 메뉴 옵션
3. **orders** - 주문 정보
4. **order_items** - 주문 상세 항목

### 초기 데이터
- 아메리카노(ICE) - 4,000원 (재고: 10)
- 아메리카노(HOT) - 4,000원 (재고: 3)
- 카페라떼 - 5,000원 (재고: 0, 품절)
- 각 메뉴별 옵션: 샷 추가, 시럽 추가

## 🚀 Render 배포 방법

### 방법 1: 자동 초기화 (권장)
서버가 시작될 때 자동으로 데이터베이스 스키마가 생성됩니다.
- `server.js`의 `initializeDatabase()` 함수가 자동 실행
- 첫 배포 시 자동으로 테이블 생성 및 초기 데이터 삽입

### 방법 2: 수동 초기화
Render Shell을 통해 수동 실행:
1. Render 대시보드 → 백엔드 서비스 선택
2. **Shell** 탭 클릭
3. 다음 명령어 실행:
   ```bash
   cd /opt/render/project/src/server
   npm run init-db
   ```

## 📖 관련 문서
- **데이터베이스 스키마 상세**: `docs/DATABASE_SCHEMA.md`
- **Render 배포 가이드**: `RENDER_DEPLOY.md`
- **서버 README**: `server/README.md`

## ⚙️ 환경 변수

### 로컬 개발 환경
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cozy_coffee
DB_USER=postgres
DB_PASSWORD=password
```

### Render 프로덕션 환경
```env
DATABASE_URL=<Render에서 제공하는 Internal Database URL>
NODE_ENV=production
```

## ✨ 특징
- ✅ 자동 초기화: 서버 시작 시 자동으로 스키마 생성
- ✅ 중복 방지: 이미 데이터가 있으면 초기 데이터 삽입 건너뜀
- ✅ 트랜잭션 지원: 주문 생성 시 자동 재고 관리
- ✅ 외래 키 제약: 데이터 무결성 보장
- ✅ 인덱스 최적화: 주요 쿼리 성능 향상

## 🔍 확인 방법

배포 후 다음 URL로 확인:
- **헬스 체크**: `https://cozy-coffee-api.onrender.com/api/health`
- **메뉴 목록**: `https://cozy-coffee-api.onrender.com/api/menus`

응답이 정상적으로 오면 데이터베이스 스키마가 성공적으로 생성된 것입니다.

