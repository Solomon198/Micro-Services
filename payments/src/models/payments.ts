import mongoose from "mongoose";
import { OrderStatus } from "@crazy-devz/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface PaymentAttrs {
  orderId: string;
  paymentId: string;
}

interface PaymentsModel extends mongoose.Model<PaymentsDoc> {
  build(attr: PaymentAttrs): PaymentsDoc;
}

interface PaymentsDoc extends mongoose.Document {
  orderId: string;
  paymentId: string;

  verson: string;
}

const PaymentSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);
PaymentSchema.set("versionKey", "version");
PaymentSchema.plugin(updateIfCurrentPlugin);
PaymentSchema.statics.build = (attrs: PaymentAttrs) => {
  return new Payments(attrs);
};
const Payments = mongoose.model<PaymentsDoc, PaymentsModel>(
  "Payments",
  PaymentSchema
);

export { Payments };
