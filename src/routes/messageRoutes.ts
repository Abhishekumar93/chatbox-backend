import { Router } from "express";
import { authenticateUser } from "../middlewares/authMiddleware";
import { getAllMessages } from "../controllers/messageController";

const router = Router();

router.get("/:chatId", authenticateUser, getAllMessages);

export default router;
