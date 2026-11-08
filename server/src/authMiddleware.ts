
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "./db";

export interface AuthRequest extends Request {
  userId?: number;
  role?: string;
}

// Verify JWT token
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Please log in.",
    });
  }

  const token = authHeader.split(" ")[1];
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      success: false,
      message: "Server authentication configuration error.",
    });
  }

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload;

    if (
      typeof decoded.userId !== "number" ||
      !Number.isInteger(decoded.userId)
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    (req as AuthRequest).userId = decoded.userId;
    next();
  } catch {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// Verify admin role from database
export const requireAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const userId = (req as AuthRequest).userId;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return;
  }

  try {
    const result = await pool.query(
      "SELECT role FROM users WHERE id = $1",
      [userId]
    );

    if (result.rows.length === 0) {
      res.status(401).json({
        success: false,
        message: "User account not found.",
      });
      return;
    }

    const role = result.rows[0].role;

    if (role !== "admin") {
      res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
      return;
    }

    (req as AuthRequest).role = role;
    next();
  } catch (error) {
    console.error("Admin authorization error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to verify admin permissions.",
    });
  }
};
