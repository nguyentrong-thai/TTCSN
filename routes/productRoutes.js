const express = require('express');
const ProductModel = require('../models/productModel');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filters = { search: (req.query.search || '').trim(), category: (req.query.category || '').trim(), brand: (req.query.brand || '').trim() };
    const [products, categories, brands] = await Promise.all([ProductModel.findAll(filters), ProductModel.getCategories(), ProductModel.getBrands()]);
    res.render('products/index', { title: 'Sản phẩm - ElectroShop', products, categories, brands, filters });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const product = await ProductModel.findById(req.params.id);
    if (!product) return res.status(404).render('404', { title: 'Không tìm thấy sản phẩm' });
    res.render('products/detail', { title: `${product.name} - ElectroShop`, product });
  } catch (err) { next(err); }
});

module.exports = router;