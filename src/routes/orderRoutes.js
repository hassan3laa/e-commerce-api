const express = require("express");

const orderController = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.post("/", orderController.createOrder);

router.get(
  "/",
  authMiddleware.restrictTo("admin"),
  orderController.getAllOrders,
);

router.get("/my-orders", orderController.getMyOrders);

router.get("/:id", orderController.getOrder);

router.patch("/:id/cancel", orderController.cancelOrder);

router.patch(
  "/:id/status",
  authMiddleware.restrictTo("admin"),
  orderController.updateOrderStatus,
);

module.exports = router;
