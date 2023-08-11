import { natsWrappper } from "../../../nats-wrapper";
import { TicketUpdatedEvent } from "@crazy-devz/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  const listener = new TicketUpdatedListener(natsWrappper.client);
  const ticket = Ticket.build({
    price: 1000,
    title: "Concert",
    id: new mongoose.Types.ObjectId().toHexString(),
  });
  await ticket.save();
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    title: "Concerto",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: ticket.version + 1,
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, ticket, data, msg };
};
it("Finds, updates and saves the ticket", async () => {
  const { listener, data, ticket, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket?.price).toEqual(data.price);
  expect(updatedTicket?.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it(" does not call acks if the message is in the future.", async () => {
  const { listener, data, msg } = await setup();
  data.version = 10;

  try {
    await listener.onMessage(data, msg);
  } catch {}

  expect(msg.ack).not.toHaveBeenCalled();
});
