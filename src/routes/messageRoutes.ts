import { Router } from "express";
import { authenticateUser } from "../middlewares/authMiddleware";
import { getParticipantsAllMessages } from "../controllers/messageController";

const router = Router();

router.get(
  "/:senderId/:receiverId",
  authenticateUser,
  getParticipantsAllMessages
);

export default router;
