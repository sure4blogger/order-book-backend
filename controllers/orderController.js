import Order from "../models/Order.js";

/* CREATE ORDER */
export const createOrder = async (req, res) => {
  try {
    const { totalPrice, advancePaid = 0 } = req.body;

    const orderData = {
      ...req.body,
      advancePaid,
      balanceAmount: totalPrice - advancePaid,
      payments: [],
    };

    // 🔧 CHANGED: store initial advance as a payment
    if (advancePaid > 0) {
      orderData.payments.push({
        amount: advancePaid,
        type: "ADD",
        note: "Initial advance",
      });
    }

    const order = await Order.create(orderData);

    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/* GET ALL ORDERS */
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer", "name phone")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* GET ORDER BY ID */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "customer",
      "name phone"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🔧 CHANGED: always derive advance & balance from payments
    const totalAdded = order.payments.reduce(
      (sum, p) => (p.type === "ADD" ? sum + p.amount : sum),
      0
    );

    const totalRefunded = order.payments.reduce(
      (sum, p) =>
        p.type === "REFUND" || p.type === "RETURN"
          ? sum + p.amount
          : sum,
      0
    );

    const netPaid = totalAdded - totalRefunded;

    order.advancePaid = netPaid;
    order.balanceAmount = order.totalPrice - netPaid;

    res.json(order);
  } catch (error) {
    res.status(404).json({ message: "Order not found" });
  }
};

/* UPDATE ORDER STATUS */
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  order.status = status;
  await order.save();

  res.json(order);
};

/* ADD / REFUND / RETURN PAYMENT */
export const addPayment = async (req, res) => {
  try {
    const { amount, note, type } = req.body;

    if (!["ADD", "REFUND", "RETURN"].includes(type)) {
      return res.status(400).json({ message: "Invalid payment type" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.payments.push({ amount, note, type });

    // 🔧 CHANGED: recompute from full payment history only
    const totalAdded = order.payments.reduce(
      (sum, p) => (p.type === "ADD" ? sum + p.amount : sum),
      0
    );

    const totalRefunded = order.payments.reduce(
      (sum, p) =>
        p.type === "REFUND" || p.type === "RETURN"
          ? sum + p.amount
          : sum,
      0
    );

    const netPaid = totalAdded - totalRefunded;

    order.advancePaid = netPaid;
    order.balanceAmount = order.totalPrice - netPaid;

    await order.save();

    res.json(order);
  } catch (err) {
    console.error("Add payment error:", err);
    res.status(500).json({ message: err.message });
  }
};
