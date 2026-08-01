import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";

import Button from "../components/common/Button";
import Modal from "../components/common/Modal";
import Spinner from "../components/common/Spinner";
import TransactionForm from "../components/transactions/TransactionForm";
import TransactionTable from "../components/transactions/TransactionTable";
import {
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "../services/transactionService";

const PAGE_SIZE = 10;

export default function TransactionsPage() {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const [transactions, setTransactions] =
    useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [draftSearch, setDraftSearch] = useState(
    searchParams.get("search") ?? "",
  );
  const [appliedSearch, setAppliedSearch] = useState(
    searchParams.get("search") ?? "",
  );
  const [type, setType] = useState(
    searchParams.get("type") ?? "",
  );

  const [
    selectedTransaction,
    setSelectedTransaction,
  ] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadTransactions = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getTransactions({
        search: appliedSearch,
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
  }, [appliedSearch, type, page]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useEffect(() => {
    const urlSearch =
      searchParams.get("search") ?? "";

    const urlType =
      searchParams.get("type") ?? "";

    setDraftSearch(urlSearch);
    setAppliedSearch(urlSearch);
    setType(urlType);
    setPage(1);

    if (searchParams.get("new") === "1") {
      setSelectedTransaction(null);
      setFormOpen(true);

      const updatedParameters =
        new URLSearchParams(searchParams);

      updatedParameters.delete("new");

      setSearchParams(updatedParameters, {
        replace: true,
      });
    }
  }, [searchParams, setSearchParams]);

  function handleSearch(event) {
    event.preventDefault();

    const updatedParameters =
      new URLSearchParams();

    if (draftSearch.trim()) {
      updatedParameters.set(
        "search",
        draftSearch.trim(),
      );
    }

    if (type) {
      updatedParameters.set("type", type);
    }

    setSearchParams(updatedParameters);
    setAppliedSearch(draftSearch.trim());
    setPage(1);
  }

  function clearFilters() {
    setDraftSearch("");
    setAppliedSearch("");
    setType("");
    setSearchParams({});
    setPage(1);
  }

  function openCreateForm() {
    setSelectedTransaction(null);
    setFormOpen(true);
    setNotice("");
  }

  function openEditForm(transaction) {
    setSelectedTransaction(transaction);
    setFormOpen(true);
    setNotice("");
  }

  async function saveTransaction(data) {
    if (selectedTransaction) {
      await updateTransaction(
        selectedTransaction.id,
        data,
      );

      setNotice(
        "Transaction updated successfully.",
      );
    } else {
      await createTransaction(data);

      setNotice(
        "Transaction added successfully.",
      );
    }

    setFormOpen(false);
    setSelectedTransaction(null);
    await loadTransactions();
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      await deleteTransaction(deleteTarget.id);
      setDeleteTarget(null);

      setNotice(
        "Transaction deleted successfully.",
      );

      if (
        transactions.length === 1 &&
        page > 1
      ) {
        setPage((current) => current - 1);
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
      <div className="page-heading">
        <div>
          <h1>Transactions</h1>
          <p>
            Search, add, edit, and delete your
            records.
          </p>
        </div>

        <Button onClick={openCreateForm}>
          Add transaction
        </Button>
      </div>

      {notice && (
        <div className="alert alert--success">
          {notice}
        </div>
      )}

      {error && (
        <div className="alert alert--error">
          {error}
        </div>
      )}

      <section className="panel">
        <form
          className="filters"
          onSubmit={handleSearch}
        >
          <input
            type="search"
            placeholder="Search by title, category, or notes"
            value={draftSearch}
            onChange={(event) =>
              setDraftSearch(event.target.value)
            }
          />

          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value)
            }
          >
            <option value="">All types</option>
            <option value="income">Income</option>
            <option value="expense">Expenses</option>
          </select>

          <Button type="submit">Search</Button>

          <Button
            variant="secondary"
            onClick={clearFilters}
          >
            Clear
          </Button>
        </form>

        {loading ? (
          <Spinner />
        ) : (
          <>
            <TransactionTable
              transactions={transactions}
              onEdit={openEditForm}
              onDelete={setDeleteTarget}
            />

            <div className="pagination">
              <span>
                Page {page} of {totalPages}
              </span>

              <div>
                <Button
                  variant="secondary"
                  disabled={page === 1}
                  onClick={() =>
                    setPage(
                      (current) => current - 1,
                    )
                  }
                >
                  Previous
                </Button>

                <Button
                  variant="secondary"
                  disabled={page >= totalPages}
                  onClick={() =>
                    setPage(
                      (current) => current + 1,
                    )
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </section>

      <Modal
        open={formOpen}
        title={
          selectedTransaction
            ? "Edit transaction"
            : "Add transaction"
        }
        onClose={() => setFormOpen(false)}
      >
        <TransactionForm
          key={selectedTransaction?.id ?? "new"}
          initialTransaction={selectedTransaction}
          onSubmit={saveTransaction}
          onCancel={() => setFormOpen(false)}
        />
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        title="Delete transaction"
        onClose={() => setDeleteTarget(null)}
      >
        <div className="delete-confirmation">
          <p>
            Delete{" "}
            <strong>{deleteTarget?.title}</strong>?
            This action cannot be undone.
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
        </div>
      </Modal>
    </>
  );
}