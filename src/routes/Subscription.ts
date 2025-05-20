import { Router, Response } from "express";
import {
  getAllNotificationClients,
  getNotificationClientByEndpoint,
  getNotificationClientById,
  createNotificationClient,
  updateNotificationClient,
  deleteNotificationClient,
  updateNotificationClientByEndpoint,
  deleteNotificationClientByEndpoint,
} from "@/controllers/subscription.controller";
import { authenticate } from "@/middlewares/auth.middleware";
import { AuthenticatedRequest } from "@/types/auth";
import { webPushConfig } from "@/config/webPush.config";
import { successResponse } from "@/helpers/respose.helper";
const router = Router();

router.get(
  "/",
  authenticate(["webpush.subscribe.read"]),
  getAllNotificationClients
);
router.get(
  "/key",
  authenticate(["webpush.key.read"]),
  (req: AuthenticatedRequest, res: Response) => {
    return successResponse(
      res,
      "Get VAPID key successfully",
      webPushConfig.vapidKeys.publicKey
    );
  }
);
router.get(
  "/endpoint",
  authenticate(["webpush.subscribe.read"]),
  getNotificationClientByEndpoint
);
router.get(
  "/:id",
  authenticate(["webpush.subscribe.read"]),
  getNotificationClientById
);

router.post(
  "/",
  authenticate(["webpush.subscribe.write"]),
  createNotificationClient
);
router.patch(
  "/endpoint",
  authenticate(["webpush.subscribe.update"]),
  updateNotificationClientByEndpoint
);
router.patch(
  "/:id",
  authenticate(["webpush.subscribe.update"]),
  updateNotificationClient
);
router.delete(
  "/endpoint",
  authenticate(["webpush.subscribe.delete"]),
  deleteNotificationClientByEndpoint
);
router.delete(
  "/:id",
  authenticate(["webpush.subscribe.delete"]),
  deleteNotificationClient
);


export default router;
