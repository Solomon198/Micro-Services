import { OrderCreatedListener } from "../order-created-listener";
import { natsWrappper } from "../../../nats-wrapper";
import { OrderCreatedEvent, OrderStatus } from "@crazy-devz/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrappper.client);
  const ticket = Ticket.build({
    price: 10,
    title: "COncert",
    userId: "kdkdkdkdkk",
  });
  await ticket.save();
  const data: OrderCreatedEvent["data"] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: "lkdkdkdk",
    version: 0,
    expiresAt: "dkdkdfkkf",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, ticket };
};
it("set the orderId of the ticket", async () => {
  const { listener, data, ticket, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);
  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrappper.client.publish).toHaveBeenCalled();
  const ticketUpdatedId = JSON.parse(
    (natsWrappper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(data.id).toEqual(ticketUpdatedId.orderId);
});
