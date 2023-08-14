import { PaymentCreatedEvent, Subjects, Publisher } from "@crazy-devz/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
