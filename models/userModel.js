const { pool } = require('../config/db');

const UserModel = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, address, role FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create({ full_name, email, password_hash, phone, address, role = 'user' }) {
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone, address, role)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, email, password_hash, phone || null, address || null, role]
    );
    return result.insertId;
  },

  async findEmployees() {
    const [rows] = await pool.query(
      "SELECT id, full_name, email, phone, address, role, created_at FROM users WHERE role = 'employee' ORDER BY created_at DESC"
    );
    return rows;
  },

  async findEmployeeById(id) {
    const [rows] = await pool.query(
      "SELECT id, full_name, email, phone, address, role FROM users WHERE id = ? AND role = 'employee'",
      [id]
    );
    return rows[0] || null;
  },
};

module.exports = UserModel;
