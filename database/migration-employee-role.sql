-- Add the employee role to an existing users table.
-- Run once after backing up the database.
ALTER TABLE users
  MODIFY role ENUM('user', 'employee', 'admin') NOT NULL DEFAULT 'user';
