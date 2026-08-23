const stripe = require("../utils/stripe");

const Order = require("../models/orderModel");

const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const createNotification = require("../utils/createNotification");

exports.createPaymentIntent = catchAsync(async (req, res, next) => {
  const order = await Order.findOne({
    _id: req.params.orderId,
    user: req.user.id,
  });

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  if (order.paymentMethod !== "card") {
    return next(new AppError("This order does not use card payment.", 400));
  }

  if (order.status === "cancelled") {
    return next(new AppError("Cancelled orders cannot be paid.", 400));
  }

  if (order.paymentStatus === "paid") {
    return next(new AppError("This order has already been paid.", 400));
  }

  if (order.paymentIntentId) {
    const existingPaymentIntent = await stripe.paymentIntents.retrieve(
      order.paymentIntentId,
    );

    return res.status(200).json({
      status: "success",
      data: {
        clientSecret: existingPaymentIntent.client_secret,
        paymentIntentId: existingPaymentIntent.id,
      },
    });
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalPrice * 100),
    currency: process.env.PAYMENT_CURRENCY || "usd",

    automatic_payment_methods: {
      enabled: true,
    },

    metadata: {
      orderId: order._id.toString(),
      userId: req.user.id.toString(),
    },
  });

  order.paymentIntentId = paymentIntent.id;

  await order.save();

  res.status(200).json({
    status: "success",
    data: {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    },
  });
});

exports.refundPayment = catchAsync(async (req, res, next) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    return next(new AppError("Order not found.", 404));
  }

  if (order.paymentStatus !== "paid") {
    return next(new AppError("Only paid orders can be refunded.", 400));
  }

  if (!order.paymentIntentId) {
    return next(new AppError("Payment information not found.", 400));
  }

  const requestedAmount = req.body.amount
    ? Number(req.body.amount)
    : order.totalPrice - order.refundAmount;

  if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
    return next(new AppError("Refund amount must be greater than zero.", 400));
  }

  const remainingAmount = order.totalPrice - order.refundAmount;

  if (requestedAmount > remainingAmount) {
    return next(
      new AppError("Refund amount exceeds the remaining amount.", 400),
    );
  }

  const refund = await stripe.refunds.create({
    payment_intent: order.paymentIntentId,

    amount: Math.round(requestedAmount * 100),
  });

  order.refundAmount += requestedAmount;

  if (order.refundAmount >= order.totalPrice) {
    order.paymentStatus = "refunded";
  } else {
    order.paymentStatus = "partially_refunded";
  }

  order.refundedAt = new Date();

  await order.save();

  res.status(200).json({
    status: "success",
    data: {
      refundId: refund.id,
      refundAmount: requestedAmount,
      order,
    },
  });
});

exports.webhook = async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).json({
      status: "fail",
      message: `Webhook Error: ${err.message}`,
    });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;

        const order = await Order.findOne({
          paymentIntentId: paymentIntent.id,
        });

        if (order) {
          order.paymentStatus = "paid";
          order.paidAt = new Date();

          if (order.status === "pending") {
            order.status = "confirmed";
          }

          await order.save();
        }

        await createNotification({
          user: order.user,
          type: "payment",
          title: "Payment Successful",
          message: `Payment for order ${order._id} was successful.`,
          data: {
            orderId: order._id,
          },
        });

        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;

        await Order.findOneAndUpdate(
          {
            paymentIntentId: paymentIntent.id,
          },
          {
            paymentStatus: "failed",
          },
        );

        break;
      }

      default:
        break;
    }

    res.status(200).json({
      received: true,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};
