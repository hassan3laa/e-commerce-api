const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty"],
      trim: true,
      maxlength: 1000,
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to a product"],
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Review must belong to a user"],
    },
  },
  {
    timestamps: true,
  },
);

reviewSchema.index(
  {
    product: 1,
    user: 1,
  },
  {
    unique: 1,
  },
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name, photo",
  });

  next();
});

module.exports = mongoose.model("Review", reviewSchema);
