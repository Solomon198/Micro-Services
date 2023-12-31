import {
  OrderCancelledEvent,
  Listener,
  Subjects,
  OrderStatus,
} from "@crazy-devz/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Orders } from "../../models/order";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(
    data: OrderCancelledEvent["data"],
    msg: Message
  ): Promise<void> {
    const order = await Orders.findOne({
      _id: data.id,
      version: data.version - 1,
    });
    if (!order) {
      throw new Error("Order not found");
    }
    order.set({
      status: OrderStatus.Cancelled,
    });
    await order.save();
    msg.ack();
  }
}
