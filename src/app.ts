import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import logger from "morgan";
import redisClient from "@/config/redis.config";
import "./register-alias";
import router from "./routes/index";
import path from "path";
import cron from "node-cron";
import PendingNotification from "@/models/PendingNotification";

dotenv.config();
const port = process.env.APP_PORT || 3000;
const app = express();
redisClient.connect();
const publicPath = path.join(__dirname, "../public");
app.use(express.json());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(publicPath));

app.get("/health", (_req: express.Request, res: express.Response) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

app.use("/", router);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

cron.schedule("0 * * * * *", async () => {
  console.log("Running cron job");
  await PendingNotification.scope("expired").destroy();
  console.log("Cron job finished");
  
});

export default app;
