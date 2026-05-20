import { Router } from "express";
import Subscription from "./Subscription";
import Notification from "./Notification";
import { authenticate } from "@/middlewares/authenticate.middleware";
const router = Router();

router.use("/subscription", authenticate, Subscription);
router.use("/notification", authenticate, Notification);

export default router;
