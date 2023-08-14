import { natsWrappper } from "../../../nats-wrapper";
import {
  ExpirationComplete,
  OrderCreatedEvent,
  OrderStatus,
  TicketCreatedEvent,
} from "@crazy-devz/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { ExpirationCompleteListener } from "../expiration-complete-listener";
import { Orders } from "../../../models/order";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrappper.client);
  const ticket = Ticket.build({
    title: "conercert",
    price: 10,
  });
  await ticket.save();
  const order = Orders.build({
    status: OrderStatus.Created,
    userId: "dkdkdkd",
    expiresAt: new Date(),
    ticket,
  });
  await order.save();
  const data: ExpirationComplete["data"] = {
    orderId: order.id,
  };
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };
  return { listener, data, msg, order, ticket };
};
it("Update order status to cancelled", async () => {
  const { listener, data, msg, order, ticket } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Orders.findById(order.id);

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("Emit order cancelled event", async () => {
  const { listener, data, msg, order, ticket } = await setup();

  await listener.onMessage(data, msg);

  const eventData = JSON.parse(
    (natsWrappper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});

it("acks the message", async () => {
  const { listener, data, msg, order, ticket } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
