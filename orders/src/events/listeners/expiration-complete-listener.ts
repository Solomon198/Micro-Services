import { Message } from "node-nats-streaming";
import {
  ExpirationComplete,
  Subjects,
  Listener,
  OrderStatus,
} from "@crazy-devz/common";
import { queueGroupName } from "./queue-group-name";
import { Orders } from "../../models/order";
import { OrderCancelledPublisher } from "../publishers/order-cancelled-publisher";
import { natsWrappper } from "../../nats-wrapper";
export class ExpirationCompleteListener extends Listener<ExpirationComplete> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
  queueGroupName: string = queueGroupName;
  async onMessage(
    data: ExpirationComplete["data"],
    msg: Message
  ): Promise<void> {
    const { orderId } = data;
    const order = await Orders.findById(orderId).populate("ticket");

    if (!order) {
      throw new Error("Order not found");
    }

    if (order.status === OrderStatus.Complete) {
      return msg.ack();
    }

    order.set({
      status: OrderStatus.Cancelled,
    });

    await order.save();
    await new OrderCancelledPublisher(natsWrappper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id,
      },
    });
    msg.ack();
  }
}
