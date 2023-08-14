import Paystack from "paystack";

export const paystack = Paystack(process.env.PAYSTACK_KEY! as string);
