import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Link } from "react-router-dom";

import AdminMetricCard from "../../components/admin/AdminMetricCard";
import Spinner from "../../components/common/Spinner";
import { getAdminOverview } from "../../services/adminService";


export default function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    setError("");
    setLoading(true);

    try {
      setOverview(await getAdminOverview());
    } catch (overviewError) {
      setError(overviewError.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Administration unavailable</h2>
        <p>{error}</p>
        <button
          type="button"
          className="button button--primary"
          onClick={loadOverview}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="page-heading admin-heading">
        <div>
          <span className="page-kicker">Administration</span>
          <h1>System overview</h1>
          <p>
            Monitor accounts and financial activity across
            Savefolio.
          </p>
        </div>
      </div>

      <section className="admin-metric-grid">
        <AdminMetricCard
          label="Total users"
          value={overview.user_count}
          detail={`${overview.active_user_count} active accounts`}
        />
        <AdminMetricCard
          label="Administrators"
          value={overview.admin_count}
          detail="Users with system access"
          tone="mint"
        />
        <AdminMetricCard
          label="Transactions"
          value={overview.transaction_count}
          detail="Records across all users"
          tone="amber"
        />
        <AdminMetricCard
          label="Net flow"
          value={overview.net_flow}
          detail="Income minus expenses"
          currency
          tone={Number(overview.net_flow) < 0 ? "red" : "green"}
        />
      </section>

      <section className="admin-finance-grid">
        <AdminMetricCard
          label="Platform income"
          value={overview.total_income}
          currency
        />
        <AdminMetricCard
          label="Platform expenses"
          value={overview.total_expenses}
          currency
          tone="red"
        />
      </section>

      <section className="admin-action-grid">
        <Link to="/admin/users" className="admin-action-card">
          <span className="admin-action-card__index">01</span>
          <div>
            <h2>Manage users</h2>
            <p>
              Review accounts, grant administrator access,
              or disable access.
            </p>
          </div>
          <span aria-hidden="true">→</span>
        </Link>

        <Link
          to="/admin/transactions"
          className="admin-action-card"
        >
          <span className="admin-action-card__index">02</span>
          <div>
            <h2>Review transactions</h2>
            <p>
              Search financial records across every user and
              remove invalid entries.
            </p>
          </div>
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    </>
  );
}
