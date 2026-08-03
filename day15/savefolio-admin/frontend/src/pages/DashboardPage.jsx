import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import MonthlyChart from "../components/dashboard/MonthlyChart";
import SummaryCard from "../components/dashboard/SummaryCard";
import Spinner from "../components/common/Spinner";
import TransactionTable from "../components/transactions/TransactionTable";
import { getDashboard } from "../services/dashboardService";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      setDashboard(await getDashboard());
    } catch (dashboardError) {
      setError(dashboardError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Dashboard unavailable</h2>
        <p>{error}</p>

        <button
          type="button"
          className="button button--primary"
          onClick={loadDashboard}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Dashboard</h1>
          <p>A simple overview of your finances.</p>
        </div>

        <Link
          to="/transactions?new=1"
          className="button button--primary"
        >
          Add transaction
        </Link>
      </div>

      <section className="summary-grid">
        <SummaryCard
          label="Total balance"
          value={dashboard.totals.balance}
        />

        <SummaryCard
          label="Income"
          value={dashboard.totals.income}
          tone="light-green"
        />

        <SummaryCard
          label="Expenses"
          value={dashboard.totals.expenses}
          tone="red"
        />

        <SummaryCard
          label="Savings"
          value={dashboard.totals.savings}
          tone="mint"
        />
      </section>

      <MonthlyChart data={dashboard.monthly_data} />

      <section className="panel">
        <div className="panel__header">
          <div>
            <h2>Recent transactions</h2>
            <p>Your latest financial activity</p>
          </div>

          <Link
            to="/transactions"
            className="text-link"
          >
            View all
          </Link>
        </div>

        <TransactionTable
          transactions={
            dashboard.recent_transactions
          }
        />
      </section>
    </>
  );
}