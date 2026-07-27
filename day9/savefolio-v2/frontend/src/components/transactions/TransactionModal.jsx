import { X } from "lucide-react";
import { useEffect, useState } from "react";

import { useFinance } from "../../context/FinanceContext";

const createInitialForm = () => ({
  title: "",
  amount: "",
  transaction_type: "spend",
  category: "Food",
  date: new Date().toISOString().split("T")[0],
  note: "",
});

const categories = [
  "Salary",
  "Freelance",
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Savings",
  "Other",
];

export default function TransactionModal() {
  const {
    formOpen,
    editingTransaction,
    saving,
    closeForm,
    saveTransaction,
  } = useFinance();

  const [form, setForm] = useState(
    createInitialForm,
  );

  useEffect(() => {
    if (!formOpen) {
      return;
    }

    if (editingTransaction) {
      setForm({
        title: editingTransaction.title,
        amount: editingTransaction.amount,
        transaction_type:
          editingTransaction.transaction_type,
        category: editingTransaction.category,
        date: editingTransaction.date,
        note: editingTransaction.note || "",
      });
    } else {
      setForm(createInitialForm());
    }
  }, [formOpen, editingTransaction]);

  if (!formOpen) {
    return null;
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    await saveTransaction({
      ...form,
      title: form.title.trim(),
      category: form.category.trim(),
      note: form.note.trim(),
      amount: Number(form.amount),
    });
  }

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/75 p-4 backdrop-blur-sm"
      onMouseDown={closeForm}
    >
      <form
        onSubmit={handleSubmit}
        onMouseDown={(event) =>
          event.stopPropagation()
        }
        className="my-8 w-full max-w-xl rounded-3xl border border-white/10 bg-zinc-900 p-6 shadow-2xl sm:p-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
              {editingTransaction
                ? "Edit entry"
                : "New entry"}
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              {editingTransaction
                ? "Update transaction"
                : "Add transaction"}
            </h2>
          </div>

          <button
            type="button"
            onClick={closeForm}
            className="grid size-10 place-items-center rounded-xl text-zinc-400 hover:bg-white/5"
          >
            <X size={21} />
          </button>
        </div>

        <div className="mt-7 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-300">
              Title
            </span>

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Grocery shopping"
              required
              className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
            />
          </label>

          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm text-zinc-300">
                Amount
              </span>

              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                placeholder="2500"
                required
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-300">
                Type
              </span>

              <select
                name="transaction_type"
                value={form.transaction_type}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
              >
                <option value="income">Income</option>
                <option value="spend">Spend</option>
                <option value="saving">Saving</option>
              </select>
            </label>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-sm text-zinc-300">
                Category
              </span>

              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
              >
                {categories.map((category) => (
                  <option
                    key={category}
                    value={category}
                  >
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-2 block text-sm text-zinc-300">
                Date
              </span>

              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm text-zinc-300">
              Note
            </span>

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              rows="3"
              maxLength="500"
              placeholder="Optional details..."
              className="w-full resize-none rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
            />
          </label>
        </div>

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={closeForm}
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-zinc-300 hover:bg-white/5"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-400 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingTransaction
                ? "Save changes"
                : "Add transaction"}
          </button>
        </div>
      </form>
    </div>
  );
}