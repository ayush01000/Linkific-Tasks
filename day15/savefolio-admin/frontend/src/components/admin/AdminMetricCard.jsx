import { formatCurrency } from "../../utils/formatters";


export default function AdminMetricCard({
  label,
  value,
  detail,
  currency = false,
  tone = "green",
}) {
  return (
    <article className={`admin-metric tone-${tone}`}>
      <span className="admin-metric__label">
        {label}
      </span>

      <strong className="admin-metric__value">
        {currency ? formatCurrency(value) : value}
      </strong>

      {detail && (
        <span className="admin-metric__detail">
          {detail}
        </span>
      )}
    </article>
  );
}
