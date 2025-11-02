# 데이터베이스 스키마 문서

이 문서는 COZY 커피 주문 앱의 PostgreSQL 데이터베이스 스키마를 설명합니다.

## 테이블 구조

### 1. `menus` 테이블 (메뉴 정보)

메뉴 기본 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | SERIAL | PRIMARY KEY | 메뉴 고유 ID |
| name | VARCHAR(100) | NOT NULL | 메뉴 이름 |
| description | TEXT | | 메뉴 설명 |
| price | INTEGER | NOT NULL | 기본 가격 |
| image_url | VARCHAR(255) | | 이미지 URL |
| stock_quantity | INTEGER | DEFAULT 0 | 재고 수량 |
| is_available | BOOLEAN | DEFAULT true | 판매 가능 여부 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성 시간 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 수정 시간 |

**인덱스**: 없음

### 2. `options` 테이블 (메뉴 옵션)

각 메뉴에 적용할 수 있는 옵션을 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | SERIAL | PRIMARY KEY | 옵션 고유 ID |
| menu_id | INTEGER | NOT NULL, FOREIGN KEY → menus(id) | 메뉴 ID |
| name | VARCHAR(50) | NOT NULL | 옵션 이름 |
| price | INTEGER | DEFAULT 0 | 추가 가격 |
| is_available | BOOLEAN | DEFAULT true | 옵션 사용 가능 여부 |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성 시간 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 수정 시간 |

**외래 키**: `menu_id` REFERENCES `menus(id)` ON DELETE CASCADE

**인덱스**: `idx_options_menu_id ON options(menu_id)`

### 3. `orders` 테이블 (주문 정보)

주문 기본 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | SERIAL | PRIMARY KEY | 주문 고유 ID |
| order_time | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | 주문 시간 |
| total_price | INTEGER | NOT NULL | 총 주문 금액 |
| status | VARCHAR(20) | DEFAULT 'received' | 주문 상태 (received, in_progress, completed) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성 시간 |
| updated_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 수정 시간 |

**인덱스**:
- `idx_orders_status ON orders(status)`
- `idx_orders_time ON orders(order_time)`

**주문 상태**:
- `received`: 주문 접수됨
- `in_progress`: 준비 중
- `completed`: 완료

### 4. `order_items` 테이블 (주문 상세 항목)

주문에 포함된 각 메뉴 항목 정보를 저장합니다.

| 컬럼명 | 타입 | 제약조건 | 설명 |
|--------|------|----------|------|
| id | SERIAL | PRIMARY KEY | 주문 항목 고유 ID |
| order_id | INTEGER | NOT NULL, FOREIGN KEY → orders(id) | 주문 ID |
| menu_id | INTEGER | NOT NULL, FOREIGN KEY → menus(id) | 메뉴 ID |
| quantity | INTEGER | NOT NULL | 주문 수량 |
| unit_price | INTEGER | NOT NULL | 단가 |
| subtotal | INTEGER | NOT NULL | 소계 (단가 × 수량) |
| selected_options | JSONB | | 선택된 옵션 정보 (JSON 배열) |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | 생성 시간 |

**외래 키**:
- `order_id` REFERENCES `orders(id)` ON DELETE CASCADE
- `menu_id` REFERENCES `menus(id)`

**인덱스**: `idx_order_items_order_id ON order_items(order_id)`

**selected_options JSONB 형식**:
```json
[
  {
    "id": 1,
    "name": "샷 추가",
    "price": 500
  },
  {
    "id": 2,
    "name": "시럽 추가",
    "price": 0
  }
]
```

## 초기 데이터

데이터베이스 초기화 시 다음 데이터가 자동으로 삽입됩니다:

### 메뉴 데이터

| ID | 이름 | 설명 | 가격 | 이미지 | 재고 | 판매 가능 |
|----|------|------|------|--------|------|----------|
| 1 | 아메리카노(ICE) | 진한 에스프레소에 시원한 얼음과 물을 더한 음료 | 4,000 | /images/americano-ice.jpg | 10 | 예 |
| 2 | 아메리카노(HOT) | 진한 에스프레소에 뜨거운 물을 더한 음료 | 4,000 | /images/americano-hot.jpg | 3 | 예 |
| 3 | 카페라떼 | 부드러운 우유와 에스프레소의 조화 | 5,000 | /images/caffe-latte.jpg | 0 | 아니오 (품절) |

### 옵션 데이터

각 메뉴(1, 2, 3)에 대해 다음 옵션이 생성됩니다:

| ID | 메뉴 ID | 이름 | 추가 가격 | 사용 가능 |
|----|---------|------|-----------|----------|
| - | 1,2,3 | 샷 추가 | 500 | 예 |
| - | 1,2,3 | 시럽 추가 | 0 | 예 |

## 관계도

```
menus (메뉴)
  │
  ├─→ options (옵션) [1:N]
  │
  └─→ order_items (주문 항목) [1:N]
       │
       └─→ orders (주문) [N:1]
```

## 데이터베이스 초기화

### 자동 초기화

서버 시작 시 (`server.js`):
```javascript
await initializeDatabase(); // 테이블 생성 + 초기 데이터 삽입
```

### 수동 초기화

초기화 스크립트 실행:
```bash
npm run init-db
```

또는:
```bash
node server/scripts/init-db.js
```

## 주의사항

1. **외래 키 제약**: 
   - 메뉴 삭제 시 옵션도 자동 삭제 (`ON DELETE CASCADE`)
   - 주문 삭제 시 주문 항목도 자동 삭제 (`ON DELETE CASCADE`)

2. **재고 관리**:
   - 주문 생성 시 자동으로 재고 차감
   - 재고가 0이 되면 `is_available`이 `false`로 업데이트

3. **JSONB 사용**:
   - `order_items.selected_options`는 JSONB 타입으로 유연한 옵션 저장 가능
   - 배열 또는 객체 형태로 저장 가능

4. **타임스탬프**:
   - 모든 테이블에 `created_at`, `updated_at` 자동 생성
   - `updated_at`은 데이터 수정 시 자동 업데이트

## 성능 최적화

다음 인덱스가 생성되어 있습니다:

- `idx_orders_status`: 주문 상태별 조회 최적화
- `idx_orders_time`: 주문 시간순 정렬 최적화
- `idx_order_items_order_id`: 주문 상세 조회 최적화
- `idx_options_menu_id`: 메뉴별 옵션 조회 최적화

## 마이그레이션

현재는 버전 1.0 스키마입니다. 향후 스키마 변경 시 마이그레이션 스크립트를 추가할 예정입니다.

