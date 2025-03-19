import { NextFunction, Request, Response } from "express";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jsonwebtoken.verify(
      token,
      process.env.JWT_SECRET ?? ""
    ) as JwtPayload;

    if (typeof decoded !== "object" || !decoded.userId) {
      return res.status(401).json({ message: "Invalid Token Payload" });
    }

    res.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid Token" });
  }
};
