const express = require('express');
const { pool } = require('../config/db');
const UserModel = require('../models/userModel');
const { requireLogin } = require('../middlewares/authMiddleware');

const router = express.Router();
router.use(requireLogin);
function getCart(req) { return req.session.cart || []; }

router.get('/checkout', async (req, res, next) => {
  try {
    const cart = getCart(req);
    if (!cart.length) { req.flash('error', 'Giỏ hàng đang trống.'); return res.redirect('/cart'); }
    const user = await UserModel.findById(req.session.user.id);
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    res.render('orders/checkout', { title: 'Thanh toán - ElectroShop', cart, total, user });
  } catch (err) { next(err); }
});

router.post('/', async (req, res, next) => {
  let connection;
  try {
    const cart = getCart(req);
    const { shipping_address, shipping_phone, note } = req.body;
    if (!cart.length || !shipping_address || !shipping_phone) {
      req.flash('error', 'Vui lòng nhập địa chỉ và số điện thoại giao hàng.');
      return res.redirect('/orders/checkout');
    }
    connection = await pool.getConnection();
    await connection.beginTransaction();
    let total = 0;
    const items = [];
    for (const cartItem of cart) {
      const [[product]] = await connection.query('SELECT id, price, stock_qty FROM products WHERE id = ? AND is_active = 1 FOR UPDATE', [cartItem.id]);
      if (!product || product.stock_qty < cartItem.quantity) throw new Error(`Sản phẩm ${cartItem.name} không đủ tồn kho.`);
      total += Number(product.price) * cartItem.quantity;
      items.push({ id: product.id, quantity: cartItem.quantity, price: Number(product.price) });
    }
    const [orderResult] = await connection.query(
      'INSERT INTO orders (user_id, total_amount, shipping_address, shipping_phone, note) VALUES (?, ?, ?, ?, ?)',
      [req.session.user.id, total, shipping_address.trim(), shipping_phone.trim(), note || null]
    );
    for (const item of items) {
      await connection.query('INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES (?, ?, ?, ?)', [orderResult.insertId, item.id, item.quantity, item.price]);
      await connection.query('UPDATE products SET stock_qty = stock_qty - ? WHERE id = ?', [item.quantity, item.id]);
    }
    await connection.commit();
    req.session.cart = [];
    req.flash('success', `Đặt hàng thành công. Mã đơn #${orderResult.insertId}.`);
    res.redirect('/orders');
  } catch (err) {
    if (connection) await connection.rollback();
    req.flash('error', err.message || 'Không thể tạo đơn hàng.');
    res.redirect('/orders/checkout');
  } finally { if (connection) connection.release(); }
});

router.get('/', async (req, res, next) => {
  try {
    const [orders] = await pool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.session.user.id]);
    res.render('orders/index', { title: 'Đơn hàng của tôi', orders });
  } catch (err) { next(err); }
});

router.post('/:id/cancel', async (req, res, next) => {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [[order]] = await connection.query(
      "SELECT id FROM orders WHERE id = ? AND user_id = ? AND status = 'pending' FOR UPDATE",
      [req.params.id, req.session.user.id]
    );
    if (order) {
      const [items] = await connection.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [order.id]);
      for (const item of items) {
        await connection.query('UPDATE products SET stock_qty = stock_qty + ? WHERE id = ?', [item.quantity, item.product_id]);
      }
      await connection.query("UPDATE orders SET status = 'cancelled' WHERE id = ?", [order.id]);
    }
    await connection.commit();
    req.flash('success', 'Đã hủy đơn hàng nếu đơn chưa được xác nhận.');
    res.redirect('/orders');
  } catch (err) {
    if (connection) await connection.rollback();
    next(err);
  } finally { if (connection) connection.release(); }
});

module.exports = router;