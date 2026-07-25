import { Plus } from "lucide-react";

import TransactionItem from "./TransactionItem";

export default function TransactionList({
  transactions,
  loading,
  onAdd,
  onDelete,
}) {
  return (
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
          type="button"
          className="secondary-button"
          onClick={onAdd}
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
          <TransactionItem
            key={transaction.id}
            transaction={transaction}
            onDelete={onDelete}
          />
        ))}
      </div>
    </section>
  );
}