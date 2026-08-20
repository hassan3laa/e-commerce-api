const mongoose = require("mongoose");
const slugify = require("slugify");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 150,
    },
    slug: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
      required: [true, "Product desctription is required"],
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
      required: [true, "Product price is required"],
    },
    discountPrice: {
      type: Number,
      min: 0,
      validate: {
        validator: function (val) {
          return this.price > val;
        },
        message: "Discount price must be lower than regular price",
      },
    },
    quantity: {
      type: Number,
      min: 0,
      default: 0,
      required: [true, "Prodyct quantity is required"],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
    },
    brand: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
    images: [
      {
        type: String,
      },
    ],

    colors: [String],
    sizes: [String],

    ratingsAverage: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (value) => Math.round(value * 10) / 10,
    },

    ratingsQuantity: {
      type: Number,
      default: 0,
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

productSchema.index({
  name: "text",
  description: "text",
});

productSchema.pre("save", function () {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
    });
  }
});

module.exports = mongoose.model("Product", productSchema);
