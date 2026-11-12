
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "./db";
import { authenticateToken, AuthRequest } from "./authMiddleware";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is missing from .env");
}

// ==========================================
// REGISTER
// ==========================================

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email.trim().toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role`,
      [name.trim(), email.trim().toLowerCase(), passwordHash]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user,
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
});

// ==========================================
// LOGIN
// ==========================================

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const result = await pool.query(
      `SELECT id, name, email, password_hash, role
       FROM users
       WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = result.rows[0];

    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// ==========================================
// GET LOGGED-IN USER PROFILE
// GET /api/auth/me
// ==========================================

router.get("/me", authenticateToken, async (req, res) => {
  const userId = (req as AuthRequest).userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, address, city, role, created_at
       FROM users
       WHERE id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({
      success: true,
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Fetch profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
    });
  }
});

// ==========================================
// UPDATE USER PROFILE
// PUT /api/auth/profile
// ==========================================

router.put("/profile", authenticateToken, async (req, res) => {
  const userId = (req as AuthRequest).userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const { name, phone, address, city } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Full name is required.",
    });
  }

  if (name.trim().length > 100) {
    return res.status(400).json({
      success: false,
      message: "Name cannot exceed 100 characters.",
    });
  }

  if (phone != null && (typeof phone !== "string" || phone.length > 20)) {
    return res.status(400).json({
      success: false,
      message: "Invalid phone number.",
    });
  }

  if (address != null && (typeof address !== "string" || address.length > 300)) {
    return res.status(400).json({
      success: false,
      message: "Address cannot exceed 300 characters.",
    });
  }

  if (city != null && (typeof city !== "string" || city.length > 100)) {
    return res.status(400).json({
      success: false,
      message: "City cannot exceed 100 characters.",
    });
  }

  try {
    const result = await pool.query(
      `UPDATE users
       SET name = $1,
           phone = $2,
           address = $3,
           city = $4
       WHERE id = $5
       RETURNING id, name, email, phone, address, city, role`,
      [
        name.trim(),
        phone?.trim() || null,
        address?.trim() || null,
        city?.trim() || null,
        userId,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Update profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
});

// ==========================================
// CHANGE PASSWORD
// PATCH /api/auth/change-password
// ==========================================

router.patch(
  "/change-password",
  authenticateToken,
  async (req, res) => {
    const userId = (req as AuthRequest).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required.",
      });
    }

    if (typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must contain at least 8 characters.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match.",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from the current password.",
      });
    }

    try {
      const result = await pool.query(
        "SELECT password_hash FROM users WHERE id = $1",
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "User not found.",
        });
      }

      const passwordMatch = await bcrypt.compare(
        currentPassword,
        result.rows[0].password_hash
      );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect.",
        });
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12);

      await pool.query(
        "UPDATE users SET password_hash = $1 WHERE id = $2",
        [newPasswordHash, userId]
      );

      return res.json({
        success: true,
        message: "Password changed successfully.",
      });
    } catch (error) {
      console.error("Change password error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to change password.",
      });
    }
  }
);

export default router;
