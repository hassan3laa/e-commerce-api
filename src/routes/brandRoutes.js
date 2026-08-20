const express = require("express");

const brandController = require("../controllers/brandController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", brandController.getAllBrands);

router.get("/:id", brandController.getBrand);

router.post(
  "/",
  authMiddleware.protect,
  authMiddleware.restrictTo("admin"),
  brandController.createBrand,
);

router.patch(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("admin"),
  brandController.updateBrand,
);

router.delete(
  "/:id",
  authMiddleware.protect,
  authMiddleware.restrictTo("admin"),
  brandController.deleteBrand,
);

module.exports = router;
