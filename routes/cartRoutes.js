const express = require('express');
const ProductModel = require('../models/productModel');

const router = express.Router();
function getCart(req) { if (!req.session.cart) req.session.cart = []; return req.session.cart; }

router.use((req, res, next) => { res.locals.cartCount = getCart(req).reduce((sum, item) => sum + item.quantity, 0); next(); });
router.get('/', (req, res) => {
  const cart = getCart(req);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  res.render('cart/index', { title: 'Giỏ hàng - ElectroShop', cart, total });
});
router.post('/update/:id', async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    const item = getCart(req).find((cartItem) => cartItem.id === Number(req.params.id));
    if (!product || !item) return res.redirect('/cart');
    const requestedQuantity = Number(req.body.quantity);
    item.quantity = Math.max(1, Math.min(Number.isFinite(requestedQuantity) ? requestedQuantity : 1, product.stock_qty));
    item.price = Number(product.price);
    item.stock_qty = product.stock_qty;
    if (product.stock_qty < 1) req.session.cart = getCart(req).filter((cartItem) => cartItem.id !== product.id);
    req.flash('success', 'Đã cập nhật giỏ hàng.');
    res.redirect('/cart');
  } catch (err) { next(err); }
});
router.post('/add', async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.body.product_id);
    if (!product || product.stock_qty < 1) { req.flash('error', 'Sản phẩm hiện đã hết hàng.'); return res.redirect('/products'); }
    const quantity = Math.max(1, Math.min(Number(req.body.quantity) || 1, product.stock_qty));
    const cart = getCart(req);
    const existing = cart.find((item) => item.id === product.id);
    if (existing) existing.quantity = Math.min(existing.quantity + quantity, product.stock_qty);
    else cart.push({ id: product.id, name: product.name, price: Number(product.price), image_url: product.image_url, quantity, stock_qty: product.stock_qty });
    req.flash('success', 'Đã thêm sản phẩm vào giỏ hàng.');
    res.redirect('/cart');
  } catch (err) { next(err); }
});
router.post('/remove/:id', (req, res) => { req.session.cart = getCart(req).filter((item) => item.id !== Number(req.params.id)); res.redirect('/cart'); });

module.exports = router;