
import multer from "multer";
import * as path from "path";
import { mkdirSync, unlinkSync } from "fs";
import { randomUUID } from "crypto";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./auth";
import { pool } from "./db";

import {
  authenticateToken,
  requireAdmin,
  AuthRequest,
} from "./authMiddleware";

import adminRoutes from "./adminRoutes";

dotenv.config();

const app = express();
const PORT = 5000;

// ==========================================
// PHOTO UPLOAD CONFIGURATION
// ==========================================

const uploadDir = path.join(process.cwd(), "uploads", "reports");

mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed."));
    }
  },
});

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());

app.use("/uploads/reports", express.static(uploadDir));

// ==========================================
// AUTHENTICATION AND ADMIN ROUTES
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

// Admin authorization test
app.get(
  "/api/admin/test",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    res.json({
      success: true,
      message: "Admin access granted!",
      userId: (req as AuthRequest).userId,
      role: (req as AuthRequest).role,
    });
  }
);

// ==========================================
// BASIC ROUTES
// ==========================================

// Welcome route
app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to Civic Sathi Backend API!",
  });
});

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Civic Sathi backend is running!",
  });
});

// Database test
app.get("/api/db-test", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database"
    );

    res.json({
      success: true,
      message: "PostgreSQL connected successfully!",
      database: result.rows[0].database,
    });
  } catch (error) {
    console.error("Database connection failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed. Check server configuration.",
    });
  }
});

// ==========================================
// SUBMIT REPORT WITH PHOTO
// LOGIN REQUIRED
// ==========================================

app.post(
  "/api/reports",
  authenticateToken,
  upload.single("photo"),
  async (req, res) => {
    const userId = (req as AuthRequest).userId;

    const {
      title,
      description,
      category,
      location,
      latitude,
      longitude,
    } = req.body;

    if (!userId) {
      if (req.file) unlinkSync(req.file.path);

      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    if (!title || !description || !category || !location) {
      if (req.file) unlinkSync(req.file.path);

      return res.status(400).json({
        success: false,
        message: "Title, description, category, and location are required.",
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Save report
      const reportResult = await client.query(
        `INSERT INTO reports
          (user_id, title, description, category, location, latitude, longitude)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          userId,
          title,
          description,
          category,
          location,
          latitude || null,
          longitude || null,
        ]
      );

      const report = reportResult.rows[0];
      let media = null;

      // Save photo details
      if (req.file) {
        const filePath = `/uploads/reports/${req.file.filename}`;

        const mediaResult = await client.query(
          `INSERT INTO report_media
            (report_id, file_name, file_path, mime_type, file_size)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [
            report.id,
            req.file.originalname,
            filePath,
            req.file.mimetype,
            req.file.size,
          ]
        );

        media = mediaResult.rows[0];
      }

      await client.query("COMMIT");

      return res.status(201).json({
        success: true,
        message: "Report submitted successfully!",
        report,
        media,
      });
    } catch (error) {
      await client.query("ROLLBACK");

      if (req.file) {
        try {
          unlinkSync(req.file.path);
        } catch (fileError) {
          console.error("Uploaded file cleanup failed:", fileError);
        }
      }

      console.error("Report submission failed:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to submit report.",
      });
    } finally {
      client.release();
    }
  }
);

// ==========================================
// PUBLIC REPORTS API
// SAFE DATA FOR EXPLORE MAP
// ==========================================

app.get("/api/reports", async (_req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         r.id,
         r.title,
         r.description,
         r.category,
         r.status,
         r.location,
         r.latitude,
         r.longitude,
         r.created_at,
         rm.file_path AS photo_path
       FROM reports r
       LEFT JOIN LATERAL (
         SELECT file_path
         FROM report_media
         WHERE report_id = r.id
         ORDER BY created_at ASC
         LIMIT 1
       ) rm ON true
       WHERE r.merged_into_report_id IS NULL
       ORDER BY r.created_at DESC`
    );

    return res.json({
      success: true,
      count: result.rows.length,
      reports: result.rows,
    });
  } catch (error) {
    console.error("Failed to fetch public reports:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reports.",
    });
  }
});

// ==========================================
// MY REPORTS API
// LOGIN REQUIRED
// ==========================================

app.get("/api/my-reports", authenticateToken, async (req, res) => {
  const userId = (req as AuthRequest).userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "User authentication required.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         r.*,
         rm.file_path AS photo_path,
         primary_report.title AS primary_report_title
       FROM reports r
       LEFT JOIN reports primary_report
         ON primary_report.id = r.merged_into_report_id
       LEFT JOIN LATERAL (
         SELECT file_path
         FROM report_media
         WHERE report_id = r.id
         ORDER BY created_at ASC
         LIMIT 1
       ) rm ON true
       WHERE r.user_id = $1
       ORDER BY r.created_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      count: result.rows.length,
      reports: result.rows,
    });
  } catch (error) {
    console.error("Failed to fetch user reports:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch your reports.",
    });
  }
});

// ==========================================
// CITIZEN NOTIFICATIONS API
// ==========================================

// GET all notifications for logged-in citizen
app.get("/api/notifications", authenticateToken, async (req, res) => {
  const userId = (req as AuthRequest).userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  try {
    const result = await pool.query(
      `SELECT
         id,
         report_id,
         title,
         message,
         notification_type,
         is_read,
         created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      count: result.rows.length,
      unreadCount: result.rows.filter(
        (notification) => !notification.is_read
      ).length,
      notifications: result.rows,
    });
  } catch (error) {
    console.error("Notifications fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
    });
  }
});

