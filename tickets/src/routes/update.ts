import express, { Request, Response } from "express";
import {
  BadRequestError,
  NotAuthorized,
  NotFoundError,
  RequireAuth,
  ValidateRequest,
} from "@crazy-devz/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { TicketUpdatedPublisher } from "../events/publishers/ticket-updated-event";
import { natsWrappper } from "../nats-wrapper";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  RequireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is requred"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greate than zero"),
  ],
  ValidateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      throw new BadRequestError("Cannot update a reserve ticket");
    }

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorized();
    }

    const { title, price } = req.body;

    ticket.set({
      title,
      price,
    });

    await ticket.save();
    await new TicketUpdatedPublisher(natsWrappper.client).publish({
      id: ticket.id,
      title: ticket.title,
      userId: ticket.userId,
      price: ticket.price,
      version: ticket.version,
    });
    res.send(ticket);
  }
);

export { router as updateTicketRouter };
