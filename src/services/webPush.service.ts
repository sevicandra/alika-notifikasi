import { webPushConfig } from "@/config/webPush.config";
import webPush from "web-push";

export class WebPushService {
  private static addExpirationTime = () => {
    const now = new Date();
    return now.setDate(now.getDate() + 365);
  };
  

  static sendNotification = async (subscription: any, payload: string) => {
    try {
      const { endpoint } = subscription;
      const options = {
        vapidDetails: {
          subject: `mailto:${webPushConfig.email}`,
          publicKey: webPushConfig.vapidKeys.publicKey,
          privateKey: webPushConfig.vapidKeys.privateKey,
        },
        TTL: 60,
      };
      await webPush.sendNotification(endpoint, payload, options);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };
  static subscribe = async (subscription: any) => {
    const { endpoint, keys } = subscription;
    const expirationTime = this.addExpirationTime();
    if (!endpoint || !keys) {
      throw new Error("Parameter not found");
    }
    return {
      endpoint,
      keys,
      expiresAt: new Date(expirationTime),
    };
  };
  static unsubscribe = async (subscription: any) => {
    const { endpoint } = subscription;
    if (!endpoint) {
      throw new Error("Parameter not found");
    }
    return {
      endpoint,
    };
  };
  static getPublicVapidKey = () => {
    return webPushConfig.vapidKeys.publicKey;
  };
  static getPrivateVapidKey = () => {
    return webPushConfig.vapidKeys.privateKey;
  };
}
