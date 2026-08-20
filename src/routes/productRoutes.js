const express = require("express");

const productController = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", productController.getAllProducts);

router.get("/:id", productController.getProduct);

router.post(
  "/",
  authMiddleware.restrictTo("admin"),
  productController.createProduct,
);

router.patch(
  "/:id",
  authMiddleware.restrictTo("admin"),
  productController.updateProduct,
);

router.delete(
  "/:id",
  authMiddleware.restrictTo("admin"),
  productController.deleteProduct,
);

module.exports = router;
