import { OrderCancelledEvent, Subjects, Publisher } from "@crazy-devz/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
