import { Request, Response } from "express";
import User from "../models/user";

export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userName, name, email, password } = req.body;
    if (!userName || !name || !email || !password) {
      res.status(400).json({ message: "Please fill in all fields" });
      return;
    }
    await User.create({ userName, name, email, password });
    res.status(201).json({ message: "User registered successfully" });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
