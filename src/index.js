import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

/* =========================
   MIDDLEWARE
========================= */
app.use(cors({
  origin: "*", // tighten later if needed
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   DATABASE
========================= */
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ Mongo connected");

    // 🔥 IMPORTANT: prevents duplicate-index 500 errors
    await mongoose.syncIndexes();
    console.log("✅ Mongo indexes synced");
  })
  .catch(err => {
    console.error("❌ Mongo connection error:", err);
    process.exit(1);
  });

/* =========================
   ROUTES
========================= */
app.use("/auth", authRoutes);

app.get("/", (_, res) => {
  res.json({ status: "OpsLink Auth API online" });
});

/* =========================
   SERVER
========================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Auth API running on port ${PORT}`);
});
