import { NotificationQueue } from "@/bullmq/queues/notification";

import { notificationJob } from "@/types/job";
import { UUID } from "@/utils/uuid.util";

export class NotificationService {
  static addNotification = async (job: notificationJob) => {
    try {
      await NotificationQueue.addJob("notification", job, UUID.v4(), {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: true,
        removeOnFail: true,
      });
    } catch (error) {
      console.error("Error adding notification job:", error);
      throw error;
    }
  };
  static getNotificationQueueCount = async () => {
    try {
      const queue = await NotificationQueue.getJobCounts();
      return queue;
    } catch (error) {
      console.error("Error getting notification queue:", error);
      return [];
    }
  };
  static getNotificationQueueCompletedCount = async () => {
    try {
      const queue = await NotificationQueue.getCompletedJobs();
      return queue;
    } catch (error) {
      console.error("Error getting notification queue:", error);
      return [];
    }
  };
  static getNotificationQueueFailedCount = async () => {
    try {
      const queue = await NotificationQueue.getFailedJobs();
      return queue;
    } catch (error) {
      console.error("Error getting notification queue:", error);
      return [];
    }
  };
  static getNotificationQueueDelayedCount = async () => {
    try {
      const queue = await NotificationQueue.getDelayedJobs();
      return queue;
    } catch (error) {
      console.error("Error getting notification queue:", error);
      return [];
    }
  };
  static getNotificationQueueWaitingCount = async () => {
    try {
      const queue = await NotificationQueue.getWaitingJobs();
      return queue;
    } catch (error) {
      console.error("Error getting notification queue:", error);
      return [];
    }
  };
}
