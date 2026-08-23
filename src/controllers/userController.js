const crypto = require("crypto");

const User = require("../models/userModel");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.role) {
    return next(
      new AppError("This route is not for password or role updates.", 400),
    );
  }

  const allowedFields = ["name", "email", "phone", "address", "photo"];

  const updateDate = [];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      updateDate[field] = req.body[field];
    }
  });

  const user = await User.findOneAndUpdate(req.user.id, updateDate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id, {
    active: false,
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(
      new AppError("Current password and new password are required.", 400),
    );
  }

  const user = await User.findById(req.user.id).select("+password");

  const correct = await user.correctPassword(currentPassword, user.password);

  if (!correct) {
    return next(new AppError("Current password is incorrect.", 401));
  }

  user.password = newPassword;

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password changed successfully.",
  });
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Email is required.", 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("There is no user with this email.", 404));
  }

  const resetToken = crypto.randomBytes(32).toString("hex");

  user.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  await user.save({
    validateBeforeSave: false,
  });

  res.status(200).json({
    status: "success",
    message: "Password reset token generated.",
    resetToken,
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,

    passwordResetExpires: {
      $gt: Date.now(),
    },
  }).select("+password");

  if (!user) {
    return next(new AppError("Token is invalid or has expired.", 400));
  }

  user.password = req.body.password;

  user.passwordResetToken = undefined;

  user.passwordResetExpires = undefined;

  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password reset successfully.",
  });
});
