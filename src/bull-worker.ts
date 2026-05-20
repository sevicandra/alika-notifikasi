import dotenv from "dotenv";
import { redisService } from "@/services/redis-service";
import { NotificationWorker } from "@/bullmq/workers/notification";
import { minioService } from "@/services/minio-service";
import "./register-alias";

dotenv.config();
const startServer = async () => {
  await redisService.connect();
  await minioService.ensureBucketExists();
  process.on("SIGTERM", () => {
    Promise.all([
      NotificationWorker.close(),
    ]);
    process.exit(0);
  });

  process.on("SIGINT", () => {
    Promise.all([
      NotificationWorker.close(),
    ]);
    process.exit(0);
  });
};

startServer();
