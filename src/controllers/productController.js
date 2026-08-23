const Product = require("../models/productModel");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const APIFeatures = require("../utils/APIFeatures");

exports.getAllProducts = catchAsync(async (req, res) => {
  const query = {};

  if (req.query.minPrice) {
    query.price = {
      ...query.price,
      $gte: Number(req.query.minPrice),
    };
  }

  if (req.query.maxPrice) {
    query.price = {
      ...query.price,
      $lte: Number(req.query.maxPrice),
    };
  }

  if (req.query.category) {
    query.category = req.query.category;
  }

  if (req.query.brand) {
    query.brand = req.query.brand;
  }

  if (req.query.inStock === "true") {
    query.quantity = {
      $gt: 0,
    };
  }

  if (req.query.minRating) {
    query.ratingsAverage = {
      $gte: Number(req.query.minRating),
    };
  }

  const features = new APIFeatures(
    Product.find(query)
      .populate("category", "name slug")
      .populate("brand", "name slug"),
    req.query,
  )
    .filter()
    .search()
    .sort()
    .limitFields()
    .paginate();

  const products = await features.query;

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id)
    .populate("category", "name slug")
    .populate("brand", "name slug");

  if (!product) {
    return next(new AppError("Product not found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

exports.createProduct = catchAsync(async (req, res) => {
  const product = await Product.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      product,
    },
  });
});

exports.updateProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new AppError("Product not found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      product,
    },
  });
});

exports.deleteProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new AppError("Product not found.", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.getRelatedProducts = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return next(new AppError("Product not found.", 404));
  }

  const products = await Product.find({
    _id: {
      $ne: product._id,
    },

    $or: [
      {
        category: product.category,
      },
      {
        brand: product.brand,
      },
    ],

    active: true,
  })
    .limit(10)
    .populate("category", "name slug")
    .populate("brand", "name slug");

  res.status(200).json({
    status: "success",
    results: products.length,
    data: {
      products,
    },
  });
});
