import express from "express";
import pool from "../config/database.js";

const router = express.Router();

/* ================= SESSION AUTH ================= */

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: "Not authenticated" });
};

const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user && req.user.is_admin) {
    return next();
  }
  return res.status(403).json({ error: "Admin access required" });
};

/* ================= ADMIN STATS ================= */

router.get("/stats", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const [[voteCount]] = await pool.execute(
      "SELECT COUNT(*) AS total FROM votes"
    );
    const [[userCount]] = await pool.execute(
      "SELECT COUNT(*) AS total FROM users"
    );

    const [votesByCandidate] = await pool.execute(`
      SELECT c.id, c.name, COUNT(v.id) AS vote_count
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidate_id
      GROUP BY c.id, c.name
    `);

    const [voters] = await pool.execute(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.linkedin_url,
        c.name AS candidate_voted_for,
        v.created_at AS vote_time
      FROM votes v
      JOIN users u ON v.user_id = u.id
      JOIN candidates c ON v.candidate_id = c.id
      ORDER BY v.created_at DESC
    `);

    const totalVotes = voteCount.total;
    const totalUsers = userCount.total;

    res.json({
      summary: {
        totalVotes,
        totalUsers,
        votingPercentage:
          totalUsers > 0 ? ((totalVotes / totalUsers) * 100).toFixed(2) : "0.00",
        remainingVoters: totalUsers - totalVotes,
      },
      votesByCandidate,
      voters,
    });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ================= CANDIDATES ================= */

router.get("/candidates", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const [candidates] = await pool.execute("SELECT * FROM candidates");
    res.json({ candidates });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/candidates", isAuthenticated, isAdmin, async (req, res) => {
  const { name, profile_description = "", linkedin_url = "" } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Candidate name is required" });
  }

  const [result] = await pool.execute(
    "INSERT INTO candidates (name, profile_description, linkedin_url) VALUES (?, ?, ?)",
    [name, profile_description, linkedin_url]
  );

  res.status(201).json({
    message: "Candidate added successfully",
    candidate: {
      id: result.insertId,
      name,
      profile_description,
      linkedin_url,
    },
  });
});

router.put("/candidates/:id", isAuthenticated, isAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, profile_description = "", linkedin_url = "" } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Candidate name is required" });
  }

  await pool.execute(
    "UPDATE candidates SET name = ?, profile_description = ?, linkedin_url = ? WHERE id = ?",
    [name, profile_description, linkedin_url, id]
  );

  res.json({ message: "Candidate updated successfully" });
});

router.delete("/candidates/:id", isAuthenticated, isAdmin, async (req, res) => {
  const { id } = req.params;

  const [[voteCount]] = await pool.execute(
    "SELECT COUNT(*) AS count FROM votes WHERE candidate_id = ?",
    [id]
  );

  if (voteCount.count > 0) {
    return res
      .status(400)
      .json({ error: "Cannot delete candidate with existing votes" });
  }

  await pool.execute("DELETE FROM candidates WHERE id = ?", [id]);
  res.json({ message: "Candidate deleted successfully" });
});

/* ================= USERS ================= */

router.get("/users", isAuthenticated, isAdmin, async (req, res) => {
  const [users] = await pool.execute(`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.linkedin_url,
      u.is_admin,
      u.created_at,
      CASE WHEN v.id IS NOT NULL THEN true ELSE false END AS has_voted
    FROM users u
    LEFT JOIN votes v ON u.id = v.user_id
    ORDER BY u.created_at DESC
  `);

  res.json({ users });
});

router.patch(
  "/users/:id/toggle-admin",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;

    if (Number(id) === req.user.id) {
      return res
        .status(400)
        .json({ error: "Cannot modify your own admin status" });
    }

    const [[user]] = await pool.execute(
      "SELECT is_admin FROM users WHERE id = ?",
      [id]
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newStatus = !user.is_admin;
    await pool.execute("UPDATE users SET is_admin = ? WHERE id = ?", [
      newStatus,
      id,
    ]);

    res.json({
      message: `User ${newStatus ? "promoted to" : "demoted from"} admin`,
      is_admin: newStatus,
    });
  }
);

router.delete("/users/:id", isAuthenticated, isAdmin, async (req, res) => {
  const { id } = req.params;

  if (Number(id) === req.user.id) {
    return res
      .status(400)
      .json({ error: "Cannot delete your own account" });
  }

  const [[user]] = await pool.execute(
    "SELECT id FROM users WHERE id = ?",
    [id]
  );

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  await pool.execute("DELETE FROM users WHERE id = ?", [id]);
  res.json({ message: "User deleted successfully" });
});

/* ================= RESET VOTES ================= */

router.post("/reset-votes", isAuthenticated, isAdmin, async (req, res) => {
  await pool.execute("DELETE FROM votes");
  res.json({ message: "All votes reset successfully" });
});

/* ================= CREATE ADMIN ================= */

router.post("/create-admin", isAuthenticated, isAdmin, async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const [[user]] = await pool.execute(
    "SELECT id, is_admin FROM users WHERE email = ?",
    [email]
  );

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  if (user.is_admin) {
    return res.status(400).json({ error: "User is already an admin" });
  }

  await pool.execute("UPDATE users SET is_admin = true WHERE id = ?", [
    user.id,
  ]);

  res.json({
    message: "User promoted to admin successfully",
    user: { id: user.id, email },
  });
});

export default router;
