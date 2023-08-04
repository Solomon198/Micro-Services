import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import { createTicketRouter } from "./routes/new";
import { ShowTicketRouter } from "./routes/show";
import { IndexTicketRouter } from "./routes";
import { updateTicketRouter } from "./routes/update";
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
app.use(createTicketRouter);
app.use(ShowTicketRouter);
app.use(IndexTicketRouter);
app.use(updateTicketRouter);

app.all("*", async () => {
  throw new NotFoundError();
});
app.use(ErrorHandler);

export { app };
