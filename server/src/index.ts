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
import cors from "cors";
import "~/utils/s3";
import { createServer } from "http";
import { Server } from "socket.io";
import Conversation from "./models/schemas/Conversations.schema";
import conversationsRouter from "./routes/conversations.routes";
import { ObjectId } from "mongodb";

// import '~/utils/fake'
config();
const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 4000;

app.use(cors());

// Tạo folder upload
initFolder();

app.use(express.json());
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

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});
const users: {
  [key: string]: {
    socket_id: string;
  };
} = {};
io.on("connection", (socket) => {
  const user_id = socket.handshake.auth._id;
  users[user_id] = {
    socket_id: socket.id,
  };
  socket.on("send_message", async (data) => {
    const {receiver_id, sender_id, content } = data.payload
    const receiver_socket_id = users[receiver_id]?.socket_id;
    if (!receiver_socket_id) return;
    const conversation = new Conversation({
      sender_id: new ObjectId(sender_id),
      receiver_id: new ObjectId(receiver_id),
      content: content,
    });
    const result = await databaseService.conversations.insertOne(conversation);
    conversation._id = result.insertedId;
    socket.to(receiver_socket_id).emit("receive_message", {
      payload: conversation,
      from: user_id,
    });
  });
  socket.on("disconnect", () => {
    delete users[user_id];
  });
});

httpServer.listen(port, () => {
  console.log(`Server is running on port:${port}`);
});
