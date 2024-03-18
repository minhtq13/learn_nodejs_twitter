import { Collection, Db, MongoClient } from "mongodb";
import dotenv from "dotenv";
import User from "~/models/schemas/User.schema";
import RefreshToken from "~/models/schemas/RefreshToken.schema";
import Follower from "~/models/schemas/Followers.schema";
import Tweet from "~/models/schemas/Tweet.schema";
import Hashtag from "~/models/schemas/Hashtag.schema";
import Bookmark from "~/models/schemas/Bookmark.schema";
import Like from "~/models/schemas/Likes.schema";
import Conversation from "~/models/schemas/Conversations.schema";
dotenv.config();
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@twitter.hhxn21p.mongodb.net/?retryWrites=true&w=majority&appName=Twitter`;

class DatabaseService {
  private client: MongoClient;
  private db: Db;
  constructor() {
    this.client = new MongoClient(uri);
    this.db = this.client.db(process.env.DB_NAME);
  }
  async connect() {
    try {
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } catch (e) {
      console.log("Error", e);
      throw e;
    }
  }
  async indexUsers() {
    const exists = await this.users.indexExists(["email_1_password_1", "email_1", "username_1"]);
    if (!exists) {
      this.users.createIndex({ email: 1, password: 1 });
      this.users.createIndex({ email: 1 }, { unique: true });
      this.users.createIndex({ username: 1 }, { unique: true });
    }
  }

  async indexRefreshToken() {
    const exists = await this.refreshTokens.indexExists(["exp_1", "token_1"]);
    if (!exists) {
      this.refreshTokens.createIndex({ token: 1 });
      this.refreshTokens.createIndex(
        { exp: 1 },
        {
          expireAfterSeconds: 0,
        },
      );
    }
  }
  // indexVideoStatus() {
  //   const exists = await this.indexVideoStatus.indexExists(["name_1"]);
  //   if (!exists) {
  //     this.indexVideoStatus.createIndex({ name: 1 });
  //   }
  // }
  async indexFollowers() {
    const exists = await this.followers.indexExists(["user_id_1_followed_user_id_1"]);
    if (!exists) {
      this.followers.createIndex({ user_id: 1, followed_user_id: 1 });
    }
  }
  async indexTweets() {
    const exists = await this.tweets.indexExists(["content_text"]);
    if (!exists) {
      this.tweets.createIndex({ content: 'text' }, {default_language: 'none'});
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USER_COLLECTION as string);
  }
  get refreshTokens(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKEN_COLLECTION as string);
  }
  get followers(): Collection<Follower> {
    return this.db.collection(process.env.DB_FOLLOWERS_COLLECTION as string);
  }
  get tweets(): Collection<Tweet> {
    return this.db.collection(process.env.DB_TWEETS_COLLECTION as string);
  }
  get hashtags(): Collection<Hashtag> {
    return this.db.collection(process.env.DB_HASHTAGS_COLLECTION as string);
  }
  get bookmarks(): Collection<Bookmark> {
    return this.db.collection(process.env.DB_BOOKMARKS_COLLECTION as string);
  }
  get likes(): Collection<Like> {
    return this.db.collection(process.env.DB_LIKES_COLLECTION as string);
  }
  get conversations(): Collection<Conversation> {
    return this.db.collection(process.env.DB_CONVERSATIONS_COLLECTION as string);
  }

}
// Tạo object từ class DatabaseService
const databaseService = new DatabaseService();
export default databaseService;
