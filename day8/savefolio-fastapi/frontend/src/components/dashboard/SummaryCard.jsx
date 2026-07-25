import { currency } from "../../utils/currency";

export default function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${color}`}>
        <Icon size={21} />
      </div>

      <p>{label}</p>
      <h2>{currency(value)}</h2>
    </article>
  );
}