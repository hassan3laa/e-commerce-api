const User = require("../models/userModel");
const Product = require("../models/productModel");
const Review = require("../models/reviewModel");
const Order = require("../models/orderModel");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.getLowStockProducts = catchAsync(async (req, res) => {
  const threshold = Number(req.query.threshold) || 5;

  const products = await Product.find({
    quantity: {
      $lte: threshold,
    },
    active: true,
  }).sort("quantity");

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

exports.getSalesReport = catchAsync(async (req, res) => {
  const report = await Order.aggregate([
    {
      $match: {
        status: {
          $ne: "cancelled",
        },
      },
    },

    {
      $group: {
        _id: {
          year: {
            $year: "$createdAt",
          },

          month: {
            $month: "$createdAt",
          },
        },

        orders: {
          $sum: 1,
        },

        revenue: {
          $sum: "$totalPrice",
        },
      },
    },

    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
  ]);

  res.status(200).json({
    status: "success",
    data: {
      report,
    },
  });
});

exports.getAllReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find()
    .populate("user", "name email")
    .populate("product", "name")
    .sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findByIdAndDelete(req.params.id);

  if (!review) {
    return next(new AppError("Review not found.", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getUsers = catchAsync(async (req, res) => {
  const users = await User.find().select("-password");

  res.status(200).json({
    status: "success",
    results: users.length,
    data: {
      users,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const allowedFields = ["name", "phone", "role", "active"];

  const data = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      data[field] = req.body[field];
    }
  }

  const user = await User.findByIdAndUpdate(req.params.id, data, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) {
    return next(new AppError("User not found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
