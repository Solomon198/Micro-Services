import { OrderCreatedEvent, Subjects, Publisher } from "@crazy-devz/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
