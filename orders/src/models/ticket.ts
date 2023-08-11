import { OrderStatus } from "@crazy-devz/common";
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Orders } from "./order";

interface TicketAttrs {
  id?: string;
  title: string;
  price: number;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attr: TicketAttrs): TicketDoc;
  findByEvent(event: { id: string; version: number }): Promise<TicketDoc>;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;

  version: number;

  isReserved: () => Promise<boolean>;
}

const TicketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
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

TicketSchema.set("versionKey", "version");
TicketSchema.plugin(updateIfCurrentPlugin);
TicketSchema.methods.isReserved = async function () {
  const existingOrder = await Orders.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Cancelled,
      ],
    },
  });
  return !!existingOrder;
};

TicketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};
TicketSchema.statics.findByEvent = async (event: {
  id: string;
  version: number;
}) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};
const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", TicketSchema);

export { Ticket };
