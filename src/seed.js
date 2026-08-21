const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/userModel");
const Category = require("./models/categoryModel");
const Brand = require("./models/brandModel");
const Product = require("./models/productModel");
const Coupon = require("./models/couponModel");

const DB = process.env.DATABASE_URL;

const seed = async () => {
  try {
    await mongoose.connect(DB);

    console.log("Database connected");

    await User.deleteMany();
    await Category.deleteMany();
    await Brand.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();

    // =========================
    // Users
    // =========================

    const users = await User.create([
      {
        name: process.env.ADMIN_NAME,
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: "admin",
      },
      {
        name: "Normal User",
        email: "user@example.com",
        password: "User@12345",
        role: "user",
      },
    ]);

    // =========================
    // Categories
    // =========================

    const categories = await Category.create([
      {
        name: "Electronics",
        description: "Electronic devices and accessories",
      },
      {
        name: "Laptops",
        description: "Laptops and portable computers",
      },
      {
        name: "Smartphones",
        description: "Smartphones and mobile devices",
      },
      {
        name: "Accessories",
        description: "Computer and mobile accessories",
      },
    ]);

    // =========================
    // Brands
    // =========================

    const brands = await Brand.create([
      {
        name: "Apple",
        description: "Apple products",
      },
      {
        name: "Samsung",
        description: "Samsung products",
      },
      {
        name: "Dell",
        description: "Dell computers",
      },
      {
        name: "Logitech",
        description: "Computer accessories",
      },
    ]);

    // =========================
    // Products
    // =========================

    const products = await Product.create([
      {
        name: "iPhone 16",
        description: "Apple smartphone with advanced performance",
        price: 45000,
        quantity: 20,
        category: categories[2]._id,
        brand: brands[0]._id,
        images: ["iphone-16.jpg"],
        colors: ["Black", "White", "Blue"],
      },

      {
        name: "Samsung Galaxy S25",
        description: "Samsung flagship smartphone",
        price: 38000,
        quantity: 25,
        category: categories[2]._id,
        brand: brands[1]._id,
        images: ["galaxy-s25.jpg"],
        colors: ["Black", "Silver"],
      },

      {
        name: "Dell XPS 15",
        description: "Powerful laptop for developers and professionals",
        price: 70000,
        quantity: 10,
        category: categories[1]._id,
        brand: brands[2]._id,
        images: ["dell-xps-15.jpg"],
      },

      {
        name: "Logitech MX Master 3S",
        description: "Wireless ergonomic productivity mouse",
        price: 5000,
        quantity: 50,
        category: categories[3]._id,
        brand: brands[3]._id,
        images: ["mx-master-3s.jpg"],
      },
    ]);

    // =========================
    // Coupons
    // =========================

    const coupons = await Coupon.create([
      {
        code: "WELCOME20",
        type: "percentage",
        value: 20,
        minOrderAmount: 500,
        maxDiscount: 1000,
        expiresAt: new Date("2026-12-31"),
        usageLimit: 100,
      },
      {
        code: "SAVE500",
        type: "fixed",
        value: 500,
        minOrderAmount: 2000,
        expiresAt: new Date("2026-12-31"),
        usageLimit: 50,
      },
    ]);

    // =========================
    // Result
    // =========================

    console.log(`Created ${users.length} users`);

    console.log(`Created ${categories.length} categories`);

    console.log(`Created ${brands.length} brands`);

    console.log(`Created ${products.length} products`);

    console.log(`Created ${coupons.length} coupons`);

    console.log("\nSeed completed successfully.");

    process.exit(0);
  } catch (err) {
    console.error("Seed failed:", err);

    process.exit(1);
  }
};

seed();
