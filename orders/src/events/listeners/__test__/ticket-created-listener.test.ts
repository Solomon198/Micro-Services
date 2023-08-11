import { TicketCreatedListener } from "../ticket-created-listener";
import { natsWrappper } from "../../../nats-wrapper";
import { TicketCreatedEvent } from "@crazy-devz/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  const listener = new TicketCreatedListener(natsWrappper.client);
  const data: TicketCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    title: "Concert",
    price: 10,
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg };
};
it("Creates and save a ticket", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const ticket = await Ticket.findById(data.id);
  expect(ticket).toBeDefined();
  expect(ticket?.title).toEqual(data.title);
  expect(ticket?.id).toEqual(data.id);
  expect(ticket?.price).toEqual(data.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
