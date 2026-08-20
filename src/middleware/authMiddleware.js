const jwt = require("jsonwebtoken");

const User = require("../models/userModel");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in. Please log on to get access", 401),
    );
  }

  const decode = jwt.verify(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decode.id).select(
    "+passwordChangedAt",
  );

  if (!currentUser) {
    return next(
      new AppError("The user belonging to this token no longer exists.", 401),
    );
  }

  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError("User recently changed password. Please log in again.", 401),
    );
  }

  req.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403),
      );
    }

    next();
  };
};
