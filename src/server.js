const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = require("./app");

const DB = process.env.DATABASE_URL;

mongoose
  .connect(DB)
  .then(() => {
    console.log("Database connected successfully");

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection failed:", err.message);

    process.exit(1);
  });
