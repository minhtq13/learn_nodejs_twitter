import { ParamsDictionary } from "express-serve-static-core";
import { NextFunction, Request, Response } from "express";
import { TweetRequestBody } from "~/models/requests/Tweet.request";
import tweetService from "~/services/tweets.services";
import { TokenPayload } from "~/models/requests/User.requests";
import { TWEET_MESSAGES } from "~/constants/message";
export const createTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await tweetService.createTweet(user_id, req.body);
  return res.json({
    message: TWEET_MESSAGES.CREATE_TWEET_SUCCESS,
    result,
  });
};
