const Review = require("../models/reviewModel");
const Product = require("../models/productModel");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

const updateProductRatings = async (productId) => {
  const stats = await Review.aggregate([
    {
      $match: {
        product: productId,
      },
    },
    {
      $group: {
        _id: "$product",
        ratingsQuantity: {
          $sum: 1,
        },
        ratingsAverage: {
          $avg: "$rating",
        },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].ratingsQuantity,
      ratingsAverage: stats[0].ratingsAverage,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 0,
    });
  }
};

exports.getProductReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({
    product: req.params.productId,
  });

  res.status(200).json({
    status: "success",
    results: reviews.length,
    data: {
      reviews,
    },
  });
});

exports.createReview = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    return next(new AppError("Product not found.", 404));
  }

  const review = await Review.create({
    review: req.body.review,
    rating: req.body.rating,
    product: req.params.productId,
    user: req.user.id,
  });

  await updateProductRatings(product._id);

  res.status(201).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!review) {
    return next(
      new AppError("Review not found or you are not the owner.", 404),
    );
  }

  review.review = req.body.review ?? review.review;
  review.rating = req.body.rating ?? review.rating;

  await review.save();

  await updateProductRatings(review.product);

  res.status(200).json({
    status: "success",
    data: {
      review,
    },
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!review) {
    return next(
      new AppError("Review not found or you are not the owner.", 404),
    );
  }

  const productId = review.product;

  await Review.findByIdAndDelete(review._id);

  await updateProductRatings(productId);

  res.status(204).json({
    status: "success",
    data: null,
  });
});
