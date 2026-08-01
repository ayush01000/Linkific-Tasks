import { useState } from "react";

import Button from "../common/Button";

const categories = [
  "Salary",
  "Freelance",
  "Food",
  "Shopping",
  "Transport",
  "Housing",
  "Utilities",
  "Health",
  "Education",
  "Entertainment",
  "Other",
];

function localToday() {
  const now = new Date();

  return new Date(
    now.getTime() -
      now.getTimezoneOffset() * 60_000,
  )
    .toISOString()
    .slice(0, 10);
}

export default function TransactionForm({
  initialTransaction,
  onSubmit,
  onCancel,
}) {
  const [form, setForm] = useState({
    title: initialTransaction?.title ?? "",
    amount: initialTransaction?.amount ?? "",
    transaction_type:
      initialTransaction?.transaction_type ?? "expense",
    category: initialTransaction?.category ?? "",
    transaction_date:
      initialTransaction?.transaction_date ??
      localToday(),
    notes: initialTransaction?.notes ?? "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] =
    useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (Number(form.amount) <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        category: form.category.trim(),
        amount: Number(form.amount),
        notes: form.notes.trim(),
      });
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className="transaction-form"
      onSubmit={handleSubmit}
    >
      {error && (
        <div className="alert alert--error">
          {error}
        </div>
      )}

      <label className="form-field form-field--full">
        <span>Title</span>
        <input
          name="title"
          value={form.title}
          onChange={updateField}
          minLength="2"
          maxLength="150"
          placeholder="For example: Grocery shopping"
          required
        />
      </label>

      <label className="form-field">
        <span>Amount</span>
        <input
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          value={form.amount}
          onChange={updateField}
          placeholder="0.00"
          required
        />
      </label>

      <label className="form-field">
        <span>Type</span>
        <select
          name="transaction_type"
          value={form.transaction_type}
          onChange={updateField}
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>

      <label className="form-field">
        <span>Category</span>
        <input
          name="category"
          list="transaction-categories"
          value={form.category}
          onChange={updateField}
          minLength="2"
          maxLength="80"
          placeholder="Select or enter a category"
          required
        />

        <datalist id="transaction-categories">
          {categories.map((category) => (
            <option key={category} value={category} />
          ))}
        </datalist>
      </label>

      <label className="form-field">
        <span>Date</span>
        <input
          name="transaction_date"
          type="date"
          value={form.transaction_date}
          onChange={updateField}
          required
        />
      </label>

      <label className="form-field form-field--full">
        <span>Notes</span>
        <textarea
          name="notes"
          value={form.notes}
          onChange={updateField}
          rows="3"
          maxLength="500"
          placeholder="Optional notes"
        />
      </label>

      <div className="form-actions">
        <Button
          variant="secondary"
          onClick={onCancel}
        >
          Cancel
        </Button>

        <Button type="submit" isLoading={submitting}>
          {initialTransaction
            ? "Save changes"
            : "Add transaction"}
        </Button>
      </div>
    </form>
  );
}