import { type Response, type NextFunction } from "express";
import type { CustomRequest, User } from "../libs/types.js";
import { users } from "../db/db.js";

export const checkRoles = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const payload = req.user;
  const user = users.find((u: User) => u.username === payload?.username);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized user",
    });
  }

  next();
};
