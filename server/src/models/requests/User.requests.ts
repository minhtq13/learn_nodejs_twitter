import { JwtPayload } from "jsonwebtoken";
import { TokenType, UserVerifyStatus } from "~/constants/enums";
import { ParamsDictionary } from "express-serve-static-core";


/**
 * @swagger
 * components:
 *   schemas:
 *     LoginBody:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: taminh596@gmail.com
 *         password:
 *           type: string
 *           example: Minh123@
 *     SuccessAuthentication:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjVmNDVkN2NiNTc1NDc5YjVmZWRiN2FmIiwidG9rZW5fdHlwZSI6MCwidmVyaWZ5IjoxLCJpYXQiOjE3MTA4MzA5NTcsImV4cCI6MTcxMTQzNTc1N30.I-3cv5fRrSwE3OBkNhqu8dsNDHO-hFt9O9djGSt6Npg
 *         refresh_token:
 *           type: string
 *           example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNjVmNDVkN2NiNTc1NDc5YjVmZWRiN2FmIiwidG9rZW5fdHlwZSI6MSwidmVyaWZ5IjoxLCJpYXQiOjE3MTA4MzA5NTcsImV4cCI6MTcxOTQ3MDk1N30.WiD1CqEnx66JYP3llGakUkqq3_b2lSwiCBnc0SMETE8
 *     User:
 *       type: "object"
 *       properties:
 *         _id:
 *           type: string
 *           format: MongoId
 *           example: 65f45d7cb575479b5fedb7af
 *         name:
 *           type: string
 *           example: "minh"
 *         email:
 *           type: string
 *           example: "taminh596@gmail.com"
 *         date_of_birth:
 *           type: string
 *           format: ISO8601
 *           example: 2023-06-08T10:17:31.096Z
 *         create_at:
 *           type: string
 *           format: ISO8601
 *           example: 2024-03-15T14:38:52.654Z
 *         updated_at:
 *           type: string
 *           format: ISO8601
 *           example: 2024-03-15T15:12:39.805Z
 *         verify:
 *           $ref: "#/components/schemas/UserVerifyStatus"
 *         twitter_circle:
 *           type: array
 *           items:
 *             type: string
 *             format: MongoId
 *           example: ['65f45d7cb575479b5fedb7af']
 *         bio:
 *           type: string
 *           example: "This is my bio."
 *         location:
 *           type: string
 *           example: "San Francisco, CA"
 *         website:
 *           type: string
 *           example: "www.example.com"
 *         username:
 *           type: string
 *           example: "taminh596"
 *         avatar:
 *           type: string
 *           example: "http:localhost:4000/avatar/test.jpg"
 *         cover_photo:
 *           type: string
 *           example: "http:localhost:4000/cover_photo/test.jpg"
 *     UserVerifyStatus:
 *       type: number
 *       enum: [Unverified, Verified, Banned]
 *       example: 1
 */

export interface LoginReqBody {
  email: string;
  password: string;
}

export interface VerifyEmailReqBody {
  email_verify_token: string;
}
export interface RegisterReqBody {
  name: string;
  email: string;
  password: string;
  confirm_password: string;
  date_of_birth: string;
}

export interface LogoutReqBody {
  refresh_token: string;
}

export interface RefreshTokenReqBody {
  refresh_token: string;
}

export interface ForgotPasswordReqBody {
  email: string;
}
export interface VerifyForgotPasswordReqBody {
  forgot_password_token: string;
}
export interface ResetPasswordReqBody {
  password: string;
  confirm_password: string;
  fotgot_password_token: string;
}

export interface UpdateMeReqBody {
  name?: string;
  date_of_birth?: string;
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  username?: string;
  cover_photo?: string;
}

export interface GetProfileReqParams extends ParamsDictionary {
  username: string;
}
export interface FollowReqBody {
  followed_user_id: string;
}
export interface UnFollowReqParams extends ParamsDictionary {
  user_id: string;
}

export interface ChangePasswordReqBody {
  old_password: string;
  password: string;
  confirm_password: string;
}
export interface TokenPayload extends JwtPayload {
  user_id: string;
  token_type: TokenType;
  verify: UserVerifyStatus;
  exp: number;
  iat: number;
}
