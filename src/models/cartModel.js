const mongoose = require("mongoose");

const cartItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  },
);

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    itmes: [cartItemSchema],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

cartSchema.methods.calculateTotal = function () {
  this.totalPrice = this.itmes.reduce((total, item) => {
    total + item.totalPrice * item.quantity;
  });

  return this.totalPrice;
};

cartSchema.pre("save", function (next) {
  this.calculateTotal();

  next();
});

cartSchema.pre(/^find/, function (next) {
  this.populate({
    path: "itme.product",
    select: "name price images quantity",
  });

  next();
});

module.exports = mongoose.model("Cart", cartSchema);
