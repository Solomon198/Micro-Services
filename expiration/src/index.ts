import { natsWrappper } from "./nats-wrapper";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";

const startApplication = async () => {
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
    new OrderCreatedListener(natsWrappper.client).listen();
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
  } catch (e) {
    console.log(e);
  }
};

startApplication();
