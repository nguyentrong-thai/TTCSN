const mysql = require('mysql2/promise');
require('dotenv').config();

// Tạo connection pool - dùng chung cho toàn bộ app, tránh mở/đóng kết nối liên tục
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'electro_shop',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Kiểm tra kết nối khi khởi động server
async function testConnection() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Kết nối MySQL thành công (database: %s)', process.env.DB_NAME);
    conn.release();
  } catch (err) {
    console.error('❌ Lỗi kết nối MySQL:', err.message);
    console.error('   Kiểm tra lại: MySQL đã chạy chưa? Thông tin trong file .env đã đúng chưa?');
  }
}

module.exports = { pool, testConnection };
