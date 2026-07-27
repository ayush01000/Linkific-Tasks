import { useEffect, useState } from "react";

import { useFinance } from "../context/FinanceContext";

export default function SettingsPage() {
  const { settings, updateSettings } =
    useFinance();

  const [form, setForm] = useState(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "savingsGoal"
          ? Number(value)
          : value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    updateSettings(form);
  }

  return (
    <section className="max-w-2xl rounded-3xl border border-white/10 bg-zinc-900/70 p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-400">
        Preferences
      </p>

      <h2 className="mt-1 text-2xl font-bold">
        Personalize Savefolio
      </h2>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-6"
      >
        <label className="block">
          <span className="mb-2 block text-sm text-zinc-300">
            Display name
          </span>

          <input
            name="displayName"
            value={form.displayName}
            onChange={handleChange}
            required
            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-zinc-300">
            Currency
          </span>

          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3"
          >
            <option value="INR">INR — Indian rupee</option>
            <option value="USD">USD — US dollar</option>
            <option value="EUR">EUR — Euro</option>
            <option value="GBP">GBP — British pound</option>
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-zinc-300">
            Savings goal
          </span>

          <input
            type="number"
            name="savingsGoal"
            value={form.savingsGoal}
            onChange={handleChange}
            min="1"
            required
            className="w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 outline-none focus:border-violet-500"
          />
        </label>

        <button className="rounded-xl bg-violet-500 px-5 py-3 font-semibold text-white hover:bg-violet-400">
          Save preferences
        </button>
      </form>
    </section>
  );
}