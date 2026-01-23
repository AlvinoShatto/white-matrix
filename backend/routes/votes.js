import express from "express";
import pool from "../config/database.js";

const router = express.Router();

/* ================= SESSION AUTH MIDDLEWARE ================= */

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
};

/* ================= GET ALL CANDIDATES ================= */

router.get("/candidates", isAuthenticated, async (req, res) => {
  try {
    const [candidates] = await pool.execute("SELECT * FROM candidates");
    res.json({ candidates });
  } catch (error) {
    console.error("Get candidates error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ================= CHECK IF USER HAS VOTED ================= */

router.get("/check-vote", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;

    const [votes] = await pool.execute(
      "SELECT id FROM votes WHERE user_id = ?",
      [userId]
    );

    res.json({ hasVoted: votes.length > 0 });
  } catch (error) {
    console.error("Check vote error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ================= SUBMIT A VOTE ================= */

router.post("/vote", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { candidate_id } = req.body;

    if (!candidate_id) {
      return res.status(400).json({ error: "Candidate ID is required" });
    }

    // Check if user already voted
    const [existingVote] = await pool.execute(
      "SELECT id FROM votes WHERE user_id = ?",
      [userId]
    );

    if (existingVote.length > 0) {
      return res.status(400).json({ error: "You have already voted" });
    }

    // Verify candidate exists
    const [candidates] = await pool.execute(
      "SELECT id FROM candidates WHERE id = ?",
      [candidate_id]
    );

    if (candidates.length === 0) {
      return res.status(404).json({ error: "Candidate not found" });
    }

    // Insert vote
    await pool.execute(
      "INSERT INTO votes (user_id, candidate_id) VALUES (?, ?)",
      [userId, candidate_id]
    );

    res.json({ message: "Vote submitted successfully" });
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ================= GET VOTERS (OPTIONAL / ADMIN USE) ================= */

router.get("/voters", isAuthenticated, async (req, res) => {
  try {
    const [voters] = await pool.execute(`
      SELECT 
        u.name,
        u.linkedin_url
      FROM votes v
      INNER JOIN users u ON v.user_id = u.id
      ORDER BY v.created_at DESC
    `);

    res.json({ voters });
  } catch (error) {
    console.error("Get voters error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
