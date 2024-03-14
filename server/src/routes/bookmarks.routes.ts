import { Router } from "express";
import { bookmarkTweetController, unBookmarkTweetController } from "~/controllers/bookmarks.controllers";
import { tweetIdValidator } from "~/middlewares/tweet.middlewares";
import { accessTokenValidator, verifiedUserValidator } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";

const bookmarksRouter = Router();

bookmarksRouter.post(
  "/",
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(bookmarkTweetController),
);

/**
 * Description: Unbookmark tweet
 * Path: /:tweet:id
 * Method: DELETE
 * Body: { tweet_id: string }
 * Header: { Authorization: Bearer <access_token>}
 */

bookmarksRouter.delete(
  "/tweets/:tweet_id",
  accessTokenValidator,
  verifiedUserValidator,
  tweetIdValidator,
  wrapRequestHandler(unBookmarkTweetController),
);

export default bookmarksRouter;
