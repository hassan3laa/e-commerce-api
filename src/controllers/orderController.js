const mongoose = require("mongoose");

const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");
const Coupon = require("../models/couponModel");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const createNotification = require("../utils/createNotification");

const calculateShipping = (subtotal) => {
  return subtotal >= 1000 ? 0 : 100;
};

exports.createOrder = catchAsync(async (req, res, next) => {
  const { shippingAddress, paymentMethod = "cash", couponCode } = req.body;

  if (
    !shippingAddress?.name ||
    !shippingAddress?.phone ||
    !shippingAddress?.address ||
    !shippingAddress?.city
  ) {
    return next(new AppError("Complete shipping address is required.", 400));
  }

  const idempotencyKey = req.headers["idempotency-key"];

  if (!idempotencyKey) {
    return next(new AppError("Idempotency-Key header is required.", 400));
  }

  const existingOrder = await Order.findOne({
    idempotencyKey,
  });

  if (existingOrder) {
    return res.status(200).json({
      status: "success",
      message: "Existing order returned.",
      data: {
        order: existingOrder,
      },
    });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const cart = await Cart.findOne({
      user: req.user.id,
    }).session(session);

    if (!cart || cart.items.length === 0) {
      throw new AppError("Your cart is empty.", 400);
    }

    let subtotal = 0;

    const orderItems = [];

    for (const item of cart.items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        throw new AppError(`Product ${item.product} no longer exists.`, 400);
      }

      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: product._id,
          quantity: {
            $gte: item.quantity,
          },
        },
        {
          $inc: {
            quantity: -item.quantity,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!updatedProduct) {
        throw new AppError(`Not enough stock for ${product.name}.`, 400);
      }

      const price = product.discountPrice || product.price;

      const itemSubtotal = price * item.quantity;

      subtotal += itemSubtotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    let discount = 0;
    let coupon = null;

    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode.toUpperCase(),
      }).session(session);

      if (!coupon || !coupon.isValid()) {
        throw new AppError("Invalid or expired coupon.", 400);
      }

      if (subtotal < coupon.minOrderAmount) {
        throw new AppError(
          `Minimum order amount is ${coupon.minOrderAmount}.`,
          400,
        );
      }

      if (coupon.type === "percentage") {
        discount = subtotal * (coupon.value / 100);

        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = coupon.value;
      }

      if (discount > subtotal) {
        discount = subtotal;
      }

      coupon.usedCount += 1;

      await coupon.save({
        session,
      });
    }

    const shippingCost = calculateShipping(subtotal);

    const totalPrice = subtotal - discount + shippingCost;

    const initialStatus = paymentMethod === "cash" ? "confirmed" : "pending";

    const [order] = await Order.create(
      [
        {
          user: req.user.id,
          items: orderItems,
          shippingAddress,
          subtotal,
          discount,
          shippingCost,
          totalPrice,
          coupon: coupon?._id,
          paymentMethod,
          status: initialStatus,
          idempotencyKey,
        },
      ],
      {
        session,
      },
    );

    cart.items = [];
    cart.totalPrice = 0;

    await cart.save({
      session,
    });

    await session.commitTransaction();

    await createNotification({
      user: req.user.id,
      type: "order",
      title: "Order Created",
      message: `Your order ${order._id} has been created successfully.`,
      data: {
        orderId: order._id,
      },
    });

    res.status(201).json({
      status: "success",
      data: {
        order,
      },
    });
  } catch (err) {
    await session.abortTransaction();

    throw err;
  } finally {
    session.endSession();
  }
});

exports.getMyOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({
    user: req.user.id,
  }).sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});

exports.cancelOrder = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id,
    }).session(session);

    if (!order) {
      throw new AppError("Order not found.", 404);
    }

    if (!["pending", "confirmed"].includes(order.status)) {
      throw new AppError("This order cannot be cancelled.", 400);
    }

    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        {
          $inc: {
            quantity: item.quantity,
          },
        },
        {
          session,
        },
      );
    }

    order.status = "cancelled";
    order.cancelledAt = new Date();

    await order.save({
      session,
    });

    await session.commitTransaction();

    res.status(200).json({
      status: "success",
      data: {
        order,
      },
    });
  } catch (err) {
    await session.abortTransaction();

    throw err;
  } finally {
    session.endSession();
  }
});

exports.getAllOrders = catchAsync(async (req, res) => {
  const orders = await Order.find().sort("-createdAt");

  res.status(200).json({
    status: "success",
    results: orders.length,
    data: {
      orders,
    },
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;

  const allowedStatuses = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    return next(new AppError("Invalid order status.", 400));
  }

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  order.status = status;

  if (status === "delivered") {
    order.deliveredAt = new Date();
  }

  await order.save();

  await createNotification({
    user: order.user,
    type: "order",
    title: "Order Status Updated",
    message: `Your order ${order._id} is now ${status}.`,
    data: {
      orderId: order._id,
      status,
    },
  });

  res.status(200).json({
    status: "success",
    data: {
      order,
    },
  });
});
