import { TweetRequestBody } from "~/models/requests/Tweet.request";
import databaseService from "./database.serivces";
import Tweet from "~/models/schemas/Tweet.schema";
import { ObjectId, WithId } from "mongodb";
import Hashtag from "~/models/schemas/Hashtag.schema";

class TweetService {
  async checkAndCreateHashtags(hashtags: string[]) {
    const hashtagDocuments = await Promise.all(
      hashtags.map((hashtag) => {
        // Tìm hashtag trong db, nếu có thì lấy, k thì tạo mới
        return databaseService.hashtags.findOneAndUpdate(
          { name: hashtag },
          {
            $setOnInsert: new Hashtag({ name: hashtag }),
          },
          {
            upsert: true,
            returnDocument: "after",
          },
        );
      }),
    );
    return hashtagDocuments;
  }

  async createTweet(user_id: string, body: TweetRequestBody) {
    const hashtags = await this.checkAndCreateHashtags(body.hashtags);
    const hashtagsArray = hashtags.map((item) => (item as WithId<Hashtag>)._id);

    const result = await databaseService.tweets.insertOne(
      new Tweet({
        audience: body.audience,
        content: body.content,
        hashtags: hashtagsArray,
        mentions: body.mentions,
        medias: body.medias,
        parent_id: body.parent_id,
        type: body.type,
        user_id: new ObjectId(user_id),
      }),
    );
    const tweet = await databaseService.tweets.findOne({ _id: result.insertedId });
    return tweet;
  }
}

const tweetService = new TweetService();
export default tweetService;
