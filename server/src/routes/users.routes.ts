import { Router } from "express";
import {
  changePasswordController,
  followController,
  forgotPasswordController,
  getMeController,
  getProfileController,
  loginController,
  logoutController,
  oauthController,
  refreshTokenController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  unFollowController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController,
} from "~/controllers/users.controllers";
import { filterMiddleware } from "~/middlewares/common.middlewares";
import {
  accessTokenValidator,
  changePasswordValidator,
  emailVerifyTokenValidator,
  followValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  unFollowValidator,
  updateMeValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator,
} from "~/middlewares/users.middlewares";
import { UpdateMeReqBody } from "~/models/requests/User.requests";
import { wrapRequestHandler } from "~/utils/handlers";
const usersRouter = Router();



/**
 * @swagger
 * /users/login:
 *   post:
 *     tags:
 *       - users
 *     summary: Đăng nhập
 *     description: Đăng nhập vào hệ thống
 *     operationId: login
 *     requestBody:
 *       description: Thông tin đăng nhập
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/LoginBody"
 *       required: true
 *     responses:
 *       "200":
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: object
 *                   example: Login sucess
 *                 result:
 *                   $ref: "#/components/schemas/SuccessAuthentication"
 *       "422":
 *         description: Invalid input
 */


usersRouter.post("/login", loginValidator, wrapRequestHandler(loginController));

usersRouter.get("/oauth/google", wrapRequestHandler(oauthController));


usersRouter.post("/register", registerValidator, wrapRequestHandler(registerController));

usersRouter.post("/logout", accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController));
 
usersRouter.post("/refresh-token", refreshTokenValidator, wrapRequestHandler(refreshTokenController));

usersRouter.post("/verify-email", emailVerifyTokenValidator, wrapRequestHandler(verifyEmailController));

usersRouter.post("/resend-verify-email", accessTokenValidator, wrapRequestHandler(resendVerifyEmailController));

usersRouter.post("/forgot-password", forgotPasswordValidator, wrapRequestHandler(forgotPasswordController));

usersRouter.post(
  "/verify-forgot-password",
  verifyForgotPasswordTokenValidator,
  wrapRequestHandler(verifyForgotPasswordController),
);

usersRouter.post("/reset-password", resetPasswordValidator, wrapRequestHandler(resetPasswordController));

usersRouter.get("/me", accessTokenValidator, wrapRequestHandler(getMeController));

usersRouter.patch(
  "/me",
  accessTokenValidator,
  verifiedUserValidator,
  updateMeValidator,
  filterMiddleware<UpdateMeReqBody>([
    "name",
    "date_of_birth",
    "bio",
    "location",
    "website",
    "username",
    "avatar",
    "cover_photo",
  ]),
  wrapRequestHandler(updateMeController),
);

usersRouter.get("/:username", wrapRequestHandler(getProfileController));


usersRouter.post("/follow", accessTokenValidator, verifiedUserValidator, followValidator, wrapRequestHandler(followController));

usersRouter.delete("/follow/:user_id", accessTokenValidator, verifiedUserValidator, unFollowValidator, wrapRequestHandler(unFollowController));

usersRouter.delete("/change-password", accessTokenValidator, verifiedUserValidator, changePasswordValidator, wrapRequestHandler(changePasswordController));

export default usersRouter;
