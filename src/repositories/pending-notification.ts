import { PendingNotification } from "@/models";
import { BaseRepository } from "./base-repository";

export class PendingNotificationRepository extends BaseRepository<PendingNotification> {
    constructor() {
        super(PendingNotification);
    }
}

export type PendingNotificationType = PendingNotification;