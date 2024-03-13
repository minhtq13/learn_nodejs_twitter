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
config();
const app = express();
const port = process.env.PORT || 4000;

// Tạo folder upload
initFolder();

app.use(express.json());
app.use("/users", userRouter);
app.use("/medias", mediasRouter);
app.use("/static", staticRouter);
app.use("/tweets", tweetsRouter)
app.use("/bookmarks", bookmarksRouter)
app.use("/static/video", express.static(UPLOAD_VIDEO_DIR));
databaseService.connect().then(() => {
  databaseService.indexUsers();
  databaseService.indexRefreshToken();
  databaseService.indexFollowers();
});
app.use(defaultErrorHandler);
app.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
