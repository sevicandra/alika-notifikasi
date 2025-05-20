import dotenv from "dotenv";
import "./register-alias";
import { notificationQueue } from "@/queue/notification.queue";
import NotificationClient from "@/models/NotificationClient";
import { WebPushError } from "web-push";
import { sendNotification } from "@/jobs/notification.job";
import { log } from "console";
dotenv.config();

notificationQueue.process("notification", 5, sendNotification); 
notificationQueue.on("failed", async (job, err: WebPushError) => {
  const { client } = job.data;
  if (err.statusCode === 410 || err.statusCode === 404) {
    await NotificationClient.destroy({
      where: { endpoint: client.endpoint },
    });
    job.remove();
  } else if (err.statusCode === 429 && job.attemptsMade < 3) {
    job.update({
      attempts: job.attemptsMade + 1,
      delay: 1000 * Math.pow(2, job.attemptsMade),
      ...job.data,
    });
  } else {
    job.remove();
  }
});

notificationQueue.on("completed", async (job) => {
  job.remove();
});

notificationQueue.on("progress", async (job) => {
  log(
    `Job ${job.id} is ${job.progress()}% complete.`
  );
});

log("Bull worker started");

