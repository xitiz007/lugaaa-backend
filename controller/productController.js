const Product = require("../models/product");
const {validateProduct} = require("../utilsServer/verifyCredential");

module.exports.getProducts = async (req, res) => {
  try {
    const limit = 8;
    let { sortBy, page = 1, category = "all", price, search } = req.query;
    page = parseInt(page);
    const regexObj = {
      title: { $regex: search ? new RegExp(search, "i") : "" },
    };

    const sortObj = {};
    if (sortBy) {
      const [name, order] = sortBy.split(":");
      sortObj.createdAt = order === "asc" ? 1 : -1;
    } else {
      const sortNumber = price === "low" ? 1 : -1;
      sortObj["productSizes.price"] = sortNumber;
    }

    const skip = (page - 1) * limit;
    const count =
      category !== "all"
        ? await Product.find({ category }).countDocuments()
        : await Product.find(regexObj).countDocuments();

    if (!count) throw new Error("failed to fetch products");
    const products =
      category !== "all"
        ? await Product.find({ category })
            .populate("category")
            .sort(sortObj)
            .limit(limit)
            .skip(skip)
        : await Product.find(regexObj)
            .populate("category")
            .sort(sortObj)
            .limit(limit)
            .skip(skip);
    const hasPrevious = page > 1;
    const hasNext = count > page * limit;
    const prevPage = page - 1;
    const nextPage = page + 1;
    const lastPage = Math.ceil(count / limit);
    return res.status(200).json({
      products,
      page,
      hasPrevious,
      hasNext,
      prevPage,
      nextPage,
      lastPage,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.createProduct = async (req, res) => {
  try {
    const { title, description, category, images, productSizes, gender } =
      req.body;
    validateProduct(title, description, category, images);
    const product = new Product({
      title,
      description,
      category,
      images,
      productSizes,
      gender,
    });
    await product.save();
    return res.status(201).json({ message: "Product added successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id).populate("category");
    if (!product) return res.status(404).json({ message: "product not found" });
    return res.status(200).json({ product });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};``  

module.exports.deleteProduct = async (req, res) => 
{
    try
    {
        const {id} = req.params;
        await Product.findByIdAndDelete(id);
        return res.status(200).json({ message: "product deleted successfully" })
    }
    catch(err)
    {
        return res.status(500).json({ message: err.message });
    }
}

module.exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, gender, images, productSizes } =
      req.body;
    validateProduct(title, description, category, images, true);
    await Product.findOneAndUpdate(
      { _id: id },
      {
        title,
        description,
        category,
        images,
        gender,
        productSizes,
      }
    );
    return res.status(200).json({ message: "product updated successfully" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
