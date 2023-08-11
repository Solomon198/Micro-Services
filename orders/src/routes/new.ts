import express, { Request, Response } from "express";
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  RequireAuth,
  ValidateRequest,
} from "@crazy-devz/common";
import { body } from "express-validator";
import mongoose from "mongoose";
import { Ticket } from "../models/ticket";
import { Orders } from "../models/order";
import { OrderCreatedPublisher } from "../events/publishers/order-created-publisher";
import { natsWrappper } from "../nats-wrapper";

const EXPIRATION_SECONDS = 15 * 60;
const router = express.Router();

router.post(
  "/api/orders",
  RequireAuth,
  [
    body("ticketId")
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage("TicketId must be provided"),
  ],

  async (req: Request, res: Response) => {
    const { ticketId } = req.body;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      throw new NotFoundError();
    }

    const isReserved = await ticket.isReserved();
    if (isReserved) {
      throw new BadRequestError("Ticket already reserved");
    }

    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_SECONDS);

    const order = Orders.build({
      status: OrderStatus.Created,
      userId: req.currentUser!.id,
      ticket,
      expiresAt: expiration,
    });

    await order.save();
    new OrderCreatedPublisher(natsWrappper.client).publish({
      id: order.id,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      status: order.status,
      version: order.version,
      ticket: {
        id: ticket.id,
        price: ticket.price,
      },
    });
    res.status(201).send(order);
  }
);

export { router as NewOrderRouter };
