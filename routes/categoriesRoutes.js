const express = require('express');
const {isAuthenticated, isAdmin} = require('../middleware/auth');
const router = express.Router();
const categoryController = require('../controller/categoriesController');

router.get('/', categoryController.getCategories);
router.post("/create", isAuthenticated, isAdmin, categoryController.createCategory);
router.delete(
  "/delete/:id",
  isAuthenticated,
  isAdmin,
  categoryController.deleteCategory
);
router.put(
  "/edit/:id",
  isAuthenticated,
  isAdmin,
  categoryController.updateCategory
);

module.exports = router;