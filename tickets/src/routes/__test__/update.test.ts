import request from "supertest";
import { app } from "../../app";
import { signup } from "../../test";
import mongoose from "mongoose";

it("returns a 404 if the provided id does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", signup())
    .send({
      title: "asdf",
      price: 10,
    })
    .expect(404);
});

it("returns a 401 if the user is not authenticated", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "asdf",
      price: 10,
    })
    .expect(401);
});

it("returns a 401 if the user does  not own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", signup())
    .send({
      title: "asdf",
      price: 100,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", signup())
    .send({
      title: "welcomee change",
      price: 2000,
    })
    .expect(401);
});

it("returns a 400 if the user provide an invalid title or price", async () => {
  const cookie = signup();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdf",
      price: 100,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "",
      price: 2000,
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "dfdfdfdfdfd",
      price: -28,
    })
    .expect(400);
});

it("updates the tickets provided valid inputs", async () => {
  const cookie = signup();
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({
      title: "asdf",
      price: 100,
    })
    .expect(201);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({
      title: "New title",
      price: 2000,
    })
    .expect(200);

  const ticket = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticket.body.title).toEqual("New title");
  expect(ticket.body.price).toEqual(2000);
});
