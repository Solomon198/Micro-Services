import { Subjects, Publisher, ExpirationComplete } from "@crazy-devz/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationComplete> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
