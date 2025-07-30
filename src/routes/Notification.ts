import { Router } from "express";
import { sendNotification } from "@/controllers/notification.controller";
import { authenticate } from "@/middlewares/auth.middleware";
const router = Router();

router.post("/Send", authenticate(["webpush.notification.process"]), sendNotification);
router.post("/SendBulk", authenticate(["webpush.notification.process"]), sendNotification);
router.post("/Broadcast", authenticate(["webpush.broadcast.process"]), sendNotification);
export default router;
