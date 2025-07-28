import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/authController";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = Router();
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", authenticateUser, logoutUser);

export default router;
