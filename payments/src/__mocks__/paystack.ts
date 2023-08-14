import mongoose from "mongoose";

export const paystack = {
  transaction: {
    charge: jest.fn().mockResolvedValue({
      data: {
        reference: new mongoose.Types.ObjectId().toHexString(),
      },
    }),
  },
};
