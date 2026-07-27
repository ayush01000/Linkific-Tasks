import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import LoadingState from "../components/common/LoadingState";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../utils/formatters";

const colors = [
  "#8b5cf6",
  "#22c55e",
  "#f97316",
  "#06b6d4",
  "#ec4899",
  "#eab308",
  "#6366f1",
];

export default function AnalyticsPage() {
  const {
    transactions,
    loading,
    settings,
  } = useFinance();

  const spendingData = useMemo(() => {
    const totals = {};

    transactions
      .filter(
        (transaction) =>
          transaction.transaction_type === "spend",
      )
      .forEach((transaction) => {
        totals[transaction.category] =
          (totals[transaction.category] || 0) +
          transaction.amount;
      });

    return Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort((first, second) => second.value - first.value);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const months = {};

    transactions.forEach((transaction) => {
      const month = transaction.date.slice(0, 7);

      if (!months[month]) {
        months[month] = {
          month,
          income: 0,
          spend: 0,
          saving: 0,
        };
      }

      months[month][transaction.transaction_type] +=
        transaction.amount;
    });

    return Object.values(months).sort((first, second) =>
      first.month.localeCompare(second.month),
    );
  }, [transactions]);

  if (loading) {
    return <LoadingState />;
  }

  const totalSpend = spendingData.reduce(
    (sum, category) => sum + category.value,
    0,
  );

  const averageSpend =
    transactions.filter(
      (transaction) =>
        transaction.transaction_type === "spend",
    ).length > 0
      ? totalSpend /
        transactions.filter(
          (transaction) =>
            transaction.transaction_type === "spend",
        ).length
      : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
          <p className="text-sm text-zinc-500">
            Spending categories
          </p>
          <strong className="mt-2 block text-3xl">
            {spendingData.length}
          </strong>
        </article>

        <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
          <p className="text-sm text-zinc-500">
            Average expense
          </p>
          <strong className="mt-2 block text-3xl">
            {formatCurrency(
              averageSpend,
              settings.currency,
            )}
          </strong>
        </article>

        <article className="rounded-2xl border border-white/10 bg-zinc-900/70 p-5">
          <p className="text-sm text-zinc-500">
            Largest category
          </p>
          <strong className="mt-2 block text-3xl">
            {spendingData[0]?.name || "None"}
          </strong>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6">
          <h2 className="text-xl font-bold">
            Spending by category
          </h2>

          <div className="mt-6 h-80">
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={spendingData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={3}
                >
                  {spendingData.map((item, index) => (
                    <Cell
                      key={item.name}
                      fill={colors[index % colors.length]}
                    />
                  ))}
                </Pie>

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
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-3xl border border-white/10 bg-zinc-900/70 p-6">
          <h2 className="text-xl font-bold">
            Monthly activity
          </h2>

          <div className="mt-6 h-80">
            <ResponsiveContainer>
              <BarChart data={monthlyData}>
                <CartesianGrid
                  vertical={false}
                  stroke="#27272a"
                />

                <XAxis
                  dataKey="month"
                  tick={{ fill: "#71717a" }}
                  axisLine={false}
                />

                <YAxis
                  tick={{ fill: "#71717a" }}
                  axisLine={false}
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

                <Bar
                  dataKey="income"
                  fill="#22c55e"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="spend"
                  fill="#f97316"
                  radius={[5, 5, 0, 0]}
                />
                <Bar
                  dataKey="saving"
                  fill="#8b5cf6"
                  radius={[5, 5, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>
    </div>
  );
}