import { BaseQueueProducer } from "@/bullmq/base-queue-producer";
import { notificationJob } from "@/types/job";

export const NotificationQueue = new BaseQueueProducer<notificationJob>("notification");
