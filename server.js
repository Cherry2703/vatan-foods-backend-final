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
import companyRoutes from "./routes/companyRoutes.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: [process.env.CLIENT_URL, "http://localhost:3000","https://vatan-foods.vercel.app"],
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
  })
);


const startServer = async () => {
  await connectDB();  // <--- ❗ MUST BE AWAITED
  console.log("DB Connection complete → Loading routes...");

  app.use("/api/auth", authRoutes);
  app.use("/api/orders", orderRoutes);
  app.use("/api/incoming", incomingRoutes);
  app.use("/api/cleaning", cleaningRoutes);
  app.use("/api/packing", packingRoutes);
  app.use("/api/track-orders", trackOrderRoutes);
  app.use("/api/companies", companyRoutes);

  app.get("/", (req, res) => {
    res.send("Vatan Foods Backend is running...");
  });

  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();  // <--- RUN IT

export default app;
