import { wrapRequestHandler } from './../utils/handlers';
import { Router } from "express";
import { getConversationsController } from "~/controllers/conversations.controller";
import { paginationValidator } from "~/middlewares/tweet.middlewares";
import { accessTokenValidator, getConversationValidator, verifiedUserValidator } from "~/middlewares/users.middlewares";

const conversationsRouter = Router();

conversationsRouter.get(
  "/receivers/:receiver_id",
  accessTokenValidator,
  verifiedUserValidator,
  paginationValidator,
  getConversationValidator,
  wrapRequestHandler(getConversationsController),
);

export default conversationsRouter;
