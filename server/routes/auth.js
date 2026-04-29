const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticates the admin using credentials stored in .env.
 * Returns a JWT token valid for 7 days.
 */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Check credentials
  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  // Generate JWT
  const token = jwt.sign(
    { email: adminEmail, role: "admin" },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    message: "Login successful",
    token,
    admin: { email: adminEmail, role: "admin" },
  });
});

module.exports = router;
