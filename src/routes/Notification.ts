import { Router } from "express";
import { NotificationController } from "@/controllers/notification.controller";
import z from "zod";
import { authorizeScopes } from "@/middlewares/authenticate.middleware";
import { validateBody } from "@/middlewares/validate-request.middleware";

const router = Router();

const sendNotificationSchema = z.object({
    nip: z.string("parameter tidak boleh kosong"),
    message: z.string("parameter tidak boleh kosong"),
    title: z.string().optional(),
    url: z.string().optional(),
});

const sendBulkNotificationSchema = z.object({
    nip: z.array(z.string("parameter tidak boleh kosong")),
    message: z.string("parameter tidak boleh kosong"),
    title: z.string().optional(),
    url: z.string().optional(),
});

const broadcastNotificationSchema = z.object({
    message: z.string("parameter tidak boleh kosong"),
    title: z.string().optional(),
    url: z.string().optional(),

});

router.post("/Send", authorizeScopes(["webpush.notification.process"]), validateBody(sendNotificationSchema), NotificationController.sendNotification);
router.post("/SendBulk", authorizeScopes(["webpush.notification.process"]), validateBody(sendBulkNotificationSchema), NotificationController.sendBulkNotification);
router.post("/Broadcast", authorizeScopes(["webpush.broadcast.process"]), validateBody(broadcastNotificationSchema), NotificationController.broadcast);
export default router;
