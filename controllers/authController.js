const bcrypt = require('bcrypt');
const UserModel = require('../models/userModel');

const authController = {
  // ---------- Hiển thị form ----------
  showRegister(req, res) {
    res.render('auth/register', { title: 'Đăng ký', authPage: true });
  },

  showLogin(req, res) {
    res.render('auth/login', { title: 'Đăng nhập', authPage: true });
  },

  // ---------- Xử lý đăng ký ----------
  async register(req, res, next) {
    try {
      const { full_name, email, password, confirm_password, phone, address } = req.body;

      if (!full_name || !email || !password) {
        req.flash('error', 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.');
        return res.redirect('/auth/register');
      }
      if (password !== confirm_password) {
        req.flash('error', 'Mật khẩu nhập lại không khớp.');
        return res.redirect('/auth/register');
      }
      if (password.length < 6) {
        req.flash('error', 'Mật khẩu phải có ít nhất 6 ký tự.');
        return res.redirect('/auth/register');
      }

      const existing = await UserModel.findByEmail(email);
      if (existing) {
        req.flash('error', 'Email này đã được đăng ký.');
        return res.redirect('/auth/register');
      }

      const password_hash = await bcrypt.hash(password, 10);
      await UserModel.create({ full_name, email, password_hash, phone, address });

      req.flash('success', 'Đăng ký thành công! Vui lòng đăng nhập.');
      res.redirect('/auth/login');
    } catch (err) {
      next(err);
    }
  },

  // ---------- Xử lý đăng nhập ----------
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const user = await UserModel.findByEmail(email);

      if (!user) {
        req.flash('error', 'Email hoặc mật khẩu không đúng.');
        return res.redirect('/auth/login');
      }

      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        req.flash('error', 'Email hoặc mật khẩu không đúng.');
        return res.redirect('/auth/login');
      }

      // Lưu thông tin tối thiểu vào session (không lưu password_hash)
      req.session.user = {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      };
      req.session.cookie.maxAge = req.body.remember
        ? 1000 * 60 * 60 * 24 * 30
        : 1000 * 60 * 60 * 24;

      req.flash('success', `Chào mừng trở lại, ${user.full_name}!`);
      const returnTo = req.session.returnTo;
      delete req.session.returnTo;
      if (returnTo === '/orders/checkout') return res.redirect(returnTo);
      if (user.role === 'admin') {
        return res.redirect('/admin');
      }
      res.redirect('/');
    } catch (err) {
      next(err);
    }
  },

  // ---------- Đăng xuất ----------
  logout(req, res) {
    req.session.destroy(() => {
      res.redirect('/');
    });
  },
};

module.exports = authController;
