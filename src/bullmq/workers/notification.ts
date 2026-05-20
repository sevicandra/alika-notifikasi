import dotenv from "dotenv";
import { BaseQueueWorker } from "@/bullmq/base-queue-worker";
import webPush from "web-push";
import { webPushConfig } from "@/config/webPush.config";
import { notificationJob } from "@/types/job";
import { appConfig } from "@/config/app.config";

dotenv.config();

webPush.setVapidDetails(
    "mailto:" + webPushConfig.email,
    webPushConfig.vapidKeys.publicKey,
    webPushConfig.vapidKeys.privateKey
);

export const NotificationWorker = new BaseQueueWorker<notificationJob>("notification", (job) => {
    const { client, payload } = job.data;
    return new Promise(async (resolve, reject) => {
        try {
            await webPush.sendNotification(
                {
                    endpoint: client.endpoint,
                    expirationTime: null,
                    keys: {
                        p256dh: client.keys.p256dh,
                        auth: client.keys.auth,
                    },
                },
                JSON.stringify({
                    title: payload.title,
                    body: payload.body,
                    icon: `${appConfig.URL}/icons/alika.png`,
                    badge: `${appConfig.URL}/icons/alika.png`,
                    image: `${appConfig.URL}/icons/alika.png`,
                    vibrate: [100, 80, 100, 80, 100, 150, 300],
                    actions: payload.actions,
                    url: payload.url,
                })
            );
            resolve();
        } catch (error) {
            console.error("Job gagal, percobaan ke:", job.attemptsMade + 1);

            if (job.attemptsMade >= 2) {
                console.log("Job gagal maksimal, status diubah ke failed.");
            }
            reject(error);
        }
    });
});
