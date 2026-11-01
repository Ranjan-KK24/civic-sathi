import multer from "multer";
import * as path from "path";
import { mkdirSync, unlinkSync } from "fs";
import { randomUUID } from "crypto";

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./auth";
import { pool } from "./db";
import { authenticateToken, AuthRequest } from "./authMiddleware";

dotenv.config();

const app = express();
const PORT = 5000;

// Photo upload configuration
const uploadDir = path.join(process.cwd(), "uploads", "reports");

// Create upload folder if it does not exist
mkdirSync(uploadDir, { recursive: true });

// Configure where photos will be stored
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${extension}`);
  },
});

// Accept image files up to 5 MB
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

app.use(cors());
app.use(express.json());
// Serve uploaded photos
app.use("/uploads", express.static(uploadDir));

// Authentication routes
app.use("/api/auth", authRoutes);

// Welcome route
app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to Civic Sathi Backend API!",
  });
});

// Health check route
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "Civic Sathi backend is running!",
  });
});

// Database test route
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

// Submit report - LOGIN REQUIRED

// Submit report with optional photo - LOGIN REQUIRED
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

      // Save photo details if a photo was uploaded
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

// View reports - PUBLIC
app.get("/api/reports", async (_req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM reports ORDER BY created_at DESC"
    );

    res.json({
      success: true,
      count: result.rows.length,
      reports: result.rows,
    });
  } catch (error) {
    console.error("Failed to fetch reports:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reports.",
    });
  }
});


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
      `SELECT * FROM reports
       WHERE user_id = $1
       ORDER BY created_at DESC`,
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


// Start server
app.listen(PORT, () => {
  console.log(`Civic Sathi backend running at http://localhost:${PORT}`);
});
