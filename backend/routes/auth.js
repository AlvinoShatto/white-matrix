import express from "express";
import passport from "../config/passport.js";
import bcrypt from "bcryptjs";
import pool from "../config/database.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import axios from "axios";

const router = express.Router();

/* ==================== EMAIL CONFIG ==================== */

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* ==================== GOOGLE OAUTH (PASSPORT) ==================== */

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
  }),
  (req, res) => {
    console.log("✅ Google OAuth success:", req.user.email);
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

/* ==================== LINKEDIN OAUTH (MANUAL – NO PASSPORT) ==================== */

router.get("/linkedin", (req, res) => {
  console.log("➡️ HIT /api/auth/linkedin");

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.LINKEDIN_CLIENT_ID,
    redirect_uri: "http://localhost:5000/api/auth/linkedin/callback",
    scope: "openid profile email",
    state: crypto.randomBytes(16).toString("hex"),
  });

  res.redirect(`https://www.linkedin.com/oauth/v2/authorization?${params}`);
});

router.get("/linkedin/callback", async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=linkedin_auth_failed`
      );
    }

    // 1️⃣ Exchange code for access token
    const tokenRes = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: "http://localhost:5000/api/auth/linkedin/callback",
        client_id: process.env.LINKEDIN_CLIENT_ID,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const accessToken = tokenRes.data.access_token;

    // 2️⃣ Get user info
    const userRes = await axios.get(
      "https://api.linkedin.com/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const { email, name, sub } = userRes.data;

    if (!email) {
      throw new Error("LinkedIn email not provided");
    }

    // 3️⃣ Find or create user
    let [users] = await pool.execute(
      "SELECT * FROM users WHERE linkedin_id = ? OR email = ?",
      [sub, email]
    );

    let user;

    if (users.length > 0) {
      user = users[0];

      if (!user.linkedin_id) {
        await pool.execute(
          "UPDATE users SET linkedin_id = ? WHERE id = ?",
          [sub, user.id]
        );
      }
    } else {
      const [result] = await pool.execute(
        "INSERT INTO users (email, name, linkedin_id) VALUES (?, ?, ?)",
        [email, name || "User", sub]
      );

      const [created] = await pool.execute(
        "SELECT * FROM users WHERE id = ?",
        [result.insertId]
      );

      user = created[0];
    }

    // 4️⃣ Create session manually
    req.login(user, (err) => {
      if (err) throw err;
      console.log("✅ LinkedIn OAuth success:", email);
      res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    });
  } catch (err) {
    console.error("❌ LinkedIn OAuth error:", err.response?.data || err);
    res.redirect(
      `${process.env.FRONTEND_URL}/login?error=linkedin_auth_failed`
    );
  }
});

/* ==================== SESSION CHECK ==================== */

router.get("/test", (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user || null,
  });
});

/* ==================== LOGOUT ==================== */

router.post("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
});

/* ==================== LOCAL AUTH ==================== */

router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: "All fields required" });
    }

    const [existing] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.execute(
      "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
      [email, hashed, name]
    );

    res.json({ message: "Signup successful" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) return next(err);
    if (!user)
      return res.status(401).json({ error: info?.message || "Login failed" });

    req.logIn(user, (err) => {
      if (err) return next(err);
      res.json({ user });
    });
  })(req, res, next);
});

/* ==================== PASSWORD RESET ==================== */

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const [users] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.json({ message: "If email exists, reset sent" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await pool.execute(
      "UPDATE users SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE email = ?",
      [token, email]
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      to: email,
      subject: "Password Reset",
      html: `<a href="${resetUrl}">${resetUrl}</a>`,
    });

    res.json({ message: "If email exists, reset sent" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    const [users] = await pool.execute(
      "SELECT id FROM users WHERE reset_token = ? AND reset_token_expiry > NOW()",
      [token]
    );

    if (users.length === 0) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.execute(
      "UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?",
      [hashed, users[0].id]
    );

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
