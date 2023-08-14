import {
  Listener,
  Subjects,
  OrderCreatedEvent,
  OrderStatus,
} from "@crazy-devz/common";
import { queueGroupName } from "./queue-group-name";
import { Message } from "node-nats-streaming";
import { Orders } from "../../models/order";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  queueGroupName = queueGroupName;
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  async onMessage(
    data: OrderCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const order = Orders.build({
      id: data.id,
      userId: data.userId,
      price: data.ticket.price,
      version: data.version,
      status: data.status,
    });
    await order.save();
    msg.ack();
  }
}
