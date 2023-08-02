import request from "supertest";
import { app } from "../../app";

it("fails when an email that does not exist is supplied", async () => {
  return request(app)
    .post("/api/users/signin")
    .send({
      email: "solexxx@gmail.com",
      password: "validpassword",
    })
    .expect(400);
});

it("fails when an incorrect password is supplied", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "solexxx@gmail.com",
      password: "validpassword",
    })
    .expect(201);
  return request(app)
    .post("/api/users/signin")
    .send({
      email: "solexxx@gmail.com",
      password: "validpasswor",
    })
    .expect(400);
});

it("responds with a cookie when given valid credentials", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "solexxx@gmail.com",
      password: "validpassword",
    })
    .expect(201);
  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "solexxx@gmail.com",
      password: "validpassword",
    })
    .expect(200);
  expect(response.get("Set-Cookie")).toBeDefined();
});
