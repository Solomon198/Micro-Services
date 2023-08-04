import request from "supertest";
import { app } from "../../app";
import { signup } from "../../test";
import { Ticket } from "../../models/ticket";

it("has a route listening at /api/tickets for a post request for a ticket", async () => {
  const response = await request(app).post("/api/tickets").send({});
  expect(response.status).not.toEqual(404);
});

it("it can only be accessed if the user is signed in", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("return a status other than 401 when user is signed in", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", signup())
    .send({});
  expect(response.status).not.toEqual(401);
});

it("it returns an error if an invalid title is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signup())
    .send({ title: "", price: 10 })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", signup())
    .send({ price: 10 })
    .expect(400);
});

it("it returns an error if an invalid price is provided", async () => {
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signup())
    .send({ title: "dfdfdfdd dfdfdfdfd", price: -10 })
    .expect(400);

  await request(app)
    .post("/api/tickets")
    .set("Cookie", signup())
    .send({ title: "welkdf k kdfdfjkj" })
    .expect(400);
});

it("it creates a ticket with valid parameters or input", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);
  await request(app)
    .post("/api/tickets")
    .set("Cookie", signup())
    .send({ title: "dfdfdfdd dfdfdfdfd", price: 10 })
    .expect(201);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
  expect(tickets[0].price).toEqual(10);
  expect(tickets[0].title).toEqual("dfdfdfdd dfdfdfdfd");
});
