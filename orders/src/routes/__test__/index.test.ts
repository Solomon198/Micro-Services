import request from "supertest";
import { app } from "../../app";
import { signup } from "../../test";
import { Orders } from "../../models/order";
import { Ticket } from "../../models/ticket";
import mongoose from "mongoose";
import { OrderStatus } from "@crazy-devz/common";

const createTicket = async () => {
  const ticket = Ticket.build({
    title: "welcome",
    price: 128,
  });
  await ticket.save();
  return ticket;
};
it("it fetches orders for a particular user", async () => {
  const ticketOne = await createTicket();
  const ticketTwo = await createTicket();
  const ticketThree = await createTicket();

  const userOne = signup();
  const userTwo = signup();

  await request(app)
    .post("/api/orders")
    .set("Cookie", userOne)
    .send({ ticketId: ticketOne.id })
    .expect(201);

  const { body: orderOne } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketTwo.id })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post("/api/orders")
    .set("Cookie", userTwo)
    .send({ ticketId: ticketThree.id })
    .expect(201);

  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", userTwo)
    .expect(200);
  expect(response.body.length).toEqual(2);
  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].ticket.id).toEqual(ticketTwo.id);
  expect(response.body[1].ticket.id).toEqual(ticketThree.id);
});
