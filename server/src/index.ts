import express from "express";
import { defaultErrorHandler } from "./middlewares/error.middlewares";
import userRouter from "./routes/users.routes";
import databaseService from "./services/database.serivces";
import mediasRouter from "./routes/medias.routes";
import { initFolder } from "./utils/file";
import { config } from "dotenv";
import staticRouter from "./routes/static.routes";
import { UPLOAD_VIDEO_DIR } from "./constants/dir";
import tweetsRouter from "./routes/tweets.routes";
import bookmarksRouter from "./routes/bookmarks.routes";
import liklesRouter from "./routes/likes.routes";
import searchRouter from "./routes/search.routes";
import cors, { CorsOptions } from "cors";
import "~/utils/s3";
import { createServer } from "http";
import conversationsRouter from "./routes/conversations.routes";
import initSocket from "./utils/socket";
import YAML from "yaml";
import fs from "fs";
import path from "path";
import swaggerUi from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";
import "~/constants/config";
import helmet from "helmet";
import { isProduction } from "~/constants/config";
import rateLimit from "express-rate-limit";

const file = fs.readFileSync(path.resolve("twitter-swagger.yaml"), "utf-8");

// const options = {
//   definition: {
//     openapi: "3.0.0",
//     info: {
//       title: "Twitter API",
//       version: "1.0.0",
//       description: "A simple Express Library API",
//     },
//     components: {
//       securitySchemes: {
//         BearerAuth: {
//           type: "http",
//           scheme: "bearer",
//           bearerFormat: "JWT",
//         }
//       }
//     }
//   },
//   apis: ['./src/routes/*.routes.ts', './src/models/requests/*.requests.ts'],
// };
// const openapiSpecification = swaggerJSDoc(options);

const swaggerDocument = YAML.parse(file);
// import '~/utils/fake'
config();
const app = express();

const httpServer = createServer(app);
const port = process.env.PORT || 4000;

app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false
});
const corsOptions: CorsOptions = {
  origin: isProduction ? process.env.CLIENT_URL : "*",
};
// Giới hạn số lượng request
app.use(limiter);
app.use(cors(corsOptions));

// Tạo folder upload
initFolder();

app.use(express.json());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use("/users", userRouter);
app.use("/medias", mediasRouter);
app.use("/static", staticRouter);
app.use("/tweets", tweetsRouter);
app.use("/bookmarks", bookmarksRouter);
app.use("/likes", liklesRouter);
app.use("/search", searchRouter);
app.use("/conversations", conversationsRouter);

app.use("/static/video", express.static(UPLOAD_VIDEO_DIR));
databaseService.connect().then(() => {
  databaseService.indexUsers();
  databaseService.indexRefreshToken();
  databaseService.indexFollowers();
  databaseService.indexTweets();
});
app.use(defaultErrorHandler);

initSocket(httpServer);

httpServer.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
