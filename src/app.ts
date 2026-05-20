// import express from "express";
// import bodyParser from "body-parser";
// import cookieParser from "cookie-parser";
// import dotenv from "dotenv";
// import logger from "morgan";
// import redisClient from "@/config/redis.config";
// import "./register-alias";
// import router from "./routes/index";
// import path from "path";
// import cron from "node-cron";
// import PendingNotification from "@/models/PendingNotification.model";
// import sequelize from "@/config/db.config";

// dotenv.config();
// const port = process.env.APP_PORT || 3000;
// const app = express();
// redisClient.connect();
// const publicPath = path.join(__dirname, "../public");
// app.use(express.json());
// app.use(logger("dev"));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(cookieParser());
// app.use(express.static(publicPath));

// app.get("/health", async (_req: express.Request, res: express.Response) => {
//   const health: any = { status: "OK", timestamp: new Date() };

//   try {
//     await sequelize.authenticate();
//     health.database = "Connected";
//   } catch (error) {
//     health.database = "Disconnected";
//     health.status = "ERROR";
//     console.error("Failed to connect to database", { error });
//   }

//   try {
//     const ping = await redisClient.ping();
//     health.redis = ping === "PONG" ? "Connected" : "Disconnected";
//   } catch (error) {
//     health.redis = "Disconnected";
//     health.status = "ERROR";
//     console.error("Failed to connect to redis", { error });
//   }

//   res.status(health.status === "OK" ? 200 : 503).json(health);
// });

// app.use("/", router);

// app.listen(port, () => {
//   console.log(`Server is up on port ${port}`);
// });

// cron.schedule("0 * * * * *", async () => {
//   console.log("Running cron job");
//   await PendingNotification.scope("expired").destroy();
//   console.log("Cron job finished");
// });

// export default app;

import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import methodOverride from "method-override";
import morgan from "morgan";
import cron from "node-cron";
import { NotificationClient } from "@/repositories";
import { correlationIdMiddleware } from "@/middlewares/correlation-id.middleware";
import { redisService } from "@/services/redis-service";
import { appConfig } from "@/config/app.config";
import { errorHandler, notFoundHandler } from "./middlewares/error-handler.middleware";
import { sequelize } from "./models";
import "./register-alias";
import router from "./routes";
import logger from "./utils/Logger.utils";
import { minioService } from "@/services/minio-service";

const startServer = async () => {
  try {
    await redisService.connect();
    dotenv.config();
    const port = appConfig.PORT;
    const app = express();

    app.use(correlationIdMiddleware);

    app.use((req: Request, res: Response, next: NextFunction) => {
      req.id = Math.random().toString(36).substr(2, 9);
      res.setHeader("X-Request-ID", req.id);
      next();
    });
    app.use(
      morgan(":method :url :status :response-time ms", {
        stream: {
          write: (message) => {
            logger.http(message.trim());
          },
        },
      })
    );

    app.use(express.json());
    app.set("trust proxy", 1);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(cookieParser());
    app.use(methodOverride("_method"));

    app.get("/health", async (_req: Request, res: Response) => {
      const health: any = { status: "OK", timestamp: new Date() };

      try {
        await sequelize.authenticate();
        health.database = "Connected";
      } catch (error) {
        health.database = "Disconnected";
        health.status = "ERROR";
        logger.error("Failed to connect to database", { error });
      }

      try {
        health.redis = redisService.isHealthy() ? "Connected" : "Disconnected";
        if (!redisService.isHealthy()) health.status = "ERROR";
      } catch (error) {
        health.redis = "Disconnected";
        health.status = "ERROR";
        logger.error("Failed to connect to redis", { error });
      }

      try {
        const buckets = await (minioService as any).client.listBuckets();
        health.minio = Array.isArray(buckets) ? "Connected" : "Disconnected";
      } catch (error) {
        health.minio = "Disconnected";
        health.status = "ERROR";
        logger.error("Failed to connect to minio", { error });
      }

      res.status(health.status === "OK" ? 200 : 503).json(health);
    });

    app.use("/", router);

    app.use(notFoundHandler);
    app.use(errorHandler);

    const server = app.listen(port, () => {
      logger.info(`Server started on port ${port}`);
    });

    cron.schedule("0 * * * *", () => {
      NotificationClient.deleteExpired();
      logger.info("Deleted expired notification clients");
    });

    process.on("SIGTERM", () => {
      logger.info("SIGTERM signal received: closing HTTP server");
      server.close(() => {
        logger.info("HTTP server closed");
      });
    });

    process.on("SIGINT", () => {
      logger.info("SIGINT received, shutting down gracefully");
      server.close(() => {
        logger.info("Process terminated");
        process.exit(0);
      });
    });
  } catch (error) {
    logger.error("Failed to start server", { error });
    process.exit(1);
  }
};

startServer();
