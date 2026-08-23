const Notification = require("../models/notificationModel");

const createNotification = async ({
  user,
  type,
  title,
  message,
  data = {},
}) => {
  return Notification.create({
    user,
    type,
    title,
    message,
    data,
  });
};

module.exports = createNotification;
