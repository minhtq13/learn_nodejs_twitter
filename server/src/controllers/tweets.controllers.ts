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

export const getTweetController = async (req: Request<ParamsDictionary, any, TweetRequestBody>, res: Response) => {
  const result = await tweetService.increaseView(req.params.tweet_id, req.decoded_authorization?.user_id);
  const tweet = {
    ...req.tweet,
    guest_views: result.guest_views,
    user_views: result.user_views,
  };
  return res.json({
    message: TWEET_MESSAGES.GET_TWEET_DETAIL_SUCCESS,
    result: tweet,
  });
};

export const getTweetChildrenController = async (
  req: Request<ParamsDictionary, any, TweetRequestBody>,
  res: Response,
) => {
  const tweet_type = Number(req.query.tweet_type as string);
  const limit = Number(req.query.limit as string);
  const page = Number(req.query.page as string);
  const { total, tweets } = await tweetService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    tweet_type,
    limit,
    page,
  });
  return res.json({
    message: "Get tweet children success!",
    result: {
      tweets,
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(total / limit),
    },
  });
};
