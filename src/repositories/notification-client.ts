import { NotificationClient } from "@/models";
import { BaseRepository } from "./base-repository";
import { Op } from "sequelize";

export class NotificationClientRepository extends BaseRepository<NotificationClient> {
    constructor() {
        super(NotificationClient);
    }

    async deleteExpired() {
        return await this.model.destroy({
            where: {
                expiresAt: {
                    [Op.lt]: new Date(),
                },
            },
        });
    }
}

export type NotificationClientType = NotificationClient;