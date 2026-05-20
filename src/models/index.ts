import sequelize from "@/config/db.config";
import NotificationClient from "@/models/NotificationClient.model";
import PendingNotification from "./PendingNotification.model";

export {
  sequelize,
  NotificationClient,
  PendingNotification,
};
