import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import pool from "./database.js";

/* ================= SERIALIZE / DESERIALIZE ================= */
console.log("🔥 PASSPORT FILE LOADED FROM:", import.meta.url);
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (!rows.length) {
      return done(null, false);
    }

    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
});

/* ================= GOOGLE OAUTH ================= */

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        if (!profile.emails || profile.emails.length === 0) {
          return done(new Error("Google account has no email"));
        }

        const email = profile.emails[0].value;
        const name = profile.displayName || "User";
        const googleId = profile.id;

        // 1️⃣ Find by Google ID
        let [rows] = await pool.execute(
          "SELECT * FROM users WHERE google_id = ?",
          [googleId]
        );

        if (rows.length) {
          return done(null, rows[0]);
        }

        // 2️⃣ Find by email
        [rows] = await pool.execute(
          "SELECT * FROM users WHERE email = ?",
          [email]
        );

        if (rows.length) {
          await pool.execute(
            "UPDATE users SET google_id = ? WHERE email = ?",
            [googleId, email]
          );

          const [updated] = await pool.execute(
            "SELECT * FROM users WHERE email = ?",
            [email]
          );

          return done(null, updated[0]);
        }

        // 3️⃣ Create new user
        const [result] = await pool.execute(
          "INSERT INTO users (email, name, google_id) VALUES (?, ?, ?)",
          [email, name, googleId]
        );

        const [newUser] = await pool.execute(
          "SELECT * FROM users WHERE id = ?",
          [result.insertId]
        );

        return done(null, newUser[0]);
      } catch (err) {
        return done(err);
      }
    }
  )
);

/* ================= LOCAL AUTH ================= */

passport.use(
  new LocalStrategy(
    { usernameField: "email", passwordField: "password" },
    async (email, password, done) => {
      try {
        const [rows] = await pool.execute(
          "SELECT * FROM users WHERE email = ?",
          [email]
        );

        if (!rows.length) {
          return done(null, false, { message: "Invalid email or password" });
        }

        const user = rows[0];

        if (!user.password) {
          return done(null, false, {
            message: "This account uses OAuth login",
          });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
          return done(null, false, { message: "Invalid email or password" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

export default passport;
