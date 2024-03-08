import { NextFunction, Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { RegisterReqBody } from "~/models/requests/User.requests";
import usersService from "~/services/users.services";
export const loginController = (req: Request, res: Response) => {
  res.status(200).json({
    message: "Logic success!",
  });
};

export const registerController = async (req: Request<ParamsDictionary, any, RegisterReqBody>, res: Response, next: NextFunction) => {
  throw new Error("Error");
  const result = await usersService.register(req.body);
  return res.status(200).json({
    message: "Register success!",
    result,
  });
};
