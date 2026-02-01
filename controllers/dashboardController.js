import Order from "../models/Order.js";

export const getDashboardStats = async (req, res) => {
  try {
    const orders = await Order.find();

    const totalOrders = orders.length;

    const completedOrders = orders.filter(
      o => o.status === "Completed"
    ).length;

    // ✅ Correct pending balance
    const pendingBalance = orders.reduce(
      (sum, o) => sum + (o.balanceAmount || 0),
      0
    );

    // ✅ FIXED revenue calculation
    const totalRevenue = orders.reduce((sum, o) => {
      if (!o.payments?.length) return sum;

      const added = o.payments
        .filter(p => p.type === "ADD")
        .reduce((s, p) => s + p.amount, 0);

      const refunded = o.payments
        .filter(p => p.type === "REFUND" || p.type === "RETURN")
        .reduce((s, p) => s + p.amount, 0);

      return sum + (added - refunded);
    }, 0);

    const recentOrders = orders
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 5);

    res.json({
      totalOrders,
      completedOrders,
      pendingBalance,
      totalRevenue,
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
