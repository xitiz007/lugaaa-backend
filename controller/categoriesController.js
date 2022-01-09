const Category = require("../models/category");

module.exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json({ categories });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.createCategory = async (req, res) => {
  try {
    const { categoryName = "" } = req.body;
    if (!categoryName.trim())
      return res.status(400).json({ message: "Category name must be passed" });
    const category = new Category({ name: categoryName });
    await category.save();
    return res
      .status(201)
      .json({ message: "Category created successfully", category });
  } catch (err) {
    return res.status(500).json({ message: 'server error' });
  }
};

module.exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.updateCategory = async (req, res) => {
  try {
    const { categoryName } = req.body;
    const { id } = req.params;
    if (!categoryName.trim())
      return res.status(400).json({ message: "Category name must be passed" });
    const category = await Category.findOneAndUpdate(
      { _id: id },
      { name: categoryName },
      { new: true }
    );

    return res
      .status(201)
      .json({ message: "Category updated successfully", category });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
