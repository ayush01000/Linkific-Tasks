import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  describe,
  expect,
  it,
  vi,
} from "vitest";

import TransactionForm from "./TransactionForm";


describe("TransactionForm", () => {
  it("rejects a non-positive amount before calling the API", () => {
    const onSubmit = vi.fn();
    render(
      <TransactionForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByLabelText("Amount"), {
      target: { value: "0" },
    });
    fireEvent.submit(
      screen
        .getByRole("button", { name: "Add transaction" })
        .closest("form"),
    );

    expect(
      screen.getByText("Amount must be greater than zero."),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("normalizes and submits valid form values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(
      <TransactionForm
        onSubmit={onSubmit}
        onCancel={vi.fn()}
      />,
    );

    await user.type(
      screen.getByLabelText("Title"),
      "  Grocery shopping  ",
    );
    await user.type(screen.getByLabelText("Amount"), "45.50");
    await user.type(screen.getByLabelText("Category"), "Food");
    await user.type(
      screen.getByLabelText("Notes"),
      "  Weekly food  ",
    );
    await user.click(
      screen.getByRole("button", { name: "Add transaction" }),
    );

    await waitFor(() => expect(onSubmit).toHaveBeenCalledOnce());
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Grocery shopping",
        amount: 45.5,
        transaction_type: "expense",
        category: "Food",
        notes: "Weekly food",
      }),
    );
  });
});
