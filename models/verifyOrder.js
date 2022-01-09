const mongoose = require("mongoose");
const { Schema } = mongoose;

const VerifyOrderSchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "order",
    },
    method: {
      type: String,
      required: true,
      enum: ["esewa", "khalti", "nabil"],
    },
  },
  {
    timestamps: true,
  }
);

const VerifyOrder = mongoose.model("verifyOrder", VerifyOrderSchema);
module.exports = VerifyOrder;
