import { TicketUpdatedEvent, Subjects, Publisher } from "@crazy-devz/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
