import { Request, Response, NextFunction } from 'express';
export const loginValidator = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send({
      data: "Email and password are required",
    });
  }
  next();
}