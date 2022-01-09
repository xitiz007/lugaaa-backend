const mongoose = require("mongoose");
const { Schema } = mongoose;

const ProductSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: Array,
      required: true,
    },
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "category",
      required: true,
    },
    gender: { type: String, required: true, enum: ["men", "women", "unisex"] },
    productSizes: [
      {
        size: { type: String, required: true, unique: true },
        price: { type: Number, required: true },
        colors: [
          {
            colorName: { type: String, required: true, unique: true },
            inStock: { type: Number, required: true },
            sold: { type: Number, default: 0 },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Product = mongoose.model("product", ProductSchema);
module.exports = Product;
