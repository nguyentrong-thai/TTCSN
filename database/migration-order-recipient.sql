-- Add the required recipient name to existing orders.
-- Run once after backing up the database.

SET @recipient_column_exists = (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'orders'
    AND column_name = 'recipient_name'
);
SET @recipient_column_sql = IF(
  @recipient_column_exists = 0,
  'ALTER TABLE orders ADD COLUMN recipient_name VARCHAR(100) NULL AFTER user_id',
  'SELECT 1'
);
PREPARE recipient_column_statement FROM @recipient_column_sql;
EXECUTE recipient_column_statement;
DEALLOCATE PREPARE recipient_column_statement;

UPDATE orders o
JOIN users u ON u.id = o.user_id
SET o.recipient_name = COALESCE(NULLIF(TRIM(u.full_name), ''), 'Khach hang')
WHERE o.recipient_name IS NULL OR TRIM(o.recipient_name) = '';

ALTER TABLE orders
  MODIFY recipient_name VARCHAR(100) NOT NULL;
