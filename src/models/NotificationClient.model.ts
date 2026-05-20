import sequelize from "@/config/db.config";
import { Model, Optional, DataTypes, Op } from "sequelize";

type NotificationClientAttributes = {
  id: string;
  nip: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  expiresAt: Date;
};

type NotificationClientAttributesCreationAttributes = Optional<
  NotificationClientAttributes,
  "id"
>;

class NotificationClient
  extends Model<
    NotificationClientAttributes,
    NotificationClientAttributesCreationAttributes
  >
  implements NotificationClientAttributes
{
  public id!: string;
  public nip!: string;
  public endpoint!: string;
  public p256dh!: string;
  public auth!: string;
  public expiresAt!: Date;
}

NotificationClient.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    nip: {
      type: DataTypes.STRING(18),
    },
    endpoint: {
      type: DataTypes.STRING(),
      unique: true,
    },
    p256dh: {
      type: DataTypes.STRING(),
    },
    auth: {
      type: DataTypes.STRING(),
    },
    expiresAt: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: "notification_client",
    timestamps: false,
    modelName: "notificationClient",
    scopes: {
      expired: {
        where: {
          expiresAt: {
            [Op.lt]: new Date(),
          },
        },
      },
    },
  }
);

export default NotificationClient;
