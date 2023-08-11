import express, { Request, Response } from "express";
import {
  NotAuthorized,
  NotFoundError,
  OrderStatus,
  RequireAuth,
} from "@crazy-devz/common";
import { Orders } from "../models/order";
import { OrderCancelledPublisher } from "../events/publishers/order-cancelled-publisher";
import { natsWrappper } from "../nats-wrapper";

const router = express.Router();

router.delete(
  "/api/orders/:orderId",
  RequireAuth,
  async (req: Request, res: Response) => {
    const order = await Orders.findById(req.params.orderId)
      .populate("ticket")
      .populate("ticket");
    if (!order) {
      throw new NotFoundError();
    }
    if (req.currentUser!.id !== order.userId) {
      throw new NotAuthorized();
    }
    order.status = OrderStatus.Cancelled;
    await order.save();
    new OrderCancelledPublisher(natsWrappper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });
    res.status(204).send(order);
  }
);

export { router as ordersDeleteRouter };
