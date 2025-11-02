# Render 프론트엔드 설정 가이드

## Static Site가 보이지 않는 경우

### 1단계: Static Site 찾기

1. **Render Dashboard** 메인 화면 접속 (https://dashboard.render.com)
2. 왼쪽 사이드바에서 **"Static Sites"** 클릭
3. `order_app_front` 또는 유사한 이름 찾기

### 2단계: 프로젝트에 추가

Static Site를 찾았다면:

1. 해당 Static Site 클릭
2. 왼쪽 메뉴에서 **"Settings"** 클릭
3. **"Project"** 섹션 찾기
4. **"Add to Project"** 또는 드롭다운에서 `ORDER_APP` 선택
5. **Environment** 드롭다운에서 `Production` 선택
6. **"Save Changes"** 클릭

### 3단계: 환경 변수 설정 (중요!)

**Settings → Environment 섹션**

환경 변수 추가:
```
VITE_API_BASE_URL=https://order-app-api.onrender.com/api
```

> ⚠️ **주의**: 백엔드 서비스의 정확한 URL을 사용해야 합니다!

### 4단계: 재배포

1. **Manual Deploy** 탭으로 이동
2. **"Deploy latest commit"** 또는 **"Clear build cache & deploy"** 클릭

## 새로 Static Site 만들기 (처음부터)

기존 Static Site를 찾을 수 없거나 다시 만들려면:

### 1. New Static Site 생성

1. Render Dashboard → **"+ New"** → **"Static Site"**
2. Git 저장소 연결 (`mashson/order_app`)

### 2. 기본 설정

| 항목 | 값 |
|------|-----|
| **Name** | `order-app-front` |
| **Project** | `ORDER_APP` |
| **Environment** | `Production` |
| **Branch** | `main` |
| **Root Directory** | `ui` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

### 3. 환경 변수 설정

**Environment Variables** 섹션에서:

```
VITE_API_BASE_URL=https://order-app-api.onrender.com/api
```

### 4. Create Static Site

**"Create Static Site"** 버튼 클릭

## 프론트엔드 - 백엔드 연동 확인

### 백엔드 환경 변수 업데이트

**백엔드 서비스 → Environment**

```
FRONTEND_URL=https://order-app-front.onrender.com
```

(또는 Static Site의 실제 URL)

### 연동 테스트

1. 프론트엔드 URL 접속
2. F12 → Console 탭
3. 다음 확인:
   - `localhost` 관련 에러 없음
   - API 요청이 `https://order-app-api.onrender.com/api`로 전송됨

## 완성된 구조

ORDER_APP 프로젝트에는 다음 3개가 있어야 합니다:

1. **order-app-api** (Web Service - Node.js)
   - Root Directory: `server`
   - 환경 변수: `DATABASE_URL`, `FRONTEND_URL`, `NODE_ENV`

2. **order-app-db** (PostgreSQL Database)
   - Internal URL을 백엔드의 `DATABASE_URL`로 사용

3. **order-app-front** (Static Site)
   - Root Directory: `ui`
   - 환경 변수: `VITE_API_BASE_URL`

## 문제 해결

### Static Site가 여전히 보이지 않는 경우

1. **왼쪽 상단 "My Workspace" 클릭** → 다른 workspace 확인
2. **Dashboard → All Services** 에서 전체 검색
3. 생성 로그 확인 (생성 중 에러 발생 가능성)

### 배포가 실패하는 경우

**Deploy Logs** 확인:
- Build command 에러
- Root Directory 경로 확인
- package.json 위치 확인

### CORS 에러가 계속 발생하는 경우

1. 백엔드 `FRONTEND_URL` 확인 (정확한 Static Site URL)
2. 프론트엔드 `VITE_API_BASE_URL` 확인 (정확한 백엔드 URL + `/api`)
3. 양쪽 모두 재배포

## 최종 체크리스트

- [ ] Static Site가 ORDER_APP 프로젝트에 포함됨
- [ ] 프론트엔드 환경 변수 `VITE_API_BASE_URL` 설정됨
- [ ] 백엔드 환경 변수 `FRONTEND_URL` 설정됨
- [ ] 프론트엔드 배포 성공 (녹색 체크)
- [ ] 프론트엔드 URL 접속 가능
- [ ] 브라우저 콘솔에 localhost 에러 없음
- [ ] 관리자 화면에서 "제조 시작" 정상 작동

