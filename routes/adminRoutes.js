const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { pool } = require('../config/db');
const { requireAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(requireAdmin);

const uploadDirectory = path.join(__dirname, '..', 'public', 'images', 'products');
fs.mkdirSync(uploadDirectory, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: uploadDirectory,
    filename: (req, file, callback) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const safeName = path.basename(file.originalname, extension).replace(/[^a-z0-9]+/gi, '-').toLowerCase().replace(/^-|-$/g, '') || 'product';
      callback(null, `${Date.now()}-${safeName}${extension}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (file.mimetype.startsWith('image/')) return callback(null, true);
    callback(new Error('Chỉ được upload file hình ảnh.'));
  },
});

function getUploadedImageUrl(file) {
  return file ? `/images/products/${file.filename}` : null;
}

router.get('/', async (req, res, next) => {
  try {
    const [[products]] = await pool.query('SELECT COUNT(*) AS count FROM products WHERE is_active = 1');
    const [[orders]] = await pool.query('SELECT COUNT(*) AS count FROM orders');
    const [[users]] = await pool.query('SELECT COUNT(*) AS count FROM users');
    res.render('admin/index', { title: 'Quản trị - ElectroShop', stats: { products: products.count, orders: orders.count, users: users.count } });
  } catch (err) { next(err); }
});

router.get('/products/new', async (req, res, next) => {
  try {
    const [categories] = await pool.query('SELECT id, name FROM categories ORDER BY name');
    res.render('admin/product-form', { title: 'Thêm sản phẩm', product: {}, categories, formAction: '/admin/products' });
  } catch (err) { next(err); }
});

router.post('/products', upload.single('image'), async (req, res, next) => {
  try {
    const { name, category_id, brand, description, price, stock_qty, image_url } = req.body;
    if (!name || !category_id || Number(price) < 0 || Number(stock_qty) < 0) {
      req.flash('error', 'Vui lòng nhập tên, danh mục, giá và tồn kho hợp lệ.');
      return res.redirect('/admin/products/new');
    }
    await pool.query(
      `INSERT INTO products (category_id, name, brand, description, price, stock_qty, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [category_id, name.trim(), brand || null, description || null, Number(price), Number(stock_qty), getUploadedImageUrl(req.file) || image_url || null]
    );
    req.flash('success', 'Đã thêm sản phẩm.');
    res.redirect('/admin');
  } catch (err) { next(err); }
});

router.get('/products/:id/edit', async (req, res, next) => {
  try {
    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    const [categories] = await pool.query('SELECT id, name FROM categories ORDER BY name');
    if (!product) return res.status(404).render('404', { title: 'Không tìm thấy sản phẩm' });
    res.render('admin/product-form', { title: 'Sửa sản phẩm', product, categories, formAction: `/admin/products/${product.id}/update` });
  } catch (err) { next(err); }
});

router.post('/products/:id/update', upload.single('image'), async (req, res, next) => {
  try {
    const { name, category_id, brand, description, price, stock_qty, image_url } = req.body;
    const [[currentProduct]] = await pool.query('SELECT image_url FROM products WHERE id = ?', [req.params.id]);
    if (!currentProduct) return res.status(404).render('404', { title: 'Không tìm thấy sản phẩm' });
    const finalImageUrl = getUploadedImageUrl(req.file) || image_url || currentProduct.image_url || null;
    await pool.query(
      `UPDATE products SET category_id = ?, name = ?, brand = ?, description = ?, price = ?, stock_qty = ?, image_url = ? WHERE id = ?`,
      [category_id, name.trim(), brand || null, description || null, Number(price), Number(stock_qty), finalImageUrl, req.params.id]
    );
    req.flash('success', 'Đã cập nhật sản phẩm.');
    res.redirect('/admin');
  } catch (err) { next(err); }
});

router.post('/products/:id/delete', async (req, res, next) => {
  try {
    await pool.query('UPDATE products SET is_active = 0 WHERE id = ?', [req.params.id]);
    req.flash('success', 'Đã ẩn sản phẩm khỏi cửa hàng.');
    res.redirect('/admin');
  } catch (err) { next(err); }
});

router.get('/categories', async (req, res, next) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY name');
    res.render('admin/categories', { title: 'Quản lý danh mục', categories });
  } catch (err) { next(err); }
});

router.get('/categories/:id/edit', async (req, res, next) => {
  try {
    const [[category]] = await pool.query('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    if (!category) return res.status(404).render('404', { title: 'Không tìm thấy danh mục' });
    res.render('admin/category-form', { title: 'Sửa danh mục', category, formAction: `/admin/categories/${category.id}/update` });
  } catch (err) { next(err); }
});

router.post('/categories', async (req, res, next) => {
  try {
    const { name, slug, description } = req.body;
    await pool.query('INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)', [name.trim(), slug.trim(), description || null]);
    req.flash('success', 'Đã thêm danh mục.');
    res.redirect('/admin/categories');
  } catch (err) { next(err); }
});

router.post('/categories/:id/update', async (req, res, next) => {
  try {
    const { name, slug, description } = req.body;
    await pool.query('UPDATE categories SET name = ?, slug = ?, description = ? WHERE id = ?', [name.trim(), slug.trim(), description || null, req.params.id]);
    req.flash('success', 'Đã cập nhật danh mục.');
    res.redirect('/admin/categories');
  } catch (err) { next(err); }
});

router.post('/categories/:id/delete', async (req, res, next) => {
  try {
    await pool.query('DELETE FROM categories WHERE id = ?', [req.params.id]);
    req.flash('success', 'Đã xóa danh mục.');
    res.redirect('/admin/categories');
  } catch (err) {
    req.flash('error', 'Không thể xóa danh mục đang có sản phẩm.');
    res.redirect('/admin/categories');
  }
});

router.get('/orders', async (req, res, next) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.full_name, u.email FROM orders o JOIN users u ON u.id = o.user_id ORDER BY o.created_at DESC`
    );
    res.render('admin/orders', { title: 'Quản lý đơn hàng', orders });
  } catch (err) { next(err); }
});

router.post('/orders/:id/status', async (req, res, next) => {
  try {
    const statuses = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];
    if (!statuses.includes(req.body.status)) return res.redirect('/admin/orders');
    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    req.flash('success', 'Đã cập nhật trạng thái đơn hàng.');
    res.redirect('/admin/orders');
  } catch (err) { next(err); }
});

module.exports = router;