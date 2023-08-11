import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
interface TicketAttrs {
  title: string;
  price: number;

  userId: string;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attr: TicketAttrs): TicketDoc;
}

interface TicketDoc extends mongoose.Document {
  title: string;

  userId: string;

  price: number;

  version: number;

  orderId?: string;
}

const TicketSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    orderId: {
      type: String,
      required: false,
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
TicketSchema.statics.build = (attrs: TicketAttrs) => {
  return new Ticket(attrs);
};
const Ticket = mongoose.model<TicketDoc, TicketModel>("Ticket", TicketSchema);

export { Ticket };
