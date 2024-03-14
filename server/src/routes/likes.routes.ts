import { Router } from "express";
import { likeTweetController, unLikeTweetController } from "~/controllers/likes.controllers";
import { tweetIdValidator } from "~/middlewares/tweet.middlewares";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";

const liklesRouter = Router();

liklesRouter.post(
  "/",
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(likeTweetController),
);

/**
 * Description: Unlike tweet
 * Path: /:tweet:id
 * Method: DELETE
 * Body: { tweet_id: string }
 * Header: { Authorization: Bearer <access_token>}
 */

liklesRouter.delete(
  "/tweets/:tweet_id",
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unLikeTweetController),
);

export default liklesRouter;
