import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import orderRoutes from "./routes/orderRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

dotenv.config();
connectDB();

const app = express();

/* 🔧 IMPORTANT: CORS */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://darkslateblue-porpoise-246865.hostingersite.com"
    ],
    credentials: true,
  })
);


app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.use("/api/orders", orderRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/dashboard", dashboardRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on port ${PORT}`)
);
