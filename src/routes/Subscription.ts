import { Router, Response, Request } from "express";
import { SubscriptionController } from "@/controllers/subscription.controller";
import { authorizeScopes } from "@/middlewares/authenticate.middleware";
import { webPushConfig } from "@/config/webPush.config";
import { successResponse } from "@/helpers/respose.helper";
import { validateBody } from "@/middlewares/validate-request.middleware";
import z from "zod";

const createSubscriptionSchema = z.object({
  endpoint: z.string("parameter tidak boleh kosong"),
  auth: z.string("parameter tidak boleh kosong"),
  p256dh: z.string("parameter tidak boleh kosong"),
});

const updateSubscriptionSchema = createSubscriptionSchema.partial();

const router = Router();

router.get(
  "/",
  authorizeScopes(["webpush.subscribe.read"]),
  SubscriptionController.getAllClient
);
router.get(
  "/key",
  authorizeScopes(["webpush.key.read"]),
  (req: Request, res: Response) => {
    return successResponse(
      res,
      "Get VAPID key successfully",
      webPushConfig.vapidKeys.publicKey
    );
  }
);
router.get(
  "/endpoint",
  authorizeScopes(["webpush.subscribe.read"]),
  SubscriptionController.getClientByEndpoint
);
router.get(
  "/:id",
  authorizeScopes(["webpush.subscribe.read"]),
  SubscriptionController.getClientById
);

router.post(
  "/",
  authorizeScopes(["webpush.subscribe.write"]),
  validateBody(createSubscriptionSchema),
  SubscriptionController.create
);
router.patch(
  "/endpoint",
  authorizeScopes(["webpush.subscribe.update"]),
  validateBody(updateSubscriptionSchema),
  SubscriptionController.updateByEndpoint
);
router.patch(
  "/:id",
  authorizeScopes(["webpush.subscribe.update"]),
  validateBody(updateSubscriptionSchema),
  SubscriptionController.update
);
router.delete(
  "/endpoint",
  authorizeScopes(["webpush.subscribe.delete"]),
  SubscriptionController.deleteByEndpoint
);
router.delete(
  "/:id",
  authorizeScopes(["webpush.subscribe.delete"]),
  SubscriptionController.delete
);


export default router;
