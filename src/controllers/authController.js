const User = require("../models/userModel");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const generateToken = require("../utils/generateToken");

const createSendToken = (user, statusCode, res) => {
  const token = generateToken(user._id);

  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, phone, address } = req.body;

  if (password !== passwordConfirm) {
    return next(
      new AppError("Password and password confirmation do not match.", 400),
    );
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
  });

  createSendToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError("Password and email are required", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  createSendToken(user, 200, res);
});

exports.getMe = catchAsync(async (req, res) => {
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
    },
  });
});
