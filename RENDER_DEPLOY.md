# Render 배포 가이드

이 문서는 COZY 커피 주문 앱을 Render 플랫폼에 배포하는 방법을 설명합니다.

## 배포 순서

### 1단계: PostgreSQL 데이터베이스 생성

1. [Render 대시보드](https://dashboard.render.com/)에 로그인
2. **New +** 버튼 클릭 → **PostgreSQL** 선택
3. 데이터베이스 설정:
   - **Name**: `cozy-coffee-db`
   - **Database**: `cozy_coffee`
   - **User**: `cozy_user` (또는 기본값)
   - **Region**: `Singapore` (또는 원하는 지역)
   - **PostgreSQL Version**: 최신 버전
   - **Plan**: `Free`
4. **Create Database** 클릭
5. 생성된 데이터베이스의 **Internal Database URL** 또는 **External Database URL** 복사
   - 내부 연결: 백엔드 서버에서 사용
   - 외부 연결: DBeaver 등 외부 툴에서 사용

### 2단계: 백엔드 API 서버 배포

1. Render 대시보드에서 **New +** 버튼 클릭 → **Web Service** 선택
2. Git 저장소 연결 (GitHub/GitLab/Bitbucket)
   - 저장소 선택 또는 연결
3. 서비스 설정:
   - **Name**: `cozy-coffee-api`
   - **Region**: `Singapore`
   - **Branch**: `main` (또는 기본 브랜치)
 hippocampal   - **Root Directory**: `server` (서버 폴더 지정)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`
4. 환경 변수 설정 (Environment Variables):
   ```
   NODE_ENV=production
   PORT=10000
   DATABASE_URL=<1단계에서 복사한 Internal Database URL>
   ```
 optimistic 5. **Advanced** 섹션에서:
   - **Health Check Path**: `/api/health`
6. **Create Web Service** 클릭
7. 배포 완료 후 **URL** 복사 (예: `https://cozy-coffee-api.onrender.com`)

### 3단계: 프론트엔드 배포

#### 방법 A: Static Site로 배포 (추천 - 무료)

1. Render 대시보드에서 **New +** 버튼 클릭 → **Static Site** 선택
2. Git 저장소 연결
3. 설정:
   - **Name**: `cozy-coffee-ui`
   - **Branch**: `main`
   - **Root Directory**: `ui`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Environment Variables**:
     ```
     VITE_API_BASE_URL=https://cozy-coffee-api.onrender.com/api
     ```
4. **Create Static Site** 클릭

#### 방법 B: Web Service로 배포

1. Render 대시보드에서 **New +** 버튼 클릭 → **Web Service** 선택
2. Git 저장소 연결
3. 설정:
   - **Name**: `cozy-coffee-ui`
   - **Root Directory**: `ui`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build && npm install -g serve`
   - **Start Command**: `serve -s dist -l 10000`
   - **Plan**: `Free`
4. 환경 변수:
   ```
   VITE_API_BASE_URL=https://cozy-coffee-api.onrender.com/api
   ```
5. **Create Web Service** 클릭

### 4단계: 백엔드 CORS 설정 업데이트

백엔드 서버의 환경 변수에 프론트엔드 URL 추가:

1. Render 대시보드 → 백엔드 서비스 (`cozy-coffee-api`) 선택
2. **Environment** 탭으로 이동
3. 환경 변수 추가:
   ```
   FRONTEND_URL=https://cozy-coffee-ui.onrender.com
   ```
4. **Save Changes** 클릭 (자동 재배포)

## 환경 변수 요약

### 백엔드 (cozy-coffee-api)
```
NODE_ENV=production
PORT=10000
DATABASE_URL=<PostgreSQL Internal Database URL>
FRONTEND_URL=https://cozy-coffee-ui.onrender.com
```

### 프론트엔드 (cozy-coffee-ui)
```
VITE_API_BASE_URL=https://cozy-coffee-api.onrender.com/api
```

## 배포 확인

1. **백엔드 헬스 체크**: `https://cozy-coffee-api.onrender.com/api/health`
2. **프론트엔드 접속**: `https://cozy-coffee-ui.onrender.com`

## 주의사항

1. **무료 플랜 제한사항**:
   - 15분간 요청이 없으면 서비스가 "sleep" 상태로 전환됩니다
   - 첫 요청 시 깨어나는 데 약 30초~1분 정도 소요됩니다
   - 데이터베이스는 90일간 비활성 시 삭제될 수 있습니다

2. **DATABASE_URL**:
   - 백엔드는 **Internal Database URL** 사용 (더 빠름)
   - 외부 툴(DBeaver 등)은 **External Database URL** 사용

3. **환경 변수**:
   - `VITE_` 접두사가 붙은 변수만 프론트엔드 빌드 시 포함됩니다
   - 환경 변수 변경 후 재배포가 필요할 수 있습니다

## 문제 해결

### 백엔드가 데이터베이스에 연결되지 않는 경우
- DATABASE_URL이 올바른지 확인
- Internal Database URL을 사용하는지 확인
- SSL 설정이 올바른지 확인

### CORS 에러가 발생하는 경우
- 백엔드의 FRONTEND_URL 환경 변수 확인
- 프론트엔드의 VITE_API_BASE_URL 확인

### 빌드 실패
- Build Logs에서 오류 확인
- Node.js 버전 확인 (Render는 자동으로 감지)
- 의존성 설치 오류 확인

