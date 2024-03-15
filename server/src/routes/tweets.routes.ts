import { Router } from "express";
import { createTweetController, getNewFeedsController, getTweetChildrenController, getTweetController } from "~/controllers/tweets.controllers";
import { audienceValidator, createTweetValidator, getTweetChildrenValidator, paginationValidator, tweetIdValidator } from "~/middlewares/tweet.middlewares";
import { accessTokenValidator, isUserLoggedInValidator, verifiedUserValidator } from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";

const tweetsRouter = Router();

tweetsRouter.post(
  "/",
  accessTokenValidator,
  verifiedUserValidator,
  createTweetValidator,
  wrapRequestHandler(createTweetController),
);

/**
 * Description: Get tweet detail
 * Path: /:tweet_id
 * Method: GET
 * Header: { Authorization?: Bearer <access_token>}
 */

tweetsRouter.get(
  "/:tweet_id",
  tweetIdValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetController),
);

/**
 * Description: Get tweet children
 * Path: /:tweet_id/children
 * Method: GET
 * Header: { Authorization?: Bearer <access_token>}
 * Query: { page: number, limit: number, tweet_type: TweetType }
 */

tweetsRouter.get(
  "/:tweet_id/children",
  tweetIdValidator,
  paginationValidator,
  getTweetChildrenValidator,
  isUserLoggedInValidator(accessTokenValidator),
  isUserLoggedInValidator(verifiedUserValidator),
  audienceValidator,
  wrapRequestHandler(getTweetChildrenController),
);


/**
 * Description: Get new feeds
 * Path: /new-feeds
 * Method: GET
 * Header: { Authorization: Bearer <access_token>}
 * Query: { page: number, limit: number }
 */

tweetsRouter.get(
  "/",
  paginationValidator,
  accessTokenValidator,
  verifiedUserValidator,
  wrapRequestHandler(getNewFeedsController),
);

export default tweetsRouter;