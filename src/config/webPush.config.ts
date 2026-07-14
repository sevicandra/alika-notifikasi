import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const readVapidKey = (filePath?: string, envFallback?: string): string => {
  if (filePath) {
    try {
      if (fs.existsSync(filePath)) {
        return fs.readFileSync(filePath, "utf8").trim();
      }
      console.warn(`VAPID key file not found at: ${filePath}. Falling back to environment variable.`);
    } catch (error) {
      console.error(`Error reading VAPID key file at ${filePath}:`, error);
    }
  }
  return envFallback || "";
};

export const webPushConfig = {
  vapidKeys: {
    publicKey: readVapidKey(process.env.PUBLIC_VAPID_KEY_FILE, process.env.PUBLIC_VAPID_KEY),
    privateKey: readVapidKey(process.env.PRIVATE_VAPID_KEY_FILE, process.env.PRIVATE_VAPID_KEY),
  },
  email: process.env.WUB_PUSH_SERVER_KEY || "",
};