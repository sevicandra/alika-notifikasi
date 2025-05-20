import { queueOptions } from "@/config/queue.config";
import { notificationJob } from "@/types/job";
import Queue from "bull";
export const notificationQueue = new Queue<notificationJob>(
  "notification",
  queueOptions
);

