import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
export const webPushConfig = {
  vapidKeys: {
    publicKey: process.env.PUBLIC_VAPID_KEY_FILE 
      ? fs.readFileSync(process.env.PUBLIC_VAPID_KEY_FILE, "utf8").trim() : process.env.PUBLIC_VAPID_KEY,
    privateKey: process.env.PRIVATE_VAPID_KEY_FILE
      ? fs.readFileSync(process.env.PRIVATE_VAPID_KEY_FILE, "utf8").trim() : process.env.PRIVATE_VAPID_KEY,
    },
    email: process.env.WUB_PUSH_SERVER_KEY || "",
};