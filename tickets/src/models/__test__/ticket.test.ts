import { Ticket } from "../ticket";

it("Implement Optimistic concurrency control", async () => {
  const ticket = Ticket.build({ title: "Concert", price: 20, userId: "123" });
  await ticket.save();

  const firstInstance = await Ticket.findById(ticket.id);
  const secondInstance = await Ticket.findById(ticket.id);

  firstInstance?.set({ title: "Notworking", price: 200 });
  secondInstance?.set({ title: "kdkfkdf", price: 3838 });

  await firstInstance?.save();
  try {
    await secondInstance?.save();
  } catch {
    return;
  }
  throw new Error("Should not reach this point!");
});

it("Increment version number on multiple saves", async () => {
  const ticket = Ticket.build({
    title: "random",
    price: 20,
    userId: "kdkdkdk",
  });
  await ticket.save();
  expect(ticket.version).toEqual(0);
  await ticket.save();
  expect(ticket.version).toEqual(1);
  await ticket.save();
  expect(ticket.version).toEqual(2);
});
