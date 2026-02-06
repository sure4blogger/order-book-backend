import mongoose from "mongoose";
import Counter from "./Counter.js";

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

    weight: Number,
    rate: Number,

    totalPrice: {
      type: Number,
      required: true,
    },

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
      enum: ["Pending", "In Progress", "Completed", "Delivered", "Cancelled"],
      default: "Pending",
    },

    notes: String,
  },
  { timestamps: true }
);

/* ================= AUTO ORDER NUMBER ================= */
/* ✅ ASYNC STYLE — NO next() */
orderSchema.pre("save", async function () {
  if (this.orderNumber) return;

  const counter = await Counter.findOneAndUpdate(
    { name: "order" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );

  this.orderNumber = `ORDER-${String(counter.seq).padStart(4, "0")}`;
});

export default mongoose.model("Order", orderSchema);
