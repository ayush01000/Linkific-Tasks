import {
  formatCurrency,
  formatDate,
} from "../../utils/formatters";

export default function TransactionTable({
  transactions,
  onEdit,
  onDelete,
}) {
  if (!transactions.length) {
    return (
      <div className="empty-state">
        <h3>No transactions found</h3>
        <p>Add a transaction or change your search.</p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Transaction</th>
            <th>Category</th>
            <th>Date</th>
            <th>Type</th>
            <th className="align-right">Amount</th>

            {(onEdit || onDelete) && (
              <th className="align-right">Actions</th>
            )}
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

              <td>{transaction.category}</td>

              <td>
                {formatDate(
                  transaction.transaction_date,
                )}
              </td>

              <td>
                <span
                  className={`type-badge type-badge--${transaction.transaction_type}`}
                >
                  {transaction.transaction_type}
                </span>
              </td>

              <td
                className={`align-right amount amount--${transaction.transaction_type}`}
              >
                {transaction.transaction_type ===
                "expense"
                  ? "−"
                  : "+"}
                {formatCurrency(transaction.amount)}
              </td>

              {(onEdit || onDelete) && (
                <td className="align-right actions">
                  {onEdit && (
                    <button
                      type="button"
                      onClick={() => onEdit(transaction)}
                    >
                      Edit
                    </button>
                  )}

                  {onDelete && (
                    <button
                      type="button"
                      className="danger-link"
                      onClick={() =>
                        onDelete(transaction)
                      }
                    >
                      Delete
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}