import { Request, Response } from 'express';
export const loginController = (req: Request, res: Response) => {
  const { email, password } = req.body;

  res.status(200).json({
    message: "Logic success!"
  });
}