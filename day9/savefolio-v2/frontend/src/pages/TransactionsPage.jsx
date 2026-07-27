import {
  Pencil,
  Search,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

import LoadingState from "../components/common/LoadingState";
import { useFinance } from "../context/FinanceContext";
import {
  formatCurrency,
  formatDate,
} from "../utils/formatters";

export default function TransactionsPage() {
  const {
    transactions,
    loading,
    settings,
    openEditForm,
    deleteTransaction,
  } = useFinance();

  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  const categories = useMemo(
    () => [
      ...new Set(
        transactions.map(
          (transaction) => transaction.category,
        ),
      ),
    ],
    [transactions],
  );

  const filteredTransactions = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    const result = transactions.filter(
      (transaction) => {
        const matchesSearch =
          !normalizedSearch ||
          transaction.title
            .toLowerCase()
            .includes(normalizedSearch) ||
          transaction.category
            .toLowerCase()
            .includes(normalizedSearch);

        const matchesType =
          type === "all" ||
          transaction.transaction_type === type;

        const matchesCategory =
          category === "all" ||
          transaction.category === category;

        return (
          matchesSearch &&
          matchesType &&
          matchesCategory
        );
      },
    );

    return [...result].sort((first, second) => {
      if (sort === "amount-high") {
        return second.amount - first.amount;
      }

      if (sort === "amount-low") {
        return first.amount - second.amount;
      }

      if (sort === "oldest") {
        return first.date.localeCompare(second.date);
      }

      return second.date.localeCompare(first.date);
    });
  }, [
    transactions,
    search,
    type,
    category,
    sort,
  ]);

  if (loading) {
    return <LoadingState />;
  }

  async function handleDelete(transaction) {
    const confirmed = window.confirm(
      `Delete "${transaction.title}"?`,
    );

    if (confirmed) {
      await deleteTransaction(transaction.id);
    }
  }

  return (
    <div>
      <section className="rounded-3xl border border-white/10 bg-zinc-900/70 p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_repeat(3,minmax(150px,auto))]">
          <label className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search transactions..."
              className="w-full rounded-xl border border-white/10 bg-zinc-950 py-3 pl-11 pr-4 outline-none focus:border-violet-500"
            />
          </label>

          <select
            value={type}
            onChange={(event) =>
              setType(event.target.value)
            }
            className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3"
          >
            <option value="all">All types</option>
            <option value="income">Income</option>
            <option value="spend">Spending</option>
            <option value="saving">Savings</option>
          </select>

          <select
            value={category}
            onChange={(event) =>
              setCategory(event.target.value)
            }
            className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3"
          >
            <option value="all">All categories</option>

            {categories.map((categoryName) => (
              <option
                key={categoryName}
                value={categoryName}
              >
                {categoryName}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(event) =>
              setSort(event.target.value)
            }
            className="rounded-xl border border-white/10 bg-zinc-950 px-4 py-3"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="amount-high">
              Highest amount
            </option>
            <option value="amount-low">
              Lowest amount
            </option>
          </select>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-zinc-900/70">
        <div className="border-b border-white/10 px-6 py-5">
          <h2 className="text-xl font-bold">
            {filteredTransactions.length} transactions
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-zinc-950/70 text-left text-xs uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="px-6 py-4">Transaction</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">
                  Amount
                </th>
                <th className="px-6 py-4 text-right">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/10">
              {filteredTransactions.map(
                (transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-white/[0.025]"
                  >
                    <td className="px-6 py-4">
                      <strong className="block">
                        {transaction.title}
                      </strong>

                      <span className="text-xs text-zinc-500">
                        {transaction.category}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="rounded-full bg-white/5 px-3 py-1 text-xs capitalize text-zinc-300">
                        {transaction.transaction_type}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm text-zinc-400">
                      {formatDate(transaction.date)}
                    </td>

                    <td className="px-6 py-4 text-right font-semibold">
                      {formatCurrency(
                        transaction.amount,
                        settings.currency,
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(transaction)
                          }
                          className="grid size-9 place-items-center rounded-lg bg-violet-500/10 text-violet-300 hover:bg-violet-500/20"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(transaction)
                          }
                          className="grid size-9 place-items-center rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>

        {filteredTransactions.length === 0 && (
          <p className="py-16 text-center text-zinc-500">
            No matching transactions found.
          </p>
        )}
      </section>
    </div>
  );
}