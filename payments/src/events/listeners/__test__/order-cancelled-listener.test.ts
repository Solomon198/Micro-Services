import { OrderCancelledEvent, OrderStatus } from "@crazy-devz/common";
import { natsWrappper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Orders } from "../../../models/order";

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrappper.client);
  const order = Orders.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    price: 10,
    userId: "ldkfkdfk",
    version: 0,
  });
  await order.save();

  const data: OrderCancelledEvent["data"] = {
    version: order.version + 1,
    id: order.id,
    ticket: {
      id: new mongoose.Types.ObjectId().toHexString(),
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, msg, data, order };
};

it("updates the status of the order", async () => {
  const { order, msg, listener, data } = await setup();
  await listener.onMessage(data, msg);
  const updatedOrder = await Orders.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks the message", async () => {
  const { msg, listener, data } = await setup();
  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
