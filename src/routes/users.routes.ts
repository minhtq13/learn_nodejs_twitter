import { Router } from "express";
import {
  forgotPasswordController,
  getMeController,
  loginController,
  logoutController,
  registerController,
  resendVerifyEmailController,
  resetPasswordController,
  updateMeController,
  verifyEmailController,
  verifyForgotPasswordController,
} from "~/controllers/users.controllers";
import {
  accessTokenValidator,
  emailVerifyTokenValidator,
  forgotPasswordValidator,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  resetPasswordValidator,
  verifiedUserValidator,
  verifyForgotPasswordTokenValidator,
} from "~/middlewares/users.middlewares";
import { wrapRequestHandler } from "~/utils/handlers";
const usersRouter = Router();

usersRouter.post("/login", loginValidator, wrapRequestHandler(loginController));
usersRouter.post("/register", registerValidator, wrapRequestHandler(registerController));
usersRouter.post("/logout", accessTokenValidator, refreshTokenValidator, wrapRequestHandler(logoutController));

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

usersRouter.patch("/me", accessTokenValidator, verifiedUserValidator, wrapRequestHandler(updateMeController));

export default usersRouter;
