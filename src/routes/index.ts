import { Router } from "express";
import Subscription from "./Subscription";
import Notification from "./Notification";
const router = Router();

router.use("/subscription", Subscription);
router.use("/notification", Notification);

export default router;
