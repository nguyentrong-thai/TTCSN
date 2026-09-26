require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');
const methodOverride = require('method-override');

const { testConnection } = require('./config/db');
const indexRoutes = require('./routes/index');

const app = express();

// ---------- View engine ----------
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- Middlewares ----------
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 ngày
}));
app.use(flash());

// Biến dùng chung cho mọi view (user đăng nhập, thông báo flash...)
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.cartCount = (req.session.cart || []).reduce((sum, item) => sum + item.quantity, 0);
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

// ---------- Routes ----------
app.use('/', indexRoutes);
app.use('/auth', require('./routes/authRoutes'));
app.use('/products', require('./routes/productRoutes'));
app.use('/cart', require('./routes/cartRoutes'));
app.use('/orders', require('./routes/orderRoutes'));
app.use('/admin', require('./routes/adminRoutes'));
app.get('/support', (req, res) => {
  res.render('support', { title: 'Trung tâm hỗ trợ - ElectroShop' });
});

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).render('404', { title: 'Không tìm thấy trang' });
});

// ---------- Khởi động server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  await testConnection();
});
