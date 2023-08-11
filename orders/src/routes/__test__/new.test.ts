import request from "supertest";
import { app } from "../../app";
import { signup } from "../../test";
import { Orders } from "../../models/order";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";
import { OrderStatus } from "@crazy-devz/common";
import { natsWrappper } from "../../nats-wrapper";

it("it returns an error if the ticket does not exist", async () => {
  const ticketId = new mongoose.Types.ObjectId();
  await request(app)
    .post("/api/orders")
    .set("Cookie", signup())
    .send({ ticketId })
    .expect(404);
});

it("returns an error if the ticket already exist", async () => {
  const ticket = Ticket.build({ title: "Conert", price: 10 });
  await ticket.save();
  const order = Orders.build({
    ticket,
    userId: "kdkdkdkdkdk",
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();
  await request(app)
    .post("/api/orders")
    .set("Cookie", signup())
    .send({ ticketId: ticket.id })
    .expect(400);
});

it("reserves a ticket", async () => {
  const ticket = Ticket.build({ title: "Conert", price: 10 });
  await ticket.save();
  await request(app)
    .post("/api/orders")
    .set("Cookie", signup())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it("emits an order event", async () => {
  const ticket = Ticket.build({ title: "Conert", price: 10 });
  await ticket.save();
  await request(app)
    .post("/api/orders")
    .set("Cookie", signup())
    .send({ ticketId: ticket.id })
    .expect(201);
  expect(natsWrappper.client.publish).toHaveBeenCalled();
});
