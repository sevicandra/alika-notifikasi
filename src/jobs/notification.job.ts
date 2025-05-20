import { notificationJob } from "@/types/job";
import webPush from "web-push";
import { webPushConfig } from "@/config/webPush.config";
import { Job } from "bull";
import { appConfig } from "@/config/app.config";

webPush.setVapidDetails(
  "mailto:" + webPushConfig.email,
  webPushConfig.vapidKeys.publicKey,
  webPushConfig.vapidKeys.privateKey
);
export const sendNotification = async (
  job: Job<notificationJob>
): Promise<void> => {
  job.progress(10);
  const { client, payload } = job.data;
  return new Promise(async (resolve, reject): Promise<void> => {
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
          icon: `${appConfig.url}/icons/alika.png`,
          badge: `${appConfig.url}/icons/alika.png`,
          image: `${appConfig.url}/icons/alika.png`,
          vibrate: [100, 80, 100, 80, 100, 150, 300],
          actions: payload.actions,
          url: payload.url,
        })
      );
      job.progress(100);
      resolve();
    } catch (error) {
      job.progress(0);
      reject(error);
    }
  });
};
