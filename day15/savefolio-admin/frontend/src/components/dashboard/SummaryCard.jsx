import { formatCurrency } from "../../utils/formatters";

export default function SummaryCard({
  label,
  value,
  tone = "green",
}) {
  return (
    <article className={`summary-card tone-${tone}`}>
      <span className="summary-card__label">
        {label}
      </span>

      <strong className="summary-card__value">
        {formatCurrency(value)}
      </strong>
    </article>
  );
}