// MARK one notification as read
app.patch(
  "/api/notifications/:id/read",
  authenticateToken,
  async (req, res) => {
    const userId = (req as AuthRequest).userId;
    const notificationId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    try {
      const result = await pool.query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [notificationId, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Notification not found.",
        });
      }

      return res.json({
        success: true,
        message: "Notification marked as read.",
      });
    } catch (error) {
      console.error("Mark notification read error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update notification.",
      });
    }
  }
);

// MARK one notification as unread
app.patch(
  "/api/notifications/:id/unread",
  authenticateToken,
  async (req, res) => {
    const userId = (req as AuthRequest).userId;
    const notificationId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    try {
      const result = await pool.query(
        `UPDATE notifications
         SET is_read = FALSE
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [notificationId, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Notification not found.",
        });
      }

      return res.json({
        success: true,
        message: "Notification marked as unread.",
      });
    } catch (error) {
      console.error("Mark notification unread error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update notification.",
      });
    }
  }
);

// MARK all notifications as read
app.patch(
  "/api/notifications/read-all",
  authenticateToken,
  async (req, res) => {
    const userId = (req as AuthRequest).userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    try {
      await pool.query(
        `UPDATE notifications
         SET is_read = TRUE
         WHERE user_id = $1`,
        [userId]
      );

      return res.json({
        success: true,
        message: "All notifications marked as read.",
      });
    } catch (error) {
      console.error("Mark all notifications read error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update notifications.",
      });
    }
  }
);

// DELETE one notification
app.delete(
  "/api/notifications/:id",
  authenticateToken,
  async (req, res) => {
    const userId = (req as AuthRequest).userId;
    const notificationId = Number(req.params.id);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!Number.isInteger(notificationId) || notificationId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid notification ID.",
      });
    }

    try {
      const result = await pool.query(
        `DELETE FROM notifications
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [notificationId, userId]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({
          success: false,
          message: "Notification not found.",
        });
      }

      return res.json({
        success: true,
        message: "Notification deleted.",
      });
    } catch (error) {
      console.error("Delete notification error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to delete notification.",
      });
    }
  }
);

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`Civic Sathi backend running at http://localhost:${PORT}`);
});
