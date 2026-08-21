const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    value: {
      type: Number,
      required: true,
      min: 0,
    },

    minOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxDiscount: {
      type: Number,
      min: 0,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    usageLimit: {
      type: Number,
      min: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

couponSchema.methods.isValid = function () {
  return (
    this.active &&
    this.expiresAt > new Date() &&
    (!this.usageLimit || this.usedCount < this.usageLimit)
  );
};

module.exports = mongoose.model("Coupon", couponSchema);
