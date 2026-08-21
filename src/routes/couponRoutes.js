const express = require("express");

const couponController = require("../controllers/couponController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/validate",
  authMiddleware.protect,
  couponController.validateCoupon,
);

router.use(authMiddleware.protect);

router.use(authMiddleware.restrictTo("admin"));

router.get("/", couponController.getAllCoupons);

router.post("/", couponController.createCoupon);

router.patch("/:id", couponController.updateCoupon);

router.delete("/:id", couponController.deleteCoupon);

module.exports = router;
