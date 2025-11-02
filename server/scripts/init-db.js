/**
 * 데이터베이스 초기화 스크립트
 * 
 * 사용법:
 *   node scripts/init-db.js
 * 
 * 이 스크립트는 데이터베이스 스키마를 생성하고 초기 데이터를 삽입합니다.
 */

import { testConnection, initializeDatabase } from '../config/database.js';
import dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

const main = async () => {
  console.log('📋 데이터베이스 초기화 시작...\n');
  
  try {
    // 데이터베이스 연결 테스트
    console.log('🔄 데이터베이스 연결 테스트 중...');
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ 데이터베이스 연결 실패. 초기화를 중단합니다.');
      process.exit(1);
    }
    
    console.log('✅ 데이터베이스 연결 성공\n');
    
    // 데이터베이스 초기화 (테이블 생성 및 초기 데이터 삽입)
    console.log('🔄 데이터베이스 스키마 생성 및 초기 데이터 삽입 중...');
    const initialized = await initializeDatabase();
    
    if (initialized) {
      console.log('\n✅ 데이터베이스 초기화 완료!');
      console.log('\n📊 생성된 테이블:');
      console.log('   - menus (메뉴 정보)');
      console.log('   - options (메뉴 옵션)');
      console.log('   - orders (주문 정보)');
      console.log('   - order_items (주문 상세 항목)');
      process.exit(0);
    } else {
      console.error('❌ 데이터베이스 초기화 실패');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    process.exit(1);
  }
};

main();

