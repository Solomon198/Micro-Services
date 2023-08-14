import { Message } from "node-nats-streaming";
import { OrderCreatedEvent, Subjects, Listener } from "@crazy-devz/common";
import { queueGroupName } from "./queue-group-name";
import { expirationQueue } from "../../queues/expiration-queue";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queueGroupName: string = queueGroupName;
  async onMessage(
    data: OrderCreatedEvent["data"],
    msg: Message
  ): Promise<void> {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    console.log("Waiting this miliseconds before we publish=", delay);
    expirationQueue.add(
      { orderId: data.id },
      {
        delay,
      }
    );
    msg.ack();
  }
}
