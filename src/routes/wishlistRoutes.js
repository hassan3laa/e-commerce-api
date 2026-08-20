const express = require("express");

const wishlistController = require("../controllers/wishlistController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.use(authMiddleware.protect);

router.get("/", wishlistController.getWishlist);

router.post("/:productId", wishlistController.addToWishlist);

router.delete("/:productId", wishlistController.removeFromWishlist);

router.delete("/", wishlistController.clearWishlist);

module.exports = router;
