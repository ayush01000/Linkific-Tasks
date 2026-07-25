import { Wallet } from "lucide-react";

export default function TailwindPractice() {
  return (
    <section className="mx-auto my-10 max-w-md rounded-2xl border border-violet-400/20 bg-zinc-900 p-6 text-white shadow-xl">
      <div className="mb-5 flex items-center gap-3">
        <div className="grid size-11 place-items-center rounded-xl bg-violet-500/20 text-violet-300">
          <Wallet size={22} />
        </div>

        <div>
          <p className="text-sm text-zinc-400">
            Available balance
          </p>

          <h2 className="text-2xl font-bold">
            ₹25,000
          </h2>
        </div>
      </div>

      <button className="w-full rounded-xl bg-violet-500 px-4 py-3 font-semibold text-white transition hover:bg-violet-400 active:scale-95">
        Add transaction
      </button>
    </section>
  );
}