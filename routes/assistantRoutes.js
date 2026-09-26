const express = require('express');
const { pool } = require('../config/db');

const router = express.Router();

function normalize(value) {
  return value
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function parseBudget(message) {
  const match = message.match(/(?:duoi|under|toi da|max|<)\s*(\d+(?:[.,]\d+)?)\s*(trieu|tr|m|million|k)?/i);
  if (!match) return null;
  const amount = Number(match[1].replace(',', '.'));
  const unit = (match[2] || '').toLowerCase();
  if (['trieu', 'tr', 'm', 'million'].includes(unit)) return amount * 1000000;
  if (unit === 'k') return amount * 1000;
  return amount;
}

router.post('/', async (req, res, next) => {
  try {
    const message = typeof req.body.message === 'string' ? req.body.message.trim().slice(0, 200) : '';
    if (!message) return res.status(400).json({ reply: 'Bạn muốn tìm sản phẩm nào?', products: [] });

    const [products] = await pool.query(
      `SELECT p.id, p.name, p.brand, p.price, p.image_url, p.stock_qty, c.name AS category_name
       FROM products p JOIN categories c ON c.id = p.category_id
       WHERE p.is_active = 1 AND p.stock_qty > 0 ORDER BY p.created_at DESC LIMIT 100`
    );
    const normalizedMessage = normalize(message);
    const budget = parseBudget(normalizedMessage);
    const ignoredWords = new Set(['toi', 'can', 'muon', 'tim', 'tu', 'van', 'tu', 'gia', 'duoi', 'tren', 'khoang', 'cho', 'mot', 'con', 'hang', 'nao', 'loai', 'san', 'pham', 'goi', 'y', 'tu', 'van', 'giup', 'voi', 'va', 'co', 'khong', 'la', 'the', 'nao', 'ngan', 'sach', 'mua']);
    const keywords = normalizedMessage.split(/[^a-z0-9]+/).filter((word) => word.length > 1 && !ignoredWords.has(word) && !/^\d/.test(word));
    const categoryTerms = {
      'dien-thoai': ['dien thoai', 'smartphone', 'iphone', 'samsung', 'oppo'],
      laptop: ['laptop', 'may tinh xach tay', 'gaming'],
      'phu-kien': ['phu kien', 'tai nghe', 'chuot', 'ban phim', 'sac'],
      'dong-ho-thong-minh': ['dong ho', 'smartwatch', 'garmin', 'watch'],
    };
    const requestedCategory = Object.entries(categoryTerms).find(([, terms]) => terms.some((term) => normalizedMessage.includes(term)));
    const matched = products
      .filter((product) => !budget || Number(product.price) <= budget)
      .map((product) => {
        const searchable = normalize(`${product.name} ${product.brand || ''} ${product.category_name}`);
        const score = keywords.reduce((total, word) => total + (searchable.includes(word) ? 1 : 0), 0);
        const categoryMatch = requestedCategory && normalize(product.category_name).includes(requestedCategory[0].replace(/-/g, ' '));
        return { product, score: score + (categoryMatch ? 3 : 0) };
      })
      .sort((left, right) => right.score - left.score || Number(left.product.price) - Number(right.product.price))
      .slice(0, 3)
      .map(({ product }) => product);

    const reply = matched.length
      ? `Mình tìm được ${matched.length} sản phẩm phù hợp${budget ? ' với mức giá bạn nêu' : ''}. Bạn có thể xem chi tiết bên dưới.`
      : `Hiện chưa tìm thấy sản phẩm còn hàng phù hợp${budget ? ' với ngân sách này' : ''}. Bạn thử đổi danh mục hoặc mức giá nhé.`;
    res.json({ reply, products: matched });
  } catch (err) { next(err); }
});

module.exports = router;