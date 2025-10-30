# Render 배포 체크리스트

이 문서는 Render에 배포하기 전 확인해야 할 사항들을 체크리스트 형식으로 정리합니다.

## ✅ 배포 전 준비사항

### 1. 코드 준비
- [x] `render.yaml` 파일 생성 완료
- [x] 데이터베이스 연결 설정 업데이트 (DATABASE_URL 지원)
- [x] CORS 설정 업데이트 (프로덕션 URL 포함)
- [x] 환경 변수 설정 파일 준비
- [ ] Git 저장소에 모든 변경사항 커밋 및 푸시

### 2. Git 저장소 준비
- [ ] GitHub/GitLab/Bitbucket 저장소 생성
- [ ] 로컬 코드 푸시
- [ ] Render와 Git 저장소 연결 가능 확인

### 3. Render 계정 준비
- [ ] [Render](https://render.com) 계정 생성 (GitHub 계정으로 가입 가능)
- [ ] 무료 플랜 확인 (Free tier)

## 📋 배포 순서 (단계별)

### Step 1: PostgreSQL 데이터베이스 생성

1. Render 대시보드 접속
2. **New +** → **PostgreSQL** 선택
3. 설정 입력:
   ```
   Name: cozy-coffee-db
   Database: cozy_coffee
   User: cozy_user (또는 기본값)
   Region: Singapore
   PostgreSQL Version: 최신
   Plan: Free
   ```
4. **Create Database** 클릭
5. ⚠️ **중요**: Internal Database URL 복사 (나중에 사용)

### Step 2: 백엔드 API 서버 배포

1. **New +** → **Web Service** 선택
2. Git 저장소 연결/선택
3. 서비스 설정:
   ```
   Name: cozy-coffee-api
   Region: Singapore
   Branch: main (또는 기본 브랜치)
   Root Directory: server
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   Plan: Free
   ```
4. **Environment Variables** 추가:
   ```
   NODE_ENV = production
   PORT = 10000
   DATABASE_URL = <Step 1에서 복사한 Internal Database URL>
   ```
5. **Advanced** 설정:
   ```
   Health Check Path: /api/health
   ```
6. **Create Web Service** 클릭
7. frequent **중요**: 배포 완료 후 URL 복사 (예: `https://cozy-coffee-api.onrender.com`)

### Step 3: 프론트엔드 배포

1. **New +** → **Static Site** 선택
2. Git 저장소 연결/선택
3. 설정:
   ```
   Name: cozy-coffee-ui
   Branch: main
   Root Directory: ui
   Build Command: npm install && npm run build
   Publish Directory: dist
   ```
4. **Environment Variables** 추가:
   ```
   VITE_API_BASE_URL = https://cozy-coffee-api.onrender.com/api
   ```
   (Step 2에서 복사한 백엔드 URL 사용)
5. **Create Static Site** 클릭
6. 배포 완료 후 프론트엔드 URL 확인

### Step 4: CORS 설정 업데이트

1. 백엔드 서비스 (`cozy-coffee-api`) 설정 페이지 이동
2. **Environment** 탭 클릭
3. 환경 변수 추가:
   ```
   FRONTEND_URL = <Step 3의 프론트엔드 URL>
   ```
4. **Save Changes** 클릭 (자동 재배포)

## 🧪 배포 후 확인

### 백엔드 확인
- [ ] 헬스 체크: `https://cozy-coffee-api.onrender.com/api/health`
- [ ] 응답 확인: `{"success": true, "message": "Server is healthy", ...}`
- [ ] 메뉴 API: `https://cozy-coffee-api.onrender.com/api/menus`

### 프론트엔드 확인
- [ ] 프론트엔드 접속: `https://cozy-coffee-ui.onrender.com`
- [ ] 메뉴 목록이 정상적으로 표시되는지 확인
- [ ] 주문 기능이 정상 동작하는지 확인
- [ ] 관리자 화면이 정상 동작하는지 확인

### 데이터베이스 확인
- [ ] DBeaver 또는 pgAdmin으로 외부 연결 테스트
- [ ] External Database URL 사용하여 연결
- [ ] 테이블이 정상 생성되었는지 확인
  - menus
  - options
  - orders
  - order_items
- [ ] 초기 데이터가 정상 삽입되었는지 확인

## ⚠️ 주의사항

1. **무료 플랜 제한사항**:
   - 15분간 요청 없으면 서비스가 sleep 상태
   - 첫 요청 시 깨어나는 데 30초~1분 소요
   - 데이터베이스는 90일간 비활성 시 삭제될 수 있음

2. **DATABASE_URL**:
   - 백엔드는 Internal Database URL 사용 (더 빠름, 보안 좋음)
   - 외부 툴은 External Database URL 사용

3. **환경 변수**:
   - `VITE_` 접두사 변수만 프론트엔드 빌드에 포함
   - 환경 변수 변경 후 재배포 필요할 수 있음

4. **빌드/배포 시간**:
   - 첫 배포: 5-10분 정도 소요
   - 이후 배포: Git push 시 자동으로 재배포 (Blue-Green 배포)

## 🔧 문제 해결

### 배포 실패 시
1. **Build Logs** 확인 (서비스 페이지 → Logs 탭)
2. **Runtime Logs** 확인
3. 환경 변수 오타 확인
4. Root Directory 경로 확인

### CORS 에러 발생 시
1. 백엔드 `FRONTEND_URL` 환경 변수 확인
2. 프론트엔드 `VITE_API_BASE_URL` 확인
3. 두 서비스 모두 재배포

### 데이터베이스 연결 실패 시
1. `DATABASE_URL` 형식 확인
2. Internal Database URL 사용 중인지 확인 domestic
3. SSL 설정 확인 (production 환경)
4. 데이터베이스 서비스가 실행 중인지 확인

## 📝 참고 자료

- [Render 공식 문서](https://render.com/docs)
- [Render PostgreSQL 문서](https:// שע.com/docs/databases)
- 상세 배포 가이드: `RENDER_DEPLOY.md` 파일 참고

