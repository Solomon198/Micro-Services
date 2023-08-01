import express from "express";
import { CurrentUser } from "../middlewares/current-user";

const router = express.Router();

router.get("/api/users/currentuser", CurrentUser, (req, res) => {
  res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
