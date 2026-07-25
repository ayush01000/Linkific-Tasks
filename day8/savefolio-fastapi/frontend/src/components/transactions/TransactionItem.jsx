import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Trash2,
} from "lucide-react";

import { currency } from "../../utils/currency";

export default function TransactionItem({
  transaction,
  onDelete,
}) {
  function renderIcon() {
    if (transaction.transaction_type === "income") {
      return <ArrowUpRight size={19} />;
    }

    if (transaction.transaction_type === "saving") {
      return <PiggyBank size={19} />;
    }

    return <ArrowDownRight size={19} />;
  }

  const prefix =
    transaction.transaction_type === "income" ? "+" : "-";

  return (
    <article className="transaction-row">
      <div
        className={
          `transaction-symbol ` +
          transaction.transaction_type
        }
      >
        {renderIcon()}
      </div>

      <div className="transaction-info">
        <strong>{transaction.title}</strong>

        <span>
          {transaction.category || "General"} ·{" "}
          {transaction.date}
        </span>
      </div>

      <span
        className={
          `transaction-amount ` +
          transaction.transaction_type
        }
      >
        {prefix}
        {currency(transaction.amount)}
      </span>

      <button
        type="button"
        className="delete-button"
        onClick={() => onDelete(transaction.id)}
        aria-label={`Delete ${transaction.title}`}
      >
        <Trash2 size={17} />
      </button>
    </article>
  );
}