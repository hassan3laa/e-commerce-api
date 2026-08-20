const express = require("express");

const reviewController = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/product/:productId", reviewController.getProductReviews);

router.post(
  "/product/:productId",
  authMiddleware.protect,
  reviewController.createReview,
);

router.patch("/:id", authMiddleware.protect, reviewController.updateReview);

router.delete("/:id", authMiddleware.protect, reviewController.deleteReview);

module.exports = router;
