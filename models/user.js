const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false
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
    role: {
      type: String,
      default: "user",
      enum: ['user', 'admin']
    },
    root: {
      type: Boolean,
      default: false,
    },
    resetToken: {
      type: String,
      select: false
    },
    expireToken: {
      type: String,
      select: false
    }
  },
  {
    timestamps: true,
  }
);

const userModel = mongoose.model("user", userSchema);
module.exports = userModel;
