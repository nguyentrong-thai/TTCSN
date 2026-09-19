-- =========================================================
-- CSDL: electro_shop
-- Website bán đồ điện tử - Bài tập lớn
-- =========================================================

CREATE DATABASE IF NOT EXISTS electro_shop
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE electro_shop;

-- ---------------------------------------------------------
-- Bảng người dùng (khách hàng + quản trị viên)
-- ---------------------------------------------------------
CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  full_name     VARCHAR(100)  NOT NULL,
  email         VARCHAR(150)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  phone         VARCHAR(20),
  address       VARCHAR(255),
  role          ENUM('user', 'admin') NOT NULL DEFAULT 'user',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Danh mục sản phẩm (VD: Điện thoại, Laptop, Phụ kiện...)
-- ---------------------------------------------------------
CREATE TABLE categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  slug        VARCHAR(120) NOT NULL UNIQUE,
  description TEXT
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Sản phẩm
-- ---------------------------------------------------------
CREATE TABLE products (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  category_id   INT NOT NULL,
  name          VARCHAR(200) NOT NULL,
  brand         VARCHAR(100),
  description   TEXT,
  price         DECIMAL(12,2) NOT NULL DEFAULT 0,
  stock_qty     INT NOT NULL DEFAULT 0,
  image_url     VARCHAR(255),
  is_active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name ON products(name);

-- ---------------------------------------------------------
-- Giỏ hàng: mỗi user có nhiều dòng cart_items
-- ---------------------------------------------------------
CREATE TABLE cart_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL DEFAULT 1,
  added_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_user_product (user_id, product_id)
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Đơn hàng
-- ---------------------------------------------------------
CREATE TABLE orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  user_id          INT NOT NULL,
  total_amount     DECIMAL(12,2) NOT NULL DEFAULT 0,
  status           ENUM('pending','confirmed','shipping','completed','cancelled')
                     NOT NULL DEFAULT 'pending',
  shipping_address VARCHAR(255) NOT NULL,
  shipping_phone   VARCHAR(20) NOT NULL,
  note             VARCHAR(255),
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Chi tiết đơn hàng (lưu lại giá tại thời điểm mua)
-- ---------------------------------------------------------
CREATE TABLE order_items (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  order_id    INT NOT NULL,
  product_id  INT NOT NULL,
  quantity    INT NOT NULL,
  unit_price  DECIMAL(12,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ---------------------------------------------------------
-- Đánh giá sản phẩm (tùy chọn - nâng cao)
-- ---------------------------------------------------------
CREATE TABLE reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  product_id  INT NOT NULL,
  user_id     INT NOT NULL,
  rating      TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- =========================================================
-- DỮ LIỆU MẪU (seed data)
-- =========================================================

-- Tài khoản admin mặc định (email: admin@electroshop.vn, mật khẩu: admin123)
INSERT INTO users (full_name, email, password_hash, role) VALUES
('Quản trị viên', 'admin@electroshop.vn', '$2b$10$Bk3pWmfrglXKJ98n1C4tEOuIe1B1n2P24FEB51wkIWoS0ZUvxqMcm', 'admin');

INSERT INTO categories (name, slug, description) VALUES
('Điện thoại', 'dien-thoai', 'Smartphone các hãng'),
('Laptop', 'laptop', 'Laptop văn phòng, gaming, đồ họa'),
('Phụ kiện', 'phu-kien', 'Tai nghe, sạc, ốp lưng, chuột, bàn phím'),
('Đồng hồ thông minh', 'dong-ho-thong-minh', 'Smartwatch các loại');

INSERT INTO products (category_id, name, brand, description, price, stock_qty, image_url) VALUES
(1, 'iPhone 15', 'Apple', 'iPhone 15 bản tiêu chuẩn, 128GB', 19990000, 20, '/images/products/iphone15.jpg'),
(1, 'Samsung Galaxy S24', 'Samsung', 'Flagship Android mới nhất', 18990000, 15, '/images/products/s24.jpg'),
(2, 'MacBook Air M2', 'Apple', 'Laptop mỏng nhẹ, chip M2, 8GB/256GB', 24990000, 10, '/images/products/macbook-air.jpg'),
(2, 'Asus TUF Gaming A15', 'Asus', 'Laptop gaming tầm trung, RTX 4050', 21990000, 8, '/images/products/tuf-a15.jpg'),
(3, 'Tai nghe AirPods Pro 2', 'Apple', 'Chống ồn chủ động, sạc không dây', 5490000, 30, '/images/products/airpods-pro2.jpg'),
(4, 'Apple Watch Series 9', 'Apple', 'Smartwatch cao cấp, theo dõi sức khỏe', 9990000, 12, '/images/products/watch-s9.jpg');
