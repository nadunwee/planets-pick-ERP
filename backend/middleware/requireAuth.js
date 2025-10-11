const jwt = require("jsonwebtoken");

const User = require("../models/userModel.js");
const { getJwtSecret } = require("../utils/jwtSecret");

const requireAuth = async (req, res, next) => {
  //verify user is authenticated
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ error: "Authorization token required" });
  }

  const token = authorization.split(" ")[1];

  try {
    const { _id } = jwt.verify(token, getJwtSecret());

    const user = await User.findById(_id).select(
      "_id name email department role level approved"
    );

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    if (!user.approved) {
      return res.status(403).json({
        error: "Account is pending approval. Contact an administrator.",
      });
    }

    if (!user.level) {
      user.level = "L1";
      await user.save();
    }

    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    res.status(401).json({ error: "Request is not authorized" });
  }
};

module.exports = requireAuth;
