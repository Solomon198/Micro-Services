import express, { Request, Response } from "express";
import { RequireAuth, ValidateRequest } from "@crazy-devz/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";
import { TicketCreatedPublisher } from "../events/publishers/ticket-created-event";
import { natsWrappper } from "../nats-wrapper";

const router = express.Router();

router.post(
  "/api/tickets",
  RequireAuth,
  [
    body("title").not().isEmpty().withMessage("Title is requred"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("Price must be greate than zero"),
  ],
  ValidateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const ticket = Ticket.build({ title, price, userId: req.currentUser!.id });
    await ticket.save();
    await new TicketCreatedPublisher(natsWrappper.client).publish({
      id: ticket.id,
      title: ticket.title,
      userId: ticket.userId,
      price: ticket.price,
      version: ticket.version,
    });
    res.status(201).send(ticket);
  }
);

export { router as createTicketRouter };
