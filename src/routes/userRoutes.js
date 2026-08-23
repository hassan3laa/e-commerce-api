const express = require("express");

const userController = require("../controllers/userController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/forgot-password", userController.forgotPassword);

router.patch("/reset-password/:token", userController.resetPassword);

router.use(authMiddleware.protect);

router.patch("/change-password", userController.changePassword);

router.get("/", authMiddleware.restrictTo("admin"), userController.getAllUsers);

router.get("/:id", authMiddleware.restrictTo("admin"), userController.getUser);

router.patch("/me", userController.updateMe);

router.delete("/me", userController.deleteMe);

module.exports = router;
