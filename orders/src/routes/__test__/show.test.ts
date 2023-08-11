import request from "supertest";
import { app } from "../../app";
import { signup } from "../../test";
import { Orders } from "../../models/order";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";
import { OrderStatus } from "@crazy-devz/common";

it("it fetches the order", async () => {
  const ticket = Ticket.build({ title: "Concert", price: 9494 });
  await ticket.save();
  const user = signup();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(200);
  expect(fetchedOrder.id).toEqual(order.id);
});

it("it returns an error if a user tries to fetch another user order", async () => {
  const ticket = Ticket.build({ title: "Concert", price: 9494 });
  await ticket.save();
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", signup())
    .send({ ticketId: ticket.id })
    .expect(201);
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", signup())
    .send()
    .expect(401);
});
