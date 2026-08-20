const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.getCart = catchAsync(async (req, res) => {
  let cart = await Cart.findOne({
    user: req.user.id,
  });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [],
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

exports.addToCart = catchAsync(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    return next(new AppError("Product not found.", 404));
  }

  if (quantity < 1) {
    return next(new AppError("Quantity must be at least 1.", 400));
  }

  if (product.quantity < quantity) {
    return next(new AppError("Not enough product stock.", 400));
  }

  let cart = await Cart.findOne({
    user: req.user.id,
  });

  if (!cart) {
    cart = new Cart({
      user: req.user.id,
      items: [],
    });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId.toString(),
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > product.quantity) {
      return next(
        new AppError("Requested quantity exceeds available stock.", 400),
      );
    }

    existingItem.quantity = newQuantity;
    existingItem.price = product.discountPrice || product.price;
  } else {
    cart.items.push({
      product: product._id,
      quantity,
      price: product.discountPrice || product.price,
    });
  }

  await cart.save();

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

exports.updateCartItem = catchAsync(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({
    user: req.user.id,
  });

  if (!cart) {
    return next(new AppError("Cart not found.", 404));
  }

  const item = cart.items.find(
    (item) => item.product.toString() === req.params.productId,
  );

  if (!item) {
    return next(new AppError("Product is not in your cart.", 404));
  }

  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new AppError("Product not found.", 404));
  }

  if (quantity < 1 || quantity > product.quantity) {
    return next(new AppError("Invalid quantity.", 400));
  }

  item.quantity = quantity;
  item.price = product.discountPrice || product.price;

  await cart.save();

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

exports.removeFromCart = catchAsync(async (req, res, next) => {
  const cart = await Cart.findOne({
    user: req.user.id,
  });

  if (!cart) {
    return next(new AppError("Cart not found.", 404));
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== req.params.productId,
  );

  await cart.save();

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});

exports.clearCart = catchAsync(async (req, res) => {
  let cart = await Cart.findOne({
    user: req.user.id,
  });

  if (!cart) {
    cart = await Cart.create({
      user: req.user.id,
      items: [],
    });
  } else {
    cart.items = [];
    await cart.save();
  }

  res.status(200).json({
    status: "success",
    data: {
      cart,
    },
  });
});
