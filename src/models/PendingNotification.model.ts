import sequelize from "@/config/db.config";
import { Model, Optional, DataTypes, Op } from "sequelize";

type PendingNotificationAttributes = {
  id: string;
  nip: string;
  message: string;
  title?: string;
  expires: Date;
};

type PendingNotificationCreationAttributes = Optional<
  PendingNotificationAttributes,
  "id"
>;

class PendingNotification
  extends Model<
    PendingNotificationAttributes,
    PendingNotificationCreationAttributes
  >
  implements PendingNotificationAttributes
{
  public id!: string;
  public nip!: string;
  public message!: string;
  public title?: string;
  public expires!: Date;
}

PendingNotification.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    nip: {
      type: DataTypes.STRING(18),
    },
    message: {
      type: DataTypes.STRING(),
    },
    title: {
      type: DataTypes.STRING(),
    },
    expires: {
      type: DataTypes.DATE,
    },
  },
  {
    sequelize,
    tableName: "pending_notification",
    timestamps: false,
    freezeTableName: true,
    modelName: "PendingNotification",
    scopes:{
      expired: {
        where: {
          expires: {
            [Op.lt]: new Date(),
          },
        },
      },
      notExpired: {
        where: {
          expires: {
            [Op.gte]: new Date(),
          },
        },
      },
    }
  }
);

export default PendingNotification;
