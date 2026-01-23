import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import session from "express-session";
import passport from "./config/passport.js";

import authRoutes from "./routes/auth.js";
import voteRoutes from "./routes/votes.js";
import adminRoutes from "./routes/admin.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

/* -------------------- CORS -------------------- */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

/* -------------------- BODY PARSERS -------------------- */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* -------------------- SESSION -------------------- */
app.use(
  session({
    name: "vote.sid",
    secret: process.env.SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,      // MUST be false on localhost
      sameSite: "lax",    // REQUIRED for Google OAuth
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);

/* -------------------- PASSPORT -------------------- */
app.use(passport.initialize());
app.use(passport.session());

/* -------------------- ROUTES -------------------- */
app.use("/api/auth", authRoutes);
app.use("/api", voteRoutes);
app.use("/api/admin", adminRoutes);

/* -------------------- AUTH DEBUG -------------------- */
app.get("/api/auth/test", (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user || null,
    sessionID: req.sessionID,
  });
});

/* -------------------- HEALTH -------------------- */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK" });
});

/* -------------------- ROOT -------------------- */
app.get("/", (req, res) => {
  res.send("Backend running");
});

/* -------------------- START SERVER -------------------- */
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

