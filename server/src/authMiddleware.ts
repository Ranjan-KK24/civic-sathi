
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: number;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access denied. Please log in.",
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    return res.status(500).json({
      message: "Server authentication configuration error.",
    });
  }

  try {
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload & {
      userId: number;
    };

    (req as AuthRequest).userId = decoded.userId;

    next();
  } catch {
    return res.status(403).json({
      message: "Invalid or expired token.",
    });
  }
};
