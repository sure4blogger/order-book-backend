import mongoose from "mongoose";
import Order from "../models/Order.js";
import Counter from "../models/Counter.js";

const MONGO_URI = "mongodb://127.0.0.1:27017/YOUR_DB_NAME"; // 🔴 change this

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB connected");

    // Get or create counter
    let counter = await Counter.findOne({ name: "order" });
    if (!counter) {
      counter = await Counter.create({ name: "order", seq: 0 });
    }

    // Find orders without orderNumber
    const orders = await Order.find({
      orderNumber: { $exists: false },
    }).sort({ createdAt: 1 });

    console.log(`Found ${orders.length} orders to update`);

    for (const order of orders) {
      counter.seq += 1;

      order.orderNumber = `ORDER-${String(counter.seq).padStart(4, "0")}`;
      await order.save({ validateBeforeSave: false });

      console.log(`Updated ${order._id} → ${order.orderNumber}`);
    }

    await counter.save();
    console.log("✅ Order numbers backfilled successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Error:", err);
    process.exit(1);
  }
}

run();
