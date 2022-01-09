const User = require("../models/user");
const bcrypt = require("bcryptjs");
const generateAccessToken = require("../utilsServer/generateToken");
const { validateForm } = require("../utilsServer/verifyCredential");
const crypto = require("crypto");
const sendMail = require("../utilsServer/sendEmail");

module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("password");
    if (!user)
      return res.status(401).json({ message: "email/password incorrect" });
    const comparePassword = await bcrypt.compare(password, user.password);
    if (!comparePassword)
      return res.status(401).json({ message: "email/password incorrect" });
    const accessToken = generateAccessToken({ id: user._id });
    return res.status(200).json({
      message: "login success",
      accessToken
    });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

module.exports.registerUser = async (req, res) => {
  const { fname, lname, email, number, code, password, confirmPassword } =
    req.body;
  try {
    validateForm(fname, lname, email, number, code, password, confirmPassword);
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    let hasOne = await User.findOne({ email });
    if (hasOne)
      return res.status(400).json({ message: "email already exists" });
    hasOne = await User.findOne({
      "number.code": { $in: code },
      "number.phoneNumber": { $in: number },
    });
    if (hasOne)
      return res.status(400).json({ message: "phone number already exists" });
    const user = new User({
      firstName: fname,
      lastName: lname,
      email: email.toLowerCase(),
      password: hashedPassword,
      number: {
        code: code,
        phoneNumber: number,
      },
    });
    await user.save();
    return res.status(201).json({ message: "account created successfully" });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

module.exports.getUserInfo = async (req, res) => {
  const user = await User.findById(req.userId);
  return res.status(200).json({
    user: {
      fname: user.firstName,
      lname: user.lastName,
      email: user.email,
      number: user.number,
      role: user.role,
      root: user.root,
      id: user._id
    },
  });
};

module.exports.resetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(404)
        .json({ message: "user with the email doesnot exist" });
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.expireToken = Date.now() + 3600000;
    await user.save();

    const baseUrl = process.env.BASE_URL;
    const subject = "Your Lugaaa password reset request";
    const html = `
      <p>Hi ${user.firstName} ${user.lastName},</p>
      <p>Forgot your password?</p>
      <p>A request has been received to change the password for your Lugaaa account.</p>
      <p>To reset your password. click on the button below:</p>
      
      <a href="${baseUrl}/forgot_password/${token}">
        <button
          style={{
            background: "#0047AB",
            color: "#fff",
            padding: "15px 10px",
            letterSpacing: "1px",
            fontSize: "15px"
          }}
        >
          Reset Your Password
        </button>        
      </a>
      <p>Thank you,</p>
      <p>The Lugaaa Team</p>
    `;

    sendMail(user.email, subject, html);
    return res
      .status(200)
      .json({ message: "check your email to reset password" });
  } catch (err) {
    return res.status(500).json({ message: "server error" });
  }
};

module.exports.verifyToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;
    if(password.trim().length < 8 || password !== confirmPassword)
    {
      return res.status(422).json({ message: "password & confirm password must match & have atleast 8 characters" })
    }
    const user = await User.findOne({ resetToken: token });
    if (!user) return res.status(401).json({ message: "token is invalid" });
    if (Date.now() > user.expireToken)
      res.status(401).json({ message: "token is expired" });
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.expireToken = undefined;
    user.resetToken = "";
    await user.save();
    return res.status(200).json({ message: "new password set successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
