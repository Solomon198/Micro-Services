import request from "supertest";
import { app } from "../../app";
import { signup } from "../../test";
import { Orders } from "../../models/order";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";
import { OrderStatus } from "@crazy-devz/common";
import { natsWrappper } from "../../nats-wrapper";

it("it marks an order as cancelled", async () => {
  const ticket = Ticket.build({ title: "Concert", price: 9494 });
  await ticket.save();
  const user = signup();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);
  const updatedOrder = await Orders.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("Emit a order cancelled event", async () => {
  const ticket = Ticket.build({ title: "Concert", price: 9494 });
  await ticket.save();
  const user = signup();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);
  expect(natsWrappper.client.publish).toHaveBeenCalled();
});
