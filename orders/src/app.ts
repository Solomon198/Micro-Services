import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import { NewOrderRouter } from "./routes/new";
import { ShowOrderRouter } from "./routes/show";
import { IndexTicketRouter } from "./routes";
import { ordersDeleteRouter } from "./routes/delete";
import { ErrorHandler, NotFoundError, CurrentUser } from "@crazy-devz/common";
import cookieSession from "cookie-session";

const app = express();
app.set("trust proxy", true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== "test",
  })
);
app.use(CurrentUser);
app.use(ShowOrderRouter);
app.use(NewOrderRouter);
app.use(IndexTicketRouter);
app.use(ordersDeleteRouter);

app.all("*", async () => {
  throw new NotFoundError();
});
app.use(ErrorHandler);

export { app };
