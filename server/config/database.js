import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// 데이터베이스 연결 풀 생성
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cozy_coffee',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20, // 최대 연결 수
  idleTimeoutMillis: 30000, // 유휴 연결 타임아웃
  connectionTimeoutMillis: 2000, // 연결 타임아웃
});

// 연결 테스트 함수
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database connected successfully:', result.rows[0]);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

// 데이터베이스 초기화 함수
export const initializeDatabase = async () => {
  try {
    const client = await pool.connect();
    
    // 테이블 생성 쿼리들
    const createTables = `
      -- Menus 테이블
      CREATE TABLE IF NOT EXISTS menus (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        price INTEGER NOT NULL,
        image_url VARCHAR(255),
        stock_quantity INTEGER DEFAULT 0,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Options 테이블
      CREATE TABLE IF NOT EXISTS options (
        id SERIAL PRIMARY KEY,
        menu_id INTEGER REFERENCES menus(id) ON DELETE CASCADE,
        name VARCHAR(50) NOT NULL,
        price INTEGER DEFAULT 0,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Orders 테이블
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        order_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        total_price INTEGER NOT NULL,
        status VARCHAR(20) DEFAULT 'received',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Order_Items 테이블
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
        menu_id INTEGER REFERENCES menus(id),
        quantity INTEGER NOT NULL,
        unit_price INTEGER NOT NULL,
        subtotal INTEGER NOT NULL,
        selected_options JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- 인덱스 생성
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
      CREATE INDEX IF NOT EXISTS idx_orders_time ON orders(order_time);
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_options_menu_id ON options(menu_id);
    `;

    await client.query(createTables);
    console.log('✅ Database tables created successfully');
    
    // 초기 데이터 삽입
    await insertInitialData(client);
    
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
};

// 초기 데이터 삽입 함수
const insertInitialData = async (client) => {
  try {
    // 메뉴 데이터 확인
    const menuCheck = await client.query('SELECT COUNT(*) FROM menus');
    if (parseInt(menuCheck.rows[0].count) > 0) {
      console.log('📋 Initial data already exists, skipping...');
      return;
    }

    // 메뉴 데이터 삽입
    const menuInsert = `
      INSERT INTO menus (name, description, price, image_url, stock_quantity, is_available) VALUES
      ('아메리카노(ICE)', '진한 에스프레소에 시원한 얼음과 물을 더한 음료', 4000, '/images/americano-ice.jpg', 10, true),
      ('아메리카노(HOT)', '진한 에스프레소에 뜨거운 물을 더한 음료', 4000, '/images/americano-hot.jpg', 3, true),
      ('카페라떼', '부드러운 우유와 에스프레소의 조화', 5000, '/images/caffe-latte.jpg', 0, false);
    `;
    await client.query(menuInsert);

    // 옵션 데이터 삽입
    const optionInsert = `
      INSERT INTO options (menu_id, name, price, is_available) VALUES
      (1, '샷 추가', 500, true), (1, '시럽 추가', 0, true),
      (2, '샷 추가', 500, true), (2, '시럽 추가', 0, true),
      (3, '샷 추가', 500, true), (3, '시럽 추가', 0, true);
    `;
    await client.query(optionInsert);

    console.log('✅ Initial data inserted successfully');
  } catch (error) {
    console.error('❌ Initial data insertion failed:', error.message);
  }
};

export default pool;
