import { ParamsDictionary } from "express-serve-static-core";
import { NextFunction, Request, Response } from "express";
import { Pagination, TweetParam, TweetQuery, TweetRequestBody } from "~/models/requests/Tweet.request";
import tweetService from "~/services/tweets.services";
import { TokenPayload } from "~/models/requests/User.requests";
import { TWEET_MESSAGES } from "~/constants/message";
import { TweetType } from "~/constants/enums";
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
    updated_at: result.updated_at,
  };
  return res.json({
    message: TWEET_MESSAGES.GET_TWEET_DETAIL_SUCCESS,
    result: tweet,
  });
};

export const getTweetChildrenController = async (req: Request<TweetParam, any, any, TweetQuery>, res: Response) => {
  const tweet_type = Number(req.query.tweet_type) as TweetType;
  const limit = Number(req.query.limit);
  const page = Number(req.query.page);
  const user_id = req.decoded_authorization?.user_id;
  const { total, tweets } = await tweetService.getTweetChildren({
    tweet_id: req.params.tweet_id,
    tweet_type,
    limit,
    page,
    user_id,
  });
  return res.json({
    message: TWEET_MESSAGES.GET_TWEET_CHILDREN_SUCCESS,
    result: {
      tweets,
      tweet_type,
      limit,
      page,
      total_page: Math.ceil(total / limit),
    },
  });
};

export const getNewFeedsController = async (req: Request<ParamsDictionary, any, any, Pagination>, res: Response) => {
  const limit = Number(req.query.limit);
  const page = Number(req.query.page);
  const user_id = req.decoded_authorization?.user_id as string;
  const result = await tweetService.getNewFeeds({
    user_id,
    limit,
    page,
  });
  return res.json({
    message: TWEET_MESSAGES.GET_NEW_FEEDS_SUCCESS,
    result: {
      limit,
      page,
      total: result.total,
      total_page: Math.ceil(result.total / limit),
      tweets: result.tweets,
    }
  })
};
