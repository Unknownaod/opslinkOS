import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

/* =========================
   HELPERS
========================= */
function signToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign(
    {
      uid: user._id,
      username: user.username,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* =========================
   REGISTER
========================= */
router.post("/register", async (req, res) => {
  try {
    console.log("REGISTER BODY:", req.body);

    const { username, email, password } = req.body;
    const normalizedEmail = email?.toLowerCase();

    // ---- Validation ----
    if (!username || !email || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (username.length < 3 || username.length > 32) {
      return res.status(400).json({ error: "Invalid username length" });
    }

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }

    // ---- Uniqueness check ----
    const existingUser = await User.findOne({
      $or: [{ username }, { email: normalizedEmail }]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return res.status(409).json({ error: "Username already exists" });
      }
      if (existingUser.email === normalizedEmail) {
        return res.status(409).json({ error: "Email already exists" });
      }
    }

    // ---- Create user ----
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      username,
      email: normalizedEmail,
      passwordHash
    });

    const token = signToken(user);

    return res.status(201).json({
      token,
      username: user.username,
      email: user.email
    });

  } catch (err) {
    // Mongo duplicate index fallback
    if (err.code === 11000) {
      return res.status(409).json({
        error: "Username or email already exists"
      });
    }

    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/* =========================
   LOGIN
========================= */
router.post("/login", async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

    const user = await User.findOne({
      $or: [
        { username: identifier },
        { email: identifier.toLowerCase() }
      ]
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken(user);

    return res.json({
      token,
      username: user.username,
      email: user.email
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

export default router;
