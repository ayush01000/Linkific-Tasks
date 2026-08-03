import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Spinner from "../../components/common/Spinner";
import {
  deleteAdminTransaction,
  getAdminTransactions,
} from "../../services/adminService";
import {
  formatCurrency,
  formatDate,
} from "../../utils/formatters";


const PAGE_SIZE = 10;


export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [draftSearch, setDraftSearch] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdminTransactions({
        search,
        type,
        skip: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      });
      setTransactions(data.items);
      setTotal(data.total);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, type]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  function handleSearch(event) {
    event.preventDefault();
    setSearch(draftSearch.trim());
    setPage(1);
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteAdminTransaction(deleteTarget.id);
      setDeleteTarget(null);
      setNotice("Transaction deleted successfully.");

      if (transactions.length === 1 && page > 1) {
        setPage((value) => value - 1);
      } else {
        await loadTransactions();
      }
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeleting(false);
    }
  }

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE),
  );

  return (
    <>
      <div className="page-heading admin-heading">
        <div>
          <span className="page-kicker">Administration</span>
          <h1>All transactions</h1>
          <p>Review financial activity across every account.</p>
        </div>
      </div>

      {notice && (
        <div className="alert alert--success">{notice}</div>
      )}

      {error && (
        <div className="alert alert--error">{error}</div>
      )}

      <section className="panel">
        <form className="filters" onSubmit={handleSearch}>
          <input
            type="search"
            placeholder="Search transaction, user, or email"
            value={draftSearch}
            onChange={(event) =>
              setDraftSearch(event.target.value)
            }
          />
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value);
              setPage(1);
            }}
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>
          <Button type="submit">Search</Button>
          <Button
            variant="secondary"
            onClick={() => {
              setDraftSearch("");
              setSearch("");
              setType("");
              setPage(1);
            }}
          >
            Clear
          </Button>
        </form>

        {loading ? (
          <Spinner />
        ) : transactions.length ? (
          <>
            <div className="table-wrapper">
              <table className="data-table admin-transactions-table">
                <thead>
                  <tr>
                    <th>Transaction</th>
                    <th>User</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Type</th>
                    <th className="align-right">Amount</th>
                    <th className="align-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td>
                        <strong>{transaction.title}</strong>
                        {transaction.notes && (
                          <small>{transaction.notes}</small>
                        )}
                      </td>
                      <td>
                        <strong>{transaction.user_name}</strong>
                        <small>{transaction.user_email}</small>
                      </td>
                      <td>{transaction.category}</td>
                      <td>
                        {formatDate(transaction.transaction_date)}
                      </td>
                      <td>
                        <span className={`type-badge type-badge--${transaction.transaction_type}`}>
                          {transaction.transaction_type}
                        </span>
                      </td>
                      <td className={`align-right amount amount--${transaction.transaction_type}`}>
                        {transaction.transaction_type === "expense"
                          ? "−"
                          : "+"}
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="align-right actions">
                        <button
                          type="button"
                          className="danger-link"
                          onClick={() =>
                            setDeleteTarget(transaction)
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <span>Page {page} of {totalPages}</span>
              <div>
                <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() =>
                    setPage((value) => value - 1)
                  }
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage((value) => value + 1)
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="empty-state">
            <h3>No transactions found</h3>
            <p>Try changing the search or type filter.</p>
          </div>
        )}
      </section>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete transaction"
        onClose={() => setDeleteTarget(null)}
      >
        <p>
          Delete <strong>{deleteTarget?.title}</strong> from{" "}
          {deleteTarget?.user_name}? This action cannot be undone.
        </p>
        <div className="form-actions">
          <Button
            variant="secondary"
            onClick={() => setDeleteTarget(null)}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            isLoading={deleting}
            onClick={confirmDelete}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </>
  );
}
