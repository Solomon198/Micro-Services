import { OrderCreatedEvent, OrderStatus } from "@crazy-devz/common";
import { natsWrappper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Orders } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrappper.client);
  const data: OrderCreatedEvent["data"] = {
    status: OrderStatus.Created,
    version: 0,
    userId: "kdkdkdkdk",
    expiresAt: "kdkdkdkd",
    id: new mongoose.Types.ObjectId().toHexString(),
    ticket: {
      price: 10,
      id: new mongoose.Types.ObjectId().toHexString(),
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, msg, data };
};

it("Replicates the order", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  const order = await Orders.findById(data.id);
  expect(order!.price).toEqual(data.ticket.price);
});

it("acks the message", async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
