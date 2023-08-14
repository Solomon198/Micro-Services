import request from "supertest";
import { app } from "../../app";
import { signup } from "../../test";
import mongoose from "mongoose";
import { Orders } from "../../models/order";
import { OrderStatus } from "@crazy-devz/common";
import { paystack } from "../../paystack";
import { Payments } from "../../models/payments";

jest.mock("../../paystack");

it("throws 404 when purchasing an order that does not exist", async () => {
  await request(app)
    .post("/api/payments")
    .set("Cookie", signup())
    .send({
      token: "99494949",
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404);
});

it("Returns 401 when purchasing an order that does not belong to the user", async () => {
  const order = Orders.build({
    userId: new mongoose.Types.ObjectId().toHexString(),
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", signup())
    .send({
      token: "99494949",
      orderId: order.id,
    })
    .expect(401);
});

it("Returns 400 when purchasing a cancelled order", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Orders.build({
    userId,
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Cancelled,
    version: 0,
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", signup(userId))
    .send({
      token: "99494949",
      orderId: order.id,
    })
    .expect(400);
});

it("Returns a 204 with valid inputs", async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Orders.build({
    userId,
    price: 10,
    id: new mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    version: 0,
  });
  await order.save();
  await request(app)
    .post("/api/payments")
    .set("Cookie", signup(userId))
    .send({
      token: "99494949",
      orderId: order.id,
    })
    .expect(204);
  const chargeOptions = (paystack.transaction.charge! as jest.Mock).mock
    .calls[0][0];
  expect(chargeOptions.email).toEqual("solomonyunana@gmail.com");
  expect(chargeOptions.amount).toEqual(1000);
  expect(chargeOptions.authorization_code).toEqual("99494949");

  const payment = await Payments.findOne({ orderId: order.id });

  expect(payment?.orderId).toEqual(order.id);
  expect(payment).not.toBeNull();
  expect(payment).toBeDefined();
});
