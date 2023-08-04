import request from "supertest";
import { app } from "../../app";
import { signup } from "../../test";
import mongoose from "mongoose";

it("returns status of 404 if ticket is not found", async () => {
  await request(app)
    .get(`/api/tickets/${new mongoose.Types.ObjectId().toHexString()}`)
    .send()
    .expect(404);
});

it("returns the ticket if the ticket is found", async () => {
  const title = "title";
  const price = 20;

  const ticket = await request(app)
    .post("/api/tickets")
    .set("Cookie", signup())
    .send({ title, price })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${ticket.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});
