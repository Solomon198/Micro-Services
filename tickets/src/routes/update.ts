import express, { Request, Response } from "express";
import {
  NotAuthorized,
  NotFoundError,
  RequireAuth,
  ValidateRequest,
} from "@crazy-devz/common";
import { body } from "express-validator";
import { Ticket } from "../models/ticket";

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

    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorized();
    }

    const { title, price } = req.body;

    ticket.set({
      title,
      price,
    });

    await ticket.save();
    res.send(ticket);
  }
);

export { router as updateTicketRouter };
