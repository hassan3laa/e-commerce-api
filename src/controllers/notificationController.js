const Notification = require("../models/notificationModel");

const AppError = require("../utils/AppError");

const catchAsync = require("../utils/catchAsync");

exports.getNotifications = catchAsync(async (req, res) => {
  const notifications = await Notification.find({
    user: req.user.id,
  }).sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: notifications.length,
    data: {
      notifications,
    },
  });
});

exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    {
      _id: req.params.id,
      user: req.user.id,
    },
    {
      read: true,
    },
    {
      new: true,
    },
  );

  if (!notification) {
    return next(new AppError("Notification not found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      notification,
    },
  });
});

exports.markAllAsRead = catchAsync(async (req, res) => {
  await Notification.updateMany(
    {
      user: req.user.id,
      read: false,
    },
    {
      read: true,
    },
  );

  res.status(200).json({
    status: "success",
    message: "All notifications marked as read.",
  });
});
