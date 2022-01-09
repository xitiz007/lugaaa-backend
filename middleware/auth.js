const User = require("../models/user");
const jwt = require("jsonwebtoken");

const isAuthenticated = async (req, res, next) => {
  try
  {
    const token = req.headers.authorization;
    if (!token) return res.status(401).json({ message: "Unauthorized" });
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) return res.status(401).json({ message: "Unauthorized" });
    const user = await User.findOne({ _id: decodedToken.id });
    if (!user) return res.status(401).json({ message: "Unauthorized" });
    req.userId = user._id.toString();
    req.isAdmin = user.role === 'admin';
    next();
  }
  catch(err)
  {
    return res.status(500).json({message: "server error"});
  }
};

const isAdmin = async(req, res, next) => {
  try
  {
    if(!req.isAdmin) return res.status(403).json({message: 'Unauthorized'});
    next();
  }
  catch(err)
  {
    return res.status(500).json({ message: 'server error' })
  }
}

module.exports = {isAuthenticated,  isAdmin};
