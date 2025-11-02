# GitHub 저장소 Visibility 변경 가이드

## Private → Public 변경 방법

### 방법 1: 웹 인터페이스 (가장 쉬움)

1. **GitHub 저장소 접속**
   - https://github.com 에서 저장소로 이동

2. **Settings 탭 클릭**
   - 저장소 페이지 상단의 **Settings** 탭

3. **Danger Zone으로 이동**
   - 페이지 하단의 **Danger Zone** 섹션

4. **Change visibility 클릭**
   - **Change visibility** 버튼 클릭
   - **Change to public** 선택

5. **확인 및 저장**
   - 저장소 이름 입력하여 확인
   - **I understand, change repository visibility.** 체크박스 선택
   - 확인 버튼 클릭

### 방법 2: GitHub CLI 사용

#### 설치 확인
```bash
gh --version
```

설치되어 있지 않다면:
- Windows: `winget install GitHub.cli`
- 또는 https://cli.github.com/ 에서 다운로드

#### 인증
```bash
gh auth login
```

#### Visibility 변경
```bash
# 저장소 경로로 이동 (또는 전체 경로 지정)
cd /path/to/your/repo

# Public으로 변경
gh repo edit --visibility public

# 또는 저장소 전체 경로 지정
gh repo edit owner/repo-name --visibility public
```

## Render에서 재연동

### 1. 저장소 연결 확인
- Render 대시보드 → 서비스 선택
- **Settings** → **GitHub Repository** 확인
- Public으로 변경 후 자동으로 인식됩니다

### 2. 수동 재연결 (필요시)
- **Settings** → **GitHub Repository** 섹션
- **Disconnect** → 다시 **Connect** 클릭하여 연결

### 3. 새 배포 트리거
- **Manual Deploy** 버튼 클릭하여 새 배포 실행
- 또는 Git에 push하면 자동 배포

## 확인 방법

### GitHub에서 확인
- 저장소 페이지 우측 상단에 **Public** 배지 표시
- 또는 Settings → General → Repository visibility에서 확인

### Render에서 확인
- 서비스 로그에서 저장소 연결 확인
- 배포 로그에서 소스 코드 접근 여부 확인

## 주의사항

### ⚠️ Public 저장소 전환 시 주의점

1. **민감 정보 노출**
   - `.env` 파일이 커밋되어 있다면 즉시 제거 필요
   - API 키, 비밀번호 등 민감 정보 확인

2. **.gitignore 확인**
   - `.env`, `*.log`, `node_modules` 등이 제외되어 있는지 확인

3. **기존 커밋 히스토리**
   - 이미 커밋된 민감 정보는 히스토리에 남아있음
   - 필요시 `git filter-branch` 또는 GitHub의 지원팀에 문의

4. **환경 변수**
   - Render에서 환경 변수로 민감 정보 관리 권장

## 문제 해결

### Render에서 여전히 저장소를 찾지 못하는 경우

1. **Render 대시보드에서 재연결**
   - 서비스 → Settings → **Disconnect & Reconnect**

2. **권한 확인**
   - GitHub → Settings → Applications
   - Render 앱 권한 확인

3. **브랜치 확인**
   - Render 설정에서 올바른 브랜치 지정되었는지 확인

4. **저장소 이름 확인**
   - 정확한 저장소 이름 (owner/repo-name) 확인

## 예시: 환경 변수로 민감 정보 보호

### ❌ 잘못된 방법 (코드에 직접 포함)
```javascript
const API_KEY = "secret-key-12345"; // 절대 금지!
```

### ✅ 올바른 방법 (환경 변수 사용)
```javascript
const API_KEY = process.env.API_KEY; // 환경 변수에서 읽기
```

### Render에서 설정
1. 서비스 → **Environment** 탭
2. **Add Environment Variable** 클릭
3. 키-값 쌍 추가:
   - `API_KEY` = `your-secret-key`
   - `DATABASE_URL` = `your-database-url`

## 관련 문서
- [GitHub 문서: Making a private repository public](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/managing-repository-settings/changing-repository-visibility)
- [Render 문서: GitHub Integration](https://render.com/docs/github)

