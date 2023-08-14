import mongoose from "mongoose";
import { app } from "./app";
import { natsWrappper } from "./nats-wrapper";
import { TicketCreatedListener } from "./events/listeners/ticket-created-listener";
import { TicketUpdatedListener } from "./events/listeners/ticket-updated-listener";
import { ExpirationCompleteListener } from "./events/listeners/expiration-complete-listener";
import { PaymentCreatedListener } from "./events/listeners/payment-created-listeners";

const startApplication = async () => {
  console.log("starting application");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT TOKEN is not defined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO URI is not defined");
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS CLient ID is not defined");
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS clusterId is not defined");
  }

  if (!process.env.NATS_URL) {
    throw new Error("NATS URI is not defined");
  }
  try {
    await natsWrappper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrappper.client.on("close", () => {
      console.log("This NAT listener have shutdown");
      process.exit();
    });

    process.on("SIGINT", () => {
      natsWrappper.client.close();
    });

    process.on("SIGTERM", () => {
      natsWrappper.client.close();
    });

    new TicketCreatedListener(natsWrappper.client).listen();
    new TicketUpdatedListener(natsWrappper.client).listen();
    new ExpirationCompleteListener(natsWrappper.client).listen();
    new PaymentCreatedListener(natsWrappper.client).listen();
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Mongodb!!");
  } catch (e) {
    console.log(e);
  }
  app.listen(3000, () => {
    console.log("Auth-service listening on port 3000!!!");
  });
};

startApplication();
