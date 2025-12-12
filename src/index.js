import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Mongo connected"))
  .catch(err => console.error(err));

app.use("/auth", authRoutes);

app.get("/", (_, res) => res.json({ status: "OpsLink Auth API online" }));

app.listen(process.env.PORT || 3000, () =>
  console.log("🚀 Auth API running")
);
