const express = require('express');
const router = express.Router();
const {isAdmin, isAuthenticated} = require('../middleware/auth');
const productController = require('../controller/productController');

router.get('/', productController.getProducts);
router.post('/create', isAuthenticated, isAdmin, productController.createProduct);
router.get('/:id', productController.getProductDetail);
router.delete('/:id', isAuthenticated, isAdmin, productController.deleteProduct);
router.put('/:id', isAuthenticated, isAdmin, productController.updateProduct);

module.exports = router;