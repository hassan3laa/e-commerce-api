const Wishlist = require("../models/wishlistModel");
const Product = require("../models/productModel");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.getWishlist = catchAsync(async (req, res) => {
  let wishlist = await Wishlist.findOne({
    user: req.user.id,
  });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: req.user.id,
      products: [],
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      wishlist,
    },
  });
});

exports.addToWishlist = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new AppError("Product not found.", 404));
  }

  let wishlist = await Wishlist.findOne({
    user: req.user.id,
  });

  if (!wishlist) {
    wishlist = new Wishlist({
      user: req.user.id,
      products: [],
    });
  }

  const exists = wishlist.products.some(
    (id) => id.toString() === req.params.productId,
  );

  if (!exists) {
    wishlist.products.push(product._id);
    await wishlist.save();
  }

  res.status(200).json({
    status: "success",
    data: {
      wishlist,
    },
  });
});

exports.removeFromWishlist = catchAsync(async (req, res, next) => {
  const wishlist = await Wishlist.findOne({
    user: req.user.id,
  });

  if (!wishlist) {
    return next(new AppError("Wishlist not found.", 404));
  }

  wishlist.products = wishlist.products.filter(
    (id) => id.toString() !== req.params.productId,
  );

  await wishlist.save();

  res.status(200).json({
    status: "success",
    data: {
      wishlist,
    },
  });
});

exports.clearWishlist = catchAsync(async (req, res) => {
  const wishlist = await Wishlist.findOne({
    user: req.user.id,
  });

  if (wishlist) {
    wishlist.products = [];
    await wishlist.save();
  }

  res.status(200).json({
    status: "success",
    data: {
      wishlist,
    },
  });
});
