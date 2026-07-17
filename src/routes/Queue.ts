import { Router } from "express";
import { QueueController } from "@/controllers/queue.controller";
import { authorizeScopes } from "@/middlewares/authenticate.middleware";

const router = Router();

router.get("/", authorizeScopes(["webpush.queue.read"]), QueueController.getQueueStatus);
router.get(
  "/:queueName/status",
  authorizeScopes(["webpush.queue.read"]),
  QueueController.getQueueStatus
);
router.get("/:queueName/jobs", authorizeScopes(["webpush.queue.read"]), QueueController.getJobs);

router.post(
  "/:queueName/pause",
  authorizeScopes(["webpush.queue.write"]),
  QueueController.pauseQueue
);
router.post(
  "/:queueName/resume",
  authorizeScopes(["webpush.queue.write"]),
  QueueController.resumeQueue
);
router.post(
  "/:queueName/clean",
  authorizeScopes(["webpush.queue.write"]),
  QueueController.cleanQueue
);
router.post(
  "/:queueName/retry",
  authorizeScopes(["webpush.queue.write"]),
  QueueController.retryFailedJobs
);
router.delete(
  "/:queueName/jobs/:jobId",
  authorizeScopes(["webpush.queue.write"]),
  QueueController.deleteJob
);

export default router;
