import { notificationQueue } from "@/queue/notification.queue";

import { notificationJob } from "@/types/job";

export class NotificationService {
  static addNotification = async (job: notificationJob) => {
    try {
      await notificationQueue.add("notification", job);
    } catch (error) {
      console.error("Error adding notification job:", error);
    }
  };
  static getNotificationQueueCount = async () => {
    try {
      const queue = await notificationQueue.count();
      return queue;
    } catch (error) {
      console.error("Error getting notification queue:", error);
      return [];
    }
  };
  static getNotificationQueueCompletedCount = async () => {
    try {
      const queue = await notificationQueue.getCompletedCount();
      return queue;
    } catch (error) {
      console.error("Error getting notification queue:", error);
      return [];
    }
  };
  static getNotificationQueueFailedCount = async () => {
    try {
      const queue = await notificationQueue.getFailedCount();
      return queue;
    } catch (error) {
      console.error("Error getting notification queue:", error);
      return [];
    }
  };
  static getNotificationQueueDelayedCount = async () => {
    try {
      const queue = await notificationQueue.getDelayedCount();
      return queue;
    } catch (error) {
      console.error("Error getting notification queue:", error);
      return [];
    }
  };
  static getNotificationQueueWaitingCount = async () => {
    try {
      const queue = await notificationQueue.getWaitingCount();
      return queue;
    } catch (error) {
      console.error("Error getting notification queue:", error);
      return [];
    }
  };
}
