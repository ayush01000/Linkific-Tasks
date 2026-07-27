import { formatCurrency } from "../../utils/formatters";

export default function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
  currency,
}) {
  const styles = {
    violet: "bg-violet-500/10 text-violet-300",
    emerald: "bg-emerald-500/10 text-emerald-300",
    orange: "bg-orange-500/10 text-orange-300",
    cyan: "bg-cyan-500/10 text-cyan-300",
  };

  return (
    <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5 transition hover:-translate-y-1 hover:border-white/20">
      <div
        className={`grid size-11 place-items-center rounded-xl ${styles[color]}`}
      >
        <Icon size={21} />
      </div>

      <p className="mt-5 text-sm text-zinc-500">
        {label}
      </p>

      <h2 className="mt-1 text-2xl font-bold">
        {formatCurrency(value, currency)}
      </h2>
    </article>
  );
}