import { Router } from "express";
import { getUserDetail, getUsersList } from "../controllers/authController";
import { authenticateUser } from "../middlewares/authMiddleware";

const router = Router();
router.get("/list", authenticateUser, getUsersList);
router.get("/:id", authenticateUser, getUserDetail);

export default router;
