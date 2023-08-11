import express, { Request, Response } from "express";
import { NotAuthorized, NotFoundError, RequireAuth } from "@crazy-devz/common";
import { Orders } from "../models/order";

const router = express.Router();

router.get(
  "/api/orders/:orderId",
  RequireAuth,
  async (req: Request, res: Response) => {
    const order = await Orders.findById(req.params.orderId).populate("ticket");
    if (!order) {
      throw new NotFoundError();
    }
    if (req.currentUser!.id !== order.userId) {
      throw new NotAuthorized();
    }
    res.send(order);
  }
);

export { router as ShowOrderRouter };
