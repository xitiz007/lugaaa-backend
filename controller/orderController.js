const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const VerifyOrder = require("../models/verifyOrder");

module.exports.getOrders = async (req, res) => {
  try {
    let orders = [];
    if (req.isAdmin) {
      orders = await Order.find().populate("user").sort({ createdAt: -1 });
    } else {
      orders = await Order.find({ user: req.userId })
        .populate("user")
        .sort({ createdAt: -1 });
    }
    return res.status(200).json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateProducts = async (cart) => {
  for (const cartItem of cart) {
    const { productSize, quantity, _id } = cartItem;
    const product = await Product.findById(_id).lean();
    const productSizes = product.productSizes.map((size) => {
      if (size._id.toString() !== productSize._id.toString()) return size;
      const colors = size.colors.map((color) => {
        if (color._id.toString() !== productSize.color._id.toString())
          return color;
        return {
          ...color,
          inStock: color.inStock - quantity,
          sold: color.sold + quantity,
        };
      });
      return {
        ...size,
        colors,
      };
    });
    await Product.findByIdAndUpdate(_id, { productSizes });
  }
};

const updateCarts = async (cart) => {
  try {
    let total = 0;
    const updatedCart = [];
    for (const item of cart) {
      const product = await Product.findById(item._id);
      const productSize = await product.productSizes.find(
        (productSize) => productSize.size === item.productSize.size
      );
      if (!productSize) throw new Error();
      updatedCart.push({
        ...item,
        productSize: { ...item.productSize, price: productSize.price },
      });
      total += productSize.price * item.quantity;
    }
    return { error: false, total, updatedCart };
  } catch (err) {
    return { error: true };
  }
};

module.exports.createOrder = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    const { cart, address } = req.body;
    if (address.trim() === "")
      return res.status(422).json({ message: "please provide your address" });
    const { error, total, updatedCart } = await updateCarts(cart);
    if (error) return res.status(400).json({ message: "order failed" });
    const order = new Order({
      user,
      address,
      number: {
        code: user.number.code,
        phoneNumber: user.number.phoneNumber,
      },
      cart: updatedCart,
      total,
    });
    await order.save();
    await updateProducts(cart);

    return res.status(201).json({
      message: "order has been placed",
      orderId: order._id,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.setOrderDelivered = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "order not found" });
    if (!order.paid)
      return res.status(400).json({
        message: "order payment must be done to deliver the order",
      });
    order.delivered = true;
    order.deliveredOn = Date.now();
    await order.save();
    return res.status(200).json({
      message: "order marked as delivered",
      date: order.deliveredOn,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getPayments = async (req, res) => {
  try {
    const payments = await VerifyOrder.find()
      .populate("order")
      .sort({ createdAt: -1 });
    return res.status(200).json({ payments });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.verifyRequest = async (req, res) => {
  try {
    const { method, orderId } = req.body;
    if (!orderId)
      return res.status(422).json({ message: "Order is not passed" });
    if (!method)
      return res.status(422).json({ message: "Payment method is not passed" });
    const verifyOrder = await VerifyOrder.findOne({ order: orderId });
    if (verifyOrder)
      return res.status(400).json({
        message: "you have previous payment request pending to verify",
      });
    const orderExist = await Order.findOne({ _id: orderId });
    if (!orderExist)
      return res.status(404).json({ message: "order doesnot exist" });
    await new VerifyOrder({ order: orderId, method }).save();
    return res.status(201).json({
      message: "lugaa will verify your payment before product delivery",
    });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

module.exports.deletePaymentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    await VerifyOrder.findByIdAndDelete(id);
    return res.status(200).json({ message: "payment verify request deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.setOrderPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const { method } = req.body;
    if (!method)
      return res.status(422).json({ message: "Payment method must be passed" });
    await Order.findByIdAndUpdate(id, { paid: true, method });
    return res.status(200).json({ message: "order payment verified" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.setOrderReceived = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user.toString() !== req.userId)
      return res.status(401).json({ message: "Unauthorized" });
    if (!order.delivered)
      return res
        .status(422)
        .json({ message: "order has not been delivered by lugaa" });
    order.received = true;
    await order.save();
    return res.status(200).json({ message: "order updated to received" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

module.exports.getOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate("user", "-password");
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.user._id.toString() !== req.userId && !req.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    return res.status(200).json({ order });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const revertProducts = async (cart) => {
  try {
    for (const item of cart) {
      const { _id, quantity, productSize } = item;
      const product = await Product.findById(_id);
      product.productSizes = product.productSizes.map((size) => {
        if (size._id.toString() !== productSize._id.toString()) return size;
        size.colors = size.colors.map((color) => {
          if (color._id.toString() !== productSize.color._id.toString())
            return color;
          color.inStock = color.inStock + quantity;
          color.sold = color.sold - quantity;
          return color;
        });
        return size;
      });
      await product.save();
    }
  } catch (err) {
    console.log(err.message);
  }
};

module.exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (!req.isAdmin && order.user.toString() !== req.userId)
      return res.status(403).json({ message: "Unauthorized" });
    const paymentRequest = await VerifyOrder.findOne({ order: id });
    if (paymentRequest)
      return res.status(401).json({
        message: "order sent for payment verification cannot be deleted",
      });
    if (order.paid && !req.isAdmin && (!order.delivered || !order.received)) 
    {
      return res.status(403).json({ message: 'order can only be deleted after order delivered'});
    }
    if (!order.delivered) {
      await revertProducts(order.cart);
    }

    await order.delete();

    return res.status(200).json({ message: "order deleted" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
