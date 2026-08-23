const express = require("express");

const paymentController = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/webhook", paymentController.webhook);

router.use(authMiddleware.protect);

router.post("/:orderId/create-intent", paymentController.createPaymentIntent);

router.post(
  "/:orderId/refund",
  authMiddleware.restrictTo("admin"),
  paymentController.refundPayment,
);

module.exports = router;
