const mongoose = require("mongoose");
const { Schema } = mongoose;

const OrderSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    number: {
      type: {
        code: {
          type: Number,
          required: true,
        },
        phoneNumber: {
          type: Number,
          required: true,
        },
      },
      required: true,
    },
    cart: Array,
    total: Number,
    delivered: {
      type: Boolean,
      default: false,
    },
    received: {
      type: Boolean,
      default: false,
    },
    deliveredOn: {
      type: Date,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    method: String,
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("order", OrderSchema);
module.exports = Order;
