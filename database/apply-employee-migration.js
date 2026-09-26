const { pool } = require('../config/db');

(async () => {
  await pool.query("ALTER TABLE users MODIFY role ENUM('user', 'employee', 'admin') NOT NULL DEFAULT 'user'");
  const [[gender]] = await pool.query("SELECT COUNT(*) AS count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'gender'");
  if (!gender.count) await pool.query("ALTER TABLE users ADD COLUMN gender ENUM('male', 'female', 'other') DEFAULT NULL AFTER address");
  const [[dateOfBirth]] = await pool.query("SELECT COUNT(*) AS count FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'users' AND column_name = 'date_of_birth'");
  if (!dateOfBirth.count) await pool.query("ALTER TABLE users ADD COLUMN date_of_birth DATE DEFAULT NULL AFTER gender");
  console.log('Employee migration complete.');
  await pool.end();
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
