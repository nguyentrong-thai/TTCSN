-- Add employee profile fields to an existing users table.
-- Run once after backing up the database.
ALTER TABLE users
  ADD COLUMN gender ENUM('male', 'female', 'other') DEFAULT NULL AFTER address,
  ADD COLUMN date_of_birth DATE DEFAULT NULL AFTER gender;