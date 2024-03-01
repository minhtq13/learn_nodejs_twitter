import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { RegisterRequestBody } from "~/models/requests/User.requests";
import usersService from "~/services/users.services";
export const loginController = (req: Request, res: Response) => {
  res.status(200).json({
    message: "Logic success!",
  });
};

export const registerController = async (
  req: Request<ParamsDictionary, any, RegisterRequestBody>,
  res: Response,
) => {
  try {
    const result = await usersService.register(req.body);
    res.status(200).json({
      message: "Register success!",
      result,
    });
  } catch (error) {
    res.status(400).json({
      message: "Register failed!",
    });
  }
};
