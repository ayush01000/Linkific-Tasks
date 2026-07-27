import {
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Wallet,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import LoadingState from "../components/common/LoadingState";
import SummaryCard from "../components/dashboard/SummaryCard";
import { useFinance } from "../context/FinanceContext";
import {
  formatCurrency,
  formatDate,
} from "../utils/formatters";

export default function DashboardPage() {
  const {
    summary,
    transactions,
    loading,
    error,
    settings,
  } = useFinance();

  if (loading) {
    return <LoadingState />;
  }

  const cards = [
    {
      label: "Available balance",
      value: summary.balance,
      icon: Wallet,
      color: "violet",
    },
    {
      label: "Total income",
      value: summary.income,
      icon: ArrowUpRight,
      color: "emerald",
    },
    {
      label: "Total spends",
      value: summary.spends,
      icon: ArrowDownRight,
      color: "orange",
    },
    {
      label: "Total savings",
      value: summary.savings,
      icon: PiggyBank,
      color: "cyan",
    },
  ];

  const progress = Math.min(
    Math.round(
      (summary.savings / settings.savingsGoal) * 100,
    ),
    100,
  );

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-300">
          {error}
        </div>
      )}

      <section className="overflow-hidden rounded-3xl border border-violet-500/15 bg-gradient-to-br from-violet-500/15 via-zinc-900 to-zinc-900 p-6 sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
          Personal finance dashboard
        </p>

        <h2 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-6xl">
          Make every rupee{" "}
          <span className="text-violet-400">
            count.
          </span>
        </h2>

        <p className="mt-5 max-w-2xl leading-7 text-zinc-400">
          Track income, understand spending, and build
          stronger savings habits from one dashboard.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <SummaryCard
            key={card.label}
            {...card}
            currency={settings.currency}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(300px,0.7fr)]">
        <article className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            Growth
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            Savings overview
          </h2>

          <div className="mt-8 h-72">
            <ResponsiveContainer>
              <AreaChart data={summary.savings_chart}>
                <CartesianGrid
                  vertical={false}
                  stroke="#27272a"
                  strokeDasharray="4 4"
                />

                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a" }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#71717a" }}
                />

                <Tooltip
                  formatter={(value) =>
                    formatCurrency(
                      value,
                      settings.currency,
                    )
                  }
                  contentStyle={{
                    background: "#18181b",
                    border: "1px solid #3f3f46",
                    borderRadius: "12px",
                  }}
                />

                <Area
                  type="monotone"
                  dataKey="savings"
                  stroke="#a78bfa"
                  strokeWidth={3}
                  fill="#8b5cf633"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
            Savings goal
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            Emergency fund
          </h2>

          <div
            className="mx-auto mt-8 grid size-48 place-items-center rounded-full"
            style={{
              background: `
                radial-gradient(
                  circle,
                  #18181b 59%,
                  transparent 60%
                ),
                conic-gradient(
                  #8b5cf6 0 ${progress}%,
                  #27272a ${progress}% 100%
                )
              `,
            }}
          >
            <div className="text-center">
              <strong className="block text-4xl">
                {progress}%
              </strong>
              <span className="text-xs text-zinc-500">
                complete
              </span>
            </div>
          </div>

          <p className="mt-7 text-center text-sm text-zinc-400">
            {formatCurrency(
              summary.savings,
              settings.currency,
            )}{" "}
            of{" "}
            {formatCurrency(
              settings.savingsGoal,
              settings.currency,
            )}
          </p>
        </article>
      </section>

      <section className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6">
        <h2 className="text-2xl font-bold">
          Recent transactions
        </h2>

        <div className="mt-5 divide-y divide-white/10">
          {transactions.slice(0, 5).map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between gap-4 py-4"
            >
              <div>
                <strong className="block">
                  {transaction.title}
                </strong>

                <span className="text-xs text-zinc-500">
                  {transaction.category} ·{" "}
                  {formatDate(transaction.date)}
                </span>
              </div>

              <strong>
                {formatCurrency(
                  transaction.amount,
                  settings.currency,
                )}
              </strong>
            </div>
          ))}

          {transactions.length === 0 && (
            <p className="py-10 text-center text-zinc-500">
              No transactions yet.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}