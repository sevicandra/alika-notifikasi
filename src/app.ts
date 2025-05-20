import express from "express";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import logger from "morgan";
import redisClient from "@/config/redis.config";
import './register-alias';
import router from "./routes/index";
import path from "path";

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

app.use("/", router);

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});

export default app;
