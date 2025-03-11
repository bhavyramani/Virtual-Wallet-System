import { Request, Response } from "express";
export const LogOutUser = (req: Request, res: Response) => {
  res.cookie("token", null, {
    maxAge: 0,
    httpOnly: true,
    sameSite: false,
  });
  res.status(200).json({ message: "User logged out" });
  return;
};
