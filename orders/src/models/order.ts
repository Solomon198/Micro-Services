import mongoose from "mongoose";
import { OrderStatus } from "@crazy-devz/common";
import { TicketDoc } from "./ticket";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface OrdersAttrs {
  status: OrderStatus;
  userId: string;
  expiresAt: Date;
  ticket: TicketDoc;
}

interface OrdersModel extends mongoose.Model<OrdersDoc> {
  build(attr: OrdersAttrs): OrdersDoc;
}

interface OrdersDoc extends mongoose.Document {
  status: OrderStatus;
  userId: string;
  expiresAt: Date;
  version: number;
  ticket: TicketDoc;
}

const OrdersSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
    },

    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },

    ticket: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ticket",
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
OrdersSchema.set("versionKey", "version");
OrdersSchema.plugin(updateIfCurrentPlugin);
OrdersSchema.statics.build = (attrs: OrdersAttrs) => {
  return new Orders(attrs);
};
const Orders = mongoose.model<OrdersDoc, OrdersModel>("Order", OrdersSchema);

export { Orders };
