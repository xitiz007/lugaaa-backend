const User = require("../models/user");
const Order = require("../models/order");
const { validateUpdateProfile } = require("../utilsServer/verifyCredential");
const bcrypt = require("bcryptjs");

module.exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ users });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

module.exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if(id === req.userId) return res.status(403).json({message: 'cannot delete your own account'});
    await User.findByIdAndDelete(id);
    return res.status(200).json({ message: "user removed successfully" });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

module.exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    await User.findOneAndUpdate(
      { _id: id },
      {
        role,
      },
      { new: true }
    );
    return res.status(200).json({ message: "user role updated" });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

module.exports.getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requestedUser = await User.findById(id);
    if (!requestedUser)
      return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ user: requestedUser });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

module.exports.getUserOrderCount = async (req, res) => {
  try {
    const totalOrder = req.isAdmin
      ? await Order.find().count()
      : await Order.find({ user: req.userId }).count();
    const totalReceived = req.isAdmin
      ? await Order.find({ received: true }).count()
      : await Order.find({
          user: req.userId,
          received: true,
        }).count();
    const totalPaid = req.isAdmin
      ? await Order.find({ paid: true }).count()
      : await Order.find({
          user: req.userId,
          paid: true,
        }).count();
    const totalUnPaid = req.isAdmin
      ? await Order.find({ paid: false }).count()
      : await Order.find({
          user: req.userId,
          paid: false,
        }).count();
    return res
      .status(200)
      .json({ totalOrder, totalReceived, totalPaid, totalUnPaid });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

module.exports.updateProfile = async (req, res) => {
  try {
    const { changePassword } = req.body;
    await changeUserNameHandler(req, res);
    await changePhoneNumberHandler(req, res);
    if (changePassword) await changePasswordHandler(req, res);
    res.status(200).json({
      message: "Profile updated successfully",
    });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

const changeUserNameHandler = async (req, res) => {
  try {
    const { fname, lname, code, phoneNumber } = req.body;
    validateUpdateProfile(false, fname, lname, code, phoneNumber);
    await User.findOneAndUpdate(
      { _id: req.userId },
      { firstName: fname, lastName: lname }
    );
    return;
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const changePhoneNumberHandler = async (req, res) => {
  const { code, phoneNumber } = req.body;
  try {
    const userExist = await User.findOne({
      _id: { $ne: req.userId },
      "number.code": { $in: code },
      "number.phoneNumber": { $in: phoneNumber },
    });
    if (userExist)
      return res.status(400).json({
        message: "Account with the phone number given is already registered",
      });
    await User.findOneAndUpdate(
      { _id: req.userId },
      {
        number: {
          code,
          phoneNumber,
        },
      }
    );
    return;
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};

const changePasswordHandler = async (req, res) => {
  try {
    const {
      fname,
      lname,
      code,
      phoneNumber,
      currentPassword,
      newPassword,
      confirmNewPassword,
    } = req.body;
    validateUpdateProfile(
      true,
      fname,
      lname,
      code,
      phoneNumber,
      currentPassword,
      newPassword,
      confirmNewPassword
    );
    const user = await User.findById(req.userId).select("password");
    const passwordMatch = await comparePassword(currentPassword, user.password);
    if (!passwordMatch)
      return res.status(401).json({ message: "incorrect current password" });
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
    await user.save();
    return;
  } catch (err) {
    res.status(500).json({ message: "server error" });
  }
};

const comparePassword = async (password, hashedPassword) => {
  const tof = await bcrypt.compare(password, hashedPassword);
  return tof;
};
