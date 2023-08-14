import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  RequireAuth,
  BadRequestError,
  NotAuthorized,
  NotFoundError,
  ValidateRequest,
  OrderStatus,
} from "@crazy-devz/common";
import { Orders } from "../models/order";
import { paystack } from "../paystack";
import mongoose from "mongoose";
import { Payments } from "../models/payments";
import Paystack from "paystack";
import { PaymentCreatedPublisher } from "../publishers/payment-publishers";
import { natsWrappper } from "../nats-wrapper";

const router = express.Router();
router.post(
  "/api/payments",
  RequireAuth,
  [body("token").not().isEmpty(), body("orderId").not().isEmpty()],
  ValidateRequest,
  async (req: Request, res: Response) => {
    const { orderId, token } = req.body;
    const order = await Orders.findById(orderId);
    if (!order) {
      throw new NotFoundError();
    }

    if (req.currentUser!.id !== order.userId) {
      throw new NotAuthorized();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for a cancelled order");
    }

    let charge: Paystack.Response;
    try {
      charge = await paystack.transaction.charge({
        email: "solomonyunana@gmail.com",
        authorization_code: token,
        amount: order.price * 100,
        reference: new mongoose.Types.ObjectId().toHexString(),
      });
    } catch {}
    const payment = Payments.build({
      // @ts-ignore
      paymentId: charge?.data?.reference || "_default__",
      orderId: order.id,
    });
    await payment.save();
    await new PaymentCreatedPublisher(natsWrappper.client).publish({
      orderId: payment.orderId,
      paymentId: payment.paymentId,
      id: payment.id,
    });
    res.status(204).send({ id: payment.id });
  }
);

export { router as createChargeRouter };
