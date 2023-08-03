import { Request, Response, NextFunction } from "express";
import { NotAuthorized } from "../errors/not-authorized";

export const RequireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.currentUser) {
    throw new NotAuthorized();
  }
  next();
};
