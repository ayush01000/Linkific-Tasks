import { useState } from "react";
import { X } from "lucide-react";

const createInitialForm = () => ({
  title: "",
  amount: "",
  transaction_type: "spend",
  category: "",
  date: new Date().toISOString().split("T")[0],
  note: "",
});

export default function TransactionForm({
  onClose,
  onSubmit,
  submitting,
}) {
  const [form, setForm] = useState(createInitialForm);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const succeeded = await onSubmit({
      ...form,
      amount: Number(form.amount),
    });

    if (succeeded) {
      setForm(createInitialForm());
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={onClose}
    >
      <form
        className="transaction-form"
        onSubmit={handleSubmit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="form-heading">
          <div>
            <p className="eyebrow">NEW ENTRY</p>
            <h2>Add transaction</h2>
          </div>

          <button
            type="button"
            className="close-button"
            onClick={onClose}
            aria-label="Close form"
          >
            <X size={22} />
          </button>
        </div>

        <label>
          Transaction title
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Freelance project"
            required
          />
        </label>

        <div className="form-row">
          <label>
            Amount
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              min="0.01"
              step="0.01"
              placeholder="2500"
              required
            />
          </label>

          <label>
            Type
            <select
              name="transaction_type"
              value={form.transaction_type}
              onChange={handleChange}
            >
              <option value="income">Income</option>
              <option value="spend">Spend</option>
              <option value="saving">Saving</option>
            </select>
          </label>
        </div>

        <div className="form-row">
          <label>
            Category
            <input
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="Food, Salary..."
            />
          </label>

          <label>
            Date
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </label>
        </div>

        <label>
          Note
          <textarea
            name="note"
            value={form.note}
            onChange={handleChange}
            placeholder="Optional details..."
            rows="3"
          />
        </label>

        <button
          className="submit-button"
          type="submit"
          disabled={submitting}
        >
          {submitting
            ? "Saving..."
            : "Save transaction"}
        </button>
      </form>
    </div>
  );
}