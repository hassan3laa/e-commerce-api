const express = require("express");

const adminController = require("../controllers/adminController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect, authMiddleware.restrictTo("admin"));

router.get("/users", adminController.getUsers);

router.patch("/users/:id", adminController.updateUser);

router.get("/reviews", adminController.getAllReviews);

router.delete("/reviews/:id", adminController.deleteReview);

router.get("/low-stock", adminController.getLowStockProducts);

router.get("/sales-report", adminController.getSalesReport);

module.exports = router;
