import mongoose from "mongoose";
import { OrderStatus } from "@crazy-devz/common";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

interface OrdersAttrs {
  status: OrderStatus;
  userId: string;
  price: number;
  version: number;
  id: string;
}

interface OrdersModel extends mongoose.Model<OrdersDoc> {
  build(attr: OrdersAttrs): OrdersDoc;
}

interface OrdersDoc extends mongoose.Document {
  status: OrderStatus;
  userId: string;
  version: number;
  price: number;
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

    price: {
      type: Number,
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
OrdersSchema.set("versionKey", "version");
OrdersSchema.plugin(updateIfCurrentPlugin);
OrdersSchema.statics.build = (attrs: OrdersAttrs) => {
  return new Orders({
    _id: attrs.id,
    userId: attrs.userId,
    version: attrs.version,
    status: attrs.status,
    price: attrs.price,
  });
};
const Orders = mongoose.model<OrdersDoc, OrdersModel>("Order", OrdersSchema);

export { Orders };
