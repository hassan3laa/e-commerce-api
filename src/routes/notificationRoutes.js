const express = require("express");

const notificationController = require("../controllers/notificationController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.get("/", notificationController.getNotifications);

router.patch("/read-all", notificationController.markAllAsRead);

router.patch("/:id/read", notificationController.markAsRead);

module.exports = router;
