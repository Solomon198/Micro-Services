import request from "supertest";
import { app } from "../../app";
import { signup } from "../../test";

it("responds with detail about current user", async () => {
  const cookie = await signup("solex@test.com", "password");
  const response = await request(app)
    .get("/api/users/currentuser")
    .set("Cookie", cookie)
    .send()
    .expect(200);
  expect(response.body.currentUser.email).toEqual("solex@test.com");
});

it("responds with null if not authenticated", async () => {
  const response = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);
  expect(response.body.currentUser).toEqual(null);
});
