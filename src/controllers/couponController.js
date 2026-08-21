const Coupon = require("../models/couponModel");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.getAllCoupons = catchAsync(async (req, res) => {
  const coupons = await Coupon.find().sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: coupons.length,
    data: {
      coupons,
    },
  });
});

exports.createCoupon = catchAsync(async (req, res) => {
  const coupon = await Coupon.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      coupon,
    },
  });
});

exports.updateCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    return next(new AppError("Coupon not found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      coupon,
    },
  });
});

exports.deleteCoupon = catchAsync(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    return next(new AppError("Coupon not found.", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});

exports.validateCoupon = catchAsync(async (req, res, next) => {
  const { code, orderAmount } = req.body;

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
  });

  if (!coupon || !coupon.isValid()) {
    return next(new AppError("Invalid or expired coupon.", 400));
  }

  if (orderAmount < coupon.minOrderAmount) {
    return next(
      new AppError(`Minimum order amount is ${coupon.minOrderAmount}.`, 400),
    );
  }

  let discount = 0;

  if (coupon.type === "percentage") {
    discount = orderAmount * (coupon.value / 100);

    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = coupon.value;
  }

  if (discount > orderAmount) {
    discount = orderAmount;
  }

  res.status(200).json({
    status: "success",
    data: {
      code: coupon.code,
      discount,
    },
  });
});
