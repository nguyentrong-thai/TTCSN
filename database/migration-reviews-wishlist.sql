-- Chay mot lan tren database da tao truoc khi co wishlist va danh gia.
-- Nen sao luu database truoc khi chay migration.

-- Moi tai khoan chi giu lai danh gia moi nhat cho tung san pham.
DELETE older_review
FROM reviews AS older_review
JOIN reviews AS newer_review
  ON newer_review.user_id = older_review.user_id
 AND newer_review.product_id = older_review.product_id
 AND newer_review.id > older_review.id;

SET @review_key_exists = (
  SELECT COUNT(*)
  FROM information_schema.statistics
  WHERE table_schema = DATABASE()
    AND table_name = 'reviews'
    AND index_name = 'uniq_review_user_product'
);
SET @review_key_sql = IF(
  @review_key_exists = 0,
  'ALTER TABLE reviews ADD UNIQUE KEY uniq_review_user_product (user_id, product_id)',
  'SELECT 1'
);
PREPARE review_key_statement FROM @review_key_sql;
EXECUTE review_key_statement;
DEALLOCATE PREPARE review_key_statement;

CREATE TABLE IF NOT EXISTS wishlist_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  product_id  INT NOT NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_wishlist_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB;