import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Wallet,
} from "lucide-react";

import {
  createTransaction,
  deleteTransaction,
  getSummary,
  getTransactions,
} from "../../api/transactions";

import TransactionForm from "../transactions/TransactionForm";
import TransactionList from "../transactions/TransactionList";
import Hero from "./Hero";
import SavingsChart from "./SavingsChart";
import SavingsGoal from "./SavingsGoal";
import SummaryCard from "./SummaryCard";

const initialSummary = {
  income: 0,
  spends: 0,
  savings: 0,
  balance: 0,
  savings_chart: [],
};

export default function Content({
  formOpen,
  onOpenForm,
  onCloseForm,
}) {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(initialSummary);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function loadDashboard() {
    try {
      setError("");

      const [transactionsResponse, summaryResponse] =
        await Promise.all([
          getTransactions(),
          getSummary(),
        ]);

      setTransactions(transactionsResponse.data);
      setSummary(summaryResponse.data);
    } catch (requestError) {
      console.error(requestError);

      setError(
        "Could not connect to the FastAPI backend. " +
          "Confirm that it is running on port 8000.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  async function handleCreate(transactionData) {
    try {
      setSubmitting(true);
      setError("");

      await createTransaction(transactionData);
      await loadDashboard();

      onCloseForm();
      return true;
    } catch (requestError) {
      console.error(requestError);

      const message =
        requestError.response?.data?.detail;

      setError(
        typeof message === "string"
          ? message
          : "Please check the transaction details.",
      );

      return false;
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(transactionId) {
    const confirmed = window.confirm(
      "Delete this transaction?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      await deleteTransaction(transactionId);
      await loadDashboard();
    } catch (requestError) {
      console.error(requestError);
      setError("Could not delete the transaction.");
    }
  }

  const cards = [
    {
      label: "Available balance",
      value: summary.balance,
      icon: Wallet,
      color: "purple",
    },
    {
      label: "Total income",
      value: summary.income,
      icon: ArrowUpRight,
      color: "green",
    },
    {
      label: "Total spends",
      value: summary.spends,
      icon: ArrowDownRight,
      color: "orange",
    },
    {
      label: "Total savings",
      value: summary.savings,
      icon: PiggyBank,
      color: "blue",
    },
  ];

  return (
    <>
      {error && (
        <div className="error-banner" role="alert">
          {error}
        </div>
      )}

      <Hero savings={summary.savings} />

      <section className="stats-grid">
        {cards.map((card) => (
          <SummaryCard
            key={card.label}
            {...card}
          />
        ))}
      </section>

      <section className="content-grid">
        <SavingsChart data={summary.savings_chart} />
        <SavingsGoal savings={summary.savings} />
      </section>

      <TransactionList
        transactions={transactions}
        loading={loading}
        onAdd={onOpenForm}
        onDelete={handleDelete}
      />

      {formOpen && (
        <TransactionForm
          onClose={onCloseForm}
          onSubmit={handleCreate}
          submitting={submitting}
        />
      )}
    </>
  );
}