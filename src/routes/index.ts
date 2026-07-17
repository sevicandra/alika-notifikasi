import { Router } from "express";
import { authenticate } from "@/middlewares/authenticate.middleware";
import Notification from "./Notification";
import Pm2 from "./Pm2";
import Queue from "./Queue";
import Subscription from "./Subscription";

const router = Router();

router.use("/subscription", authenticate, Subscription);
router.use("/notification", authenticate, Notification);
router.use("/PM2", authenticate, Pm2);
router.use("/Queue", authenticate, Queue);

export default router;
