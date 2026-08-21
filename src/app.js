const express = require("express");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const morgan = require("morgan");

const AppError = require("./utils/AppError");

const errorMiddleware = require("./middleware/errorMiddleware");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const brandRoutes = require("./routes/brandRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const cartRoutes = require("./routes/cartRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const orderRoutes = require("./routes/orderRoutes");
const couponRoutes = require("./routes/couponRoutes");

const app = express();

app.set("query parser", "extended");

app.use(helmet());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: {
    status: "fail",
    message: "Too many requests from this IP. Please try again later.",
  },
});

app.use("/api", limiter);

app.use(
  express.json({
    limit: "10kb",
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  }),
);

app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    status: "sucess",
    message: "E-Commerce API is running",
  });
});

app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/users", userRoutes);

app.use("/api/v1/products", productRoutes);

app.use("/api/v1/categories", categoryRoutes);

app.use("/api/v1/brands", brandRoutes);

app.use("/api/v1/reviews", reviewRoutes);

app.use("/api/v1/cart", cartRoutes);

app.use("/api/v1/wishlist", wishlistRoutes);

app.use("api/v1/orders", orderRoutes);

app.use("/api/v1/coupons", couponRoutes);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorMiddleware);

module.exports = app;
