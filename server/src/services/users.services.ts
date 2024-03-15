import axios from "axios";
import { config } from "dotenv";
import { ObjectId } from "mongodb";
import { TokenType, UserVerifyStatus } from "~/constants/enums";
import HTTP_STATUS from "~/constants/httpStatus";
import { USERS_MESSAGES } from "~/constants/message";
import { ErrorWithStatus } from "~/models/Errors";
import { RegisterReqBody, UpdateMeReqBody } from "~/models/requests/User.requests";
import RefreshToken from "~/models/schemas/RefreshToken.schema";
import User from "~/models/schemas/User.schema";
import { hashPassword } from "~/utils/crypto";
import { sendForgotPasswordEmail, sendVerifyRegisterEmail } from "~/utils/email";
import { signToken, verifyToken } from "~/utils/jwt";
import databaseService from "./database.serivces";
config();
class UsersService {
  private signAccessToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.AccessToken,
        verify,
      },
      privateKey: process.env.JWT_SECRET_ACCESS_TOKEN as string,
      options: {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
      },
    });
  }
  private signRefreshToken({ user_id, verify, exp }: { user_id: string; verify: UserVerifyStatus; exp?: number }) {
    if (exp) {
      return signToken({
        payload: {
          user_id,
          token_type: TokenType.RefreshToken,
          verify,
          exp,
        },
        privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      });
    }
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.RefreshToken,
        verify,
      },
      privateKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
      options: {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
      },
    });
  }

  private signEmailVerifyToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.EmailVerifyToken,
        verify,
      },
      privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string,
      options: {
        expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN,
      },
    });
  }
  private signForgotPasswordToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return signToken({
      payload: {
        user_id,
        token_type: TokenType.ForgotPasswordToken,
        verify,
      },
      privateKey: process.env.JWT_SECRET_FORGOT_PASSWORD_TOKEN as string,
      options: {
        expiresIn: process.env.FORGOT_PASSWORD_TOKEN_EXPIRES_IN,
      },
    });
  }
  private signAccessAndRefreshToken({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    return Promise.all([this.signAccessToken({ user_id, verify }), this.signRefreshToken({ user_id, verify })]);
  }
  private decodeRefreshToken(refresh_token: string) {
    return verifyToken({
      token: refresh_token,
      secretOrPublicKey: process.env.JWT_SECRET_REFRESH_TOKEN as string,
    });
  }

  async register(payload: RegisterReqBody) {
    const user_id = new ObjectId();
    const email_verify_token = await this.signEmailVerifyToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified,
    });
    await databaseService.users.insertOne(
      new User({
        ...payload,
        _id: user_id,
        email_verify_token,
        date_of_birth: new Date(payload.date_of_birth),
        password: hashPassword(payload.password),
        username: payload.email.split("@")[0],
      }),
    );
    // Flow verify email
    // 1. Server send email to user
    // 2. User click link in email
    // 3. Client send request to server with email_verify_token
    // 4. Server verify email_verify_token
    // 5. Client receive access_token and refresh_token
    await sendVerifyRegisterEmail(payload.email, email_verify_token);
    console.log("email_verify_token", email_verify_token);
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id: user_id.toString(),
      verify: UserVerifyStatus.Unverified,
    });
    const { iat, exp } = await this.decodeRefreshToken(refresh_token);
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp }),
    );
    return {
      access_token,
      refresh_token,
    };
  }

  async refreshToken({
    user_id,
    refresh_token,
    verify,
    exp,
  }: {
    user_id: string;
    refresh_token: string;
    verify: UserVerifyStatus;
    exp: number;
  }) {
    const [new_access_token, new_refresh_token] = await Promise.all([
      this.signAccessToken({ user_id, verify }),
      this.signRefreshToken({ user_id, verify, exp }),
      databaseService.refreshTokens.deleteOne({ token: refresh_token }),
    ]);
    const decoded_refresh_token = await this.decodeRefreshToken(new_refresh_token);
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({
        user_id: new ObjectId(user_id),
        token: new_refresh_token,
        iat: decoded_refresh_token.iat,
        exp: decoded_refresh_token.exp,
      }),
    );
    return {
      access_token: new_access_token,
      refresh_token: new_refresh_token,
    };
  }

  async checkEmailExist(email: string) {
    const user = await databaseService.users.findOne({ email });
    return Boolean(user);
  }
  async login({ user_id, verify }: { user_id: string; verify: UserVerifyStatus }) {
    const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
      user_id,
      verify,
    });
    const { iat, exp } = await this.decodeRefreshToken(refresh_token);
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp }),
    );
    return {
      access_token,
      refresh_token,
    };
  }
  private async getOauthGoogleToken(code: string) {
    const body = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: "authorization_code",
    };
    const { data } = await axios.post("https://oauth2.googleapis.com/token", body, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
    return data as {
      access_token: string;
      id_token: string;
    };
  }

  private async getGoogleUserInfo(access_token: string, id_token: string) {
    const { data } = await axios.get("https://www.googleapis.com/oauth2/v1/userinfo", {
      params: {
        access_token,
        alt: "json",
      },
      headers: {
        Authorization: `Bearer ${id_token}`,
      },
    });
    return data as {
      id: string;
      email: string;
      verified_email: boolean;
      name: string;
      given_name: string;
      family_name: string;
      picture: string;
      locale: string;
    };
  }
  async oauth(code: string) {
    const { id_token, access_token } = await this.getOauthGoogleToken(code);
    const userInfo = await this.getGoogleUserInfo(access_token, id_token);
    if (!userInfo.verified_email) {
      throw new ErrorWithStatus({
        message: USERS_MESSAGES.GMAIL_NOT_VERIFIED,
        status: HTTP_STATUS.BAD_REQUEST,
      });
    }
    // Kiểm tra email đăng ký hay chưa
    const user = await databaseService.users.findOne({ email: userInfo.email });
    // Nếu tồn tại thì cho login vào
    if (user) {
      const [access_token, refresh_token] = await this.signAccessAndRefreshToken({
        user_id: user._id.toString(),
        verify: user.verify,
      });
      const { iat, exp } = await this.decodeRefreshToken(refresh_token);
      await databaseService.refreshTokens.insertOne(
        new RefreshToken({ user_id: user._id, token: refresh_token, iat, exp }),
      );
      return {
        access_token,
        refresh_token,
        newUser: 0,
        verify: user.verify,
      };
    } else {
      // random string password
      const password = Math.random().toString(36).substring(2, 15);
      // Không thì đăng ký
      const data = await this.register({
        email: userInfo.email,
        name: userInfo.name,
        password: password,
        confirm_password: password,
        date_of_birth: new Date().toISOString(),
      });
      return { ...data, newUser: 1, verify: UserVerifyStatus.Unverified };
    }
  }
  async logout(refresh_token: string) {
    await databaseService.refreshTokens.deleteOne({ token: refresh_token });
    return {
      message: USERS_MESSAGES.LOGOUT_SUCCESS,
    };
  }
  async verifyEmail(user_id: string) {
    const [token] = await Promise.all([
      this.signAccessAndRefreshToken({ user_id, verify: UserVerifyStatus.Verified }),
      databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
        { $set: { email_verify_token: "", verify: UserVerifyStatus.Verified, updated_at: "$$NOW" } },
      ]),
    ]);
    const [access_token, refresh_token] = token;
    const { iat, exp } = await this.decodeRefreshToken(refresh_token);
    await databaseService.refreshTokens.insertOne(
      new RefreshToken({ user_id: new ObjectId(user_id), token: refresh_token, iat, exp }),
    );
    return {
      access_token,
      refresh_token,
    };
  }
  async resendEmailVerify(user_id: string, email: string) {
    const email_verify_token = await this.signEmailVerifyToken({
      user_id,
      verify: UserVerifyStatus.Unverified,
    });
    // Gửi email
    await sendVerifyRegisterEmail(email, email_verify_token)

    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      { $set: { email_verify_token, updated_at: "$$NOW" } },
    ]);
    return {
      message: USERS_MESSAGES.RESEND_EMAIL_VERIFY_SUCCESS,
    };
  }
  async forgotPassword({ user_id, verify, email }: { user_id: string; verify: UserVerifyStatus, email: string }) {
    const forgot_password_token = await this.signForgotPasswordToken({
      user_id,
      verify,
    });
    databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      { $set: { forgot_password_token, updated_at: "$$NOW" } },
    ]);

    // Gửi email chứa link reset password
    await sendForgotPasswordEmail(email, forgot_password_token)

    return {
      message: USERS_MESSAGES.CHECK_EMAIL_TO_RESET_PASSWORD,
    };
  }
  async resetPassword(user_id: string, password: string) {
    databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      { $set: { password: hashPassword(password), forgot_password_token: "", updated_at: "$$NOW" } },
    ]);
    return {
      message: USERS_MESSAGES.RESET_PASSWORD_SUCCESS,
    };
  }
  async getMe(user_id: string) {
    const user = await databaseService.users.findOne(
      { _id: new ObjectId(user_id) },
      {
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        },
      },
    );
    return user;
  }
  async updateMe(user_id: string, payload: UpdateMeReqBody) {
    const _payload = payload.date_of_birth ? { ...payload, date_of_birth: new Date(payload.date_of_birth) } : payload;
    const user = await databaseService.users.findOneAndUpdate(
      {
        _id: new ObjectId(user_id),
      },
      {
        $set: {
          ...(_payload as UpdateMeReqBody & { date_of_birth?: Date }),
        },
        $currentDate: {
          updated_at: true,
        },
      },
      {
        returnDocument: "after",
        projection: {
          password: 0,
          email_verify_token: 0,
          forgot_password_token: 0,
        },
      },
    );
    return user;
  }
  async follow(user_id: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id),
    });
    if (follower === null) {
      await databaseService.followers.insertOne({
        user_id: new ObjectId(user_id),
        followed_user_id: new ObjectId(followed_user_id),
      });
      return {
        message: USERS_MESSAGES.FOLLOW_SUCCESS,
      };
    }
    return {
      message: USERS_MESSAGES.FOLLOWED,
    };
  }
  async unFollow(user_id: string, followed_user_id: string) {
    const follower = await databaseService.followers.findOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id),
    });
    // Không tìm thấy document follower nghĩa là chưa follow người này
    if (follower === null) {
      return {
        message: USERS_MESSAGES.ALREADY_UNFOLLOWED,
      };
    }
    // Tìm thấy doment follower nghĩa là đã follow người này rồi thì tiến hành xoá document này
    await databaseService.followers.deleteOne({
      user_id: new ObjectId(user_id),
      followed_user_id: new ObjectId(followed_user_id),
    });
    return {
      message: USERS_MESSAGES.UNFOLLOW_SUCCESS,
    };
  }

  async changePassword(user_id: string, new_password: string) {
    await databaseService.users.updateOne({ _id: new ObjectId(user_id) }, [
      { $set: { password: hashPassword(new_password), updated_at: "$$NOW" } },
    ]);
    return {
      message: USERS_MESSAGES.CHANGE_PASSWORD_SUCCESS,
    };
  }
}

const usersService = new UsersService();
export default usersService;
