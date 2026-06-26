import dotenv from "dotenv";
import { redisService } from "@/services/redis-service";
import { minioService } from "@/services/minio-service";
import { NotificationWorker } from "@/bullmq/workers/notification";
import logger from "./utils/Logger.utils";
import "./register-alias";

const startServer = async () => {
  dotenv.config();
  try {
    await redisService.connect();
  } catch (error) {
    logger.error(
      "Failed to connect to Redis during startup. App will run without Redis cache.",
      { error },
    );
  }

  try {
    await minioService.ensureBucketExists();
  } catch (error) {
    logger.error(
      "Failed to initialize MinIO during startup. App will run without functional object storage.",
      { error },
    );
  }
  process.on("SIGTERM", () => {
    Promise.all([NotificationWorker.close()]);
    process.exit(0);
  });

  process.on("SIGINT", () => {
    Promise.all([NotificationWorker.close()]);
    process.exit(0);
  });
};

startServer();
