const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN || "7d",
  });
};

module.exports = generateToken;
