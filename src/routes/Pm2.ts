import { Router } from "express";
import { PM2ControllerV1 } from "@/controllers/pm2.controller";
import { authorizeScopes } from "@/middlewares/authenticate.middleware";

const router = Router();

router.get("/", authorizeScopes(["webpush.pm2.read"]), PM2ControllerV1.getStatus);
router.post("/ResetAll", authorizeScopes(["webpush.pm2.write"]), PM2ControllerV1.restartAll);
router.post("/Reset/:id", authorizeScopes(["webpush.pm2.write"]), PM2ControllerV1.restart);

export default router;
