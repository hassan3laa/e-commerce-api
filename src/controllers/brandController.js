const Brand = require("../models/brandModel");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");

exports.getAllBrands = catchAsync(async (req, res) => {
  const brands = await Brand.find();

  res.status(200).json({
    status: "success",
    results: brands.length,
    data: {
      brands,
    },
  });
});

exports.getBrand = catchAsync(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new AppError("Brand not found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      brand,
    },
  });
});

exports.createBrand = catchAsync(async (req, res) => {
  const brand = await Brand.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      brand,
    },
  });
});

exports.updateBrand = catchAsync(async (req, res, next) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!brand) {
    return next(new AppError("Brand not found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      brand,
    },
  });
});

exports.deleteBrand = catchAsync(async (req, res, next) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);

  if (!brand) {
    return next(new AppError("Brand not found.", 404));
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
