import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Landmark,
  PiggyBank,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  createTransaction,
  deleteTransaction,
  getSummary,
  getTransactions,
} from "./api";

const initialForm = {
  title: "",
  amount: "",
  transaction_type: "spend",
  category: "",
  date: new Date().toISOString().split("T")[0],
  note: "",
};

const fallbackChart = [
  { month: "Jan", savings: 0 },
  { month: "Feb", savings: 0 },
  { month: "Mar", savings: 0 },
  { month: "Apr", savings: 0 },
  { month: "May", savings: 0 },
  { month: "Jun", savings: 0 },
];

function currency(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function App() {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    income: 0,
    spends: 0,
    savings: 0,
    balance: 0,
    savings_chart: [],
  });
  const [form, setForm] = useState(initialForm);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  async function loadDashboard() {
    try {
      const [transactionResponse, summaryResponse] =
        await Promise.all([
          getTransactions(),
          getSummary(),
        ]);

      setTransactions(transactionResponse.data);
      setSummary(summaryResponse.data);
    } catch (error) {
      console.error("Could not load dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      await createTransaction({
        ...form,
        amount: Number(form.amount),
      });

      setForm(initialForm);
      setShowForm(false);
      await loadDashboard();
    } catch (error) {
      console.error("Could not add transaction:", error);
      alert("Please check the transaction details.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this transaction?")) {
      return;
    }

    await deleteTransaction(id);
    await loadDashboard();
  }

  const cards = [
    {
      label: "Available balance",
      value: summary.balance,
      icon: Wallet,
      className: "purple",
    },
    {
      label: "Total income",
      value: summary.income,
      icon: ArrowUpRight,
      className: "green",
    },
    {
      label: "Total spends",
      value: summary.spends,
      icon: ArrowDownRight,
      className: "orange",
    },
    {
      label: "Total savings",
      value: summary.savings,
      icon: PiggyBank,
      className: "blue",
    },
  ];

  const chartData = summary.savings_chart?.length
    ? summary.savings_chart
    : fallbackChart;

  return (
    <main className="app-shell">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <nav className="navbar">
        <a href="/" className="brand">
          <span className="brand-icon">
            <Landmark size={19} />
          </span>
          Savefolio
        </a>

        <div className="nav-links">
          <a href="#overview">Overview</a>
          <a href="#savings">Savings</a>
          <a href="#transactions">Transactions</a>
        </div>

        <button
          className="primary-button"
          onClick={() => setShowForm(true)}
        >
          <Plus size={18} />
          Add transaction
        </button>
      </nav>

      <section className="hero" id="overview">
        <div>
          <p className="eyebrow">PERSONAL FINANCE DASHBOARD</p>
          <h1>
            Make every rupee
            <span> count.</span>
          </h1>
          <p className="hero-description">
            Track your income, understand your spending, and
            watch your savings grow from one simple dashboard.
          </p>
        </div>

        <div className="hero-balance">
          <p>Your savings</p>
          <strong>{currency(summary.savings)}</strong>
          <span>
            Build small habits. Create meaningful progress.
          </span>
        </div>
      </section>

      <section className="stats-grid">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <article className="stat-card" key={card.label}>
              <div className={`stat-icon ${card.className}`}>
                <Icon size={21} />
              </div>
              <p>{card.label}</p>
              <h2>{currency(card.value)}</h2>
            </article>
          );
        })}
      </section>

      <section className="content-grid">
        <article className="chart-card" id="savings">
          <div className="section-heading">
            <div>
              <p className="eyebrow">GROWTH</p>
              <h2>Savings overview</h2>
            </div>
            <span className="chart-badge">Monthly</span>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient
                    id="savingGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#9b87f5"
                      stopOpacity={0.5}
                    />
                    <stop
                      offset="100%"
                      stopColor="#9b87f5"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="#28283a"
                  strokeDasharray="4 4"
                  vertical={false}
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#85859b", fontSize: 12 }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#85859b", fontSize: 12 }}
                />

                <Tooltip
                  formatter={(value) => currency(value)}
                  contentStyle={{
                    background: "#171721",
                    border: "1px solid #303043",
                    borderRadius: "12px",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#a997ff"
                  strokeWidth={3}
                  fill="url(#savingGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="goal-card">
          <p className="eyebrow">SAVINGS GOAL</p>
          <h2>Emergency fund</h2>
          <p className="goal-description">
            Work towards six months of financial security.
          </p>

          <div className="goal-circle">
            <div>
              <strong>
                {Math.min(
                  Math.round(
                    (Number(summary.savings) / 100000) * 100
                  ),
                  100
                )}
                %
              </strong>
              <span>complete</span>
            </div>
          </div>

          <div className="goal-numbers">
            <span>Saved</span>
            <strong>
              {currency(summary.savings)} / ₹1,00,000
            </strong>
          </div>
        </article>
      </section>

      <section
        className="transactions-section"
        id="transactions"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">ACTIVITY</p>
            <h2>Recent transactions</h2>
          </div>

          <button
            className="secondary-button"
            onClick={() => setShowForm(true)}
          >
            <Plus size={17} />
            Add new
          </button>
        </div>

        <div className="transaction-list">
          {loading && (
            <p className="empty-state">
              Loading your transactions...
            </p>
          )}

          {!loading && transactions.length === 0 && (
            <p className="empty-state">
              No transactions yet. Add your first transaction.
            </p>
          )}

          {transactions.map((transaction) => (
            <article
              className="transaction-row"
              key={transaction.id}
            >
              <div
                className={`transaction-symbol ${transaction.transaction_type}`}
              >
                {transaction.transaction_type === "income" ? (
                  <ArrowUpRight size={19} />
                ) : transaction.transaction_type === "saving" ? (
                  <PiggyBank size={19} />
                ) : (
                  <ArrowDownRight size={19} />
                )}
              </div>

              <div className="transaction-info">
                <strong>{transaction.title}</strong>
                <span>
                  {transaction.category || "General"} ·{" "}
                  {transaction.date}
                </span>
              </div>

              <span
                className={`transaction-amount ${transaction.transaction_type}`}
              >
                {transaction.transaction_type === "income"
                  ? "+"
                  : "-"}
                {currency(transaction.amount)}
              </span>

              <button
                className="delete-button"
                onClick={() =>
                  handleDelete(transaction.id)
                }
                aria-label={`Delete ${transaction.title}`}
              >
                <Trash2 size={17} />
              </button>
            </article>
          ))}
        </div>
      </section>

      {showForm && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setShowForm(false)}
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
                onClick={() => setShowForm(false)}
              >
                ×
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

            <button className="submit-button" type="submit">
              Save transaction
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

export default App;