import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { LikeRequestBody } from "~/models/requests/Likes.request";
import { TokenPayload } from "~/models/requests/User.requests";
import likeService from "~/services/likes.services";
import { LIKE_MESSAGES } from './../constants/message';
export const likeTweetController = async (
  req: Request<ParamsDictionary, any, LikeRequestBody>,
  res: Response,
) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  const result = await likeService.likeTweet(user_id, req.body.tweet_id);
  return res.json({
    message: LIKE_MESSAGES.LIKE_TWEET_SUCCESSFULLY,
    result,
  });
};

export const unLikeTweetController = async (req: Request, res: Response) => {
  const { user_id } = req.decoded_authorization as TokenPayload;
  await likeService.unLikeTweet(user_id, req.params.tweet_id);
  return res.json({
    message: LIKE_MESSAGES.UNLIKE_TWEET_SUCCESSFULLY,
  });
};
