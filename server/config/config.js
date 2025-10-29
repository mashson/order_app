export const config = {
  server: {
    port: process.env.PORT || 3001,
    env: process.env.NODE_ENV || 'development'
  },
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true
  },
  // 향후 데이터베이스 설정 추가
  database: {
    // host: process.env.DB_HOST || 'localhost',
    // port: process.env.DB_PORT || 5432,
    // name: process.env.DB_NAME || 'cozy_coffee',
    // user: process.env.DB_USER || 'postgres',
    // password: process.env.DB_PASSWORD || 'password'
  }
};
