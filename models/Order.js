import mongoose from "mongoose";
import Counter from "./Counter.js"; // 🔧 NEW: for order number auto-increment

/* ================= PAYMENT SCHEMA ================= */

const paymentSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    type: {
      type: String,
      enum: ["ADD", "REFUND", "RETURN"],
      required: true,
    },
    note: String,
    date: { type: Date, default: Date.now },
  },
  { _id: false }
);

/* ================= ORDER SCHEMA ================= */

const orderSchema = new mongoose.Schema(
  {
    // 🔧 NEW: human-readable order number (ORDER-0001)
    orderNumber: {
      type: String,
      unique: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    jewelleryType: String,
    material: String,

    // 🔧 EXISTING: weight in grams
    weight: {
      type: Number,
    },

    // 🔧 EXISTING: rate per gram (gold/silver)
    rate: {
      type: Number,
    },

    totalPrice: {
      type: Number,
      required: true,
    },

    // 🔧 EXISTING: making charges
    makingCharges: {
      type: Number,
      default: 0,
    },

    advancePaid: {
      type: Number,
      default: 0,
    },

    balanceAmount: {
      type: Number,
      default: 0,
    },

    payments: [paymentSchema],

    deliveryDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      // 🔧 EXISTING + CONFIRMED: Cancelled only used in Orders list
      enum: ["Pending", "In Progress", "Completed", "Delivered", "Cancelled"],
      default: "Pending",
    },

    notes: String,
  },
  { timestamps: true }
);

/* ================= AUTO ORDER NUMBER ================= */
/* 🔥 NEW LOGIC: generates ORDER-0001, ORDER-0002, etc */
orderSchema.pre("save", async function (next) {
  if (this.orderNumber) return next();

  const counter = await Counter.findOneAndUpdate(
    { name: "order" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  this.orderNumber = `ORDER-${String(counter.seq).padStart(4, "0")}`;
  next();
});

export default mongoose.model("Order", orderSchema);
