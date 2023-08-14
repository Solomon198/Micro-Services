import Queue from "bull";
import { natsWrappper } from "../nats-wrapper";
import { ExpirationCompletePublisher } from "../events/publishers/expiration-complete-publishers";

interface Payload {
  orderId: string;
}
export const expirationQueue = new Queue<Payload>("order-expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  new ExpirationCompletePublisher(natsWrappper.client).publish({
    orderId: job.data.orderId,
  });
  console.log("expiration complete order", job.data.orderId);
});
