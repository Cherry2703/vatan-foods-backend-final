import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import incomingRoutes from "./routes/incomingRoutes.js";
import cleaningRoutes from "./routes/cleaningRoutes.js";
import packingRoutes from "./routes/packingRoutes.js";
import trackOrderRoutes from "./routes/trackOrder.js";



dotenv.config();
const app = express();
 
app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);

// DB Connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/incoming", incomingRoutes);
app.use("/api/cleaning", cleaningRoutes);
app.use("/api/packing", packingRoutes);
app.use("/api/track-orders",trackOrderRoutes)

app.get("/", (req, res) => {
  res.send("Vatan Foods Backend is running...");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
export default app; 