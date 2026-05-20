import { NotificationClientRepository, NotificationClientType } from "@/repositories/notification-client";
import { PendingNotificationRepository, PendingNotificationType } from "@/repositories/pending-notification";


const NotificationClient = new NotificationClientRepository();
const PendingNotification = new PendingNotificationRepository();


export {
    NotificationClient,
    PendingNotification,
};

export type {
    NotificationClientType,
    PendingNotificationType,
};
