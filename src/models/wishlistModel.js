const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  },
);

wishlistSchema.pref(/^find/, function (next) {
  this.populate({
    path: "products",
    select: "name price discountPrice images ratingsAverage",
  });

  next();
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
